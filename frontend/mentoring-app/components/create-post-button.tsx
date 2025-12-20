"use client";

import { useState, useRef } from "react";
import { Plus, Image as ImageIcon, X, Loader2 } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createPost, type PostResponse } from "@/lib/posts-service";
import { useAuth } from "@/contexts/auth-context";
import { getInitials } from "@/lib/helper";

interface CreatePostButtonProps {
  communityId: number;
  communityName: string;
  onCreatePost?: (post: PostResponse) => void;
}

// Backend validation: MaxLength(500) for Caption
const postContentMaxLength = 500;

function ValidatePostContent(content: string): string | null {
  const trimmedContent = content.trim();
  const contentLength = trimmedContent.length;

  if (contentLength === 0) {
    return "Post content cannot be empty.";
  }

  if (contentLength > postContentMaxLength) {
    return `Post content cannot be longer than ${postContentMaxLength} characters.`;
  }

  return null;
}

export function CreatePostButton({
  communityId,
  communityName,
  onCreatePost,
}: CreatePostButtonProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageFile(files[0]);
    }
  };

  const handleImageFile = (file: File) => {
    // Backend accepts: image/jpeg, image/png, image/gif, image/webp, video/mp4
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
    ];
    
    if (allowedTypes.includes(file.type)) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setContentError("Unsupported file type. Please use JPEG, PNG, GIF, WEBP, or MP4.");
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    const validationError = ValidatePostContent(newValue);

    setContent(newValue);
    setContentError(validationError);
  };

  const handleSubmit = async () => {
    const trimmedContent = content.trim();
    const validationError = ValidatePostContent(trimmedContent);

    if (validationError !== null) {
      setContentError(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await createPost(communityId, {
        caption: trimmedContent,
        media: selectedFile || undefined,
      });

      if (!result.success) {
        setSubmitError(result.message || "Failed to create post");
        return;
      }

      // Call the callback with the created post
      if (onCreatePost && result.data) {
        onCreatePost(result.data);
      }

      // Reset form
      setContent("");
      setContentError(null);
      setImagePreview(null);
      setSelectedFile(null);
      setSubmitError(null);
      setOpen(false);
    } catch (error) {
      setSubmitError("An unexpected error occurred. Please try again.");
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPostContentValid =
    contentError === null && content.trim().length > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-8 right-8 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 bg-black hover:bg-gray-900"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Post
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create a post</DialogTitle>
            <DialogDescription>
              Share your thoughts with the community
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* User and Community Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(user?.fullName || "")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    Posting to:
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                {communityName}
              </Badge>
            </div>

            {/* Post Content */}
            <div className="space-y-1">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={handleContentChange}
                className="min-h-[120px] resize-none"
                maxLength={postContentMaxLength}
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {content.length}/{postContentMaxLength} characters
                </span>
                {contentError && (
                  <span className="text-destructive">
                    {contentError}
                  </span>
                )}
              </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Drag and Drop Area */}
            {!imagePreview && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
              >
                <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop an image here, or
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,video/mp4"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  Choose File
                </Button>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {submitError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!isPostContentValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
