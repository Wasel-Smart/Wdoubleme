import { API_URL, fetchWithRetry, getAuthDetails } from './core';

export const walletAPI = {
  async getBalance() {
    return await walletAPI.getWallet();
  },

  async getWallet() {
    const { token, userId } = await getAuthDetails();

    const response = await fetchWithRetry(`${API_URL}/wallet/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch wallet');
    }

    return await response.json();
  },

  async addFunds(amount: number) {
    const { token, userId } = await getAuthDetails();

    const response = await fetchWithRetry(`${API_URL}/wallet/${userId}/add-funds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount })
    });

    if (!response.ok) {
      throw new Error('Failed to add funds');
    }

    return await response.json();
  },

  async getTransactions(page = 1, limit = 10) {
    const { token, userId } = await getAuthDetails();

    const response = await fetchWithRetry(`${API_URL}/wallet/${userId}/transactions?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    return await response.json();
  },

  async withdrawFunds(amount: number) {
    const { token, userId } = await getAuthDetails();

    const response = await fetchWithRetry(`${API_URL}/wallet/${userId}/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to withdraw funds');
    }

    return await response.json();
  },

  async topUp(amount: number, paymentMethod: string) {
    if (amount <= 0) throw new Error('Invalid amount');
    const { token, userId } = await getAuthDetails();

    const response = await fetchWithRetry(`${API_URL}/wallet/${userId}/add-funds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount, paymentMethod }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as any).error || 'Top up failed');
    }

    return await response.json();
  },
};
