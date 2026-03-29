import { API_URL, fetchWithRetry, getAuthDetails } from './core';

export const messagesAPI = {
  async sendMessage(recipientId: string, tripId: string, content: string) {
    const { token } = await getAuthDetails();

    const response = await fetchWithRetry(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ recipient_id: recipientId, trip_id: tripId, content })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    return await response.json();
  },

  async getConversations() {
    const { token, userId } = await getAuthDetails();

    const response = await fetchWithRetry(`${API_URL}/messages/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }

    return await response.json();
  },
  
  async getConversationWithUser(otherUserId: string) {
    const { token, userId } = await getAuthDetails();
    
    const response = await fetchWithRetry(`${API_URL}/messages/conversation/${userId}/${otherUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch messages');
    }
    
    return await response.json();
  }
};
