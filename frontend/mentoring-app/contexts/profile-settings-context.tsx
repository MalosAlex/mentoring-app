"use client";

/**
 * Profile Settings Context
 * 
 * This context manages user preferences for what is displayed on the profile page.
 * Settings are persisted to localStorage so they survive page refreshes.
 * 
 * Usage:
 * - Wrap your app with <ProfileSettingsProvider>
 * - Use the useProfileSettings() hook to access settings and updateSettings
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

/**
 * ProfileSettings type - defines the available profile visibility settings
 * @property showStats - Whether to show the stats cards (posts, communities, reactions, comments)
 * @property showActivity - Whether to show the activity sections (communities joined, recent posts)
 */
type ProfileSettings = {
  showStats: boolean;
  showActivity: boolean;
};

/**
 * Context type that exposes settings and the update function
 */
type ProfileSettingsContextType = {
  settings: ProfileSettings;
  updateSettings: (settings: Partial<ProfileSettings>) => void;
};

// Key used to store settings in localStorage
const STORAGE_KEY = "profile_settings";

// Default settings - all sections visible by default
const defaultSettings: ProfileSettings = {
  showStats: true,
  showActivity: true,
};

const ProfileSettingsContext = createContext<ProfileSettingsContextType | undefined>(undefined);

/**
 * ProfileSettingsProvider Component
 * 
 * Provides profile settings context to child components.
 * Handles loading from and saving to localStorage.
 */
export function ProfileSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ProfileSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // Merge stored settings with defaults to handle new settings added in future
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch {
      // Ignore errors (e.g., localStorage not available)
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage whenever they change (after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  /**
   * Update one or more settings
   * @param newSettings - Partial settings object with values to update
   */
  const updateSettings = (newSettings: Partial<ProfileSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <ProfileSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ProfileSettingsContext.Provider>
  );
}

/**
 * Hook to access profile settings
 * @returns Object containing settings and updateSettings function
 * @throws Error if used outside of ProfileSettingsProvider
 */
export function useProfileSettings() {
  const context = useContext(ProfileSettingsContext);
  if (context === undefined) {
    throw new Error("useProfileSettings must be used within a ProfileSettingsProvider");
  }
  return context;
}
