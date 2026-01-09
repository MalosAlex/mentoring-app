"use client"

/**
 * Profile Page
 * 
 * Displays the current user's profile information including:
 * - Profile header with avatar, name, and email
 * - Stats cards showing posts count, communities joined, reactions received, and comments
 * - List of communities the user has joined
 * - Recent posts by the user
 * 
 * Data is fetched from backend APIs:
 * - GET /api/users/{userId}/posts - User's posts
 * - GET /api/Communities - All communities (filtered by isJoined)
 * 
 * Sections can be hidden via settings (controlled in /settings page)
 */

import { useEffect, useState } from "react";
import { Mail, FileText, Users, MessageSquare, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useProfileSettings } from "@/contexts/profile-settings-context";
import { getInitials } from "@/lib/helper";
import { getPostsForUser, PostResponse } from "@/lib/posts-service";
import { getAllCommunities } from "@/lib/communities-service";
import { Community } from "@/lib/types";
import Link from "next/link";

/**
 * Formats a date string into a human-readable relative format
 * @param dateString - ISO date string
 * @returns Relative time string (e.g., "Today", "Yesterday", "3 days ago")
 */
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export default function ProfilePage() {
  // Get current authenticated user
  const { user } = useAuth();
  // Get profile visibility settings (controlled via Settings page)
  const { settings } = useProfileSettings();
  
  // State for user's posts and communities
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's posts and communities on mount or when user changes
  useEffect(() => {
    async function loadData() {
      // If no user is logged in, just set loading to false
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch posts and communities in parallel for better performance
        const [postsResult, communitiesData] = await Promise.all([
          getPostsForUser(user.id),
          getAllCommunities().catch(() => [] as Community[]),
        ]);

        // Update posts if fetch was successful
        if (postsResult.success && postsResult.data) {
          setPosts(postsResult.data.posts);
        }

        // Filter to only show communities the user has joined
        const joinedCommunities = communitiesData.filter(c => c.isJoined);
        setCommunities(joinedCommunities);
      } catch {
        // Keep empty arrays on error - will show "No posts/communities" messages
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user?.id]);

  // Calculate total reactions across all posts
  const totalReactions = posts.reduce((sum, post) => sum + post.reactionCount, 0);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Profile</h1>
      
      {/* Profile Header Card - Always visible */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            {/* User avatar with initials */}
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">{getInitials(user?.fullName || "")}</AvatarFallback>
            </Avatar>
            {/* User name and email - min-w-0 allows text truncation */}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-2xl">{user?.fullName}</CardTitle>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                {/* truncate class handles long emails */}
                <span className="truncate">{user?.email}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards - Conditionally rendered based on settings.showStats */}
      {settings.showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Posts Count Card */}
          <Card>
            <CardContent className="flex items-center justify-center min-h-[80px] p-4">
              <div className="flex items-center justify-center gap-5">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{posts.length}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communities Count Card */}
          <Card>
            <CardContent className="flex items-center justify-center min-h-[80px] p-4">
              <div className="flex items-center justify-center gap-5">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{communities.length}</p>
                  <p className="text-sm text-muted-foreground">Communities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reactions Count Card */}
          <Card>
            <CardContent className="flex items-center justify-center min-h-[80px] p-4">
              <div className="flex items-center justify-center gap-5">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalReactions}</p>
                  <p className="text-sm text-muted-foreground">Reactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Count Card */}
          <Card>
            <CardContent className="flex items-center justify-center min-h-[80px] p-4">
              <div className="flex items-center justify-center gap-5">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{posts.reduce((sum, p) => sum + p.comments.length, 0)}</p>
                  <p className="text-sm text-muted-foreground">Comments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Sections - Conditionally rendered based on settings.showActivity */}
      {settings.showActivity && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Communities Joined Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Communities Joined
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : communities.length === 0 ? (
                <p className="text-muted-foreground">No communities joined yet.</p>
              ) : (
                <div className="space-y-3">
                  {/* Show up to 5 communities */}
                  {communities.slice(0, 5).map((community) => (
                    <Link 
                      key={community.id} 
                      href={`/communities/${community.id}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{community.name}</p>
                        <p className="text-sm text-muted-foreground">{community.memberCount} members</p>
                      </div>
                    </Link>
                  ))}
                  {/* Show "View all" link if more than 5 communities */}
                  {communities.length > 5 && (
                    <Link href="/communities" className="text-sm text-primary hover:underline block text-center pt-2">
                      View all {communities.length} communities
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Posts Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : posts.length === 0 ? (
                <p className="text-muted-foreground">No posts yet.</p>
              ) : (
                <div className="space-y-3">
                  {/* Show up to 5 recent posts */}
                  {posts.slice(0, 5).map((post) => (
                    <div key={post.id} className="p-2 rounded-lg hover:bg-muted transition-colors">
                      {/* line-clamp-2 limits text to 2 lines */}
                      <p className="text-sm line-clamp-2">{post.caption}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{formatRelativeDate(post.createdAt)}</span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {post.reactionCount}
                        </span>
                      </div>
                    </div>
                  ))}
                  {/* Show "View all" link if more than 5 posts */}
                  {posts.length > 5 && (
                    <Link href="/my-posts" className="text-sm text-primary hover:underline block text-center pt-2">
                      View all {posts.length} posts
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
