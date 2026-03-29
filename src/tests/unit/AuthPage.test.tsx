import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthPage } from '../../components/AuthPage';
import { LanguageProvider } from '../../contexts/LanguageContext';

const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithGoogle = vi.fn();
const mockSignInWithFacebook = vi.fn();
const mockResetPassword = vi.fn();

vi.mock('motion/react', () => {
  const makeMotionComponent = (tag: keyof JSX.IntrinsicElements) =>
    ({ children, ...props }: any) => {
      const {
        animate,
        exit,
        initial,
        layout,
        transition,
        viewport,
        whileHover,
        whileTap,
        whileInView,
        ...domProps
      } = props;
      return React.createElement(tag, domProps, children);
    };

  return {
    motion: new Proxy(
      {},
      {
        get: (_target, key: string) => makeMotionComponent(key as keyof JSX.IntrinsicElements),
      },
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
  },
}));

vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      signIn: mockSignIn,
      signUp: mockSignUp,
      signInWithGoogle: mockSignInWithGoogle,
      signInWithFacebook: mockSignInWithFacebook,
      resetPassword: mockResetPassword,
      loading: false,
      user: null,
    }),
  };
});

function renderAuthPage() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <AuthPage />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the login experience by default', () => {
    renderAuthPage();

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^log in$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it('renders social authentication actions', () => {
    renderAuthPage();

    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with facebook/i })).toBeInTheDocument();
  });

  it('shows an invalid email error before submit', async () => {
    renderAuthPage();

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'invalid-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('shows a short password error before submit', async () => {
    renderAuthPage();

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('does not submit when login fields are empty', async () => {
    renderAuthPage();

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter email and password/i)).toBeInTheDocument();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('calls signIn with the entered credentials', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    renderAuthPage();

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('surfaces login failures to the user', async () => {
    mockSignIn.mockResolvedValue({ error: new Error('Invalid credentials') });
    renderAuthPage();

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('switches to the sign-up form and submits a new account', async () => {
    mockSignUp.mockResolvedValue({ error: null });
    renderAuthPage();

    fireEvent.click(screen.getByRole('button', { name: /don't have an account\? sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/create account/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('john@example.com', 'password123', 'John Doe');
    });
  });

  it('calls Google OAuth when requested', async () => {
    mockSignInWithGoogle.mockResolvedValue({ error: null });
    renderAuthPage();

    fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });

  it('calls Facebook OAuth when requested', async () => {
    mockSignInWithFacebook.mockResolvedValue({ error: null });
    renderAuthPage();

    fireEvent.click(screen.getByRole('button', { name: /continue with facebook/i }));

    await waitFor(() => {
      expect(mockSignInWithFacebook).toHaveBeenCalled();
    });
  });

  it('keeps keyboard navigation usable between email and password', () => {
    renderAuthPage();

    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    emailInput.focus();
    fireEvent.keyDown(emailInput, { key: 'Tab' });

    expect(document.activeElement).toBe(passwordInput);
  });
});
