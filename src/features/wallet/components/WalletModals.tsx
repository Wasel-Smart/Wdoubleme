/**
 * WalletModals — Extracted from WalletDashboard.tsx
 * Contains: TopUpModal, WithdrawModal, SendMoneyModal, PinSetupModal
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard, Smartphone, Landmark, Zap,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { WaselColors } from '../../../tokens/wasel-tokens';

// ── Shared Modal Shell ────────────────────────────────────────────────────────

interface ModalShellProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function ActionModal({ show, onClose, title, children }: ModalShellProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md rounded-2xl border border-border/50 p-6 space-y-4"
            style={{ background: WaselColors.navyCard }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Top-Up Modal ──────────────────────────────────────────────────────────────

interface TopUpModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (amount: number, method: string) => Promise<void>;
  t: Record<string, string>;
  isRTL: boolean;
  actionLoading: boolean;
}

export function TopUpModal({ show, onClose, onConfirm, t, isRTL, actionLoading }: TopUpModalProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');

  const handleConfirm = async () => {
    await onConfirm(parseFloat(amount), method);
    setAmount('');
  };

  const methods = [
    { id: 'card', label: t.card, icon: CreditCard },
    { id: 'apple_pay', label: t.applePay, icon: Smartphone },
    { id: 'bank_transfer', label: t.bankTransfer, icon: Landmark },
    { id: 'cliq', label: t.cliq, icon: Zap },
  ];

  return (
    <ActionModal show={show} onClose={onClose} title={t.addMoney}>
      <div className="space-y-3">
        {/* Quick amounts */}
        <div className="grid grid-cols-4 gap-2">
          {[5, 10, 20, 50].map((amt) => (
            <Button
              key={amt}
              variant={amount === String(amt) ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAmount(String(amt))}
              className="rounded-lg text-sm"
            >
              {amt}
            </Button>
          ))}
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">{t.topUpAmount}</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 rounded-lg" placeholder="0.00" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">{t.paymentMethod}</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${method === m.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-muted-foreground/50'}`}
              >
                <m.icon className="w-4 h-4" />
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={handleConfirm} disabled={actionLoading} className="w-full rounded-xl h-11 font-semibold" style={{ background: WaselColors.teal }}>
          {actionLoading ? t.processing : `${t.topUp} ${amount ? `${amount} ${t.jod}` : ''}`}
        </Button>
      </div>
    </ActionModal>
  );
}

// ── Withdraw Modal ────────────────────────────────────────────────────────────

interface WithdrawModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (amount: number, bankAccount: string, method: string) => Promise<void>;
  t: Record<string, string>;
  isRTL: boolean;
  actionLoading: boolean;
  balance: number;
}

export function WithdrawModal({ show, onClose, onConfirm, t, isRTL, actionLoading, balance }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [method, setMethod] = useState('bank_transfer');

  const handleConfirm = async () => {
    await onConfirm(parseFloat(amount), bankAccount, method);
    setAmount('');
    setBankAccount('');
  };

  return (
    <ActionModal show={show} onClose={onClose} title={t.withdraw}>
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">{t.withdrawAmount}</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 rounded-lg" placeholder="0.00" />
          <p className="text-xs text-muted-foreground mt-1">{isRTL ? 'الرصيد المتاح' : 'Available'}: {balance.toFixed(2)} {t.jod}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">{t.bankAccount}</Label>
          <Input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} className="mt-1 rounded-lg" placeholder="JO12ABCD..." />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'instant', label: t.instant, fee: '0.50 JOD' },
            { id: 'bank_transfer', label: t.standard, fee: isRTL ? 'مجاني' : 'Free' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`p-3 rounded-lg border text-left transition-all ${method === m.id ? 'border-primary bg-primary/10' : 'border-border hover:border-muted-foreground/50'}`}
            >
              <p className="text-sm font-medium">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.fee}</p>
            </button>
          ))}
        </div>
        <Button onClick={handleConfirm} disabled={actionLoading} className="w-full rounded-xl h-11 font-semibold" style={{ background: WaselColors.bronze }}>
          {actionLoading ? t.processing : t.confirmWithdraw}
        </Button>
      </div>
    </ActionModal>
  );
}

// ── Send Money Modal ──────────────────────────────────────────────────────────

interface SendMoneyModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (recipient: string, amount: number, note: string) => Promise<void>;
  t: Record<string, string>;
  isRTL: boolean;
  actionLoading: boolean;
}

export function SendMoneyModal({ show, onClose, onConfirm, t, isRTL, actionLoading }: SendMoneyModalProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleConfirm = async () => {
    await onConfirm(recipient, parseFloat(amount), note);
    setRecipient('');
    setAmount('');
    setNote('');
  };

  return (
    <ActionModal show={show} onClose={onClose} title={t.sendMoney}>
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">{t.recipientId}</Label>
          <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} className="mt-1 rounded-lg" placeholder={isRTL ? 'معرّف المستلم' : 'User ID'} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">{t.sendAmount}</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 rounded-lg" placeholder="0.00" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">{t.noteOptional}</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 rounded-lg" placeholder={isRTL ? 'ملاحظة...' : 'Note...'} />
        </div>
        <Button onClick={handleConfirm} disabled={actionLoading} className="w-full rounded-xl h-11 font-semibold" style={{ background: WaselColors.teal }}>
          {actionLoading ? t.processing : `${t.confirmSend} ${amount ? `${amount} ${t.jod}` : ''}`}
        </Button>
      </div>
    </ActionModal>
  );
}

// ── PIN Setup Modal ───────────────────────────────────────────────────────────

interface PinSetupModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => Promise<void>;
  t: Record<string, string>;
  isRTL: boolean;
  actionLoading: boolean;
  isPinSet: boolean;
}

export function PinSetupModal({ show, onClose, onConfirm, t, isRTL, actionLoading, isPinSet }: PinSetupModalProps) {
  const [pin, setPin] = useState('');

  const handleClose = () => {
    setPin('');
    onClose();
  };

  const handleConfirm = async () => {
    await onConfirm(pin);
    setPin('');
  };

  return (
    <ActionModal show={show} onClose={handleClose} title={isPinSet ? t.changePin : t.setPin}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t.pinDescription}</p>
        <div className="flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${pin.length > i ? 'border-primary text-foreground' : 'border-border text-transparent'}`}
            >
              {pin[i] ? '•' : ''}
            </div>
          ))}
        </div>
        <Input
          type="tel"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          className="text-center text-2xl tracking-[1em] rounded-lg"
          placeholder="••••"
          autoFocus
        />
        <Button
          onClick={handleConfirm}
          disabled={actionLoading || pin.length !== 4}
          className="w-full rounded-xl h-11 font-semibold"
          style={{ background: WaselColors.teal }}
        >
          {actionLoading ? t.processing : t.setPin}
        </Button>
      </div>
    </ActionModal>
  );
}
