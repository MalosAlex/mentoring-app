"use client";

import { BookOpen, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { usePosts } from "@/contexts/posts-context";
import { formatTimestamp } from "@/lib/helper";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Community } from "@/lib/types";
import { getAllCommunities } from "@/lib/communities-service";

export default function MyPostsPage() {
  const { userPosts } = usePosts();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);

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
        const data = await getAllCommunities();
        setCommunities(data);
      };
  
      fetchCommunities();
    }, [isAuthenticated, authLoading, router]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">My Posts</h1>
      
      {userPosts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Your posts will appear here. Start by joining communities and sharing your thoughts!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {userPosts.map((post) => {
            const community = communities.find(c => c.id === post.communityId);
            return (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {post.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{post.author.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTimestamp(post.timestamp)}
                        </p>
                      </div>
                    </div>
                    {community && (
                      <Badge variant="secondary">{community.name}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-base mb-4 whitespace-pre-wrap">{post.content}</p>
                  
                  {post.image && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
                      <Image
                        src={post.image}
                        alt="Post image"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="flex items-center gap-6">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2"
                      asChild
                    >
                      <Link href={`/communities/${post.communityId}/posts/${post.id}`}>
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

