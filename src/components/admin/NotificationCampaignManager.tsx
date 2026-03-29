/**
 * Push Notification Campaign Manager (Admin)
 * Create and schedule automated notification sequences
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { Bell, Send, Clock, Users, Target, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/server`;

// Pre-defined campaign templates
const CAMPAIGN_TEMPLATES = [
  {
    id: 'new_rider_day0',
    name: 'New Rider - Welcome',
    audience: 'new_riders',
    delay_minutes: 0,
    title: 'Welcome to Wasel! 🎉',
    message: 'Your first ride is FREE (up to 5 JOD). Book now!',
  },
  {
    id: 'new_rider_day1',
    name: 'New Rider - Book First Trip',
    audience: 'new_riders_no_trip',
    delay_minutes: 1440, // 24 hours
    title: 'Ready for your first ride?',
    message: 'Book now and use your 5 JOD free credit. Valid for 7 days!',
  },
  {
    id: 'new_rider_day3',
    name: 'New Rider - Reminder',
    audience: 'new_riders_no_trip',
    delay_minutes: 4320, // 72 hours
    title: 'Don\'t forget your FREE ride!',
    message: 'Your 5 JOD credit expires soon. Book today!',
  },
  {
    id: 'inactive_rider',
    name: 'Re-engage Inactive Rider',
    audience: 'inactive_riders',
    delay_minutes: 0,
    title: 'We miss you! 20% off your next ride',
    message: 'Come back and save 20% on your next trip. Limited time offer!',
  },
  {
    id: 'new_driver_day0',
    name: 'New Driver - Welcome',
    audience: 'new_drivers',
    delay_minutes: 0,
    title: 'Welcome, Driver! 💰',
    message: 'Complete 100 trips and earn 2,000 JOD guaranteed. Start earning now!',
  },
  {
    id: 'new_driver_day1',
    name: 'New Driver - Upload Docs',
    audience: 'new_drivers_pending_docs',
    delay_minutes: 1440,
    title: 'Almost there! Upload your documents',
    message: 'Get approved in 24 hours and start earning with your 2,000 JOD guarantee.',
  },
  {
    id: 'inactive_driver',
    name: 'Re-engage Inactive Driver',
    audience: 'inactive_drivers',
    delay_minutes: 0,
    title: 'High demand in your area! 🚗',
    message: 'Go online now and earn with surge pricing. Don\'t miss out!',
  },
];

const AUDIENCES = [
  { id: 'all', label: 'All Users', description: 'Everyone registered' },
  { id: 'new_riders', label: 'New Riders (Day 0)', description: 'Signed up in last 24h' },
  { id: 'new_riders_no_trip', label: 'New Riders (No Trip)', description: 'Signed up but no trips' },
  { id: 'inactive_riders', label: 'Inactive Riders', description: 'No trip in 7 days' },
  { id: 'active_riders', label: 'Active Riders', description: '2+ trips this week' },
  { id: 'new_drivers', label: 'New Drivers (Day 0)', description: 'Signed up in last 24h' },
  { id: 'new_drivers_pending_docs', label: 'New Drivers (Pending)', description: 'Docs not uploaded' },
  { id: 'inactive_drivers', label: 'Inactive Drivers', description: 'No trip in 3 days' },
  { id: 'students', label: 'Students', description: 'Verified students' },
];

export function NotificationCampaignManager() {
  const { user, session } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // New campaign form
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    audience: 'all',
    title: '',
    message: '',
    schedule_type: 'immediate', // immediate | delayed | scheduled
    delay_minutes: 0,
    scheduled_time: '',
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${API_BASE}/campaigns/list`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.title || !newCampaign.message) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/campaigns/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        },
        body: JSON.stringify(newCampaign),
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      toast.success('Campaign created successfully!');
      setShowCreate(false);
      setNewCampaign({
        name: '',
        audience: 'all',
        title: '',
        message: '',
        schedule_type: 'immediate',
        delay_minutes: 0,
        scheduled_time: '',
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`${API_BASE}/campaigns/send/${campaignId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to send campaign');
      }

      const data = await response.json();
      toast.success(`Campaign sent to ${data.sent_count} users!`);
      fetchCampaigns();
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error('Failed to send campaign');
    }
  };

  const handleUseTemplate = (template: any) => {
    setNewCampaign({
      name: template.name,
      audience: template.audience,
      title: template.title,
      message: template.message,
      schedule_type: template.delay_minutes > 0 ? 'delayed' : 'immediate',
      delay_minutes: template.delay_minutes,
      scheduled_time: '',
    });
    setShowCreate(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Notification Campaigns</CardTitle>
                <CardDescription>Automate user engagement and activation</CardDescription>
              </div>
            </div>
            <Button onClick={() => setShowCreate(!showCreate)}>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </CardHeader>

        {showCreate && (
          <CardContent className="border-t">
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Campaign Name</label>
                <Input
                  placeholder="e.g., New Rider Welcome"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Target Audience</label>
                <Select
                  value={newCampaign.audience}
                  onValueChange={(value) => setNewCampaign({ ...newCampaign, audience: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIENCES.map((aud) => (
                      <SelectItem key={aud.id} value={aud.id}>
                        {aud.label} - {aud.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notification Title</label>
                <Input
                  placeholder="e.g., Welcome to Wasel!"
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {newCampaign.title.length}/50 characters
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea
                  placeholder="Your message here..."
                  value={newCampaign.message}
                  onChange={(e) => setNewCampaign({ ...newCampaign, message: e.target.value })}
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {newCampaign.message.length}/200 characters
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Send When</label>
                <Select
                  value={newCampaign.schedule_type}
                  onValueChange={(value) => setNewCampaign({ ...newCampaign, schedule_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Send Immediately</SelectItem>
                    <SelectItem value="delayed">Send After Delay</SelectItem>
                    <SelectItem value="scheduled">Schedule for Later</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newCampaign.schedule_type === 'delayed' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Delay (minutes)</label>
                  <Input
                    type="number"
                    placeholder="1440"
                    value={newCampaign.delay_minutes}
                    onChange={(e) => setNewCampaign({ ...newCampaign, delay_minutes: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    1440 = 24 hours, 4320 = 72 hours
                  </p>
                </div>
              )}

              {newCampaign.schedule_type === 'scheduled' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Scheduled Time</label>
                  <Input
                    type="datetime-local"
                    value={newCampaign.scheduled_time}
                    onChange={(e) => setNewCampaign({ ...newCampaign, scheduled_time: e.target.value })}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleCreateCampaign} disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Campaign'}
                </Button>
                <Button variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Templates</CardTitle>
          <CardDescription>Pre-built campaigns for common use cases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CAMPAIGN_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleUseTemplate(template)}
                className="p-3 border rounded-lg text-left hover:border-purple-500 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-sm">{template.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {template.delay_minutes === 0 ? 'Instant' : `${template.delay_minutes / 60}h delay`}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{template.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{template.message}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No campaigns yet. Create one to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Target: {AUDIENCES.find(a => a.id === campaign.audience)?.label}
                      </p>
                      <p className="text-sm mt-2">
                        <strong>{campaign.title}</strong><br />
                        {campaign.message}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant={campaign.status === 'sent' ? 'default' : 'outline'}>
                        {campaign.status === 'sent' ? `Sent (${campaign.sent_count})` : 'Draft'}
                      </Badge>
                      {campaign.status !== 'sent' && (
                        <Button
                          size="sm"
                          onClick={() => handleSendCampaign(campaign.id)}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Send Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
