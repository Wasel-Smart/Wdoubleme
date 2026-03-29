import { Hono } from 'npm:hono';
import { kv, getUserIdFromToken, logError } from './shared.tsx';

type VerificationLevel = 0 | 1 | 2 | 3;

type VerificationProfile = {
  userId: string;
  phoneNumber: string | null;
  phoneVerified: boolean;
  sanadVerified: boolean;
  documentStatus: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  sanadStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  verificationLevel: VerificationLevel;
  identityLevelLabel: string;
  verificationStatus: 'unverified' | 'in_review' | 'verified';
  documentUploadStatus: 'missing' | 'uploaded' | 'approved' | 'rejected';
  nationalIdMasked: string | null;
  verificationTimestamp: string | null;
  trustScore: number;
  driverVerificationSubmitted: boolean;
  backendMode: 'edge';
};

type OtpSessionRecord = {
  id: string;
  userId: string;
  phoneNumber: string;
  otpCode: string;
  status: 'pending' | 'verified' | 'expired';
  expiresAt: string;
  createdAt: string;
};

type SanadSessionRecord = {
  id: string;
  userId: string;
  nationalId: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  completedAt: string | null;
};

const app = new Hono();

const nowIso = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
const verificationKey = (userId: string) => `verification:${userId}`;
const otpKey = (userId: string, sessionId: string) => `otp:${userId}:${sessionId}`;
const sanadKey = (userId: string, sessionId: string) => `sanad:${userId}:${sessionId}`;
const trustKey = (userId: string) => `wallet_trust:${userId}`;

function maskNationalId(nationalId: string) {
  if (nationalId.length <= 4) return nationalId;
  return `${nationalId.slice(0, 2)}${'*'.repeat(Math.max(0, nationalId.length - 4))}${nationalId.slice(-2)}`;
}

function label(level: VerificationLevel) {
  if (level === 3) return 'Level 3 - Full Driver Verified';
  if (level === 2) return 'Level 2 - SANAD Verified';
  if (level === 1) return 'Level 1 - Phone Verified';
  return 'Level 0 - Unverified';
}

function trustScore(profile: VerificationProfile) {
  let score = 40;
  if (profile.phoneVerified) score += 15;
  if (profile.sanadVerified) score += 25;
  if (profile.documentStatus === 'approved') score += 10;
  if (profile.verificationLevel === 3) score += 10;
  return Math.min(100, score);
}

async function resolveActorId(c: any, requestedUserId?: string): Promise<string | null> {
  const actorId = await getUserIdFromToken(c.req.header('Authorization'));
  return actorId || requestedUserId || null;
}

async function getProfile(userId: string): Promise<VerificationProfile> {
  const existing = await kv.get(verificationKey(userId)) as VerificationProfile | null;
  if (existing) return existing;
  const profile: VerificationProfile = {
    userId,
    phoneNumber: null,
    phoneVerified: false,
    sanadVerified: false,
    documentStatus: 'not_submitted',
    sanadStatus: 'unverified',
    verificationLevel: 0,
    identityLevelLabel: label(0),
    verificationStatus: 'unverified',
    documentUploadStatus: 'missing',
    nationalIdMasked: null,
    verificationTimestamp: null,
    trustScore: 40,
    driverVerificationSubmitted: false,
    backendMode: 'edge',
  };
  await kv.set(verificationKey(userId), profile);
  return profile;
}

async function saveProfile(profile: VerificationProfile) {
  const nextProfile = {
    ...profile,
    identityLevelLabel: label(profile.verificationLevel),
    trustScore: trustScore(profile),
  };
  await kv.set(verificationKey(profile.userId), nextProfile);
  await kv.set(trustKey(profile.userId), {
    totalTrips: 0,
    cashRating: 4.8,
    onTimePayments: 0,
    deposit: 0,
    verificationLevel: nextProfile.verificationLevel,
    sanadVerified: nextProfile.sanadVerified,
  });
  return nextProfile;
}

app.get('/verification/me', async (c) => {
  try {
    const actorId = await resolveActorId(c, c.req.query('userId') || undefined);
    if (!actorId) return c.json({ error: 'Unauthorized' }, 401);
    return c.json({ verification: await getProfile(actorId) });
  } catch (error) {
    logError('verification.me failed', error);
    return c.json({ error: 'Failed to load verification status' }, 500);
  }
});

app.get('/verification/:userId', async (c) => {
  try {
    const requestedUserId = c.req.param('userId');
    if (await resolveActorId(c, requestedUserId) !== requestedUserId) return c.json({ error: 'Forbidden' }, 403);
    return c.json({ verification: await getProfile(requestedUserId) });
  } catch (error) {
    logError('verification.user failed', error);
    return c.json({ error: 'Failed to load verification status' }, 500);
  }
});

app.post('/verification/otp/start', async (c) => {
  try {
    const body = await c.req.json();
    const userId = String(body.userId || '');
    const phoneNumber = String(body.phoneNumber || '');
    if (!userId || !phoneNumber) return c.json({ error: 'userId and phoneNumber are required' }, 400);
    const session: OtpSessionRecord = {
      id: makeId('otp'),
      userId,
      phoneNumber,
      otpCode: String(Math.floor(100000 + Math.random() * 900000)),
      status: 'pending',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      createdAt: nowIso(),
    };
    await kv.set(otpKey(userId, session.id), session);
    return c.json({ success: true, sessionId: session.id, expiresAt: session.expiresAt, devOtpCode: session.otpCode });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'OTP start failed' }, 400);
  }
});

