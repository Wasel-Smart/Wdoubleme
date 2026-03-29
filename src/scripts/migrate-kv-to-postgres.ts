// scripts/migrate-kv-to-postgres.ts
// Migration script: KV Store → PostgreSQL with Drizzle ORM
// Run with: deno run --allow-all scripts/migrate-kv-to-postgres.ts

import { createClient } from "npm:@supabase/supabase-js@2";
import { drizzle } from "npm:drizzle-orm/postgres-js@0.30.10";
import postgres from "npm:postgres@3.4.4";
import * as schema from "../supabase/functions/server/db/schema.ts";

// Load environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const DATABASE_URL = Deno.env.get('SUPABASE_DB_URL') || Deno.env.get('DATABASE_URL')!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !DATABASE_URL) {
  console.error('❌ Missing environment variables. Please set:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('   - SUPABASE_DB_URL or DATABASE_URL');
  Deno.exit(1);
}

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const sql = postgres(DATABASE_URL);
const db = drizzle(sql, { schema });

// Import KV functions (note: path adjusted for script location)
import * as kv from "../supabase/functions/server/kv_store.tsx";

console.log('🚀 Starting KV Store → PostgreSQL Migration');
console.log('⚠️  WARNING: This will migrate all KV data to PostgreSQL');
console.log('   Make sure you have a backup before proceeding!\n');

// Prompt for confirmation
const proceed = prompt('Type "YES" to proceed: ');
if (proceed !== 'YES') {
  console.log('❌ Migration cancelled');
  Deno.exit(0);
}

// Migration statistics
const stats = {
  profiles: { total: 0, migrated: 0, failed: 0 },
  trips: { total: 0, migrated: 0, failed: 0 },
  bookings: { total: 0, migrated: 0, failed: 0 },
  errors: [] as string[],
};

// ==================== MIGRATE PROFILES ====================
async function migrateProfiles() {
  console.log('\n📝 Migrating Profiles...');
  
  try {
    // Get all profile keys
    const profileKeys = await kv.getByPrefix('profile:');
    stats.profiles.total = profileKeys.length;
    
    console.log(`   Found ${profileKeys.length} profiles`);
    
    for (const key of profileKeys) {
      try {
        const profile = await kv.get(key);
        
        if (!profile || !profile.id) {
          console.warn(`   ⚠️  Invalid profile at key ${key}, skipping`);
          continue;
        }
        
        // Map KV profile to PostgreSQL schema
        await db.insert(schema.profiles).values({
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name || 'Unknown',
          phone: profile.phone || null,
          phoneVerified: profile.phone_verified || false,
          emailVerified: profile.email_verified || true,
          avatarUrl: profile.avatar_url || null,
          
          totalTrips: profile.total_trips || 0,
          tripsAsDriver: profile.trips_as_driver || 0,
          tripsAsPassenger: profile.trips_as_passenger || 0,
          
          ratingAsDriver: profile.rating_as_driver?.toString() || '0.00',
          ratingAsPassenger: profile.rating_as_passenger?.toString() || '0.00',
          totalRatingsReceived: profile.total_ratings_received || 0,
          
          smokingAllowed: profile.smoking_allowed || false,
          petsAllowed: profile.pets_allowed || false,
          musicAllowed: profile.music_allowed !== undefined ? profile.music_allowed : true,
          language: profile.language || 'ar',
          currency: profile.currency || 'JOD',
          
          walletBalance: profile.wallet_balance?.toString() || '0.00',
          totalEarned: profile.total_earned?.toString() || '0.00',
          totalSpent: profile.total_spent?.toString() || '0.00',
          
          notificationEnabled: profile.notification_enabled !== undefined ? profile.notification_enabled : true,
          locationSharingEnabled: profile.location_sharing_enabled !== undefined ? profile.location_sharing_enabled : true,
          
          stripeCustomerId: profile.stripe_customer_id || null,
          stripeSubscriptionId: profile.stripe_subscription_id || null,
          subscriptionStatus: profile.subscription_status || null,
          subscriptionPlan: profile.subscription_plan || 'free',
          
          createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
          updatedAt: profile.updated_at ? new Date(profile.updated_at) : new Date(),
        }).onConflictDoUpdate({
          target: schema.profiles.id,
          set: {
            email: profile.email,
            fullName: profile.full_name,
            updatedAt: new Date(),
          },
        });
        
        stats.profiles.migrated++;
        
        if (stats.profiles.migrated % 10 === 0) {
          console.log(`   ✅ Migrated ${stats.profiles.migrated}/${stats.profiles.total} profiles`);
        }
      } catch (error: any) {
        stats.profiles.failed++;
        const errorMsg = `Failed to migrate profile ${key}: ${error.message}`;
        stats.errors.push(errorMsg);
        console.error(`   ❌ ${errorMsg}`);
      }
    }
    
    console.log(`   ✅ Profiles: ${stats.profiles.migrated} migrated, ${stats.profiles.failed} failed`);
  } catch (error: any) {
    console.error(`   ❌ Error migrating profiles: ${error.message}`);
  }
}

