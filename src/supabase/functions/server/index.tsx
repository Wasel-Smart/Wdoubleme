import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import ridesApp from './rides.ts';
import { packageService } from './package_service.tsx';
import myTripsApp from './my_trips_service.tsx';
import bookingsApp from './bookings_service.tsx';
import tripsApp from './trips_service.tsx';
import authApp from './auth_service.tsx';
import walletService from './wallet_service.tsx';
import verificationService from './verification_service.tsx';

const app = new Hono();

// ── Middleware ──
app.use('*', cors({
  // Allow all origins — security is enforced by Supabase JWT + Row Level Security.
  // Restricting origin here blocks Figma Make's deployment-time health checks
  // (which originate from makeproxy-c.figma.site) and causes 403 on deploy.
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Client-Info', 'X-Requested-With'],
  credentials: false, // must be false when origin is '*'
}));

// ── Health check (must be before other routes) ──
app.get('/make-server-0b1f4071/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'wasel-api',
    version: '4.2',
    timestamp: new Date().toISOString(),
  });
});

// ── Mount all route modules ──
app.route('/', ridesApp);
app.route('/', myTripsApp);
app.route('/', bookingsApp);
app.route('/', tripsApp);
app.route('/', authApp);
app.route('/make-server-0b1f4071', packageService);
app.route('/make-server-0b1f4071', walletService);
app.route('/make-server-0b1f4071', verificationService);

// ── Root endpoint ──
app.get('/make-server-0b1f4071/', (c) => {
  return c.json({
    message: 'Wasel API Server',
    version: '4.2',
    endpoints: [
      '/make-server-0b1f4071/health',
      '/make-server-0b1f4071/rides/seed',
      '/make-server-0b1f4071/rides/search',
      '/make-server-0b1f4071/rides/:id',
      '/make-server-0b1f4071/rides/create',
      '/make-server-0b1f4071/rides/:id/book',
      '/make-server-0b1f4071/my-trips',
      '/make-server-0b1f4071/bookings/:id',
      '/make-server-0b1f4071/trips/:id',
      '/make-server-0b1f4071/wallet/:userId',
      '/make-server-0b1f4071/verification/me',
      '/make-server-0b1f4071/admin/overview',
    ],
  });
});

console.log('🚀 Wasel API Server starting...');

Deno.serve(app.fetch);
