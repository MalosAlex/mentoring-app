import { PostResponse } from "./posts-service";
import { Post } from "./types";

const DEFAULT_API_BASE_URL = "https://localhost:7117/api";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
).replace(/\/$/, "");

// Helper function to format timestamp
export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    return `${diffInDays}d ago`;
  }
}

export function getInitials(name: string): string {
  const names = name.split(" ");
  const initials = names.map((n) => n.charAt(0).toUpperCase()).join("");
  return initials.slice(0, 2);
}

// Convert backend PostResponse to frontend Post type
  export const mapPostResponseToPost = (postResponse: PostResponse): Post => {
    // Construct full URL for images (backend serves static files)
    const imageUrl = postResponse.mediaUrl 
      ? `https://localhost:7117${postResponse.mediaUrl}` 
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
      isLiked: false, // TODO: Get from backend if available
      comments: postResponse.comments.length,
    };
  };