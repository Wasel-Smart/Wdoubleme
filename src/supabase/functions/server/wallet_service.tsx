import { Hono } from 'npm:hono';
import { kv, getUserIdFromToken, logError } from './shared.tsx';

type TxType =
  | 'top_up'
  | 'withdrawal'
  | 'transfer_in'
  | 'transfer_out'
  | 'ride_payment'
  | 'package_payment'
  | 'earning'
  | 'reward';

type WalletRecord = {
  id: string;
  userId: string;
  balance: number;
  pendingBalance: number;
  rewardsBalance: number;
  totalEarned: number;
  totalSpent: number;
  totalDeposited: number;
  currency: 'JOD';
  pinHash: string | null;
  pinSet: boolean;
  autoTopUp: boolean;
  autoTopUpAmount: number;
  autoTopUpThreshold: number;
  walletStatus: 'active' | 'restricted' | 'suspended';
  createdAt: string;
  updatedAt: string;
};

type WalletTransaction = {
  id: string;
  walletId: string;
  userId: string;
  type: TxType;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  direction: 'credit' | 'debit';
  note: string;
  referenceId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

type PaymentMethodRecord = {
  id: string;
  userId: string;
  type: string;
  provider: string;
  label: string;
  last4: string | null;
  isDefault: boolean;
  createdAt: string;
};

const app = new Hono();

const nowIso = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
const roundMoney = (value: number) => Math.round(value * 1000) / 1000;
const walletKey = (userId: string) => `wallet:${userId}`;
const txKey = (userId: string, id: string) => `wallet_tx:${userId}:${id}`;
const methodKey = (userId: string, id: string) => `wallet_method:${userId}:${id}`;
const rewardKey = (userId: string, id: string) => `wallet_reward:${userId}:${id}`;
const subscriptionKey = (userId: string) => `wallet_subscription:${userId}`;
const trustKey = (userId: string) => `wallet_trust:${userId}`;

async function sha256(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function resolveActorId(c: any, requestedUserId: string): Promise<string> {
  const actorId = await getUserIdFromToken(c.req.header('Authorization'));
  return actorId || requestedUserId;
}

async function getWallet(userId: string): Promise<WalletRecord> {
  const existing = await kv.get(walletKey(userId)) as WalletRecord | null;
  if (existing) return existing;
  const createdAt = nowIso();
  const wallet: WalletRecord = {
    id: `wallet_${userId}`,
    userId,
    balance: 0,
    pendingBalance: 0,
    rewardsBalance: 0,
    totalEarned: 0,
    totalSpent: 0,
    totalDeposited: 0,
    currency: 'JOD',
    pinHash: null,
    pinSet: false,
    autoTopUp: false,
    autoTopUpAmount: 0,
    autoTopUpThreshold: 0,
    walletStatus: 'active',
    createdAt,
    updatedAt: createdAt,
  };
  await kv.set(walletKey(userId), wallet);
  return wallet;
}

async function listTransactions(userId: string): Promise<WalletTransaction[]> {
  const items = await kv.getByPrefix(`wallet_tx:${userId}:`) as WalletTransaction[];
  return items.filter(Boolean).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function listPaymentMethods(userId: string): Promise<PaymentMethodRecord[]> {
  const items = await kv.getByPrefix(`wallet_method:${userId}:`) as PaymentMethodRecord[];
  return items.filter(Boolean).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function listRewards(userId: string) {
  const existing = await kv.getByPrefix(`wallet_reward:${userId}:`) as any[];
  if (existing.length) return existing;
  const seeded = [{
    id: makeId('reward'),
    userId,
    title: 'Trusted Traveler Bonus',
    points: 15,
    status: 'active',
    createdAt: nowIso(),
    claimedAt: null,
  }];
  await kv.set(rewardKey(userId, seeded[0].id), seeded[0]);
  return seeded;
}

async function postTransaction(
  userId: string,
  input: {
    type: TxType;
    amount: number;
    direction: 'credit' | 'debit';
    paymentMethod: string;
    note: string;
    metadata?: Record<string, unknown>;
    referenceId?: string | null;
  },
) {
  const wallet = await getWallet(userId);
  const amount = roundMoney(Math.abs(Number(input.amount)));
  if (amount <= 0) throw new Error('Amount must be greater than zero');
  if (input.direction === 'debit' && wallet.balance < amount) throw new Error('Insufficient wallet balance');

  const updatedWallet: WalletRecord = {
    ...wallet,
    balance: roundMoney(wallet.balance + (input.direction === 'credit' ? amount : -amount)),
    totalDeposited: roundMoney(wallet.totalDeposited + (input.type === 'top_up' ? amount : 0)),
    totalSpent: roundMoney(wallet.totalSpent + (input.direction === 'debit' ? amount : 0)),
    totalEarned: roundMoney(wallet.totalEarned + (input.direction === 'credit' ? amount : 0)),
    updatedAt: nowIso(),
  };

  const transaction: WalletTransaction = {
    id: makeId('tx'),
    walletId: wallet.id,
    userId,
    type: input.type,
    amount,
    paymentMethod: input.paymentMethod,
    status: 'completed',
    direction: input.direction,
    note: input.note,
    referenceId: input.referenceId ?? null,
    metadata: input.metadata ?? {},
    createdAt: nowIso(),
  };

  await kv.set(walletKey(userId), updatedWallet);
  await kv.set(txKey(userId, transaction.id), transaction);

  const trust = await kv.get(trustKey(userId)) as Record<string, unknown> | null;
  if (trust) {
    await kv.set(trustKey(userId), {
      ...trust,
      onTimePayments: Number(trust.onTimePayments || 0) + 1,
      deposit: roundMoney(Number(trust.deposit || 0) + (input.type === 'top_up' ? amount : 0)),
      lastPaymentAt: transaction.createdAt,
    });
  }

  return { wallet: updatedWallet, transaction };
}

app.get('/wallet/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const wallet = await getWallet(userId);
    const transactions = await listTransactions(userId);
    const rewards = await listRewards(userId);
    const subscription = await kv.get(subscriptionKey(userId));
    return c.json({
      wallet,
      balance: wallet.balance,
      pendingBalance: wallet.pendingBalance,
      rewardsBalance: wallet.rewardsBalance,
      total_earned: wallet.totalEarned,
      total_spent: wallet.totalSpent,
      total_deposited: wallet.totalDeposited,
      currency: wallet.currency,
      pinSet: wallet.pinSet,
      autoTopUp: wallet.autoTopUp,
      transactions,
      activeEscrows: [],
      activeRewards: rewards.filter((reward: any) => reward.status === 'active'),
      subscription,
    });
  } catch (error) {
    logError('wallet.get failed', error);
    return c.json({ error: 'Failed to load wallet' }, 500);
  }
});

app.get('/wallet/:userId/transactions', async (c) => {
  try {
    const userId = c.req.param('userId');
    const page = Math.max(1, Number(c.req.query('page') || '1'));
    const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') || '20')));
    const type = c.req.query('type');
    const all = await listTransactions(userId);
    const filtered = type ? all.filter((transaction) => transaction.type === type) : all;
    const start = (page - 1) * limit;
    return c.json({
      transactions: filtered.slice(start, start + limit),
      page,
      limit,
      total: filtered.length,
      hasMore: start + limit < filtered.length,
    });
  } catch (error) {
    logError('wallet.transactions failed', error);
    return c.json({ error: 'Failed to load transactions' }, 500);
  }
});

app.post('/wallet/:userId/top-up', async (c) => {
  try {
    const userId = c.req.param('userId');
    if (await resolveActorId(c, userId) !== userId) return c.json({ error: 'Forbidden' }, 403);
    const body = await c.req.json();
    const posting = await postTransaction(userId, {
      type: 'top_up',
      amount: body.amount,
      direction: 'credit',
      paymentMethod: String(body.paymentMethod || body.method || 'wallet_topup'),
      note: 'Wallet top-up',
      metadata: { source: 'wallet_dashboard' },
    });
    return c.json({ success: true, wallet: posting.wallet, transaction: posting.transaction, newBalance: posting.wallet.balance });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Top-up failed' }, 400);
  }
});

app.post('/wallet/:userId/withdraw', async (c) => {
  try {
    const userId = c.req.param('userId');
    if (await resolveActorId(c, userId) !== userId) return c.json({ error: 'Forbidden' }, 403);
    const body = await c.req.json();
    const posting = await postTransaction(userId, {
      type: 'withdrawal',
      amount: body.amount,
      direction: 'debit',
      paymentMethod: String(body.method || 'bank_transfer'),
      note: 'Wallet withdrawal',
      metadata: { bankAccount: String(body.bankAccount || '') },
    });
    return c.json({ success: true, wallet: posting.wallet, transaction: posting.transaction, newBalance: posting.wallet.balance });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Withdrawal failed' }, 400);
  }
});

app.post('/wallet/:userId/send', async (c) => {
  try {
    const userId = c.req.param('userId');
    if (await resolveActorId(c, userId) !== userId) return c.json({ error: 'Forbidden' }, 403);
    const body = await c.req.json();
    const recipientId = String(body.recipientId || '');
    if (!recipientId) return c.json({ error: 'Recipient is required' }, 400);
    const senderPosting = await postTransaction(userId, {
      type: 'transfer_out',
      amount: body.amount,
      direction: 'debit',
      paymentMethod: 'wallet_balance',
      note: String(body.note || 'Peer transfer'),
      metadata: { recipientId },
    });
    const receiverPosting = await postTransaction(recipientId, {
      type: 'transfer_in',
      amount: body.amount,
      direction: 'credit',
      paymentMethod: 'wallet_balance',
      note: String(body.note || 'Peer transfer'),
      metadata: { senderId: userId },
      referenceId: senderPosting.transaction.id,
    });
    return c.json({
      success: true,
      wallet: senderPosting.wallet,
      transaction: senderPosting.transaction,
      recipientTransaction: receiverPosting.transaction,
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Transfer failed' }, 400);
  }
});

app.get('/wallet/:userId/rewards', async (c) => c.json({ rewards: await listRewards(c.req.param('userId')) }));

app.post('/wallet/:userId/rewards/claim', async (c) => {
  try {
    const userId = c.req.param('userId');
    if (await resolveActorId(c, userId) !== userId) return c.json({ error: 'Forbidden' }, 403);
    const { rewardId } = await c.req.json();
    const reward = await kv.get(rewardKey(userId, String(rewardId || ''))) as any;
    if (!reward) return c.json({ error: 'Reward not found' }, 404);
    if (reward.status === 'claimed') return c.json({ error: 'Reward already claimed' }, 400);
    await kv.set(rewardKey(userId, reward.id), { ...reward, status: 'claimed', claimedAt: nowIso() });
    const posting = await postTransaction(userId, {
      type: 'reward',
      amount: reward.points,
      direction: 'credit',
      paymentMethod: 'reward_points',
      note: reward.title,
      metadata: { rewardId: reward.id },
    });
    return c.json({ success: true, wallet: posting.wallet });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Claim failed' }, 400);
  }
});

app.get('/wallet/:userId/subscription', async (c) => c.json({ subscription: await kv.get(subscriptionKey(c.req.param('userId'))) }));

app.post('/wallet/:userId/subscribe', async (c) => {
  try {
    const userId = c.req.param('userId');
    if (await resolveActorId(c, userId) !== userId) return c.json({ error: 'Forbidden' }, 403);
    const body = await c.req.json();
    const subscription = {
      id: makeId('sub'),
      userId,
      planName: String(body.planName || 'Standard'),
      price: Number(body.price || 0),
      status: 'active',
      startedAt: nowIso(),
    };
    await kv.set(subscriptionKey(userId), subscription);
    return c.json({ success: true, subscription });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Subscribe failed' }, 400);
  }
});

app.get('/wallet/:userId/insights', async (c) => {
  try {
    const userId = c.req.param('userId');
    const transactions = await listTransactions(userId);
    const categoryBreakdown = transactions.reduce<Record<string, number>>((acc, transaction) => {
      acc[transaction.type] = roundMoney((acc[transaction.type] || 0) + transaction.amount);
      return acc;
    }, {});
    return c.json({
      thisMonthSpent: transactions.filter((tx) => tx.direction === 'debit').reduce((sum, tx) => sum + tx.amount, 0),
      lastMonthSpent: 0,
      thisMonthEarned: transactions.filter((tx) => tx.direction === 'credit').reduce((sum, tx) => sum + tx.amount, 0),
      changePercent: 100,
      categoryBreakdown,
      monthlyTrend: [],
      totalTransactions: transactions.length,
      carbonSaved: transactions.filter((tx) => tx.type === 'ride_payment').length * 1.4,
    });
  } catch (error) {
    logError('wallet.insights failed', error);
    return c.json({ error: 'Failed to load insights' }, 500);
  }
});

app.post('/wallet/:userId/pin/set', async (c) => {
  try {
    const userId = c.req.param('userId');
    if (await resolveActorId(c, userId) !== userId) return c.json({ error: 'Forbidden' }, 403);
    const { pin } = await c.req.json();
    const pinValue = String(pin || '');
    if (!/^\d{4,6}$/.test(pinValue)) return c.json({ error: 'PIN must be 4 to 6 digits' }, 400);
    const wallet = await getWallet(userId);
    await kv.set(walletKey(userId), { ...wallet, pinHash: await sha256(pinValue), pinSet: true, updatedAt: nowIso() });
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Set PIN failed' }, 400);
  }
});

app.post('/wallet/:userId/pin/verify', async (c) => {
  try {
    const userId = c.req.param('userId');
    if (await resolveActorId(c, userId) !== userId) return c.json({ error: 'Forbidden' }, 403);
    const { pin } = await c.req.json();
    const wallet = await getWallet(userId);
    return c.json({ success: wallet.pinHash !== null && wallet.pinHash === await sha256(String(pin || '')) });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'PIN verification failed' }, 400);
  }
});

app.post('/wallet/:userId/auto-topup', async (c) => {
  try {
    const userId = c.req.param('userId');
    if (await resolveActorId(c, userId) !== userId) return c.json({ error: 'Forbidden' }, 403);
    const body = await c.req.json();
    const wallet = await getWallet(userId);
    const updatedWallet = {
      ...wallet,
      autoTopUp: Boolean(body.enabled),
      autoTopUpAmount: Number(body.amount || 0),
      autoTopUpThreshold: Number(body.threshold || 0),
      updatedAt: nowIso(),
    };
    await kv.set(walletKey(userId), updatedWallet);
    return c.json({ success: true, wallet: updatedWallet });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Auto top-up update failed' }, 400);
  }
});

app.get('/wallet/:userId/payment-methods', async (c) => c.json({ methods: await listPaymentMethods(c.req.param('userId')) }));

app.post('/wallet/:userId/payment-methods', async (c) => {
  try {
    const userId = c.req.param('userId');
    if (await resolveActorId(c, userId) !== userId) return c.json({ error: 'Forbidden' }, 403);
    const body = await c.req.json();
    const method: PaymentMethodRecord = {
      id: makeId('pm'),
      userId,
      type: String(body.type || 'card'),
      provider: String(body.provider || 'manual'),
      label: String(body.label || body.provider || body.type || 'Payment method'),
      last4: body.last4 ? String(body.last4).slice(-4) : null,
      isDefault: Boolean(body.isDefault),
      createdAt: nowIso(),
    };
    if (method.isDefault) {
      const existing = await listPaymentMethods(userId);
      await Promise.all(existing.map((item) => kv.set(methodKey(userId, item.id), { ...item, isDefault: false })));
    }
    await kv.set(methodKey(userId, method.id), method);
    return c.json({ success: true, method });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Add payment method failed' }, 400);
  }
});

app.delete('/wallet/:userId/payment-methods/:methodId', async (c) => {
  try {
    const userId = c.req.param('userId');
    if (await resolveActorId(c, userId) !== userId) return c.json({ error: 'Forbidden' }, 403);
    await kv.del(methodKey(userId, c.req.param('methodId')));
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Delete payment method failed' }, 400);
  }
});

app.get('/wallet/:userId/trust-score', async (c) => {
  try {
    const userId = c.req.param('userId');
    const transactions = await listTransactions(userId);
    const trust = await kv.get(trustKey(userId)) as Record<string, unknown> | null;
    return c.json({
      totalTrips: Number(trust?.totalTrips || 0),
      cashRating: Number(trust?.cashRating || 4.8),
      onTimePayments: Number(trust?.onTimePayments || transactions.length),
      deposit: Number(trust?.deposit || 0),
    });
  } catch (error) {
    logError('wallet.trustScore failed', error);
    return c.json({ error: 'Failed to load trust score' }, 500);
  }
});

export default app;
