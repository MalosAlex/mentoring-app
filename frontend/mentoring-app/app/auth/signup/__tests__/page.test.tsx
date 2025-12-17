/**
 * Tests for Signup Page
 * 
 * Tests rendering, form validation, API handlers, and error states
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import SignupPage from '../page';
import { registerUser } from '@/lib/auth-service';

// Mock dependencies
jest.mock('@/lib/auth-service');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockRegisterUser = registerUser as jest.MockedFunction<typeof registerUser>;

describe('SignupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('Rendering', () => {
    it('should render signup form with all fields', () => {
      render(<SignupPage />);

      expect(screen.getByText('Create an account')).toBeInTheDocument();
      expect(screen.getByText(/Enter your information to create a new account/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create account/i })).toBeInTheDocument();
      expect(screen.getByText(/Already have an account/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Sign in/i })).toBeInTheDocument();
    });

    it('should render form inputs with correct placeholders', () => {
      render(<SignupPage />);

      expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('johndoe')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
    });
  });

  describe('Form Validation', () => {
    describe('Full Name Validation', () => {
      it('should show validation error when full name is empty', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const fullNameInput = screen.getByLabelText(/Full Name/i);
        await user.click(fullNameInput);
        await user.tab();

        await waitFor(() => {
          expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
        });
      });

      it('should show validation error when full name is too short', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const fullNameInput = screen.getByLabelText(/Full Name/i);
        await user.type(fullNameInput, 'A');
        await user.tab();

        await waitFor(() => {
          expect(screen.getByText(/Full name must be at least 2 characters/i)).toBeInTheDocument();
        });
      });

      it('should show validation error for invalid characters in full name', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const fullNameInput = screen.getByLabelText(/Full Name/i);
        await user.type(fullNameInput, 'John123');
        await user.tab();

        await waitFor(() => {
          expect(screen.getByText(/Full name can only contain letters, spaces, apostrophes, and hyphens/i)).toBeInTheDocument();
        });
      });

      it('should accept valid full name with apostrophe', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const fullNameInput = screen.getByLabelText(/Full Name/i);
        await user.type(fullNameInput, "John O'Connor");
        await user.tab();

        await waitFor(() => {
          expect(screen.queryByText(/Full name can only contain letters/i)).not.toBeInTheDocument();
        });
      });

      it('should accept valid full name with hyphen', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const fullNameInput = screen.getByLabelText(/Full Name/i);
        await user.type(fullNameInput, 'Mary-Jane Smith');
        await user.tab();

        await waitFor(() => {
          expect(screen.queryByText(/Full name can only contain letters/i)).not.toBeInTheDocument();
        });
      });
    });

    describe('Username Validation', () => {
      it('should show validation error when username is empty', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const usernameInput = screen.getByLabelText(/Username/i);
        await user.click(usernameInput);
        await user.tab();

        await waitFor(() => {
          expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
        });
      });

      it('should show validation error when username is too short', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const usernameInput = screen.getByLabelText(/Username/i);
        await user.type(usernameInput, 'ab');
        await user.tab();

        await waitFor(() => {
          expect(screen.getByText(/Username must be at least 3 characters/i)).toBeInTheDocument();
        });
      });

      it('should show validation error for invalid characters in username', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const usernameInput = screen.getByLabelText(/Username/i);
        await user.type(usernameInput, 'user-name');
        await user.tab();

        await waitFor(() => {
          expect(screen.getByText(/Username can only contain letters, numbers, and underscores/i)).toBeInTheDocument();
        });
      });

      it('should accept valid username with underscores', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const usernameInput = screen.getByLabelText(/Username/i);
        await user.type(usernameInput, 'test_user_123');
        await user.tab();

        await waitFor(() => {
          expect(screen.queryByText(/Username can only contain letters/i)).not.toBeInTheDocument();
        });
      });
    });

    describe('Email Validation', () => {
      it('should show validation error when email is empty', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const emailInput = screen.getByLabelText(/Email/i);
        await user.click(emailInput);
        await user.tab();

        await waitFor(() => {
          expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
        });
      });

      it('should show validation error for invalid email format', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'invalid-email');
        await user.tab();

        await waitFor(() => {
          expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
        });
      });

      it('should accept valid email address', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'test@example.com');
        await user.tab();

        await waitFor(() => {
          expect(screen.queryByText(/Please enter a valid email address/i)).not.toBeInTheDocument();
        });
      });
    });

    describe('Password Validation', () => {
      it('should show validation error when password is empty', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const passwordInput = screen.getByLabelText(/^Password$/i);
        await user.click(passwordInput);
        await user.tab();

        await waitFor(() => {
          expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
        });
      });

      it('should show validation error when password is too short', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const passwordInput = screen.getByLabelText(/^Password$/i);
        await user.type(passwordInput, 'Pass1!');
        await user.tab();

        await waitFor(() => {
          expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
        });
      });

      it('should show validation error when password lacks letter', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const passwordInput = screen.getByLabelText(/^Password$/i);
        await user.type(passwordInput, '12345678!');
        await user.tab();

        await waitFor(() => {
          expect(screen.getByText(/Password must contain at least one letter, one number, and one special character/i)).toBeInTheDocument();
        });
      });

      it('should show validation error when password lacks number', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const passwordInput = screen.getByLabelText(/^Password$/i);
        await user.type(passwordInput, 'Password!');
        await user.tab();

        await waitFor(() => {
          expect(screen.getByText(/Password must contain at least one letter, one number, and one special character/i)).toBeInTheDocument();
        });
      });

      it('should show validation error when password lacks special character', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const passwordInput = screen.getByLabelText(/^Password$/i);
        await user.type(passwordInput, 'Password1');
        await user.tab();

        await waitFor(() => {
          expect(screen.getByText(/Password must contain at least one letter, one number, and one special character/i)).toBeInTheDocument();
        });
      });

      it('should accept valid password', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const passwordInput = screen.getByLabelText(/^Password$/i);
        await user.type(passwordInput, 'Password123!');
        await user.tab();

        await waitFor(() => {
          expect(screen.queryByText(/Password must contain at least one letter/i)).not.toBeInTheDocument();
        });
      });
    });

    describe('Confirm Password Validation', () => {
      it('should show validation error when confirm password is empty', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
        await user.click(confirmPasswordInput);
        await user.tab();

        await waitFor(() => {
          expect(screen.getByText(/Please confirm your password/i)).toBeInTheDocument();
        });
      });

      it('should show validation error when passwords do not match', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const passwordInput = screen.getByLabelText(/^Password$/i);
        const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

        await user.type(passwordInput, 'Password123!');
        await user.type(confirmPasswordInput, 'Different123!');
        await user.tab();

        await waitFor(() => {
          expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
        });
      });

      it('should accept matching passwords', async () => {
        const user = userEvent.setup();
        render(<SignupPage />);

        const passwordInput = screen.getByLabelText(/^Password$/i);
        const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

        await user.type(passwordInput, 'Password123!');
        await user.type(confirmPasswordInput, 'Password123!');
        await user.tab();

        await waitFor(() => {
          expect(screen.queryByText(/Passwords do not match/i)).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      mockRegisterUser.mockResolvedValue({ success: true, message: 'Account created successfully.' });

      render(<SignupPage />);

      const fullNameInput = screen.getByLabelText(/Full Name/i);
      const usernameInput = screen.getByLabelText(/Username/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      const submitButton = screen.getByRole('button', { name: /Create account/i });

      await user.type(fullNameInput, 'John Doe');
      await user.type(usernameInput, 'johndoe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.type(confirmPasswordInput, 'Password123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegisterUser).toHaveBeenCalledWith({
          fullName: 'John Doe',
          userName: 'johndoe',
          email: 'john@example.com',
          password: 'Password123!',
        });
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login');
      });
    });

    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup();
      let resolveRegister: (value: { success: boolean; message?: string }) => void;
      const registerPromise = new Promise<{ success: boolean; message?: string }>((resolve) => {
        resolveRegister = resolve;
      });
      mockRegisterUser.mockReturnValue(registerPromise);

      render(<SignupPage />);

      const fullNameInput = screen.getByLabelText(/Full Name/i);
      const usernameInput = screen.getByLabelText(/Username/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      const submitButton = screen.getByRole('button', { name: /Create account/i });

      await user.type(fullNameInput, 'John Doe');
      await user.type(usernameInput, 'johndoe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.type(confirmPasswordInput, 'Password123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/Creating account.../i)).toBeInTheDocument();
      });

      resolveRegister!({ success: true });
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should disable inputs while submitting', async () => {
      const user = userEvent.setup();
      let resolveRegister: (value: { success: boolean; message?: string }) => void;
      const registerPromise = new Promise<{ success: boolean; message?: string }>((resolve) => {
        resolveRegister = resolve;
      });
      mockRegisterUser.mockReturnValue(registerPromise);

      render(<SignupPage />);

      const fullNameInput = screen.getByLabelText(/Full Name/i);
      const usernameInput = screen.getByLabelText(/Username/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      const submitButton = screen.getByRole('button', { name: /Create account/i });

      await user.type(fullNameInput, 'John Doe');
      await user.type(usernameInput, 'johndoe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.type(confirmPasswordInput, 'Password123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(fullNameInput).toBeDisabled();
        expect(usernameInput).toBeDisabled();
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(confirmPasswordInput).toBeDisabled();
      });

      resolveRegister!({ success: true });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when registration fails', async () => {
      const user = userEvent.setup();
      mockRegisterUser.mockResolvedValue({
        success: false,
        message: 'Email already exists',
      });

      render(<SignupPage />);

      const fullNameInput = screen.getByLabelText(/Full Name/i);
      const usernameInput = screen.getByLabelText(/Username/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      const submitButton = screen.getByRole('button', { name: /Create account/i });

      await user.type(fullNameInput, 'John Doe');
      await user.type(usernameInput, 'johndoe');
      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.type(confirmPasswordInput, 'Password123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });
    });

    it('should display default error message when no message is provided', async () => {
      const user = userEvent.setup();
      mockRegisterUser.mockResolvedValue({
        success: false,
      });

      render(<SignupPage />);

      const fullNameInput = screen.getByLabelText(/Full Name/i);
      const usernameInput = screen.getByLabelText(/Username/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      const submitButton = screen.getByRole('button', { name: /Create account/i });

      await user.type(fullNameInput, 'John Doe');
      await user.type(usernameInput, 'johndoe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.type(confirmPasswordInput, 'Password123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create account')).toBeInTheDocument();
      });
    });

    it('should display error message when registration throws an exception', async () => {
      const user = userEvent.setup();
      mockRegisterUser.mockRejectedValue(new Error('Network error'));

      render(<SignupPage />);

      const fullNameInput = screen.getByLabelText(/Full Name/i);
      const usernameInput = screen.getByLabelText(/Username/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      const submitButton = screen.getByRole('button', { name: /Create account/i });

      await user.type(fullNameInput, 'John Doe');
      await user.type(usernameInput, 'johndoe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.type(confirmPasswordInput, 'Password123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
      });
    });

    it('should clear error message on new submission attempt', async () => {
      const user = userEvent.setup();
      mockRegisterUser
        .mockResolvedValueOnce({
          success: false,
          message: 'First error',
        })
        .mockResolvedValueOnce({
          success: false,
          message: 'Second error',
        });

      render(<SignupPage />);

      const fullNameInput = screen.getByLabelText(/Full Name/i);
      const usernameInput = screen.getByLabelText(/Username/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      const submitButton = screen.getByRole('button', { name: /Create account/i });

      await user.type(fullNameInput, 'John Doe');
      await user.type(usernameInput, 'johndoe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.type(confirmPasswordInput, 'Password123!');
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
    it('should redirect to login page on successful registration', async () => {
      const user = userEvent.setup();
      mockRegisterUser.mockResolvedValue({ success: true });

      render(<SignupPage />);

      const fullNameInput = screen.getByLabelText(/Full Name/i);
      const usernameInput = screen.getByLabelText(/Username/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      const submitButton = screen.getByRole('button', { name: /Create account/i });

      await user.type(fullNameInput, 'John Doe');
      await user.type(usernameInput, 'johndoe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.type(confirmPasswordInput, 'Password123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login');
      });
    });

    it('should have link to login page', () => {
      render(<SignupPage />);

      const loginLink = screen.getByRole('link', { name: /Sign in/i });
      expect(loginLink).toHaveAttribute('href', '/auth/login');
    });
  });
});

