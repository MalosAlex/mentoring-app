"use client";

import { useState } from "react";
import { Users, UserPlus, UserMinus } from "lucide-react";
import Link from "next/link";
import { mockCommunities, type Community } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>(mockCommunities);
  const [isLoading] = useState(false);

  const handleToggleMembership = (communityId: string) => {
    setCommunities(communities.map(community => 
      community.id === communityId 
        ? { ...community, isJoined: !community.isJoined }
        : community
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading communities...</p>
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
          <Card key={community.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl">
                      {community.name}
                    </CardTitle>
                    {community.isJoined && (
                      <Badge variant="secondary">Joined</Badge>
                    )}
                  </div>
                  <CardDescription>
                    {community.description}
                  </CardDescription>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                    <Users className="h-4 w-4" />
                    <span>{community.memberCount.toLocaleString()} members</span>
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
      </div>
    </div>
  );
}

