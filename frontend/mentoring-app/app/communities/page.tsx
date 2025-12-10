"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, UserPlus, UserMinus } from "lucide-react";
import Link from "next/link";
import { type Community } from "@/lib/mock-data";
import {
  getAllCommunities,
  joinCommunity,
  leaveCommunity,
} from "@/lib/communities-service";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CommunitiesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Only fetch if authenticated
    if (!isAuthenticated) {
      return;
    }

    const fetchCommunities = async () => {
      try {
        const data = await getAllCommunities();
        setCommunities(data);
      } catch (err) {
        setError("Failed to load communities. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunities();
  }, [isAuthenticated, authLoading, router]);

  const handleToggleMembership = async (communityId: string) => {
    const community = communities.find((c) => c.id === communityId);
    if (!community) return;

    const wasJoined = community.isJoined;

    // Optimistically update UI
    setCommunities(
      communities.map((c) =>
        c.id === communityId
          ? {
              ...c,
              isJoined: !wasJoined,
              memberCount: wasJoined
                ? Math.max(0, c.memberCount - 1)
                : c.memberCount + 1,
            }
          : c
      )
    );

    try {
      // Call the API
      if (wasJoined) {
        await leaveCommunity(communityId);
      } else {
        await joinCommunity(communityId);
      }
    } catch (err) {
      // Revert on error
      setCommunities(
        communities.map((c) =>
          c.id === communityId
            ? {
                ...c,
                isJoined: wasJoined,
                memberCount: wasJoined
                  ? c.memberCount + 1
                  : Math.max(0, c.memberCount - 1),
              }
            : c
        )
      );
      console.error("Failed to toggle membership:", err);
      setError("Failed to update membership. Please try again.");
    }
  };

  // Show loading while checking auth or fetching data
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading communities...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Communities</h1>
        <p className="text-muted-foreground">
          Discover and join communities to connect with mentors and peers
        </p>
      </div>

      <div className="space-y-4">
        {communities.map((community) => (
          <Card
            key={community.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl">{community.name}</CardTitle>
                    {community.isJoined && (
                      <Badge variant="secondary">Joined</Badge>
                    )}
                  </div>
                  <CardDescription>{community.description}</CardDescription>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                    <Users className="h-4 w-4" />
                    <span>
                      {community.memberCount.toLocaleString()} members
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => handleToggleMembership(community.id)}
                  variant={community.isJoined ? "outline" : "default"}
                  size="sm"
                >
                  {community.isJoined ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Leave
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={`/communities/${community.id}`}>
                <Button variant="outline" className="w-full">
                  Explore Community
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
        {communities.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            No communities found.
          </div>
        )}
      </div>
    </div>
  );
}
