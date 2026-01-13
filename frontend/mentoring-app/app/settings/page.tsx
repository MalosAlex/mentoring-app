"use client";

/**
 * Settings Page
 * 
 * Allows users to configure their profile visibility preferences.
 * Settings are persisted via the ProfileSettingsContext (stored in localStorage).
 * 
 * Available settings:
 * - Show Stats Cards: Toggle visibility of posts/communities/reactions/comments counts
 * - Show Activity Sections: Toggle visibility of communities joined and recent posts
 */

import { BarChart3, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useProfileSettings } from "@/contexts/profile-settings-context";

export default function SettingsPage() {
  // Get current settings and update function from context
  const { settings, updateSettings } = useProfileSettings();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        {/* Profile Visibility Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Visibility</CardTitle>
            <CardDescription>Control what information is displayed on your profile page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Toggle: Show Stats Cards */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Icon with colored background */}
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <Label htmlFor="show-stats" className="text-base font-medium">
                    Show Stats Cards
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display posts, communities, reactions, and comments counts
                  </p>
                </div>
              </div>
              {/* Switch toggles the showStats setting */}
              <Switch
                id="show-stats"
                checked={settings.showStats}
                onCheckedChange={(checked) => updateSettings({ showStats: checked })}
              />
            </div>

            {/* Toggle: Show Activity Sections */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Icon with colored background */}
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <Label htmlFor="show-activity" className="text-base font-medium">
                    Show Activity Sections
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display communities joined and recent posts
                  </p>
                </div>
              </div>
              {/* Switch toggles the showActivity setting */}
              <Switch
                id="show-activity"
                checked={settings.showActivity}
                onCheckedChange={(checked) => updateSettings({ showActivity: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
