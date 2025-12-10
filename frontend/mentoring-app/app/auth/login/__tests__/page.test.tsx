/**
 * Tests for Login Page
 * 
 * Tests rendering, form validation, API handlers, and error states
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import LoginPage from '../page';
import { useAuth } from '@/contexts/auth-context';

// Mock dependencies
jest.mock('@/contexts/auth-context');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockLogin = jest.fn();

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });
  });

  describe('Rendering', () => {
    it('should render login form with all fields', () => {
      render(<LoginPage />);

      // The card title renders as a div, so select the text within non-button elements
      expect(
        screen.getByText(/Sign in/i, { selector: 'div' })
      ).toBeInTheDocument();
      expect(screen.getByText(/Enter your email or username and password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email or Username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Sign up/i })).toBeInTheDocument();
    });

    it('should render form inputs with correct placeholders', () => {
      render(<LoginPage />);

      expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error when email/username is empty', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email or Username/i);
      await user.click(emailInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/Email or username is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error when password is empty', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText(/Password/i);
      await user.click(passwordInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email or Username/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address or username/i)).toBeInTheDocument();
      });
    });

    it('should accept valid email address', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email or Username/i);
      await user.type(emailInput, 'test@example.com');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/Please enter a valid email address or username/i)).not.toBeInTheDocument();
      });
    });

    it('should accept valid username', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email or Username/i);
      await user.type(emailInput, 'testuser123');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/Please enter a valid email address or username/i)).not.toBeInTheDocument();
      });
    });

    it('should accept username with underscores', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email or Username/i);
      await user.type(emailInput, 'test_user_123');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/Please enter a valid email address or username/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid credentials', async () => {
      const user = userEvent.setup();
      const mockToken = 'mock.token.here';
      mockLogin.mockResolvedValue({ success: true, token: mockToken });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email or Username/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should submit form with username instead of email', async () => {
      const user = userEvent.setup();
      const mockToken = 'mock.token.here';
      mockLogin.mockResolvedValue({ success: true, token: mockToken });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email or Username/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign in/i });

      await user.type(emailInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
      });
    });

    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup();
      let resolveLogin: (value: { success: boolean; token?: string; message?: string }) => void;
      const loginPromise = new Promise<{ success: boolean; token?: string; message?: string }>((resolve) => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValue(loginPromise);

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email or Username/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/Signing in.../i)).toBeInTheDocument();
      });

      resolveLogin!({ success: true, token: 'token' });
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should disable inputs while submitting', async () => {
      const user = userEvent.setup();
      let resolveLogin: (value: { success: boolean; token?: string; message?: string }) => void;
      const loginPromise = new Promise<{ success: boolean; token?: string; message?: string }>((resolve) => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValue(loginPromise);

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email or Username/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
      });

      resolveLogin!({ success: true, token: 'token' });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when login fails', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({
        success: false,
        message: 'Invalid email/username or password',
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email or Username/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email/username or password')).toBeInTheDocument();
      });
    });

    it('should display default error message when no message is provided', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({
        success: false,
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email or Username/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email/username or password')).toBeInTheDocument();
      });
    });

    it('should display error message when login throws an exception', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValue(new Error('Network error'));

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email or Username/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
      });
    });

    it('should clear error message on new submission attempt', async () => {
      const user = userEvent.setup();
      mockLogin
        .mockResolvedValueOnce({
          success: false,
          message: 'First error',
        })
        .mockResolvedValueOnce({
          success: false,
          message: 'Second error',
        });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email or Username/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
        expect(screen.getByText('Second error')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should redirect to home page on successful login', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true, token: 'mock.token' });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email or Username/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should have link to signup page', () => {
      render(<LoginPage />);

      const signupLink = screen.getByRole('link', { name: /Sign up/i });
      expect(signupLink).toHaveAttribute('href', '/auth/signup');
    });
  });
});

