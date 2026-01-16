"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Heart, MessageCircle, ImagePlus, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { formatTimestamp, mapPostResponseToPost } from "@/lib/helper";
import { Post, Community } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CreatePostButton } from "@/components/create-post-button";
import { PostMedia } from "@/components/post-media";
import { usePosts } from "@/contexts/posts-context";
import { getPosts, reactToPost, type PostResponse } from "@/lib/posts-service";
import { getCommunityById, joinCommunity } from "@/lib/communities-service";

export default function CommunityFeedPage() {
  const params = useParams();
  const communityId = params.id as string;
  const { addPost } = usePosts();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Fetch posts and community from API
  useEffect(() => {
    const fetchData = async () => {
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

        // Fetch community details
        const communityData = await getCommunityById(communityId);
        if (communityData) {
          setCommunity(communityData);
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
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [communityId]);

  const handleToggleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post || !communityId) return;

    const numericCommunityId = parseInt(communityId, 10);
    const numericPostId = parseInt(postId, 10);
    
    // Optimistically update
    const wasLiked = post.isLiked;
    setPosts(posts.map(p => 
      p.id === postId 
        ? { 
            ...p, 
            isLiked: !wasLiked,
            likes: wasLiked ? p.likes - 1 : p.likes + 1
          }
        : p
    ));

    try {
      const result = await reactToPost(numericCommunityId, numericPostId, "like");
      if (result.success && result.data) {
        // Update with actual count and liked state from server
        setPosts(posts.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                likes: result.data!.totalReactions,
                isLiked: result.data!.isLiked
              }
            : p
        ));
      }
    } catch (err) {
      // Revert on error
      setPosts(posts.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              isLiked: wasLiked,
              likes: wasLiked ? p.likes + 1 : p.likes - 1
            }
          : p
      ));
    }
  };

  const handleJoinCommunity = async () => {
    if (!communityId || isJoining) return;
    setIsJoining(true);
    try {
      await joinCommunity(communityId);
      setCommunity(prev => prev ? { ...prev, isJoined: true } : null);
    } catch (err) {
      console.error("Failed to join:", err);
    } finally {
      setIsJoining(false);
    }
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
      {/* Create Post Button - Only show if joined */}
      {!isNaN(numericCommunityId) && community?.isJoined && (
        <CreatePostButton 
          communityId={numericCommunityId}
          communityName={community.name}
          onCreatePost={handleCreatePost}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <Link href="/communities">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Communities
            </Button>
          </Link>
          
          {!community?.isJoined && (
            <Button onClick={handleJoinCommunity} disabled={isJoining}>
              {isJoining ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Join Community to Post
            </Button>
          )}
        </div>
        <h1 className="text-4xl font-bold mb-2">{community?.name}</h1>
        <p className="text-muted-foreground">{community?.description}</p>
      </div>

      <Separator className="mb-6" />

      {/* Membership Warning for posting */}
      {!community?.isJoined && (
        <div className="bg-muted/50 border rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-muted-foreground">
            You are viewing this community as a guest. 
            <button 
              onClick={handleJoinCommunity}
              className="text-primary font-semibold ml-1 hover:underline"
            >
              Join now
            </button> to share your thoughts!
          </p>
        </div>
      )}

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
                    <PostMedia src={post.image} alt="Post media" />
                  </div>
                )}

                <Separator className="my-4" />

                <div className="flex items-center gap-6">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 cursor-pointer"
                    onClick={() => handleToggleLike(post.id)}
                    disabled={!community?.isJoined}
                  >
                    <Heart 
                      className={`h-4 w-4 ${post.isLiked ? 'text-red-500' : ''}`} 
                      fill={post.isLiked ? "currentColor" : "none"}
                    />
                    <span>{post.likes}</span>
                  </Button>
                  {community?.isJoined ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 cursor-pointer"
                      asChild
                    >
                      <Link href={`/communities/${communityId}/posts/${post.id}`}>
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 cursor-default"
                      disabled
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}