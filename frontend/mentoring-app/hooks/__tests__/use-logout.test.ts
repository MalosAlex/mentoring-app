/**
 * Tests for useLogout Hook
 * 
 * Tests logout functionality and redirect behavior
 */

import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useLogout } from '../use-logout';
import { useAuth } from '@/contexts/auth-context';

// Mock dependencies
jest.mock('@/contexts/auth-context');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockContextLogout = jest.fn();

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useAuth as jest.Mock).mockReturnValue({
      logout: mockContextLogout,
    });
  });

  describe('Logout Functionality', () => {
    it('should call context logout and redirect to default path', async () => {
      mockContextLogout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLogout());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockContextLogout).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });

    it('should call context logout and redirect to custom path', async () => {
      mockContextLogout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLogout());

      await act(async () => {
        await result.current.logout('/home');
      });

      expect(mockContextLogout).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/home');
    });

    it('should handle logout errors gracefully', async () => {
      mockContextLogout.mockRejectedValue(new Error('Logout failed'));

      const { result } = renderHook(() => useLogout());

      await act(async () => {
        try {
          await result.current.logout();
        } catch (error) {
          // Error is expected
        }
      });

      expect(mockContextLogout).toHaveBeenCalledTimes(1);
      // Should still attempt redirect even if logout fails
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });

    it('should use memoized logout function', () => {
      const { result, rerender } = renderHook(() => useLogout());

      const firstLogout = result.current.logout;

      rerender();

      const secondLogout = result.current.logout;

      // Function should be memoized (same reference)
      expect(firstLogout).toBe(secondLogout);
    });

    it('should redirect to different paths on multiple calls', async () => {
      mockContextLogout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLogout());

      await act(async () => {
        await result.current.logout('/home');
      });

      await act(async () => {
        await result.current.logout('/dashboard');
      });

      expect(mockPush).toHaveBeenCalledWith('/home');
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
      expect(mockPush).toHaveBeenCalledTimes(2);
    });
  });
});

