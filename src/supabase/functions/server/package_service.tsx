/**
 * Wasel API — Package Service (Core)
 * Handles: Awasel package delivery — send, browse, accept, track, QR verify
 */

import { Hono } from 'npm:hono';
import {
  kv, logInfo, logError, getUserIdFromToken, sendPushNotification,
} from './shared.tsx';
import {
  isNonEmptyString, sanitiseString, validate,
} from './validation.tsx';

export const packageService = new Hono();

// ── POST /packages — Sender posts a package ──────────────────────────────────
packageService.post('/packages', async (c) => {
  const userId = await getUserIdFromToken(c.req.header('Authorization'));
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const body = await c.req.json();

    // ── Input validation ──────────────────────────────────────────────────
    const errors = validate(
      ['from', body.from, (v) => isNonEmptyString(v, 200), 'Origin city is required (max 200 chars)'],
      ['to', body.to, (v) => isNonEmptyString(v, 200), 'Destination city is required (max 200 chars)'],
      ['recipientName', body.recipientName, (v) => isNonEmptyString(v, 200), 'Recipient name is required'],
      ['recipientPhone', body.recipientPhone, (v) => isNonEmptyString(v, 30), 'Recipient phone is required'],
    );
    if (body.weight !== undefined && body.weight !== null) {
      if (typeof body.weight !== 'number' || body.weight < 0 || body.weight > 50) {
        errors.push({ field: 'weight', message: 'Weight must be between 0 and 50 kg' });
      }
    }
    if (body.value !== undefined && body.value !== null) {
      if (typeof body.value !== 'number' || body.value < 0 || body.value > 10000) {
        errors.push({ field: 'value', message: 'Declared value must be between 0 and 10,000 JOD' });
      }
    }
    if (body.price !== undefined && body.price !== null) {
      if (typeof body.price !== 'number' || body.price < 1 || body.price > 500) {
        errors.push({ field: 'price', message: 'Price must be between 1 and 500 JOD' });
      }
    }
    if (errors.length) return c.json({ error: 'Validation failed', details: errors }, 400);

    const pkgId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const pkg = {
      id: pkgId, sender_id: userId,
      from: sanitiseString(body.from, 200), to: sanitiseString(body.to, 200),
      weight: body.weight || 0, dimensions: body.dimensions || {},
      value: body.value || 0, description: sanitiseString(body.description || '', 500),
      fragile: body.fragile ?? false, insurance: body.insurance ?? false,
      recipient_name: sanitiseString(body.recipientName || '', 200), recipient_phone: sanitiseString(body.recipientPhone || '', 30),
      sender_phone: sanitiseString(body.senderPhone || '', 30), price: body.price || 5,
      deadline: body.pickupDate || body.deliveryDate || '',
      status: 'pending',
      tracking_code: `AW${pkgId.slice(-6).toUpperCase()}`,
      qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=AWASEL-${pkgId}`,
      created_at: new Date().toISOString(),
    };
    await kv.set(`package:${userId}:${pkgId}`, pkg);
    await kv.set(`package_index:${pkg.from}:${pkg.to}:${pkgId}`, pkg);
    logInfo(`Package posted by ${userId}: ${pkg.from} -> ${pkg.to}`);
    return c.json({ success: true, package: pkg }, 201);
  } catch (error) {
    logError('Post package failed', error);
    return c.json({ error: `Post package failed: ${error instanceof Error ? error.message : String(error)}` }, 500);
  }
});

// ── GET /packages/my — Sender's own packages ─────────────────────────────────
packageService.get('/packages/my', async (c) => {
  const userId = await getUserIdFromToken(c.req.header('Authorization'));
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const myPkgs: any[] = (await kv.getByPrefix(`package:${userId}:`)).filter(Boolean);
    myPkgs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    logInfo(`GET /packages/my: ${myPkgs.length} packages for sender ${userId}`);
    return c.json(myPkgs);
  } catch (error) {
    logError('GET /packages/my failed', error);
    return c.json([]);
  }
});

// ── GET /packages/available — Browse pending packages ────────────────────────
packageService.get('/packages/available', async (c) => {
  try {
    const fromSearch = c.req.query('from') || '';
    const toSearch = c.req.query('to') || '';
    const allPkgs: any[] = (await kv.getByPrefix('package_index:')).filter(Boolean);
    const filtered = allPkgs.filter((p: any) => {
      if (!p || p.status !== 'pending') return false;
      if (fromSearch && !p.from.toLowerCase().includes(fromSearch.toLowerCase())) return false;
      if (toSearch && !p.to.toLowerCase().includes(toSearch.toLowerCase())) return false;
      return true;
    });
    filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    logInfo(`Available packages: ${fromSearch}->${toSearch}, found ${filtered.length}`);
    return c.json({ packages: filtered, total: filtered.length });
  } catch (error) {
    logError('Available packages failed', error);
    return c.json({ packages: [], total: 0 });
  }
});

// ── POST /packages/accept — Traveler accepts a package ───────────────────────
packageService.post('/packages/accept', async (c) => {
  const userId = await getUserIdFromToken(c.req.header('Authorization'));
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const body = await c.req.json();
    if (!body.packageId || typeof body.packageId !== 'string' || body.packageId.trim().length === 0) {
      return c.json({ error: 'Validation failed', details: [{ field: 'packageId', message: 'Package ID is required' }] }, 400);
    }
    const pkgId = body.packageId;
    const allPkgs: any[] = (await kv.getByPrefix('package_index:')).filter(Boolean);
    const pkg = allPkgs.find((p: any) => p?.id === pkgId);
    if (!pkg) return c.json({ error: 'Package not found' }, 404);
    const updated = { ...pkg, status: 'accepted', traveler_id: userId, traveler_name: body.travelerName || 'Traveler', accepted_at: new Date().toISOString() };
    await kv.set(`package:${pkg.sender_id}:${pkgId}`, updated);
    await kv.set(`package_index:${pkg.from}:${pkg.to}:${pkgId}`, updated);
    if (pkg.sender_id) await sendPushNotification(pkg.sender_id, 'Package Accepted', `A traveler accepted your package to ${pkg.to}!`);
    logInfo(`Package ${pkgId} accepted by ${userId}`);
    return c.json({ success: true, package: updated });
  } catch (error) {
    logError('Package accept failed', error);
    return c.json({ error: `Accept failed: ${error instanceof Error ? error.message : String(error)}` }, 500);
  }
});

// ── GET /packages/track/:code — Track by code ────────────────────────────────
packageService.get('/packages/track/:code', async (c) => {
  try {
    const trackingCode = c.req.param('code');
    const allPkgs: any[] = (await kv.getByPrefix('package:')).filter(Boolean);
    const pkg = allPkgs.find((p: any) => p?.tracking_code === trackingCode);
    if (!pkg) return c.json({ error: 'Package not found' }, 404);
    return c.json(pkg);
  } catch (error) {
    logError('Package tracking failed', error);
    return c.json({ error: 'Tracking failed' }, 500);
  }
});

// ── POST /packages/:id/confirm-pickup — QR pickup scan ──────────────────────
packageService.post('/packages/:id/confirm-pickup', async (c) => {
  const userId = await getUserIdFromToken(c.req.header('Authorization'));
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const pkgId = c.req.param('id');
    const allPkgs: any[] = (await kv.getByPrefix('package:')).filter(Boolean);
    const pkg = allPkgs.find((p: any) => p?.id === pkgId);
    if (!pkg) return c.json({ error: 'Package not found' }, 404);
    const updated = { ...pkg, status: 'picked_up', picked_up_at: new Date().toISOString(), picked_up_by: userId };
    await kv.set(`package:${pkg.sender_id}:${pkgId}`, updated);
    await kv.set(`package_index:${pkg.from}:${pkg.to}:${pkgId}`, updated);
    if (pkg.sender_id) await sendPushNotification(pkg.sender_id, 'Package Picked Up', `Your package to ${pkg.to} has been picked up!`);
    logInfo(`Package ${pkgId} picked up`);
    return c.json({ success: true, package: updated });
  } catch (error) {
    logError('Confirm pickup failed', error);
    return c.json({ error: 'Confirm pickup failed' }, 500);
  }
});

// ── POST /packages/:id/confirm-delivery — QR delivery scan ──────────────────
packageService.post('/packages/:id/confirm-delivery', async (c) => {
  const userId = await getUserIdFromToken(c.req.header('Authorization'));
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const pkgId = c.req.param('id');
    const allPkgs: any[] = (await kv.getByPrefix('package:')).filter(Boolean);
    const pkg = allPkgs.find((p: any) => p?.id === pkgId);
    if (!pkg) return c.json({ error: 'Package not found' }, 404);
    const updated = { ...pkg, status: 'delivered', delivered_at: new Date().toISOString(), delivered_by: userId };
    await kv.set(`package:${pkg.sender_id}:${pkgId}`, updated);
    await kv.set(`package_index:${pkg.from}:${pkg.to}:${pkgId}`, updated);
    if (pkg.sender_id) await sendPushNotification(pkg.sender_id, 'Package Delivered!', `Your package has arrived in ${pkg.to}!`);
    logInfo(`Package ${pkgId} delivered`);
    return c.json({ success: true, package: updated });
  } catch (error) {
    logError('Confirm delivery failed', error);
    return c.json({ error: 'Confirm delivery failed' }, 500);
  }
});

// ── GET /packages/:id — Fetch single package ────────────────────────────────
packageService.get('/packages/:id', async (c) => {
  const userId = await getUserIdFromToken(c.req.header('Authorization'));
  try {
    const pkgId = c.req.param('id');
    const allPkgs: any[] = (await kv.getByPrefix('package:')).filter(Boolean);
    const pkg = allPkgs.find((p: any) => p?.id === pkgId);
    if (!pkg) return c.json({ error: 'Package not found' }, 404);
    if (userId && (pkg.sender_id === userId || pkg.traveler_id === userId)) {
      logInfo(`GET /packages/${pkgId} (full) by ${userId}`);
      return c.json(pkg);
    }
    const publicView = { id: pkg.id, from: pkg.from, to: pkg.to, status: pkg.status, tracking_code: pkg.tracking_code, created_at: pkg.created_at };
    return c.json(publicView);
  } catch (error) {
    logError('GET /packages/:id failed', error);
    return c.json({ error: `Fetch package failed: ${error instanceof Error ? error.message : String(error)}` }, 500);
  }
});