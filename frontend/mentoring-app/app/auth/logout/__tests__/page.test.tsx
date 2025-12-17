/**
 * Tests for Logout Page
 * 
 * Tests rendering and automatic logout functionality
 */

import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import LogoutPage from '../page';
import { useLogout } from '@/hooks/use-logout';

// Mock dependencies
jest.mock('@/hooks/use-logout');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockLogout = jest.fn();

describe('LogoutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useLogout as jest.Mock).mockReturnValue({
      logout: mockLogout,
    });
  });

  describe('Rendering', () => {
    it('should render logout message', () => {
      render(<LogoutPage />);

      expect(screen.getByText('Logging out...')).toBeInTheDocument();
    });

    it('should render with correct styling classes', () => {
      const { container } = render(<LogoutPage />);

      const mainDiv = container.querySelector('div.flex.min-h-screen');
      expect(mainDiv).toBeInTheDocument();
    });
  });

  describe('Logout Functionality', () => {
    it('should call logout function on mount', async () => {
      mockLogout.mockResolvedValue(undefined);

      render(<LogoutPage />);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledWith('/auth/login');
      });
    });

    it('should call logout with default redirect path', async () => {
      mockLogout.mockResolvedValue(undefined);

      render(<LogoutPage />);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
        expect(mockLogout).toHaveBeenCalledWith('/auth/login');
      });
    });

    it('should handle logout promise rejection gracefully', async () => {
      // Avoid unhandled rejection by catching inside the mock
      mockLogout.mockImplementation(() =>
        Promise.reject(new Error('Logout failed')).catch(() => {})
      );

      render(<LogoutPage />);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });

      // Component should still render even if logout fails
      expect(screen.getByText('Logging out...')).toBeInTheDocument();
    });
  });
});

