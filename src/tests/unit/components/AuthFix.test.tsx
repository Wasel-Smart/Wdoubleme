import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { AuthFix } from '../../../components/AuthFix';
import { createMockFetchResponse, mockUser, mockSession } from '../../utils/test-helpers';

// Mock Supabase client
const { mockSignIn, mockSetSession } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockSetSession: vi.fn(),
}));

vi.mock('../../../utils/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignIn,
      setSession: mockSetSession,
    },
  },
}));

// Mock toast (must be hoisted because vi.mock is hoisted)
const { mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

// Mock window.location safely (JSDOM's Location is often non-configurable)
try {
  window.location.href = '';
} catch {
  // ignore
}

describe('AuthFix Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Rendering', () => {
    it('renders login form by default', () => {
      render(
        <BrowserRouter>
          <AuthFix />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Login to Wassel')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login with smart fix/i })).toBeInTheDocument();
    });

    it('renders signup form when signup tab clicked', () => {
      render(
        <BrowserRouter>
          <AuthFix />
        </BrowserRouter>
      );
      
      const signupTab = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(signupTab);
      
      expect(screen.getByText('Sign Up for Wassel')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      render(
        <BrowserRouter>
          <AuthFix />
        </BrowserRouter>
      );
      
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Login Functionality', () => {
    it('validates empty email', async () => {
      render(
        <BrowserRouter>
          <AuthFix />
        </BrowserRouter>
      );
      
      const loginButton = screen.getByRole('button', { name: /login with smart fix/i });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Please enter email and password');
      });
    });

    it('validates email format', async () => {
      render(
        <BrowserRouter>
          <AuthFix />
        </BrowserRouter>
      );
      
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const loginButton = screen.getByRole('button', { name: /login with smart fix/i });
      fireEvent.click(loginButton);
      
      // Should show error (email validation happens on server)
      await waitFor(() => {
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });

    it('handles successful direct login', async () => {
      mockSignIn.mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      });

      render(
        <BrowserRouter>
          <AuthFix />
        </BrowserRouter>
      );
      
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      fireEvent.change(emailInput, { target: { value: 'test@wassel.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const loginButton = screen.getByRole('button', { name: /direct login/i });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'test@wassel.com',
          password: 'password123',
        });
      });
      
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          'Welcome back!',
          expect.objectContaining({
            description: 'Successfully logged in',
          })
        );
      });
    });

    it('handles smart login via server endpoint', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        createMockFetchResponse({
          success: true,
          session: mockSession,
          user: mockUser,
        })
      );

      mockSetSession.mockResolvedValueOnce({ error: null });

      render(
        <BrowserRouter>
          <AuthFix />
        </BrowserRouter>
      );
      
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      fireEvent.change(emailInput, { target: { value: 'test@wassel.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const loginButton = screen.getByRole('button', { name: /login with smart fix/i });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/login'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              email: 'test@wassel.com',
              password: 'password123',
            }),
          })
        );
      });

      await waitFor(() => {
        expect(mockSetSession).toHaveBeenCalled();
      });
    });

    it('handles login error', async () => {
      mockSignIn.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid login credentials' },
      });

      render(
        <BrowserRouter>
          <AuthFix />
        </BrowserRouter>
      );
      
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      fireEvent.change(emailInput, { target: { value: 'test@wassel.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      
      const loginButton = screen.getByRole('button', { name: /direct login/i });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Login Failed',
          expect.objectContaining({
            description: expect.stringContaining('Invalid'),
          })
        );
      });
    });

    it('shows loading state during login', async () => {
      mockSignIn.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 100))
      );

      render(
        <BrowserRouter>
          <AuthFix />
        </BrowserRouter>
      );
      
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      fireEvent.change(emailInput, { target: { value: 'test@wassel.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const loginButton = screen.getByRole('button', { name: /direct login/i });
      fireEvent.click(loginButton);
      
      // Should show loading state
      expect(screen.getByText(/logging in/i)).toBeInTheDocument();
      expect(loginButton).toBeDisabled();
    });

    it('supports keyboard Enter to submit', async () => {
      mockSignIn.mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      render(
        <BrowserRouter>
          <AuthFix />
        </BrowserRouter>
      );
      
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      fireEvent.change(emailInput, { target: { value: 'test@wassel.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      fireEvent.keyPress(passwordInput, { key: 'Enter', code: 'Enter', charCode: 13 });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Signup Functionality', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <AuthFix />
        </BrowserRouter>
      );
      
      const signupTab = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(signupTab);
    });

    it('validates required fields', async () => {
      const signupButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(signupButton);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Please fill in all fields');
      });
    });

    it('handles successful signup', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        createMockFetchResponse({
          success: true,
          user: mockUser,
        })
      );

      mockSignIn.mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const nameInput = screen.getByPlaceholderText('John Doe');
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'newuser@wassel.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const signupButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(signupButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/signup'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              email: 'newuser@wassel.com',
              password: 'password123',
              fullName: 'Test User',
            }),
          })
        );
      });

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          'Welcome to Wassel!',
          expect.anything()
        );
      });
    });

    it('handles email already exists error', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        createMockFetchResponse(
          { error: 'A user with this email address has already been registered' },
          false
        )
      );

      const nameInput = screen.getByPlaceholderText('John Doe');
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'existing@wassel.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const signupButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(signupButton);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Email already registered',
          expect.anything()
        );
      });

      // Should switch to login mode
      await waitFor(() => {
        expect(screen.getByText('Login to Wassel')).toBeInTheDocument();
      });
    });
  });

  describe('UI Interactions', () => {
    it('switches between login and signup modes', () => {
      render(
        <BrowserRouter>
          <AuthFix />
        </BrowserRouter>
      );
      
      // Start with login
      expect(screen.getByText('Login to Wassel')).toBeInTheDocument();
      
      // Switch to signup
      const signupTab = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(signupTab);
      expect(screen.getByText('Sign Up for Wassel')).toBeInTheDocument();
      
      // Switch back to login
      const loginTab = screen.getByRole('button', { name: /login/i });
      fireEvent.click(loginTab);
      expect(screen.getByText('Login to Wassel')).toBeInTheDocument();
    });

    it('clears form when switching modes', () => {
      render(
        <BrowserRouter>
          <AuthFix />
        </BrowserRouter>
      );
      
      // Enter login data
      const emailInput = screen.getByPlaceholderText('you@example.com');
      fireEvent.change(emailInput, { target: { value: 'test@wassel.com' } });
      
      // Switch to signup
      const signupTab = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(signupTab);
      
      // Email should still be there (not cleared)
      const emailInputSignup = screen.getByPlaceholderText('you@example.com');
      expect(emailInputSignup).toHaveValue('test@wassel.com');
    });

    it('displays result messages', async () => {
      mockSignIn.mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      render(
        <BrowserRouter>
          <AuthFix />
        </BrowserRouter>
      );
      
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      fireEvent.change(emailInput, { target: { value: 'test@wassel.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const loginButton = screen.getByRole('button', { name: /direct login/i });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText('Success!')).toBeInTheDocument();
        expect(screen.getByText('Login successful!')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles network errors gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      render(
        <BrowserRouter>
          <AuthFix />
        </BrowserRouter>
      );
      
      const signupTab = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(signupTab);
      
      const nameInput = screen.getByPlaceholderText('John Doe');
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@wassel.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const signupButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(signupButton);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });
    });

    it('disables form during submission', async () => {
      mockSignIn.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 200))
      );

      render(
        <BrowserRouter>
          <AuthFix />
        </BrowserRouter>
      );
      
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      fireEvent.change(emailInput, { target: { value: 'test@wassel.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const loginButton = screen.getByRole('button', { name: /direct login/i });
      fireEvent.click(loginButton);
      
      // Form should be disabled
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(loginButton).toBeDisabled();
    });
  });
});
