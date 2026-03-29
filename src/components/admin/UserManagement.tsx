/**
 * User Management Component
 * 
 * Complete user administration including search, filter,
 * suspend/ban, verification management.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { 
  Search, 
  Filter, 
  Ban, 
  CheckCircle, 
  XCircle,
  MoreVertical,
  Eye,
  Mail,
  Phone,
  Shield,
  User as UserIcon,
  Bot,
  AlertTriangle,
  Pencil,
  Trash2,
  Plus,
  ShieldAlert
} from 'lucide-react';
import { supabase } from '../../services/core';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'passenger' | 'driver' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  verified: boolean;
  rating: number;
  total_trips: number;
  created_at: string;
  last_active: string;
  profile_photo?: string;
}

interface IAMPrincipal {
  id: string;
  type: 'service_account' | 'user';
  principal: string;
  name: string;
  roles: string[];
  securityInsights?: string;
  excessPermissions?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // IAM State
  const [iamPrincipals, setIamPrincipals] = useState<IAMPrincipal[]>([
    {
      id: '1',
      type: 'service_account',
      principal: '972743387950-compute@developer.gserviceaccount.com',
      name: 'Default compute service account',
      roles: ['Editor']
    },
    {
      id: '2',
      type: 'service_account',
      principal: 'firebase-adminsdk-fbsvc@coffee-spark-ai-barista-5d7f0.iam.gserviceaccount.com',
      name: 'firebase-adminsdk',
      roles: [
        'Firebase Admin SDK Administrator Service Agent',
        'Firebase App Check Admin',
        'Firebase Authentication Admin',
        'Service Account Token Creator'
      ]
    },
    {
      id: '3',
      type: 'user',
      principal: 'laith.nassar.90@gmail.com',
      name: 'Laith nassar',
      roles: ['Owner'],
      excessPermissions: '12237/12537 excess permissions'
    }
  ]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter, statusFilter, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // In production, this data comes from backend
      const mockUsers: User[] = (data || []).map((profile: any) => ({
        id: profile.id,
        email: profile.email || 'user@example.com',
        full_name: profile.full_name || 'User',
        phone: profile.phone || '+962791234567',
        role: profile.role || 'passenger',
        status: profile.status || 'active',
        verified: profile.verified || false,
        rating: profile.rating || 4.5,
        total_trips: profile.total_trips || 0,
        created_at: profile.created_at,
        last_active: profile.updated_at || profile.created_at,
        profile_photo: profile.avatar_url,
      }));

      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleSuspendUser = async (userId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to suspend this user? They will not be able to use the platform.'
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended', updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User suspended successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to suspend user:', error);
      toast.error('Failed to suspend user');
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User activated successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to activate user:', error);
      toast.error('Failed to activate user');
    }
  };

  const handleBanUser = async (userId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to BAN this user? This action is severe and should only be used for serious violations.'
    );

    if (!confirmed) return;

    const reason = window.prompt('Enter reason for ban:');
    if (!reason) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status: 'banned', 
          ban_reason: reason,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User banned successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to ban user:', error);
      toast.error('Failed to ban user');
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verified: true, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User verified successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to verify user:', error);
      toast.error('Failed to verify user');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'suspended':
        return <Badge variant="secondary">Suspended</Badge>;
      case 'banned':
        return <Badge variant="destructive">Banned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'driver':
        return <Badge variant="default">Driver</Badge>;
      case 'passenger':
        return <Badge variant="secondary">Passenger</Badge>;
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Access Management</h2>
          <p className="text-muted-foreground">
            Manage users, drivers, and system permissions.
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Passengers & Drivers</TabsTrigger>
          <TabsTrigger value="iam">IAM & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Existing User Management UI */}
          <Card>
            <CardHeader>
              <CardTitle>User Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="passenger">Passengers</SelectItem>
                    <SelectItem value="driver">Drivers</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Trips</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.profile_photo} />
                              <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {user.full_name}
                                {user.verified && (
                                  <CheckCircle className="w-4 h-4 text-blue-500" />
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {user.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            ⭐ {user.rating.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>{user.total_trips}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.status === 'active' ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSuspendUser(user.id)}
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                                {!user.verified && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleVerifyUser(user.id)}
                                  >
                                    <Shield className="w-4 h-4" />
                                  </Button>
                                )}
                              </>
                            ) : user.status === 'suspended' ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleActivateUser(user.id)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleBanUser(user.id)}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Badge variant="destructive">Banned</Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="iam" className="space-y-4">
          {/* IAM Permissions UI - Mimicking Google Cloud IAM Console */}
          <Card className="bg-background border-border">
            <CardHeader className="pb-2 border-b">
              <div className="flex flex-col gap-1">
                <div className="text-xs text-muted-foreground font-mono">IAM and admin / IAM</div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">Permissions for project Wasel 14 Online</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  These permissions affect this project and all of its resources. <button type="button" className="text-primary hover:underline">Learn more</button>
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 border-b flex items-center justify-between bg-card/50">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1 border-b-2 border-primary px-1 pb-2">
                    <span className="font-medium text-primary">View by principals</span>
                  </div>
                  <div className="px-1 pb-2 text-muted-foreground hover:text-foreground cursor-pointer">
                    View by roles
                  </div>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between gap-4 border-b">
                <div className="flex items-center gap-2">
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Grant access
                  </Button>
                  <Button size="sm" variant="ghost" disabled className="text-muted-foreground">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Remove access
                  </Button>
                </div>
                <div className="flex-1 max-w-md relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Filter Enter property name or value" 
                    className="pl-9 h-9"
                  />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldAlert className="w-4 h-4" />
                  <MoreVertical className="w-4 h-4" />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[40px]"><Checkbox /></TableHead>
                    <TableHead className="w-[60px]">Type</TableHead>
                    <TableHead className="min-w-[300px]">Principal ↑</TableHead>
                    <TableHead className="min-w-[200px]">Name</TableHead>
                    <TableHead className="min-w-[200px]">Role</TableHead>
                    <TableHead>Security insights</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {iamPrincipals.map((principal) => (
                    <TableRow key={principal.id} className="hover:bg-muted/50">
                      <TableCell><Checkbox /></TableCell>
                      <TableCell>
                        {principal.type === 'service_account' ? (
                          <Bot className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {principal.principal}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {principal.name}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-col gap-1">
                          {principal.roles.map((role, idx) => (
                            <span key={idx}>{role}</span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {principal.excessPermissions && (
                          <div className="flex items-center gap-2 text-blue-400 bg-blue-400/10 px-2 py-1 rounded text-xs w-fit">
                            <span className="font-semibold">{principal.excessPermissions}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
