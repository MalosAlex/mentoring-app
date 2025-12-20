"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Heart, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { 
  mockCommunities, 
  getPostById, 
  getCommentsByPostId,
  formatTimestamp,
  type Comment 
} from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CommentItem } from "@/components/comment-item";

export default function PostDetailPage() {
  const params = useParams();
  const communityId = params.id as string;
  const postId = params.postId as string;
  
  const community = mockCommunities.find(c => c.id === communityId);
  const post = getPostById(postId);
  const [comments, setComments] = useState<Comment[]>(getCommentsByPostId(postId));
  const [isLiked, setIsLiked] = useState(post?.isLiked || false);
  const [likes, setLikes] = useState(post?.likes || 0);
  const [commentText, setCommentText] = useState("");

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `c${Date.now()}`,
      postId: postId,
      author: {
        name: "John Doe", // Current user (mock)
      },
      content: commentText,
      timestamp: new Date(),
      likes: 0,
      replies: [],
    };

    setComments([newComment, ...comments]);
    setCommentText("");
  };

  if (!post || !community) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Post not found</h1>
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
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
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
                  disabled={!commentText.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Comment
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

