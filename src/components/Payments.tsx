/**
 * Passenger Wallet & Payments
 * 
 * A comprehensive fintech dashboard for Wasel passengers.
 * 
 * Features:
 * - Wallet balance visualization (Credit Card style)
 * - One-tap top-up & withdrawal
 * - Transaction history with smart filtering
 * - Escrow & pending fund tracking
 * - Subscription management teaser
 * 
 * @module Payments
 */

import { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  ArrowRight, 
  Clock, 
  Zap, 
  ArrowDownLeft, 
  ArrowUpRight, 
  MoreHorizontal, 
  Filter, 
  History 
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

// --- Types ---

interface Transaction {
  id: string;
  type: 'Ride Payment' | 'Wallet Top-up' | 'Subscription' | 'Refund';
  amount: number;
  currency: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  method?: string; // e.g., 'Visa •••• 4242'
  merchant?: string; // e.g., 'Wasel Inc.'
}

// --- Mock Data ---

const MOCK_TRANSACTIONS: Transaction[] = [
  { 
    id: 'tx-1', 
    type: 'Ride Payment', 
    amount: -2.500, 
    currency: 'JOD', 
    date: 'Today, 8:45 AM', 
    status: 'Completed', 
    method: 'Wallet', 
    merchant: 'Captain Ahmad' 
  },
  { 
    id: 'tx-2', 
    type: 'Wallet Top-up', 
    amount: +20.000, 
    currency: 'JOD', 
    date: 'Yesterday, 6:30 PM', 
    status: 'Completed', 
    method: 'Visa •••• 4242', 
    merchant: 'Wasel Wallet' 
  },
  { 
    id: 'tx-3', 
    type: 'Ride Payment', 
    amount: -3.100, 
    currency: 'JOD', 
    date: 'Oct 23, 2024', 
    status: 'Completed', 
    method: 'Wallet', 
    merchant: 'Captain Sami' 
  },
  { 
    id: 'tx-4', 
    type: 'Subscription', 
    amount: -45.000, 
    currency: 'JOD', 
    date: 'Oct 01, 2024', 
    status: 'Completed', 
    method: 'Mastercard •••• 8888', 
    merchant: 'Wasel Pro (Monthly)' 
  },
];

// --- Sub-Components ---

const BalanceCard = ({ balance }: { balance: number }) => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-2xl ring-1 ring-white/10">
    {/* Abstract Background */}
    <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
    
    <div className="relative z-10 flex flex-col justify-between h-full space-y-8">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-400 tracking-wide uppercase">Total Balance</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold tracking-tight">{balance.toFixed(3)}</h2>
            <span className="text-lg font-medium text-slate-500">JOD</span>
          </div>
        </div>
        <div className="h-10 w-10 rounded-full bg-white/5 backdrop-blur flex items-center justify-center border border-white/10">
          <ShieldCheck className="h-5 w-5 text-teal-400" />
        </div>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white border-0 font-semibold shadow-lg shadow-teal-900/20">
          <Plus className="mr-2 h-4 w-4" /> Top Up
        </Button>
        <Button variant="outline" className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm">
          <ArrowRight className="mr-2 h-4 w-4" /> Send
        </Button>
      </div>
    </div>
  </div>
);

const EscrowStatus = () => (
  <div className="grid grid-cols-2 gap-3">
    <Card className="bg-orange-50/50 border-orange-100/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-orange-100 rounded-md">
            <Clock className="h-3.5 w-3.5 text-orange-600" />
          </div>
          <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">Pending</span>
        </div>
        <p className="text-xl font-bold text-slate-900">1.250 <span className="text-sm font-normal text-muted-foreground">JOD</span></p>
        <p className="text-[10px] text-muted-foreground mt-1">Held in escrow for current ride</p>
      </CardContent>
    </Card>
    <Card className="bg-blue-50/50 border-blue-100/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-blue-100 rounded-md">
            <Zap className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Saved</span>
        </div>
        <p className="text-xl font-bold text-slate-900">12.500 <span className="text-sm font-normal text-muted-foreground">JOD</span></p>
        <p className="text-[10px] text-muted-foreground mt-1">Total savings this month</p>
      </CardContent>
    </Card>
  </div>
);

const TransactionItem = ({ tx }: { tx: Transaction }) => {
  const isPositive = tx.amount > 0;
  
  return (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors rounded-xl group cursor-pointer border border-transparent hover:border-slate-100">
      <div className="flex items-center gap-4">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${
          isPositive 
            ? 'bg-green-100 text-green-600' 
            : 'bg-slate-100 text-slate-600'
        }`}>
          {isPositive ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-900 group-hover:text-primary transition-colors">{tx.merchant || tx.type}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {tx.date} 
            {tx.method && <span className="hidden sm:inline">• {tx.method}</span>}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold text-sm ${isPositive ? 'text-green-600' : 'text-slate-900'}`}>
          {isPositive ? '+' : ''}{Math.abs(tx.amount).toFixed(3)} {tx.currency}
        </p>
        <Badge variant={tx.status === 'Completed' ? 'secondary' : 'outline'} className="text-[10px] h-5 px-1.5 font-normal">
          {tx.status}
        </Badge>
      </div>
    </div>
  );
};

// --- Main Component ---

export function Payments() {
  const [balance] = useState(14.500);

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Wallet</h1>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreHorizontal className="h-5 w-5 text-slate-500" />
        </Button>
      </div>

      {/* Main Balance */}
      <BalanceCard balance={balance} />

      {/* Escrow & Savings */}
      <EscrowStatus />

      {/* Subscription Teaser */}
      <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform origin-bottom-right" />
        <CardContent className="p-5 flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 text-[10px] font-bold px-1.5">PRO</Badge>
              <h3 className="font-bold text-sm tracking-wide">Wasel Subscription</h3>
            </div>
            <p className="text-xs text-purple-100 max-w-[200px]">Save up to 30% on daily commutes with auto-renewing bundles.</p>
          </div>
          <div className="h-12 w-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
            30%
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-lg text-slate-900">Recent Activity</h3>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-muted-foreground">
               <Filter className="h-3 w-3 mr-1" /> Filter
             </Button>
             <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-primary">
               See All
             </Button>
          </div>
        </div>
        
        <Card className="border border-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">
            {MOCK_TRANSACTIONS.map((tx) => (
              <TransactionItem key={tx.id} tx={tx} />
            ))}
          </div>
          {MOCK_TRANSACTIONS.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No recent transactions</p>
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}
