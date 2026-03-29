/**
 * W Mobility Platform - Database Type Definitions
 * Auto-generated types for type-safe database operations
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          full_name: string
          avatar_url: string | null
          role: 'passenger' | 'driver' | 'both' | 'admin'
          gender: 'male' | 'female' | 'unspecified'
          date_of_birth: string | null
          language: string
          email_verified: boolean
          phone_verified: boolean
          identity_verified: 'unverified' | 'pending' | 'verified' | 'rejected'
          sanad_verified: boolean
          trust_score: number
          total_trips: number
          total_trips_as_driver: number
          total_trips_as_passenger: number
          gender_preference: 'mixed' | 'women_only' | 'men_only' | 'family_only'
          prayer_stops_enabled: boolean
          ramadan_mode_enabled: boolean
          hijab_privacy_enabled: boolean
          wallet_balance: number
          lifetime_earnings: number
          referral_code: string | null
          referred_by: string | null
          is_active: boolean
          is_banned: boolean
          last_active_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          phone?: string | null
          full_name: string
          avatar_url?: string | null
          role?: 'passenger' | 'driver' | 'both' | 'admin'
          gender?: 'male' | 'female' | 'unspecified'
          date_of_birth?: string | null
          language?: string
          email_verified?: boolean
          phone_verified?: boolean
          identity_verified?: 'unverified' | 'pending' | 'verified' | 'rejected'
          sanad_verified?: boolean
          trust_score?: number
          total_trips?: number
          total_trips_as_driver?: number
          total_trips_as_passenger?: number
          gender_preference?: 'mixed' | 'women_only' | 'men_only' | 'family_only'
          prayer_stops_enabled?: boolean
          ramadan_mode_enabled?: boolean
          hijab_privacy_enabled?: boolean
          wallet_balance?: number
          lifetime_earnings?: number
          referral_code?: string | null
          referred_by?: string | null
          is_active?: boolean
          is_banned?: boolean
          last_active_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          full_name?: string
          avatar_url?: string | null
          role?: 'passenger' | 'driver' | 'both' | 'admin'
          gender?: 'male' | 'female' | 'unspecified'
          date_of_birth?: string | null
          language?: string
          email_verified?: boolean
          phone_verified?: boolean
          identity_verified?: 'unverified' | 'pending' | 'verified' | 'rejected'
          sanad_verified?: boolean
          trust_score?: number
          total_trips?: number
          total_trips_as_driver?: number
          total_trips_as_passenger?: number
          gender_preference?: 'mixed' | 'women_only' | 'men_only' | 'family_only'
          prayer_stops_enabled?: boolean
          ramadan_mode_enabled?: boolean
          hijab_privacy_enabled?: boolean
          wallet_balance?: number
          lifetime_earnings?: number
          referral_code?: string | null
          referred_by?: string | null
          is_active?: boolean
          is_banned?: boolean
          last_active_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      driver_profiles: {
        Row: {
          user_id: string
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_year: number | null
          vehicle_color: string | null
          vehicle_plate: string | null
          vehicle_type: 'economy' | 'comfort' | 'premium' | 'van' | 'suv'
          seats_available: number | null
          license_number: string | null
          license_expiry: string | null
          license_verified: boolean
          insurance_number: string | null
          insurance_expiry: string | null
          insurance_verified: boolean
          vehicle_registration_verified: boolean
          status: 'offline' | 'online' | 'busy' | 'in_trip'
          current_location: string | null
          heading: number | null
          acceptance_rate: number
          cancellation_rate: number
          average_rating: number
          total_ratings: number
          total_earnings: number
          this_month_earnings: number
          last_payout_at: string | null
          auto_accept_enabled: boolean
          max_pickup_distance_km: number
          preferred_corridors: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_year?: number | null
          vehicle_color?: string | null
          vehicle_plate?: string | null
          vehicle_type?: 'economy' | 'comfort' | 'premium' | 'van' | 'suv'
          seats_available?: number | null
          license_number?: string | null
          license_expiry?: string | null
          license_verified?: boolean
          insurance_number?: string | null
          insurance_expiry?: string | null
          insurance_verified?: boolean
          vehicle_registration_verified?: boolean
          status?: 'offline' | 'online' | 'busy' | 'in_trip'
          current_location?: string | null
          heading?: number | null
          acceptance_rate?: number
          cancellation_rate?: number
          average_rating?: number
          total_ratings?: number
          total_earnings?: number
          this_month_earnings?: number
          last_payout_at?: string | null
          auto_accept_enabled?: boolean
          max_pickup_distance_km?: number
          preferred_corridors?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_year?: number | null
          vehicle_color?: string | null
          vehicle_plate?: string | null
          vehicle_type?: 'economy' | 'comfort' | 'premium' | 'van' | 'suv'
          seats_available?: number | null
          license_number?: string | null
          license_expiry?: string | null
          license_verified?: boolean
          insurance_number?: string | null
          insurance_expiry?: string | null
          insurance_verified?: boolean
          vehicle_registration_verified?: boolean
          status?: 'offline' | 'online' | 'busy' | 'in_trip'
          current_location?: string | null
          heading?: number | null
          acceptance_rate?: number
          cancellation_rate?: number
          average_rating?: number
          total_ratings?: number
          total_earnings?: number
          this_month_earnings?: number
          last_payout_at?: string | null
          auto_accept_enabled?: boolean
          max_pickup_distance_km?: number
          preferred_corridors?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          mode: 'carpooling' | 'on_demand' | 'scheduled' | 'package' | 'return'
          status: 'posted' | 'requested' | 'matched' | 'accepted' | 'booked' | 'confirmed' | 'pickup' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
          driver_id: string | null
          created_by: string
          origin_name: string
          origin_location: string
          destination_name: string
          destination_location: string
          distance_km: number | null
          duration_minutes: number | null
          route_polyline: string | null
          departure_time: string | null
          scheduled_pickup_time: string | null
          actual_pickup_time: string | null
          actual_dropoff_time: string | null
          completed_at: string | null
          total_seats: number
          available_seats: number
          price_per_seat: number | null
          total_price: number | null
          surge_multiplier: number
          gender_preference: 'mixed' | 'women_only' | 'men_only' | 'family_only'
          prayer_stop_enabled: boolean
          prayer_stop_location: string | null
          prayer_stop_duration_min: number | null
          allows_packages: boolean
          package_capacity_kg: number | null
          predicted_demand: number | null
          corridor_id: string | null
          cluster_id: string | null
          notes: string | null
          cancelled_by: string | null
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mode: 'carpooling' | 'on_demand' | 'scheduled' | 'package' | 'return'
          status?: 'posted' | 'requested' | 'matched' | 'accepted' | 'booked' | 'confirmed' | 'pickup' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
          driver_id?: string | null
          created_by: string
          origin_name: string
          origin_location: string
          destination_name: string
          destination_location: string
          distance_km?: number | null
          duration_minutes?: number | null
          route_polyline?: string | null
          departure_time?: string | null
          scheduled_pickup_time?: string | null
          actual_pickup_time?: string | null
          actual_dropoff_time?: string | null
          completed_at?: string | null
          total_seats?: number
          available_seats?: number
          price_per_seat?: number | null
          total_price?: number | null
          surge_multiplier?: number
          gender_preference?: 'mixed' | 'women_only' | 'men_only' | 'family_only'
          prayer_stop_enabled?: boolean
          prayer_stop_location?: string | null
          prayer_stop_duration_min?: number | null
          allows_packages?: boolean
          package_capacity_kg?: number | null
          predicted_demand?: number | null
          corridor_id?: string | null
          cluster_id?: string | null
          notes?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mode?: 'carpooling' | 'on_demand' | 'scheduled' | 'package' | 'return'
          status?: 'posted' | 'requested' | 'matched' | 'accepted' | 'booked' | 'confirmed' | 'pickup' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
          driver_id?: string | null
          created_by?: string
          origin_name?: string
          origin_location?: string
          destination_name?: string
          destination_location?: string
          distance_km?: number | null
          duration_minutes?: number | null
          route_polyline?: string | null
          departure_time?: string | null
          scheduled_pickup_time?: string | null
          actual_pickup_time?: string | null
          actual_dropoff_time?: string | null
          completed_at?: string | null
          total_seats?: number
          available_seats?: number
          price_per_seat?: number | null
          total_price?: number | null
          surge_multiplier?: number
          gender_preference?: 'mixed' | 'women_only' | 'men_only' | 'family_only'
          prayer_stop_enabled?: boolean
          prayer_stop_location?: string | null
          prayer_stop_duration_min?: number | null
          allows_packages?: boolean
          package_capacity_kg?: number | null
          predicted_demand?: number | null
          corridor_id?: string | null
          cluster_id?: string | null
          notes?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trip_bookings: {
        Row: {
          id: string
          trip_id: string
          passenger_id: string
          seats_booked: number
          price_paid: number
          pickup_location: string | null
          pickup_name: string | null
          dropoff_location: string | null
          dropoff_name: string | null
          status: 'posted' | 'requested' | 'matched' | 'accepted' | 'booked' | 'confirmed' | 'pickup' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
          confirmed_by_driver: boolean
          driver_rating: number | null
          passenger_rating: number | null
          driver_review: string | null
          passenger_review: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          passenger_id: string
          seats_booked?: number
          price_paid: number
          pickup_location?: string | null
          pickup_name?: string | null
          dropoff_location?: string | null
          dropoff_name?: string | null
          status?: 'posted' | 'requested' | 'matched' | 'accepted' | 'booked' | 'confirmed' | 'pickup' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
          confirmed_by_driver?: boolean
          driver_rating?: number | null
          passenger_rating?: number | null
          driver_review?: string | null
          passenger_review?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          passenger_id?: string
          seats_booked?: number
          price_paid?: number
          pickup_location?: string | null
          pickup_name?: string | null
          dropoff_location?: string | null
          dropoff_name?: string | null
          status?: 'posted' | 'requested' | 'matched' | 'accepted' | 'booked' | 'confirmed' | 'pickup' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
          confirmed_by_driver?: boolean
          driver_rating?: number | null
          passenger_rating?: number | null
          driver_review?: string | null
          passenger_review?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      packages: {
        Row: {
          id: string
          tracking_number: string
          qr_code: string
          sender_id: string
          receiver_name: string
          receiver_phone: string
          origin_name: string
          origin_location: string
          destination_name: string
          destination_location: string
          size: 'small' | 'medium' | 'large' | 'extra_large'
          weight_kg: number | null
          description: string | null
          declared_value: number | null
          fragile: boolean
          trip_id: string | null
          carrier_id: string | null
          delivery_fee: number
          insurance_fee: number
          status: 'posted' | 'requested' | 'matched' | 'accepted' | 'booked' | 'confirmed' | 'pickup' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
          picked_up_at: string | null
          delivered_at: string | null
          pickup_verified: boolean
          dropoff_verified: boolean
          pickup_signature: string | null
          dropoff_signature: string | null
          is_return: boolean
          ecommerce_order_id: string | null
          return_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tracking_number: string
          qr_code: string
          sender_id: string
          receiver_name: string
          receiver_phone: string
          origin_name: string
          origin_location: string
          destination_name: string
          destination_location: string
          size: 'small' | 'medium' | 'large' | 'extra_large'
          weight_kg?: number | null
          description?: string | null
          declared_value?: number | null
          fragile?: boolean
          trip_id?: string | null
          carrier_id?: string | null
          delivery_fee: number
          insurance_fee?: number
          status?: 'posted' | 'requested' | 'matched' | 'accepted' | 'booked' | 'confirmed' | 'pickup' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
          picked_up_at?: string | null
          delivered_at?: string | null
          pickup_verified?: boolean
          dropoff_verified?: boolean
          pickup_signature?: string | null
          dropoff_signature?: string | null
          is_return?: boolean
          ecommerce_order_id?: string | null
          return_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tracking_number?: string
          qr_code?: string
          sender_id?: string
          receiver_name?: string
          receiver_phone?: string
          origin_name?: string
          origin_location?: string
          destination_name?: string
          destination_location?: string
          size?: 'small' | 'medium' | 'large' | 'extra_large'
          weight_kg?: number | null
          description?: string | null
          declared_value?: number | null
          fragile?: boolean
          trip_id?: string | null
          carrier_id?: string | null
          delivery_fee?: number
          insurance_fee?: number
          status?: 'posted' | 'requested' | 'matched' | 'accepted' | 'booked' | 'confirmed' | 'pickup' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
          picked_up_at?: string | null
          delivered_at?: string | null
          pickup_verified?: boolean
          dropoff_verified?: boolean
          pickup_signature?: string | null
          dropoff_signature?: string | null
          is_return?: boolean
          ecommerce_order_id?: string | null
          return_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          title_ar: string | null
          message: string
          message_ar: string | null
          trip_id: string | null
          package_id: string | null
          read: boolean
          read_at: string | null
          push_sent: boolean
          sms_sent: boolean
          email_sent: boolean
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          title_ar?: string | null
          message: string
          message_ar?: string | null
          trip_id?: string | null
          package_id?: string | null
          read?: boolean
          read_at?: string | null
          push_sent?: boolean
          sms_sent?: boolean
          email_sent?: boolean
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          title_ar?: string | null
          message?: string
          message_ar?: string | null
          trip_id?: string | null
          package_id?: string | null
          read?: boolean
          read_at?: string | null
          push_sent?: boolean
          sms_sent?: boolean
          email_sent?: boolean
          metadata?: Json | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          trip_id: string | null
          message: string
          read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          trip_id?: string | null
          message: string
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          trip_id?: string | null
          message?: string
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      available_trips: {
        Row: {
          id: string
          mode: string
          status: string
          driver_id: string
          driver_name: string
          driver_avatar: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_color: string | null
          vehicle_type: string
          driver_rating: number
          driver_total_ratings: number
          origin_name: string
          destination_name: string
          departure_time: string
          available_seats: number
          price_per_seat: number
          gender_preference: string
        }
      }
      driver_earnings_summary: {
        Row: {
          driver_id: string
          full_name: string
          total_trips: number
          total_earnings: number
          this_month_earnings: number
          this_week_earnings: number
          average_rating: number
        }
      }
    }
    Functions: {
      find_nearby_drivers: {
        Args: {
          user_lat: number
          user_lon: number
          max_distance_km?: number
          max_results?: number
        }
        Returns: {
          driver_id: string
          distance_km: number
          driver_name: string
          vehicle_type: string
          rating: number
        }[]
      }
      calculate_dynamic_price: {
        Args: {
          p_mode: 'carpooling' | 'on_demand' | 'package'
          p_distance_km: number
          p_duration_min: number
          p_corridor?: string
          p_timestamp?: string
        }
        Returns: Json
      }
    }
    Enums: {
      user_role: 'passenger' | 'driver' | 'both' | 'admin'
      trip_mode: 'carpooling' | 'on_demand' | 'scheduled' | 'package' | 'return'
      trip_status: 'posted' | 'requested' | 'matched' | 'accepted' | 'booked' | 'confirmed' | 'pickup' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
      gender: 'male' | 'female' | 'unspecified'
      gender_preference: 'mixed' | 'women_only' | 'men_only' | 'family_only'
      vehicle_type: 'economy' | 'comfort' | 'premium' | 'van' | 'suv'
      package_size: 'small' | 'medium' | 'large' | 'extra_large'
      driver_status: 'offline' | 'online' | 'busy' | 'in_trip'
    }
  }
}
