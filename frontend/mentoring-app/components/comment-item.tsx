"use client";

import { useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { type Comment } from "@/lib/types";
import { formatTimestamp } from "@/lib/helper";

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  onReply?: (parentCommentId: string, replyContent: string) => void;
}

export function CommentItem({ comment, depth = 0, onReply }: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likes);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [localReplies, setLocalReplies] = useState<Comment[]>(comment.replies || []);

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;

    const newReply: Comment = {
      id: `r${Date.now()}`,
      postId: comment.postId,
      author: {
        name: "John Doe", // Current user (mock)
      },
      content: replyText,
      timestamp: new Date(),
      likes: 0,
      replies: [],
    };

    setLocalReplies([...localReplies, newReply]);
    setReplyText("");
    setShowReplyForm(false);
    
    // Also call parent handler if provided
    if (onReply) {
      onReply(comment.id, replyText);
    }
  };

  const handleNestedReply = (parentCommentId: string, replyContent: string) => {
    // Handle nested replies by updating the specific reply
    setLocalReplies(localReplies.map(reply => {
      if (reply.id === parentCommentId) {
        const newNestedReply: Comment = {
          id: `r${Date.now()}`,
          postId: comment.postId,
          author: {
            name: "John Doe",
          },
          content: replyContent,
          timestamp: new Date(),
          likes: 0,
          replies: [],
        };
        return {
          ...reply,
          replies: [...(reply.replies || []), newNestedReply]
        };
      }
      return reply;
    }));
  };

  // Limit nesting depth for better UX
  const maxDepth = 3;
  const indent = Math.min(depth, maxDepth) * 2; // 2rem per level, max 6rem

  return (
    <div className="space-y-4">
      <div 
        style={{ marginLeft: `${indent}rem` }}
        className={`flex gap-3 py-2 ${depth > 0 ? 'border-l-2 border-muted pl-4' : ''}`}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {comment.author.name.split(' ').map(n => n[0]).join('')}
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
              <Heart className={`h-3 w-3 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => setShowReplyForm(!showReplyForm)}
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

