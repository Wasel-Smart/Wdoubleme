import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Check, Minus, Plus, Users, DollarSign, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '../utils/clipboard';
import { useLanguage } from '../contexts/LanguageContext';

interface SplitPaymentProps {
  tripId?: string;
  totalAmount?: number;
  driverName?: string;
  onComplete?: () => void;
}

interface SplitMember {
  id: string;
  name: string;
  email: string;
  amount: number;
  paid: boolean;
}

export function SplitPayment({ tripId = 'demo', totalAmount = 0, driverName = '', onComplete }: SplitPaymentProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [splitMethod, setSplitMethod] = useState<'equal' | 'custom'>('equal');
  const [members, setMembers] = useState<SplitMember[]>([
    { id: '1', name: 'You', email: 'you@email.com', amount: 0, paid: false },
  ]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);

  const calculateSplit = () => {
    if (splitMethod === 'equal') {
      const amountPerPerson = totalAmount / members.length;
      return members.map(m => ({ ...m, amount: parseFloat(amountPerPerson.toFixed(2)) }));
    }
    return members;
  };

  const updatedMembers = calculateSplit();
  const totalSplit = updatedMembers.reduce((sum, m) => sum + m.amount, 0);
  const remaining = totalAmount - totalSplit;

  const addMember = () => {
    if (!newMemberName.trim()) {
      toast.error(isRTL ? 'حط اسم' : 'Please enter a name');
      return;
    }

    const newMember: SplitMember = {
      id: Date.now().toString(),
      name: newMemberName,
      email: newMemberEmail,
      amount: 0,
      paid: false,
    };

    setMembers([...members, newMember]);
    setNewMemberName('');
    setNewMemberEmail('');
    setShowAddMember(false);
    toast.success(isRTL ? 'تمت إضافة العضو' : 'Member added');
  };

  const removeMember = (id: string) => {
    if (members.length === 1) {
      toast.error(isRTL ? 'ما تقدر تشيل حالك' : 'You cannot remove yourself');
      return;
    }
    setMembers(members.filter(m => m.id !== id));
  };

  const updateCustomAmount = (id: string, amount: number) => {
    setMembers(members.map(m => m.id === id ? { ...m, amount } : m));
  };

  const markAsPaid = (id: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, paid: true } : m));
    toast.success(isRTL ? 'تم تعيين الدفع كمستلم' : 'Payment marked as received');
  };

  const sendPaymentRequests = () => {
    // In a real app, this would send payment requests via email/notification
    toast.success(isRTL ? `تم إرسال طلبات الدفع إلى ${members.length - 1} أعضاء` : `Payment requests sent to ${members.length - 1} members`);
    onComplete?.();
  };

  const sharePaymentLink = async () => {
    const shareData = {
      title: 'Wasel Trip Payment Split',
      text: `Split payment request for trip with ${driverName}. Your share: JOD ${updatedMembers.find(m => m.id !== '1')?.amount || 0}`,
      url: `https://wasel.app/pay/${tripId}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success(isRTL ? 'تمت المشاركة بنجاح!' : 'Shared successfully!');
      } else {
        copyToClipboard(shareData.url);
        toast.success(isRTL ? 'تم نسخ رابط الدفع!' : 'Payment link copied!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isRTL ? 'تقسيم الدفع' : 'Split Payment'}</CardTitle>
        <CardDescription>
          {isRTL ? 'قسّم تكلفة الرحلة مع الركاب الآخرين' : 'Split the trip cost with other passengers'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trip Info */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{isRTL ? 'السائق' : 'Driver'}</p>
              <p className="font-medium">{driverName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{isRTL ? 'المبلغ الإجمالي' : 'Total Amount'}</p>
              <p className="text-2xl">JOD {totalAmount}</p>
            </div>
          </div>
        </div>

        {/* Split Method */}
        <div className="space-y-2">
          <Label>{isRTL ? 'طريقة التقسيم' : 'Split Method'}</Label>
          <div className="flex gap-2">
            <Button
              variant={splitMethod === 'equal' ? 'default' : 'outline'}
              onClick={() => setSplitMethod('equal')}
              className={`flex-1 ${splitMethod === 'equal' ? 'bg-primary text-primary-foreground' : ''}`}
            >
              <Users className="w-4 h-4 mr-2" />
              {isRTL ? 'تقسيم متساوي' : 'Equal Split'}
            </Button>
            <Button
              variant={splitMethod === 'custom' ? 'default' : 'outline'}
              onClick={() => setSplitMethod('custom')}
              className={`flex-1 ${splitMethod === 'custom' ? 'bg-primary text-primary-foreground' : ''}`}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              {isRTL ? 'مبلغ مخصص' : 'Custom Amount'}
            </Button>
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Split with ({members.length} people)</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddMember(!showAddMember)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Person
            </Button>
          </div>

          {/* Add Member Form */}
          {showAddMember && (
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Friend's name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email or Phone (Optional)</Label>
                  <Input
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="For sending payment request"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addMember} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                    Add
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddMember(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Member Cards */}
          <div className="space-y-2">
            {updatedMembers.map((member) => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  member.paid ? 'bg-primary/5 border-primary/30' : 'bg-background'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {member.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{member.name}</p>
                    {member.email && (
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {splitMethod === 'custom' ? (
                    <Input
                      type="number"
                      value={member.amount || ''}
                      onChange={(e) => updateCustomAmount(member.id, parseFloat(e.target.value) || 0)}
                      className="w-24 text-right"
                      placeholder="0"
                      disabled={member.paid}
                    />
                  ) : (
                    <div className="text-right min-w-24">
                      <p className="font-medium">JOD {member.amount.toFixed(2)}</p>
                    </div>
                  )}

                  {member.id !== '1' && !member.paid && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsPaid(member.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMember(member.id)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </>
                  )}

                  {member.paid && (
                    <Badge variant="default" className="bg-primary">
                      <Check className="w-3 h-3 mr-1" />
                      Paid
                    </Badge>
                  )}

                  {member.id === '1' && (
                    <Badge variant="outline">You</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="font-medium">JOD {totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Split Among</span>
            <span className="font-medium">{members.length} people</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Already Split</span>
            <span className="font-medium">JOD {totalSplit.toFixed(2)}</span>
          </div>
          {Math.abs(remaining) > 0.01 && (
            <div className="flex items-center justify-between text-accent">
              <span>Remaining</span>
              <span className="font-medium">JOD {remaining.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={sharePaymentLink}
            variant="outline"
            className="flex-1"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Link
          </Button>
          <Button
            onClick={sendPaymentRequests}
            disabled={Math.abs(remaining) > 0.01}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Send Requests
          </Button>
        </div>

        {Math.abs(remaining) > 0.01 && (
          <p className="text-sm text-center text-muted-foreground">
            Please adjust amounts to match the total before sending requests
          </p>
        )}
      </CardContent>
    </Card>
  );
}