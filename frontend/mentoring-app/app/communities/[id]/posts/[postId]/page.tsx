"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Heart, MessageCircle, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatTimestamp, mapPostResponseToPost } from "@/lib/helper";
import { Comment, Post, Community } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CommentItem } from "@/components/comment-item";
import { PostMedia } from "@/components/post-media";
import {
  getPostById,
  reactToPost,
  createComment,
  type PostResponse,
  type PostCommentResponse,
} from "@/lib/posts-service";
import { getCommunityById } from "@/lib/communities-service";
import { useAuth } from "@/contexts/auth-context";

export default function PostDetailPage() {
  const params = useParams();
  const communityId = params.id as string;
  const postId = params.postId as string;
  const { user } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Convert backend PostCommentResponse to frontend Comment type
  const mapCommentResponseToComment = (c: PostCommentResponse): Comment => ({
    id: c.id.toString(),
    postId: c.postId.toString(),
    author: {
      name: c.authorName,
    },
    content: c.content,
    timestamp: new Date(c.createdAt),
    likes: c.reactionCount,
    isLiked: c.isLiked,
    replies: c.replies?.map(mapCommentResponseToComment) || [],
  });

  const fetchData = async () => {
    if (!communityId || !postId) return;

    setIsLoading(true);
    setError(null);

    try {
      const numericCommunityId = parseInt(communityId, 10);
      const numericPostId = parseInt(postId, 10);

      // Fetch community and post data
      const [communityData, postResult] = await Promise.all([
        getCommunityById(communityId),
        getPostById(numericCommunityId, numericPostId),
      ]);

      if (communityData) {
        setCommunity(communityData);
      }

      if (postResult.success && postResult.data) {
        const mappedPost = mapPostResponseToPost(postResult.data);
        setPost(mappedPost);
        setIsLiked(mappedPost.isLiked || false);
        setLikes(mappedPost.likes || 0);

        const mappedComments = postResult.data.comments.map(
          mapCommentResponseToComment
        );
        setComments(mappedComments);
      } else {
        setError(postResult.message || "Failed to load post");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [communityId, postId]);

  const handleToggleLike = async () => {
    if (!post || !communityId || !community?.isJoined) return;

    const numericCommunityId = parseInt(communityId, 10);
    const numericPostId = parseInt(postId, 10);

    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikes(wasLiked ? likes - 1 : likes + 1);

    try {
      const result = await reactToPost(
        numericCommunityId,
        numericPostId,
        "like"
      );
      if (result.success && result.data) {
        setIsLiked(result.data.isLiked);
        setLikes(result.data.totalReactions);
      }
    } catch (err) {
      setIsLiked(wasLiked);
      setLikes(wasLiked ? likes + 1 : likes - 1);
    }
  };

  const handleAddComment = async () => {
    if (
      !commentText.trim() ||
      !communityId ||
      !postId ||
      isSubmittingComment ||
      !community?.isJoined
    )
      return;

    setIsSubmittingComment(true);
    try {
      const numericCommunityId = parseInt(communityId, 10);
      const numericPostId = parseInt(postId, 10);

      const result = await createComment(
        numericCommunityId,
        numericPostId,
        commentText.trim()
      );

      if (result.success && result.data) {
        const newComment = mapCommentResponseToComment(result.data);
        setComments([newComment, ...comments]);
        setCommentText("");
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReplyToComment = async (
    parentCommentId: string,
    replyContent: string
  ) => {
    if (!communityId || !postId || !community?.isJoined) return;

    try {
      const numericCommunityId = parseInt(communityId, 10);
      const numericPostId = parseInt(postId, 10);
      const numericParentId = parseInt(parentCommentId, 10);

      const result = await createComment(
        numericCommunityId,
        numericPostId,
        replyContent,
        numericParentId
      );

      if (result.success && result.data) {
        // Refresh data to show nested reply correctly
        await fetchData();
      }
    } catch (err) {
      console.error("Failed to add reply:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !post || !community) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">
            {error || "Post not found"}
          </h1>
          <Link href={`/communities/${communityId}`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Community
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
                {post.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
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
              className="gap-2"
              onClick={handleToggleLike}
            >
              <Heart
                className={`h-4 w-4 ${isLiked ? "text-red-500" : ""}`}
                fill={isLiked ? "currentColor" : "none"}
              />
              <span>{likes}</span>
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>
                {comments.length}{" "}
                {comments.length === 1 ? "comment" : "comments"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comment Form */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {user?.fullName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isSubmittingComment}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || isSubmittingComment}
                >
                  {isSubmittingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>

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
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReplyToComment}
                disabled={!community?.isJoined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}