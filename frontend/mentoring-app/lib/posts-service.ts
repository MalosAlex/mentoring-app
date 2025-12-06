import { getStoredToken } from "./auth-service";

const DEFAULT_API_BASE_URL = "http://localhost:5216/api";
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
).replace(/\/$/, "");

export interface CreatePostRequest {
  caption: string;
  media?: File;
}

export interface PostResponse {
  id: number;
  communityId: number;
  userId: number;
  caption: string;
  mediaUrl?: string;
  createdAt: string;
  authorName: string;
  reactionCount: number;
  comments: PostCommentResponse[];
}

export interface PostCommentResponse {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  authorName: string;
}

export interface GetPostsResponse {
  posts: PostResponse[];
  pageNumber: number;
  hasMore: boolean;
}

const parseErrorMessage = async (response: Response): Promise<string> => {
  const fallback = "Something went wrong. Please try again.";
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const data = await response.json();
      if (!data) {
        return fallback;
      }

      if (typeof data === "string") {
        return data;
      }

      if (typeof data?.message === "string") {
        return data.message;
      }

      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        return data.errors.join(", ");
      }

      // Handle validation errors
      if (data?.title === "One or more validation errors occurred.") {
        const errors = data.errors || {};
        const errorMessages = Object.entries(errors)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return `${key}: ${value.join(", ")}`;
            }
            return `${key}: ${value}`;
          })
          .join("; ");
        return errorMessages || fallback;
      }
    } else {
      const text = await response.text();
      if (text) {
        return text;
      }
    }
  } catch {
    // ignore parsing errors and fall back to default message
  }

  return fallback;
};

const getAuthHeaders = (): HeadersInit => {
  const token = getStoredToken();
  const headers: HeadersInit = {};

  if (token) {
    headers.Authorization = `Bearer ${token.token}`;
  }

  return headers;
};

/**
 * Creates a new post in a community
 */
export const createPost = async (
  communityId: number,
  request: CreatePostRequest
): Promise<{ success: boolean; data?: PostResponse; message?: string }> => {
  try {
    const token = getStoredToken();
    if (!token) {
      return {
        success: false,
        message: "You must be logged in to create a post.",
      };
    }

    const formData = new FormData();
    formData.append("Caption", request.caption);
    if (request.media) {
      formData.append("Media", request.media);
    }

    const response = await fetch(
      `${API_BASE_URL}/communities/${communityId}/posts`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: await parseErrorMessage(response),
      };
    }

    const data = await response.json();
    
    // Handle both camelCase and PascalCase responses
    const post: PostResponse = {
      id: data.id ?? data.Id ?? 0,
      communityId: data.communityId ?? data.CommunityId ?? communityId,
      userId: data.userId ?? data.UserId ?? 0,
      caption: data.caption ?? data.Caption ?? "",
      mediaUrl: data.mediaUrl ?? data.MediaUrl ?? undefined,
      createdAt: data.createdAt ?? data.CreatedAt ?? new Date().toISOString(),
      authorName: data.authorName ?? data.AuthorName ?? "",
      reactionCount: data.reactionCount ?? data.ReactionCount ?? 0,
      comments: (data.comments ?? data.Comments ?? []).map((c: any) => ({
        id: c.id ?? c.Id ?? 0,
        postId: c.postId ?? c.PostId ?? 0,
        userId: c.userId ?? c.UserId ?? 0,
        content: c.content ?? c.Content ?? "",
        createdAt: c.createdAt ?? c.CreatedAt ?? new Date().toISOString(),
        authorName: c.authorName ?? c.AuthorName ?? "",
      })),
    };

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to reach the server. Please try again later.",
    };
  }
};

/**
 * Gets posts for a community with pagination
 */
export const getPosts = async (
  communityId: number,
  pageNumber: number = 1,
  pageSize: number = 20
): Promise<{ success: boolean; data?: GetPostsResponse; message?: string }> => {
  try {
    const token = getStoredToken();
    if (!token) {
      return {
        success: false,
        message: "You must be logged in to view posts. Please log in and try again.",
      };
    }

    const response = await fetch(
      `${API_BASE_URL}/communities/${communityId}/posts?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        return {
          success: false,
          message: "Your session has expired. Please log in again.",
        };
      }
      
      const errorMessage = await parseErrorMessage(response);
      console.error(`Failed to fetch posts: ${response.status} ${response.statusText}`, errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }

    const data = await response.json();
    
    // Handle both camelCase and PascalCase responses
    const postsResponse: GetPostsResponse = {
      posts: (data.posts ?? data.Posts ?? []).map((p: any) => ({
        id: p.id ?? p.Id ?? 0,
        communityId: p.communityId ?? p.CommunityId ?? communityId,
        userId: p.userId ?? p.UserId ?? 0,
        caption: p.caption ?? p.Caption ?? "",
        mediaUrl: p.mediaUrl ?? p.MediaUrl ?? undefined,
        createdAt: p.createdAt ?? p.CreatedAt ?? new Date().toISOString(),
        authorName: p.authorName ?? p.AuthorName ?? "",
        reactionCount: p.reactionCount ?? p.ReactionCount ?? 0,
        comments: (p.comments ?? p.Comments ?? []).map((c: any) => ({
          id: c.id ?? c.Id ?? 0,
          postId: c.postId ?? c.PostId ?? 0,
          userId: c.userId ?? c.UserId ?? 0,
          content: c.content ?? c.Content ?? "",
          createdAt: c.createdAt ?? c.CreatedAt ?? new Date().toISOString(),
          authorName: c.authorName ?? c.AuthorName ?? "",
        })),
      })),
      pageNumber: data.pageNumber ?? data.PageNumber ?? pageNumber,
      hasMore: data.hasMore ?? data.HasMore ?? false,
    };

    return {
      success: true,
      data: postsResponse,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to reach the server. Please try again later.",
    };
  }
};