// ==================== MIGRATE TRIPS ====================
async function migrateTrips() {
  console.log('\n🚗 Migrating Trips...');
  
  try {
    const tripKeys = await kv.getByPrefix('trip:');
    stats.trips.total = tripKeys.length;
    
    console.log(`   Found ${tripKeys.length} trips`);
    
    for (const key of tripKeys) {
      try {
        const trip = await kv.get(key);
        
        if (!trip || !trip.id) {
          console.warn(`   ⚠️  Invalid trip at key ${key}, skipping`);
          continue;
        }
        
        await db.insert(schema.trips).values({
          id: trip.id,
          driverId: trip.driver_id,
          
          fromLocation: trip.from_location,
          toLocation: trip.to_location,
          fromLat: trip.from_lat?.toString() || null,
          fromLng: trip.from_lng?.toString() || null,
          toLat: trip.to_lat?.toString() || null,
          toLng: trip.to_lng?.toString() || null,
          distanceKm: trip.distance_km?.toString() || null,
          
          departureDate: trip.departure_date,
          departureTime: trip.departure_time,
          
          totalSeats: trip.total_seats || 4,
          availableSeats: trip.available_seats ?? trip.total_seats ?? 4,
          
          pricePerSeat: trip.price_per_seat?.toString() || '0.00',
          currency: trip.currency || 'JOD',
          
          status: trip.status || 'published',
          
          smokingAllowed: trip.smoking_allowed || false,
          petsAllowed: trip.pets_allowed || false,
          musicAllowed: trip.music_allowed !== undefined ? trip.music_allowed : true,
          luggageSpace: trip.luggage_space || null,
          
          vehicleMake: trip.vehicle_make || null,
          vehicleModel: trip.vehicle_model || null,
          vehicleColor: trip.vehicle_color || null,
          
          notes: trip.notes || null,
          createdAt: trip.created_at ? new Date(trip.created_at) : new Date(),
          updatedAt: trip.updated_at ? new Date(trip.updated_at) : new Date(),
        }).onConflictDoUpdate({
          target: schema.trips.id,
          set: {
            status: trip.status,
            availableSeats: trip.available_seats,
            updatedAt: new Date(),
          },
        });
        
        stats.trips.migrated++;
        
        if (stats.trips.migrated % 10 === 0) {
          console.log(`   ✅ Migrated ${stats.trips.migrated}/${stats.trips.total} trips`);
        }
      } catch (error: any) {
        stats.trips.failed++;
        const errorMsg = `Failed to migrate trip ${key}: ${error.message}`;
        stats.errors.push(errorMsg);
        console.error(`   ❌ ${errorMsg}`);
      }
    }
    
    console.log(`   ✅ Trips: ${stats.trips.migrated} migrated, ${stats.trips.failed} failed`);
  } catch (error: any) {
    console.error(`   ❌ Error migrating trips: ${error.message}`);
  }
}

