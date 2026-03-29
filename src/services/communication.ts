/**
 * Communication Service
 * Handles phone calls and messaging functionality
 */

import { toast } from 'sonner';

interface ContactInfo {
  userId: string;
  name: string;
  phone?: string;
  role?: 'driver' | 'passenger';
}

/**
 * Initiate a phone call
 */
export function initiateCall(contact: ContactInfo): void {
  // Check if phone number is available
  if (!contact.phone) {
    toast.error('Phone number not available', {
      description: 'This user has not shared their phone number',
      duration: 3000,
    });
    return;
  }

  // Validate phone number format (basic check)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(contact.phone.replace(/[\s-]/g, ''))) {
    toast.error('Invalid phone number', {
      description: 'Please contact support if this issue persists',
      duration: 3000,
    });
    return;
  }

  // Confirm before calling
  const roleText = contact.role === 'driver' ? 'driver' : 'passenger';
  const confirmed = window.confirm(
    `Call ${contact.name} (${roleText})?\\n\\nPhone: ${contact.phone}\\n\\nNote: Standard call rates apply.`
  );

  if (confirmed) {
    try {
      // Show initiating toast
      toast.loading('Initiating call...', {
        id: 'call-init',
        duration: 2000,
      });

      // Initiate the call
      window.open(`tel:${contact.phone}`);

      // Show success message
      setTimeout(() => {
        toast.success('Call initiated', {
          id: 'call-success',
          description: `Calling ${contact.name}`,
          duration: 2000,
        });
      }, 500);
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error('Failed to initiate call', {
        description: 'Please try again or use your phone app directly',
        duration: 3000,
      });
    }
  }
}

/**
 * Open messaging interface
 */
export function openMessages(contact: ContactInfo, navigate?: (path: string) => void): void {
  try {
    // Show loading state
    toast.loading('Opening chat...', {
      id: 'message-init',
      duration: 1000,
    });

    // Navigate to messages with specific user
    if (navigate) {
      // Navigate to messages page with user ID as query param
      navigate(`/messages?userId=${contact.userId}&name=${encodeURIComponent(contact.name)}`);
      
      toast.success('Opening chat', {
        id: 'message-success',
        description: `Chat with ${contact.name}`,
        duration: 2000,
      });
    } else {
      // Fallback: just show messages tab
      toast.info('Go to Messages tab', {
        id: 'message-info',
        description: `Find ${contact.name} in your conversations`,
        duration: 3000,
      });
    }
  } catch (error) {
    console.error('Error opening messages:', error);
    toast.error('Failed to open chat', {
      description: 'Please navigate to Messages manually',
      duration: 3000,
    });
  }
}

/**
 * Quick message with pre-filled text
 */
export function sendQuickMessage(
  contact: ContactInfo,
  message: string,
  navigate?: (path: string) => void
): void {
  try {
    const encodedMessage = encodeURIComponent(message);
    
    if (navigate) {
      navigate(
        `/messages?userId=${contact.userId}&name=${encodeURIComponent(contact.name)}&message=${encodedMessage}`
      );
      
      toast.success('Opening chat', {
        description: `Sending message to ${contact.name}`,
        duration: 2000,
      });
    } else {
      toast.info('Go to Messages tab', {
        description: `Find ${contact.name} to send: "${message}"`,
        duration: 4000,
      });
    }
  } catch (error) {
    console.error('Error sending quick message:', error);
    toast.error('Failed to send message', {
      description: 'Please try again',
      duration: 3000,
    });
  }
}

/**
 * Emergency call (bypasses confirmation)
 */
export function emergencyCall(contact: ContactInfo): void {
  if (!contact.phone) {
    toast.error('Emergency: Phone number not available', {
      description: 'Use SOS button to contact emergency services',
      duration: 5000,
    });
    return;
  }

  toast.error('Emergency call initiated', {
    description: `Calling ${contact.name}`,
    duration: 3000,
  });

  window.open(`tel:${contact.phone}`);
}

/**
 * Check if user can be called
 */
export function canCall(contact: ContactInfo): boolean {
  return !!(contact.phone && contact.phone.length > 0);
}

/**
 * Check if user can be messaged
 */
export function canMessage(contact: ContactInfo): boolean {
  return !!(contact.userId && contact.userId.length > 0);
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a Jordanian number (+962)
  if (cleaned.startsWith('962')) {
    const number = cleaned.substring(3);
    // Format: +962 XX XXX XXXX
    return `+962 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`;
  }
  
  // Check if it's a Saudi number (+966)
  if (cleaned.startsWith('966')) {
    const number = cleaned.substring(3);
    // Format: +966 XX XXX XXXX
    return `+966 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`;
  }
  
  // Default: just add + if not present
  return phone.startsWith('+') ? phone : `+${phone}`;
}

export default {
  initiateCall,
  openMessages,
  sendQuickMessage,
  emergencyCall,
  canCall,
  canMessage,
  formatPhoneNumber,
};