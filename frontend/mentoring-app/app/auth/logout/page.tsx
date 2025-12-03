"use client";

/**
 * Logout Page Component
 * 
 * This page automatically logs out the user by clearing the authentication token
 * and redirecting to the login page. Displays a brief "Logging out..." message
 * during the process.
 * 
 * @module app/auth/logout/page
 */

import { useEffect } from "react";
import { useLogout } from "@/hooks/use-logout";

/**
 * LogoutPage Component
 * 
 * Automatically executes logout on component mount and redirects to login page.
 * 
 * @returns {JSX.Element} The logout page UI with loading message
 */
export default function LogoutPage() {
  const { logout } = useLogout();

  /**
   * Effect hook that runs on component mount
   * 
   * Automatically calls logout function which clears the token and redirects
   * to the login page.
   */
  useEffect(() => {
    // Clear token and redirect to login
    void logout("/auth/login");
  }, [logout]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground">Logging out...</p>
      </div>
    </div>
  );
}