// ==================== MIGRATE BOOKINGS ====================
async function migrateBookings() {
  console.log('\n📅 Migrating Bookings...');
  
  try {
    const bookingKeys = await kv.getByPrefix('booking:');
    stats.bookings.total = bookingKeys.length;
    
    console.log(`   Found ${bookingKeys.length} bookings`);
    
    for (const key of bookingKeys) {
      try {
        const booking = await kv.get(key);
        
        if (!booking || !booking.id) {
          console.warn(`   ⚠️  Invalid booking at key ${key}, skipping`);
          continue;
        }
        
        await db.insert(schema.bookings).values({
          id: booking.id,
          tripId: booking.trip_id,
          passengerId: booking.passenger_id,
          
          seatsRequested: booking.seats_requested || 1,
          
          pricePerSeat: booking.price_per_seat?.toString() || '0.00',
          totalPrice: booking.total_price?.toString() || '0.00',
          currency: booking.currency || 'JOD',
          
          status: booking.status || 'pending',
          paymentStatus: booking.payment_status || 'pending',
          
          createdAt: booking.created_at ? new Date(booking.created_at) : new Date(),
          updatedAt: booking.updated_at ? new Date(booking.updated_at) : new Date(),
        }).onConflictDoUpdate({
          target: schema.bookings.id,
          set: {
            status: booking.status,
            paymentStatus: booking.payment_status,
            updatedAt: new Date(),
          },
        });
        
        stats.bookings.migrated++;
        
        if (stats.bookings.migrated % 10 === 0) {
          console.log(`   ✅ Migrated ${stats.bookings.migrated}/${stats.bookings.total} bookings`);
        }
      } catch (error: any) {
        stats.bookings.failed++;
        const errorMsg = `Failed to migrate booking ${key}: ${error.message}`;
        stats.errors.push(errorMsg);
        console.error(`   ❌ ${errorMsg}`);
      }
    }
    
    console.log(`   ✅ Bookings: ${stats.bookings.migrated} migrated, ${stats.bookings.failed} failed`);
  } catch (error: any) {
    console.error(`   ❌ Error migrating bookings: ${error.message}`);
  }
}

// ==================== VERIFY MIGRATION ====================
async function verifyMigration() {
  console.log('\n🔍 Verifying Migration...');
  
  try {
    const profileCount = await db.$count(schema.profiles);
    const tripCount = await db.$count(schema.trips);
    const bookingCount = await db.$count(schema.bookings);
    
    console.log(`   Profiles in PostgreSQL: ${profileCount}`);
    console.log(`   Trips in PostgreSQL: ${tripCount}`);
    console.log(`   Bookings in PostgreSQL: ${bookingCount}`);
    
    const matches = {
      profiles: profileCount === stats.profiles.migrated,
      trips: tripCount === stats.trips.migrated,
      bookings: bookingCount === stats.bookings.migrated,
    };
    
    if (matches.profiles && matches.trips && matches.bookings) {
      console.log('   ✅ All counts match!');
    } else {
      console.warn('   ⚠️  Count mismatch detected!');
    }
  } catch (error: any) {
    console.error(`   ❌ Error verifying migration: ${error.message}`);
  }
}

// ==================== RUN MIGRATION ====================
async function runMigration() {
  const startTime = Date.now();
  
  await migrateProfiles();
  await migrateTrips();
  await migrateBookings();
  await verifyMigration();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Profiles: ${stats.profiles.migrated}/${stats.profiles.total} migrated (${stats.profiles.failed} failed)`);
  console.log(`Trips:    ${stats.trips.migrated}/${stats.trips.total} migrated (${stats.trips.failed} failed)`);
  console.log(`Bookings: ${stats.bookings.migrated}/${stats.bookings.total} migrated (${stats.bookings.failed} failed)`);
  console.log(`Duration: ${duration}s`);
  
  if (stats.errors.length > 0) {
    console.log(`\n⚠️  ${stats.errors.length} errors occurred:`);
    stats.errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
    
    if (stats.errors.length > 10) {
      console.log(`   ... and ${stats.errors.length - 10} more`);
    }
  }
  
  console.log('='.repeat(60));
  console.log('✅ Migration complete!\n');
  
  // Close connections
  await sql.end();
}

// Run migration
runMigration().catch((error) => {
  console.error('❌ Fatal error during migration:', error);
  Deno.exit(1);
});
