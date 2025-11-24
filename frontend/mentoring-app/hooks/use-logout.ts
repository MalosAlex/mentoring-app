"use client";

/**
 * Logout Hook
 * 
 * Custom React hook that provides logout functionality with automatic redirect.
 * Can be used in any component to log out the current user and navigate to a
 * specified page (defaults to login page).
 * 
 * @module hooks/use-logout
 */

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { logout as performLogout } from "@/lib/auth-service";

/**
 * useLogout Hook
 * 
 * Returns a logout function that clears the authentication token and redirects
 * the user to a specified route.
 * 
 * @returns {Object} Object containing the logout function
 * @returns {Function} logout - Function to log out and redirect
 * 
 * @example
 * ```tsx
 * const { logout } = useLogout();
 * 
 * // Logout and redirect to default login page
 * <Button onClick={() => logout()}>Logout</Button>
 * 
 * // Logout and redirect to custom page
 * <Button onClick={() => logout("/home")}>Logout</Button>
 * ```
 */
export function useLogout() {
  const router = useRouter();

  /**
   * Logs out the current user and redirects to specified page
   * 
   * Clears the authentication token from localStorage and navigates to the
   * specified route. If no route is provided, defaults to "/auth/login".
   * 
   * @param {string} redirectTo - Path to redirect to after logout (default: "/auth/login")
   */
  const logout = useCallback(
    async (redirectTo: string = "/auth/login") => {
      await performLogout();
      router.push(redirectTo);
    },
    [router]
  );

  return { logout };
}

