"use client";

import { useState, useEffect } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatTimestamp, type Comment } from "@/lib/mock-data";
import { useAuth } from "@/contexts/auth-context";
import { reactToComment } from "@/lib/posts-service";
import { useParams } from "next/navigation";

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  onReply?: (parentCommentId: string, replyContent: string) => void;
  disabled?: boolean;
}

export function CommentItem({
  comment,
  depth = 0,
  onReply,
  disabled = false,
}: CommentItemProps) {
  const params = useParams();
  const communityId = params.id as string;
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likes, setLikes] = useState(comment.likes || 0);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [localReplies, setLocalReplies] = useState<Comment[]>(
    comment.replies || []
  );
  const { user } = useAuth();

  // Sync state with props
  useEffect(() => {
    setIsLiked(comment.isLiked || false);
    setLikes(comment.likes || 0);
    if (comment.replies) {
      setLocalReplies(comment.replies);
    }
  }, [comment.isLiked, comment.likes, comment.replies]);

  const handleToggleLike = async () => {
    if (disabled || !communityId) return;

    const wasLiked = isLiked;
    const currentLikes = typeof likes === "number" && !isNaN(likes) ? likes : 0;

    // Optimistic update
    setIsLiked(!wasLiked);
    setLikes(wasLiked ? currentLikes - 1 : currentLikes + 1);

    try {
      const numericCommunityId = parseInt(communityId, 10);
      const numericCommentId = parseInt(comment.id, 10);
      const result = await reactToComment(
        numericCommunityId,
        numericCommentId,
        "like"
      );
      if (result.success && result.data) {
        setIsLiked(result.data.isLiked);
        setLikes(result.data.totalReactions || 0);
      } else {
        setIsLiked(wasLiked);
        setLikes(currentLikes);
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
      setIsLiked(wasLiked);
      setLikes(currentLikes);
    }
  };

  const handleSubmitReply = () => {
    if (!replyText.trim() || disabled) return;

    // Call parent handler if provided
    if (onReply) {
      onReply(comment.id, replyText);
      setReplyText("");
      setShowReplyForm(false);
    } else {
      // Fallback for local update if no parent handler
      const newReply: Comment = {
        id: `r${Date.now()}`,
        postId: comment.postId,
        author: {
          name: user?.fullName || "User",
        },
        content: replyText,
        timestamp: new Date(),
        likes: 0,
        replies: [],
      };

      setLocalReplies([...localReplies, newReply]);
      setReplyText("");
      setShowReplyForm(false);
    }
  };

  const handleNestedReply = (parentCommentId: string, replyContent: string) => {
    if (onReply) {
      onReply(parentCommentId, replyContent);
    } else {
      // Handle nested replies locally if no parent handler
      setLocalReplies(
        localReplies.map((reply) => {
          if (reply.id === parentCommentId) {
            const newNestedReply: Comment = {
              id: `r${Date.now()}`,
              postId: comment.postId,
              author: {
                name: user?.fullName || "User",
              },
              content: replyContent,
              timestamp: new Date(),
              likes: 0,
              replies: [],
            };
            return {
              ...reply,
              replies: [...(reply.replies || []), newNestedReply],
            };
          }
          return reply;
        })
      );
    }
  };

  // Limit nesting depth for better UX
  const maxDepth = 3;
  const indent = Math.min(depth, maxDepth) * 2; // 2rem per level, max 6rem

  return (
    <div className="space-y-4">
      <div
        style={{ marginLeft: `${indent}rem` }}
        className={`flex gap-3 py-2 ${
          depth > 0 ? "border-l-2 border-muted pl-4" : ""
        }`}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {comment.author.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm">{comment.author.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatTimestamp(comment.timestamp)}
            </p>
          </div>
          <p className="text-sm mb-2">{comment.content}</p>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={handleToggleLike}
            >
              <Heart
                className={`h-3 w-3 ${isLiked ? "text-red-500" : ""}`}
                fill={isLiked ? "currentColor" : "none"}
              />
              <span>{likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => setShowReplyForm(!showReplyForm)}
              disabled={disabled}
            >
              <MessageCircle className="h-3 w-3" />
              <span>Reply</span>
            </Button>
          </div>

          {showReplyForm && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder={`Reply to ${comment.author.name}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[60px] text-sm resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim()}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render nested replies */}
      {localReplies.length > 0 && (
        <div className="">
          {localReplies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={handleNestedReply}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}
