/**
 * Local Messages Mock Service
 * Simulates backend API for development without Supabase backend
 */

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  trip_id?: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface Conversation {
  userId: string;
  messages: Message[];
}

class LocalMessagesService {
  private static instance: LocalMessagesService;
  private messages: Message[] = [];
  private conversations: Map<string, Conversation> = new Map();

  private constructor() {
    // Initialize with some demo data
    this.initializeDemoData();
  }

  static getInstance(): LocalMessagesService {
    if (!LocalMessagesService.instance) {
      LocalMessagesService.instance = new LocalMessagesService();
    }
    return LocalMessagesService.instance;
  }

  private initializeDemoData() {
    // Add some demo conversations
    const demoMessages: Message[] = [
      {
        id: 'msg_1',
        sender_id: 'driver_123',
        recipient_id: 'user_current',
        content: 'Hi! I booked 2 seats for tomorrow',
        read: true,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'msg_2',
        sender_id: 'user_current',
        recipient_id: 'driver_123',
        content: 'Great! Where would you like to be picked up?',
        read: true,
        created_at: new Date(Date.now() - 3500000).toISOString(),
      },
      {
        id: 'msg_3',
        sender_id: 'driver_123',
        recipient_id: 'user_current',
        content: 'Near 7th Circle would be perfect',
        read: true,
        created_at: new Date(Date.now() - 3400000).toISOString(),
      },
    ];

    this.messages = demoMessages;
  }

  /**
   * Send a message (simulated)
   */
  async sendMessage(data: {
    sender_id: string;
    recipient_id: string;
    trip_id?: string;
    content: string;
  }): Promise<{ success: boolean; message?: Message; error?: string }> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const newMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sender_id: data.sender_id,
        recipient_id: data.recipient_id,
        trip_id: data.trip_id,
        content: data.content,
        read: false,
        created_at: new Date().toISOString(),
      };

      // Store message
      this.messages.push(newMessage);

      return { success: true, message: newMessage };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get conversation between two users
   */
  async getConversation(
    userId1: string,
    userId2: string
  ): Promise<{ success: boolean; messages?: Message[]; error?: string }> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));

      // Filter messages between these two users
      const conversationMessages = this.messages.filter(
        (msg) =>
          (msg.sender_id === userId1 && msg.recipient_id === userId2) ||
          (msg.sender_id === userId2 && msg.recipient_id === userId1)
      );

      // Sort by created_at
      conversationMessages.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      return { success: true, messages: conversationMessages };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<boolean> {
    const message = this.messages.find((m) => m.id === messageId);
    if (message) {
      message.read = true;
      return true;
    }
    return false;
  }

  /**
   * Get unread count
   */
  getUnreadCount(userId: string): number {
    return this.messages.filter(
      (msg) => msg.recipient_id === userId && !msg.read
    ).length;
  }

  /**
   * Clear all messages (for testing)
   */
  clearAll() {
    this.messages = [];
    this.conversations.clear();
  }
}

// Export singleton instance
export const localMessagesService = LocalMessagesService.getInstance();

// Export types
export type { Message };
