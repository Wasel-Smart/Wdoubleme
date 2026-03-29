/**
 * Reviews and Ratings Service
 * Backend service for managing driver and passenger reviews
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface Review {
  id: string;
  trip_id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_type: 'driver' | 'passenger';
  reviewee_id: string;
  reviewee_type: 'driver' | 'passenger';
  rating: number; // 1-5
  comment?: string;
  categories: {
    cleanliness?: number;
    punctuality?: number;
    communication?: number;
    safety?: number;
    professionalism?: number;
  };
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface RatingsSummary {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  category_averages: {
    cleanliness: number;
    punctuality: number;
    communication: number;
    safety: number;
    professionalism: number;
  };
}

class ReviewsService {
  private baseUrl = `https://${projectId}.supabase.co/functions/v1/server`;

  /**
   * Submit a review
   */
  async submitReview(review: Omit<Review, 'id' | 'created_at' | 'status'>): Promise<Review> {
    try {
      const response = await fetch(`${this.baseUrl}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(review),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      const data = await response.json();
      return data.review;
    } catch (error) {
      console.error('[Reviews] Submit error:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a user
   */
  async getReviews(
    userId: string,
    userType: 'driver' | 'passenger',
    limit = 20
  ): Promise<Review[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/reviews?reviewee_id=${userId}&reviewee_type=${userType}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();
      return data.reviews || [];
    } catch (error) {
      console.error('[Reviews] Fetch error:', error);
      return [];
    }
  }

  /**
   * Get ratings summary
   */
  async getRatingsSummary(
    userId: string,
    userType: 'driver' | 'passenger'
  ): Promise<RatingsSummary> {
    try {
      const response = await fetch(
        `${this.baseUrl}/reviews/summary?user_id=${userId}&user_type=${userType}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch summary');

      const data = await response.json();
      return data.summary;
    } catch (error) {
      console.error('[Reviews] Summary error:', error);
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        category_averages: {
          cleanliness: 0,
          punctuality: 0,
          communication: 0,
          safety: 0,
          professionalism: 0,
        },
      };
    }
  }

  /**
   * Update review status (admin only)
   */
  async updateReviewStatus(
    reviewId: string,
    status: 'approved' | 'rejected'
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update status');
    } catch (error) {
      console.error('[Reviews] Update status error:', error);
      throw error;
    }
  }

  /**
   * Report inappropriate review
   */
  async reportReview(reviewId: string, reason: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to report review');
    } catch (error) {
      console.error('[Reviews] Report error:', error);
      throw error;
    }
  }
}

export const reviewsService = new ReviewsService();