/**
 * Dispute Management Component
 * 
 * Handle user disputes, review evidence, and resolve issues.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AlertTriangle, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { supabase } from '../../services/core';
import { toast } from 'sonner';

interface Dispute {
  id: string;
  trip_id: string;
  filed_by: string;
  filed_by_name: string;
  filed_by_photo?: string;
  type: 'pricing' | 'service' | 'safety' | 'lost_item' | 'payment';
  description: string;
  evidence: string[];
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  resolution?: string;
  admin_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export function DisputeManagement() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mock data for now
      const mockDisputes: Dispute[] = [
        {
          id: '1',
          trip_id: 'trip123',
          filed_by: 'user1',
          filed_by_name: 'Ahmed Mohammed',
          type: 'pricing',
          description: 'I was charged more than the estimated fare. The app showed JOD 45 but I was charged JOD 65.',
          evidence: [],
          status: 'open',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          trip_id: 'trip124',
          filed_by: 'user2',
          filed_by_name: 'Sarah Johnson',
          type: 'service',
          description: 'Driver was rude and took a longer route intentionally.',
          evidence: [],
          status: 'under_review',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ];

      setDisputes(mockDisputes);
    } catch (error) {
      console.error('Failed to load disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (disputeId: string, action: 'approve' | 'reject') => {
    if (!resolution) {
      toast.error('Please provide a resolution message');
      return;
    }

    try {
      const { error } = await supabase
        .from('disputes')
        .update({
          status: 'resolved',
          resolution,
          admin_notes: adminNotes,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', disputeId);

      if (error) throw error;

      toast.success('Dispute resolved successfully');
      setSelectedDispute(null);
      setResolution('');
      setAdminNotes('');
      loadDisputes();
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
      toast.error('Failed to resolve dispute');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      open: { variant: 'destructive' as const, label: 'Open' },
      under_review: { variant: 'secondary' as const, label: 'Under Review' },
      resolved: { variant: 'default' as const, label: 'Resolved' },
      closed: { variant: 'outline' as const, label: 'Closed' },
    };

    const { variant, label } = config[status as keyof typeof config] || { variant: 'outline' as const, label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const labels = {
      pricing: 'Pricing',
      service: 'Service',
      safety: 'Safety',
      lost_item: 'Lost Item',
      payment: 'Payment',
    };

    return <Badge variant="outline">{labels[type as keyof typeof labels] || type}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {disputes.filter(d => d.status === 'open').length}
            </div>
            <p className="text-sm text-muted-foreground">Open Disputes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {disputes.filter(d => d.status === 'under_review').length}
            </div>
            <p className="text-sm text-muted-foreground">Under Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {disputes.filter(d => d.status === 'resolved').length}
            </div>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">24.5h</div>
            <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Disputes List */}
      <Card>
        <CardHeader>
          <CardTitle>All Disputes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <div key={dispute.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={dispute.filed_by_photo} />
                      <AvatarFallback>{dispute.filed_by_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{dispute.filed_by_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Trip ID: {dispute.trip_id}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(dispute.status)}
                    {getTypeBadge(dispute.type)}
                  </div>
                </div>

                <p className="text-sm mb-4">{dispute.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {new Date(dispute.created_at).toLocaleString()}
                  </div>
                  {dispute.status === 'open' || dispute.status === 'under_review' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDispute(dispute)}
                    >
                      Review & Resolve
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm">
                      View Resolution
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resolution Modal */}
      {selectedDispute && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resolve Dispute</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDispute(null)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium mb-2">User: {selectedDispute.filed_by_name}</p>
              <p className="text-sm text-muted-foreground mb-2">
                Trip ID: {selectedDispute.trip_id}
              </p>
              <p className="text-sm">{selectedDispute.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Resolution Message (will be sent to user)
              </label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Explain how the dispute was resolved..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Admin Notes (internal only)
              </label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes about this resolution..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="default"
                className="flex-1"
                onClick={() => handleResolve(selectedDispute.id, 'approve')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Resolve in Favor of User
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleResolve(selectedDispute.id, 'reject')}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Resolve in Favor of Driver
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
