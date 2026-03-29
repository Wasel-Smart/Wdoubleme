import { useState } from 'react';
import { Ticket, Plus, Trash2, Edit, Copy, TrendingUp, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { copyToClipboard } from '../utils/clipboard';

export function PromoCodesManager() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');
  
  const [promoCodes, setPromoCodes] = useState([
    {
      id: 1,
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      description: 'Welcome bonus for new users',
      uses: 245,
      maxUses: 1000,
      expiresAt: '2025-12-31',
      status: 'active',
    },
    {
      id: 2,
      code: 'RAMADAN2025',
      type: 'fixed',
      value: 20,
      description: 'Ramadan special discount',
      uses: 567,
      maxUses: 2000,
      expiresAt: '2025-04-30',
      status: 'active',
    },
    {
      id: 3,
      code: 'FIRSTRIDE',
      type: 'fixed',
      value: 15,
      description: 'First ride discount',
      uses: 890,
      maxUses: null,
      expiresAt: null,
      status: 'active',
    },
  ]);

  const [newPromo, setNewPromo] = useState({
    code: '',
    type: 'percentage',
    value: '',
    description: '',
    maxUses: '',
    expiresAt: '',
  });

  const handleCreatePromo = () => {
    if (!newPromo.code || !newPromo.value) {
      toast.error('Please fill in all required fields');
      return;
    }

    const promo = {
      id: Date.now(),
      code: newPromo.code.toUpperCase(),
      type: newPromo.type,
      value: parseFloat(newPromo.value),
      description: newPromo.description,
      uses: 0,
      maxUses: newPromo.maxUses ? parseInt(newPromo.maxUses) : null,
      expiresAt: newPromo.expiresAt || null,
      status: 'active' as const,
    };

    setPromoCodes([...promoCodes, promo]);
    toast.success('Promo code created successfully!');
    setShowCreateDialog(false);
    setNewPromo({
      code: '',
      type: 'percentage',
      value: '',
      description: '',
      maxUses: '',
      expiresAt: '',
    });
  };

  const copyPromoCode = (code: string) => {
    copyToClipboard(code);
    toast.success('Promo code copied!');
  };

  const deletePromo = (id: number) => {
    setPromoCodes(promoCodes.filter(p => p.id !== id));
    toast.success('Promo code deleted');
  };

  const activePromos = promoCodes.filter(p => p.status === 'active');
  const expiredPromos = promoCodes.filter(p => p.status === 'expired');

  const totalUses = promoCodes.reduce((sum, p) => sum + p.uses, 0);
  const totalSavings = promoCodes.reduce((sum, p) => {
    if (p.type === 'fixed') {
      return sum + (p.uses * p.value);
    } else {
      return sum + (p.uses * 25); // Estimated average savings
    }
  }, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Promo Codes Manager</h1>
          <p className="text-muted-foreground">Create and manage promotional discount codes</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Promo Code</DialogTitle>
              <DialogDescription>
                Create a new promotional discount code
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Promo Code *</Label>
                <Input
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SUMMER25"
                  className="uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label>Discount Type *</Label>
                <Select
                  value={newPromo.type}
                  onValueChange={(value) => setNewPromo({ ...newPromo, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (JOD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Discount Value *</Label>
                <Input
                  type="number"
                  value={newPromo.value}
                  onChange={(e) => setNewPromo({ ...newPromo, value: e.target.value })}
                  placeholder={newPromo.type === 'percentage' ? '10' : '20'}
                />
                <p className="text-xs text-muted-foreground">
                  {newPromo.type === 'percentage' ? 'Enter percentage (e.g., 10 for 10%)' : 'Enter amount in JOD'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newPromo.description}
                  onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                  placeholder="e.g., Summer special discount"
                />
              </div>

              <div className="space-y-2">
                <Label>Max Uses (Optional)</Label>
                <Input
                  type="number"
                  value={newPromo.maxUses}
                  onChange={(e) => setNewPromo({ ...newPromo, maxUses: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="space-y-2">
                <Label>Expiration Date (Optional)</Label>
                <Input
                  type="date"
                  value={newPromo.expiresAt}
                  onChange={(e) => setNewPromo({ ...newPromo, expiresAt: e.target.value })}
                />
              </div>

              <Button onClick={handleCreatePromo} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Create Promo Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Codes</p>
                <p className="text-3xl">{activePromos.length}</p>
              </div>
              <Ticket className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Uses</p>
                <p className="text-3xl">{totalUses.toLocaleString()}</p>
              </div>
              <Users className="w-10 h-10 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Savings</p>
                <p className="text-3xl">JOD {totalSavings.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promo Codes Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'active' ? 'default' : 'outline'}
              onClick={() => setActiveTab('active')}
              className={activeTab === 'active' ? 'bg-primary text-primary-foreground' : ''}
            >
              Active ({activePromos.length})
            </Button>
            <Button
              variant={activeTab === 'expired' ? 'default' : 'outline'}
              onClick={() => setActiveTab('expired')}
              className={activeTab === 'expired' ? 'bg-primary text-primary-foreground' : ''}
            >
              Expired ({expiredPromos.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(activeTab === 'active' ? activePromos : expiredPromos).map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded">{promo.code}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPromoCode(promo.code)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    {promo.description && (
                      <p className="text-xs text-muted-foreground mt-1">{promo.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {promo.type === 'percentage' ? 'Percentage' : 'Fixed'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {promo.type === 'percentage' ? `${promo.value}%` : `JOD ${promo.value}`}
                  </TableCell>
                  <TableCell>
                    {promo.uses}
                    {promo.maxUses && ` / ${promo.maxUses}`}
                  </TableCell>
                  <TableCell>
                    {promo.expiresAt ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        {new Date(promo.expiresAt).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No expiry</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePromo(promo.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}