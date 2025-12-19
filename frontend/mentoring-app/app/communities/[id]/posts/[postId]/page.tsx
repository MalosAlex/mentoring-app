"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Heart, MessageCircle, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { 
  mockCommunities, 
  formatTimestamp,
  type Comment,
  type Post
} from "@/lib/mock-data";
import { 
  getPostById as getPostByIdFromAPI,
  reactToPost,
  commentOnPost,
  type PostResponse,
  type PostCommentResponse
} from "@/lib/posts-service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CommentItem } from "@/components/comment-item";

// Convert API PostResponse to frontend Post type
const mapPostResponseToPost = (postResponse: PostResponse, communityId: number): Post => {
  const imageUrl = postResponse.mediaUrl 
    ? `http://localhost:5216${postResponse.mediaUrl}` 
    : undefined;
  
  return {
    id: postResponse.id.toString(),
    communityId: postResponse.communityId.toString(),
    author: {
      name: postResponse.authorName,
    },
    content: postResponse.caption,
    image: imageUrl,
    timestamp: new Date(postResponse.createdAt),
    likes: postResponse.reactionCount,
    isLiked: false, // Backend doesn't return this, would need separate check
    comments: postResponse.comments.length,
  };
};

// Convert API PostCommentResponse to frontend Comment type
const mapCommentResponseToComment = (commentResponse: PostCommentResponse): Comment => {
  return {
    id: commentResponse.id.toString(),
    postId: commentResponse.postId.toString(),
    author: {
      name: commentResponse.authorName,
    },
    content: commentResponse.content,
    timestamp: new Date(commentResponse.createdAt),
    likes: 0, // Backend doesn't support comment reactions
    replies: [], // Backend doesn't support nested replies
  };
};

export default function PostDetailPage() {
  const params = useParams();
  const communityId = params.id as string;
  const postId = params.postId as string;
  
  const community = mockCommunities.find(c => c.id === communityId);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReacting, setIsReacting] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  // Fetch post and comments from API
  useEffect(() => {
    const fetchPost = async () => {
      if (!communityId || !postId) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const numericCommunityId = parseInt(communityId, 10);
        const numericPostId = parseInt(postId, 10);
        
        if (isNaN(numericCommunityId) || isNaN(numericPostId)) {
          setError("Invalid community or post ID");
          setIsLoading(false);
          return;
        }

        const result = await getPostByIdFromAPI(numericCommunityId, numericPostId);
        
        if (!result.success || !result.data) {
          setError(result.message || "Failed to load post");
          setIsLoading(false);
          return;
        }

        const mappedPost = mapPostResponseToPost(result.data, numericCommunityId);
        setPost(mappedPost);
        setLikes(mappedPost.likes);
        
        // Convert comments from API
        const mappedComments = result.data.comments.map(mapCommentResponseToComment);
        setComments(mappedComments);
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Error fetching post:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [communityId, postId]);

  const handleToggleLike = async () => {
    if (!post || !communityId || !postId || isReacting) return;

    setIsReacting(true);
    try {
      const numericCommunityId = parseInt(communityId, 10);
      const numericPostId = parseInt(postId, 10);
      
      const result = await reactToPost(numericCommunityId, numericPostId, "like");
      
      if (result.success && result.data) {
        setIsLiked(!isLiked);
        setLikes(result.data.totalReactions);
      } else {
        console.error("Failed to react to post:", result.message);
        // Still update UI optimistically, but show error
        alert(result.message || "Failed to react to post");
      }
    } catch (err) {
      console.error("Error reacting to post:", err);
      alert("Failed to react to post. Please try again.");
    } finally {
      setIsReacting(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !post || !communityId || !postId || isCommenting) return;

    setIsCommenting(true);
    try {
      const numericCommunityId = parseInt(communityId, 10);
      const numericPostId = parseInt(postId, 10);
      
      const result = await commentOnPost(numericCommunityId, numericPostId, commentText);
      
      if (result.success && result.data) {
        const newComment = mapCommentResponseToComment(result.data);
        setComments([newComment, ...comments]);
        setCommentText("");
      } else {
        console.error("Failed to add comment:", result.message);
        alert(result.message || "Failed to add comment");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add comment. Please try again.");
    } finally {
      setIsCommenting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !post || !community) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{error || "Post not found"}</h1>
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Back Button */}
      <Link href={`/communities/${communityId}`}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {community.name}
        </Button>
      </Link>

      {/* Post Card */}
      <Card className="mb-6">
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
              />
            </div>
          )}

          <Separator className="my-4" />

          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={handleToggleLike}
              disabled={isReacting}
            >
              {isReacting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              )}
              <span>{likes}</span>
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comment Form */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || isCommenting}
                >
                  {isCommenting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">
          Comments ({comments.length})
        </h2>
        
        {comments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-center">
                No comments yet. Be the first to comment!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

