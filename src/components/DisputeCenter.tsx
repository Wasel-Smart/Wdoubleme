/**
 * Dispute Center Component
 * 
 * User-facing dispute filing and tracking system.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { FileText, Upload, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../services/core';
import { toast } from 'sonner';

interface Dispute {
  id: string;
  trip_id: string;
  type: string;
  description: string;
  status: string;
  created_at: string;
  resolution?: string;
}

export function DisputeCenter() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [showFileForm, setShowFileForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [tripId, setTripId] = useState('');
  const [disputeType, setDisputeType] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<File[]>([]);

  useEffect(() => {
    if (user) {
      loadDisputes();
    }
  }, [user]);

  const loadDisputes = async () => {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select('*')
        .eq('filed_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDisputes(data || []);
    } catch (error) {
      console.error('Failed to load disputes:', error);
    }
  };

  const handleFileDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tripId || !disputeType || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Upload evidence files if any
      const evidenceUrls: string[] = [];
      
      for (const file of evidence) {
        const fileName = `${user?.id}/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('dispute-evidence')
          .upload(fileName, file);

        if (error) throw error;
        
        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('dispute-evidence')
            .getPublicUrl(data.path);
          evidenceUrls.push(publicUrl);
        }
      }

      // Create dispute
      const { error: insertError } = await supabase
        .from('disputes')
        .insert({
          trip_id: tripId,
          filed_by: user?.id,
          type: disputeType,
          description,
          evidence: evidenceUrls,
          status: 'open',
          created_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      toast.success('Dispute filed successfully. Our team will review it within 24 hours.');
      
      // Reset form
      setTripId('');
      setDisputeType('');
      setDescription('');
      setEvidence([]);
      setShowFileForm(false);
      
      loadDisputes();
    } catch (error) {
      console.error('Failed to file dispute:', error);
      toast.error('Failed to file dispute. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEvidence(Array.from(e.target.files));
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      open: { variant: 'destructive' as const, label: 'Open', icon: AlertCircle },
      under_review: { variant: 'secondary' as const, label: 'Under Review', icon: Clock },
      resolved: { variant: 'default' as const, label: 'Resolved', icon: CheckCircle },
      closed: { variant: 'outline' as const, label: 'Closed', icon: CheckCircle },
    };

    const { variant, label, icon: Icon } = config[status as keyof typeof config] || {
      variant: 'outline' as const,
      label: status,
      icon: AlertCircle,
    };

    return (
      <Badge variant={variant}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dispute Center</h1>
          <p className="text-muted-foreground">
            File and track disputes for your trips
          </p>
        </div>
        {!showFileForm && (
          <Button onClick={() => setShowFileForm(true)}>
            <FileText className="w-4 h-4 mr-2" />
            File New Dispute
          </Button>
        )}
      </div>

      {/* File Dispute Form */}
      {showFileForm && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>File a Dispute</CardTitle>
            <CardDescription>
              Provide details about your issue. Our team will review within 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFileDispute} className="space-y-4">
              <div>
                <Label htmlFor="tripId">Trip ID *</Label>
                <Input
                  id="tripId"
                  value={tripId}
                  onChange={(e) => setTripId(e.target.value)}
                  placeholder="Enter trip ID (found in trip history)"
                  required
                />
              </div>

              <div>
                <Label htmlFor="disputeType">Dispute Type *</Label>
                <Select value={disputeType} onValueChange={setDisputeType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dispute type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pricing">Pricing Issue</SelectItem>
                    <SelectItem value="service">Service Quality</SelectItem>
                    <SelectItem value="safety">Safety Concern</SelectItem>
                    <SelectItem value="lost_item">Lost Item</SelectItem>
                    <SelectItem value="payment">Payment Problem</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="evidence">Evidence (optional)</Label>
                <div className="mt-2">
                  <Input
                    id="evidence"
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload screenshots, receipts, or other supporting documents
                  </p>
                  {evidence.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {evidence.map((file, i) => (
                        <p key={i} className="text-sm text-muted-foreground">
                          ✓ {file.name}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Submitting...' : 'Submit Dispute'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFileForm(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Existing Disputes */}
      <Card>
        <CardHeader>
          <CardTitle>Your Disputes</CardTitle>
          <CardDescription>Track the status of your filed disputes</CardDescription>
        </CardHeader>
        <CardContent>
          {disputes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No disputes filed</p>
              <p className="text-sm text-muted-foreground">
                If you have an issue with a trip, you can file a dispute above
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {disputes.map((dispute) => (
                <div key={dispute.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(dispute.status)}
                        <span className="text-sm text-muted-foreground">
                          Trip ID: {dispute.trip_id.slice(0, 8)}
                        </span>
                      </div>
                      <p className="font-semibold capitalize">
                        {dispute.type.replace('_', ' ')} Issue
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(dispute.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {dispute.description}
                  </p>

                  {dispute.resolution && (
                    <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg">
                      <p className="text-sm font-semibold mb-1">Resolution:</p>
                      <p className="text-sm">{dispute.resolution}</p>
                    </div>
                  )}

                  {dispute.status === 'open' && (
                    <p className="text-xs text-muted-foreground mt-3">
                      ⏱️ Your dispute is in queue. Average response time: 24 hours
                    </p>
                  )}

                  {dispute.status === 'under_review' && (
                    <p className="text-xs text-muted-foreground mt-3">
                      🔍 Our team is reviewing your case. You'll be notified soon.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Information */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Dispute Resolution Process</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>1. Submit your dispute with detailed information</li>
            <li>2. Our team reviews your case within 24 hours</li>
            <li>3. We may contact you for additional information</li>
            <li>4. A resolution is provided within 2-3 business days</li>
            <li>5. If applicable, refunds are processed to your original payment method</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}