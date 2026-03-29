import { API_URL, fetchWithRetry, getAuthDetails, supabase, publicAnonKey } from './core';

export const authAPI = {
  async signUp(email: string, password: string, firstName: string, lastName: string, phone: string) {
    try {
      // ⚡ REMOVED: Excessive logging
      
      const response = await fetchWithRetry(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, fullName: `${firstName} ${lastName}` })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        if (errorData.error?.includes('already been registered') || 
            errorData.error?.includes('User already registered')) {
          throw new Error('EMAIL_ALREADY_EXISTS');
        }
        
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server.');
      }
      
      throw error;
    }
  },

  async createProfile(userId: string, email: string, firstName: string, lastName: string) {
    try {
      // ⚡ FAST: Get session with minimal retries
      let session = null;
      let attempts = 0;
      const maxAttempts = 3; // Reduced from 5
      
      while (!session && attempts < maxAttempts) {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          session = currentSession;
          break;
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 500)); // Faster retry
      }
      
      if (!session) {
        throw new Error('Not authenticated - please try logging in again');
      }
      
      const response = await fetchWithRetry(`${API_URL}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          userId, 
          email, 
          firstName, 
          lastName,
          fullName: `${firstName} ${lastName}`.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        if (response.status === 401 && errorData.message?.includes('JWT')) {
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !refreshedSession) {
            throw new Error('Session expired - please log in again');
          }
          
          const retryResponse = await fetchWithRetry(`${API_URL}/profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshedSession.access_token}`
            },
            body: JSON.stringify({ 
              userId, 
              email, 
              firstName, 
              lastName,
              fullName: `${firstName} ${lastName}`.trim()
            })
          });
          
          if (!retryResponse.ok) {
            const retryErrorData = await retryResponse.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(retryErrorData.error || `Failed to create profile: ${retryResponse.status}`);
          }
          
          return await retryResponse.json();
        }
        
        throw new Error(errorData.error || `Failed to create profile: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('createProfile error:', error);
      }
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  },

  async getProfile() {
    const { token, userId } = await getAuthDetails();
    if (!token || !userId) return { profile: null };

    // Use the API which reads from KV store (profiles table does not exist)
    try {
      const response = await fetchWithRetry(
        `${API_URL}/profile/${userId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!response.ok) return { profile: null };
      const data = await response.json();
      return { profile: data };
    } catch (error) {
      return { profile: null };
    }
  },

  async updateProfile(updates: any) {
    const { token, userId } = await getAuthDetails();
    if (!token || !userId) return { success: false, error: 'Not authenticated' };

    // Use the API which writes to KV store (profiles table does not exist)
    try {
      const response = await fetchWithRetry(
        `${API_URL}/profile/${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Server error: ${response.status}` }));
        console.error('[authAPI.updateProfile] Server error:', response.status, errorData);
        return { success: false, error: errorData.error || `Failed to update profile: ${response.status}` };
      }
      const data = await response.json();
      return { success: true, profile: data };
    } catch (error) {
      console.error('[authAPI.updateProfile] Network/fetch error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Network error updating profile' };
    }
  }
};