app.post('/verification/otp/verify', async (c) => {
  try {
    const body = await c.req.json();
    const userId = String(body.userId || '');
    const sessionId = String(body.sessionId || '');
    const otpCode = String(body.otpCode || '');
    const session = await kv.get(otpKey(userId, sessionId)) as OtpSessionRecord | null;
    if (!session) return c.json({ error: 'OTP session not found' }, 404);
    if (new Date(session.expiresAt).getTime() < Date.now()) return c.json({ error: 'OTP session expired' }, 400);
    if (session.otpCode !== otpCode) return c.json({ error: 'Invalid OTP code' }, 400);
    await kv.set(otpKey(userId, sessionId), { ...session, status: 'verified' });
    const profile = await getProfile(userId);
    const nextProfile = await saveProfile({
      ...profile,
      phoneNumber: session.phoneNumber,
      phoneVerified: true,
      verificationLevel: profile.verificationLevel < 1 ? 1 : profile.verificationLevel,
      verificationStatus: 'in_review',
    });
    return c.json({ success: true, verification: nextProfile });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'OTP verification failed' }, 400);
  }
});

app.post('/verification/sanad/start', async (c) => {
  try {
    const body = await c.req.json();
    const userId = String(body.userId || '');
    const nationalId = String(body.nationalId || '');
    if (!userId || !nationalId) return c.json({ error: 'userId and nationalId are required' }, 400);
    const session: SanadSessionRecord = {
      id: makeId('sanad'),
      userId,
      nationalId,
      status: 'pending',
      createdAt: nowIso(),
      completedAt: null,
    };
    await kv.set(sanadKey(userId, session.id), session);
    const profile = await getProfile(userId);
    const nextProfile = await saveProfile({
      ...profile,
      sanadStatus: 'pending',
      verificationStatus: 'in_review',
      nationalIdMasked: maskNationalId(nationalId),
      documentStatus: profile.documentStatus === 'not_submitted' ? 'pending' : profile.documentStatus,
      documentUploadStatus: profile.documentUploadStatus === 'missing' ? 'uploaded' : profile.documentUploadStatus,
    });
    return c.json({ success: true, provider: 'SANAD', sessionId: session.id, status: 'pending', verification: nextProfile });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'SANAD verification failed to start' }, 400);
  }
});

app.post('/verification/sanad/callback', async (c) => {
  try {
    const body = await c.req.json();
    const userId = String(body.userId || '');
    const sessionId = String(body.sessionId || '');
    const status = String(body.status || 'verified');
    const session = await kv.get(sanadKey(userId, sessionId)) as SanadSessionRecord | null;
    if (!session) return c.json({ error: 'SANAD session not found' }, 404);
    await kv.set(sanadKey(userId, sessionId), {
      ...session,
      status: status === 'verified' ? 'verified' : 'rejected',
      completedAt: nowIso(),
    });
    const profile = await getProfile(userId);
    const verified = status === 'verified';
    const nextProfile = await saveProfile({
      ...profile,
      sanadVerified: verified,
      sanadStatus: verified ? 'verified' : 'rejected',
      documentStatus: verified ? 'approved' : 'rejected',
      verificationLevel: verified && profile.verificationLevel < 2 ? 2 : profile.verificationLevel,
      verificationStatus: verified ? 'verified' : 'unverified',
      documentUploadStatus: verified ? 'approved' : 'rejected',
      verificationTimestamp: nowIso(),
    });
    return c.json({ success: true, verification: nextProfile });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'SANAD callback failed' }, 400);
  }
});

app.post('/verification/driver/submit', async (c) => {
  try {
    const body = await c.req.json();
    const userId = String(body.userId || '');
    if (!userId) return c.json({ error: 'userId is required' }, 400);
    const profile = await getProfile(userId);
    const nextProfile = await saveProfile({
      ...profile,
      driverVerificationSubmitted: true,
      verificationLevel: profile.sanadVerified ? 3 : profile.verificationLevel,
      verificationStatus: profile.sanadVerified ? 'verified' : 'in_review',
      documentStatus: profile.sanadVerified ? 'approved' : 'pending',
      documentUploadStatus: profile.sanadVerified ? 'approved' : 'uploaded',
      verificationTimestamp: nowIso(),
    });
    return c.json({ success: true, verification: nextProfile });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Driver verification submission failed' }, 400);
  }
});

app.get('/admin/overview', async (c) => {
  try {
    const verifications = await kv.getByPrefix('verification:') as VerificationProfile[];
    const wallets = await kv.getByPrefix('wallet:') as Array<{ balance?: number }>;
    const trips = await kv.getByPrefix('trip:') as Array<{ status?: string }>;
    const packages = await kv.getByPrefix('package:') as Array<{ status?: string }>;
    const transactions = await kv.getByPrefix('wallet_tx:') as Array<{ amount?: number }>;
    return c.json({
      usersVerified: verifications.filter((item) => item?.sanadVerified).length,
      driverLevelVerified: verifications.filter((item) => item?.verificationLevel === 3).length,
      activeTrips: trips.filter((item) => ['published', 'open', 'in_progress'].includes(String(item?.status || ''))).length,
      movingPackages: packages.filter((item) => ['accepted', 'picked_up', 'in_transit'].includes(String(item?.status || ''))).length,
      walletLiquidity: wallets.reduce((sum, wallet) => sum + Number(wallet?.balance || 0), 0),
      walletTransactions: transactions.length,
    });
  } catch (error) {
    logError('admin.overview failed', error);
    return c.json({ error: 'Failed to load admin overview' }, 500);
  }
});

export default app;
