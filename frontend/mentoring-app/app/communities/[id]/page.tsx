"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, MessageCircle, ImagePlus, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Community, type Post } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CreatePostButton } from "@/components/create-post-button";
import { usePosts } from "@/contexts/posts-context";
import { getPosts, type PostResponse } from "@/lib/posts-service";
import { getAllCommunities } from "@/lib/communities-service";
import { useAuth } from "@/contexts/auth-context";
import { formatTimestamp, mapPostResponseToPost } from "@/lib/helper";

export default function CommunityFeedPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;
  const { addPost } = usePosts();
  const [communities, setCommunities] = useState<Community[]>([]);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const community = communities.find(c => c.id === communityId);
  const [posts, setPosts] = useState<Post[]>([]);
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

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      if (!communityId) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const numericCommunityId = parseInt(communityId, 10);
        if (isNaN(numericCommunityId)) {
          setError("Invalid community ID");
          setIsLoading(false);
          return;
        }

        const result = await getPosts(numericCommunityId, 1, 20);
        
        if (!result.success) {
          // Check if it's an authentication error
          if (result.message?.includes("logged in") || result.message?.includes("session has expired")) {
            setError(result.message + " Redirecting to login...");
            // Redirect to login after a short delay
            setTimeout(() => {
              window.location.href = "/auth/login";
            }, 2000);
          } else {
            setError(result.message || "Failed to load posts");
          }
          setIsLoading(false);
          return;
        }

        if (result.data) {
          const mappedPosts = result.data.posts.map(mapPostResponseToPost);
          setPosts(mappedPosts);
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Error fetching posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [communityId]);

  const handleToggleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleCreatePost = (postResponse: PostResponse) => {
    const newPost = mapPostResponseToPost(postResponse);
    setPosts([newPost, ...posts]);
    addPost(newPost); // Add to global user posts
  };

  if (!community) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Community not found</h1>
          <Link href="/communities">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Communities
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-16">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const numericCommunityId = parseInt(communityId, 10);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Create Post Button */}
      {!isNaN(numericCommunityId) && (
        <CreatePostButton 
          communityId={numericCommunityId}
          communityName={community.name}
          onCreatePost={handleCreatePost}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <Link href="/communities">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Communities
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">{community.name}</h1>
        <p className="text-muted-foreground">{community.description}</p>
      </div>

      <Separator className="mb-6" />

      {/* Empty State */}
      {posts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <ImagePlus className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Be the first to post in this community and start the conversation!
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Posts Feed */
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleToggleLike(post.id)}
                  >
                    <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{post.likes}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    asChild
                  >
                    <Link href={`/communities/${communityId}/posts/${post.id}`}>
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

