import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { 
  UserPlus, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  Phone, 
  Mail,
  Car,
  Shield,
  TrendingUp,
  Users,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { supabase } from '../../utils/supabase/client';

interface DriverApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  appliedDate: string;
  status: 'pending' | 'documents_submitted' | 'verification' | 'approved' | 'rejected';
  documents: {
    license: boolean;
    insurance: boolean;
    registration: boolean;
    backgroundCheck: boolean;
  };
  vehicleType: string;
  referralCode?: string;
  notes: string;
}

export function DriverRecruitmentDashboard() {
  const { t } = useTranslation();
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      
      // Fetch driver applications from Supabase
      const { data, error } = await supabase
        .from('driver_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map database records to DriverApplication format
      const mappedApplications: DriverApplication[] = (data || []).map((app: any) => ({
        id: app.id,
        name: app.full_name,
        email: app.email,
        phone: app.phone,
        appliedDate: new Date(app.created_at).toISOString().split('T')[0],
        status: app.status,
        documents: {
          license: app.drivers_license_url ? true : false,
          insurance: app.vehicle_insurance_url ? true : false,
          registration: app.vehicle_registration_url ? true : false,
          backgroundCheck: app.background_check_status === 'approved',
        },
        vehicleType: app.vehicle_type || 'Sedan',
        notes: app.notes || '',
      }));
      
      setApplications(mappedApplications);
    } catch (error) {
      console.error('Error loading driver applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, newStatus: DriverApplication['status']) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/driver-applications/${id}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ status: newStatus })
      // });
      
      setApplications(prev => 
        prev.map(app => app.id === id ? { ...app, status: newStatus } : app)
      );
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    verification: applications.filter(a => a.status === 'verification').length,
  };

  const filteredApplications = applications
    .filter(app => filter === 'all' || app.status === filter)
    .filter(app => 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone.includes(searchTerm)
    );

  const getStatusColor = (status: DriverApplication['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'verification': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'documents_submitted': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getDocumentProgress = (documents: DriverApplication['documents']) => {
    const total = Object.keys(documents).length;
    const completed = Object.values(documents).filter(Boolean).length;
    return (completed / total) * 100;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-olive-400 bg-clip-text text-transparent">
            Driver Recruitment Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Manage driver applications and onboarding</p>
        </div>
        <Button className="bg-gradient-to-r from-teal-500 to-olive-500">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Drivers
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Applications</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
              </div>
              <Users className="w-10 h-10 text-teal-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">In Verification</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">{stats.verification}</p>
              </div>
              <Shield className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Approved</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{stats.approved}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Rejected</p>
                <p className="text-3xl font-bold text-red-400 mt-2">{stats.rejected}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recruitment Progress */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            Recruitment Progress
          </CardTitle>
          <CardDescription>Target: 50 drivers for launch</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Approved Drivers</span>
                <span className="text-white font-semibold">{stats.approved} / 50</span>
              </div>
              <Progress value={(stats.approved / 50) * 100} className="h-3" />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <p className="text-2xl font-bold text-teal-400">{((stats.approved / 50) * 100).toFixed(0)}%</p>
                <p className="text-sm text-gray-400 mt-1">Complete</p>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-400">{50 - stats.approved}</p>
                <p className="text-sm text-gray-400 mt-1">Needed</p>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <p className="text-2xl font-bold text-blue-400">{stats.pending + stats.verification}</p>
                <p className="text-sm text-gray-400 mt-1">In Pipeline</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md bg-gray-900/50 border-gray-800"
        />
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="flex-1">
          <TabsList className="bg-gray-900/50">
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Applications List */}
      <div className="grid gap-4">
        {loading ? (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-12 text-center">
              <Activity className="w-12 h-12 text-teal-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-400">Loading applications...</p>
            </CardContent>
          </Card>
        ) : filteredApplications.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No applications found</p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((app) => (
            <Card key={app.id} className="bg-gray-900/50 border-gray-800 hover:border-teal-500/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-olive-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {app.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                      <div className="flex gap-4 mt-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {app.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {app.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          {app.vehicleType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(app.status)}>
                    {app.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                {/* Document Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Documents</span>
                    <span className="text-white">{getDocumentProgress(app.documents).toFixed(0)}%</span>
                  </div>
                  <Progress value={getDocumentProgress(app.documents)} className="h-2" />
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {Object.entries(app.documents).map(([doc, completed]) => (
                      <div
                        key={doc}
                        className={`text-xs p-2 rounded flex items-center gap-1 ${
                          completed ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'
                        }`}
                      >
                        {completed ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {doc.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {app.notes && (
                  <p className="text-sm text-gray-400 mb-4 p-3 bg-gray-800/50 rounded">
                    <FileText className="w-4 h-4 inline mr-2" />
                    {app.notes}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {app.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateApplicationStatus(app.id, 'documents_submitted')}
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                      >
                        Request Documents
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateApplicationStatus(app.id, 'rejected')}
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {app.status === 'documents_submitted' && (
                    <Button
                      size="sm"
                      onClick={() => updateApplicationStatus(app.id, 'verification')}
                      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                    >
                      Start Verification
                    </Button>
                  )}
                  {app.status === 'verification' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateApplicationStatus(app.id, 'approved')}
                        className="bg-gradient-to-r from-teal-500 to-olive-500"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateApplicationStatus(app.id, 'rejected')}
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {app.status === 'approved' && (
                    <Badge className="bg-green-500/20 text-green-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ready to Drive
                    </Badge>
                  )}
                  <Button size="sm" variant="outline" className="ml-auto">
                    View Details
                  </Button>
                </div>

                <div className="text-xs text-gray-500 mt-3">
                  Applied: {new Date(app.appliedDate).toLocaleDateString()}
                  {app.referralCode && ` • Referral: ${app.referralCode}`}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
