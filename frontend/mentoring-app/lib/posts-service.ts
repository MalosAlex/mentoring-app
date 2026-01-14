import { getStoredToken } from "./auth-service";
import { API_BASE_URL } from "./helper";

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
  isLiked: boolean;
  comments: PostCommentResponse[];
}

export interface PostCommentResponse {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  authorName: string;
  parentCommentId?: number;
  reactionCount: number;
  isLiked: boolean;
  replies: PostCommentResponse[];
}

export interface GetPostsResponse {
  posts: PostResponse[];
  pageNumber: number;
  hasMore: boolean;
}

export interface PostReactionResponse {
  postId: number;
  userId: number;
  reactionType: string;
  createdAt: string;
  totalReactions: number;
  isLiked: boolean;
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

const mapCommentResponse = (c: any): PostCommentResponse => ({
  id: c.id ?? c.Id ?? 0,
  postId: c.postId ?? c.PostId ?? 0,
  userId: c.userId ?? c.UserId ?? 0,
  content: c.content ?? c.Content ?? "",
  createdAt: c.createdAt ?? c.CreatedAt ?? new Date().toISOString(),
  authorName: c.authorName ?? c.AuthorName ?? "",
  parentCommentId: c.parentCommentId ?? c.ParentCommentId,
  reactionCount: c.reactionCount ?? c.ReactionCount ?? 0,
  isLiked: c.isLiked ?? c.IsLiked ?? false,
  replies: (c.replies ?? c.Replies ?? []).map((r: any) =>
    mapCommentResponse(r)
  ),
});

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
      isLiked: data.isLiked ?? data.IsLiked ?? false,
      comments: (data.comments ?? data.Comments ?? []).map(mapCommentResponse),
    };

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to reach the server. Please try again later.",
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
        message:
          "You must be logged in to view posts. Please log in and try again.",
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
      console.error(
        `Failed to fetch posts: ${response.status} ${response.statusText}`,
        errorMessage
      );
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
        isLiked: p.isLiked ?? p.IsLiked ?? false,
        comments: (p.comments ?? p.Comments ?? []).map(mapCommentResponse),
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
      message:
        error instanceof Error
          ? error.message
          : "Unable to reach the server. Please try again later.",
    };
  }
};

/**
 * Gets posts for a specific user
 */
export const getPostsForUser = async (
  userId: number,
  pageNumber: number = 1,
  pageSize: number = 20
): Promise<{ success: boolean; data?: GetPostsResponse; message?: string }> => {
  try {
    const token = getStoredToken();
    if (!token) {
      return {
        success: false,
        message:
          "You must be logged in to view posts. Please log in and try again.",
      };
    }

    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/posts?pageNumber=${pageNumber}&pageSize=${pageSize}`,
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
      console.error(
        `Failed to fetch posts: ${response.status} ${response.statusText}`,
        errorMessage
      );
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
        communityId: p.communityId ?? p.CommunityId ?? 0,
        userId: p.userId ?? p.UserId ?? userId,
        caption: p.caption ?? p.Caption ?? "",
        mediaUrl: p.mediaUrl ?? p.MediaUrl ?? undefined,
        createdAt: p.createdAt ?? p.CreatedAt ?? new Date().toISOString(),
        authorName: p.authorName ?? p.AuthorName ?? "",
        reactionCount: p.reactionCount ?? p.ReactionCount ?? 0,
        isLiked: p.isLiked ?? p.IsLiked ?? false,
        comments: (p.comments ?? p.Comments ?? []).map(mapCommentResponse),
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
      message:
        error instanceof Error
          ? error.message
          : "Unable to reach the server. Please try again later.",
    };
  }
};

/**
 * Reacts to a post
 */
export const reactToPost = async (
  communityId: number,
  postId: number,
  reactionType: string
): Promise<{
  success: boolean;
  data?: PostReactionResponse;
  message?: string;
}> => {
  try {
    const token = getStoredToken();
    if (!token) {
      return {
        success: false,
        message: "You must be logged in to react to a post.",
      };
    }

    const response = await fetch(
      `${API_BASE_URL}/communities/${communityId}/posts/${postId}/react`,
      {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reactionType }),
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: await parseErrorMessage(response),
      };
    }

    const data = await response.json();

    const reaction: PostReactionResponse = {
      postId: data.postId ?? data.PostId ?? postId,
      userId: data.userId ?? data.UserId ?? 0,
      reactionType: data.reactionType ?? data.ReactionType ?? reactionType,
      createdAt: data.createdAt ?? data.CreatedAt ?? new Date().toISOString(),
      totalReactions: data.totalReactions ?? data.TotalReactions ?? 0,
      isLiked: data.isLiked ?? data.IsLiked ?? false,
    };

    return {
      success: true,
      data: reaction,
    };
  } catch (error) {
    console.error("Error reacting to post:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to reach the server. Please try again later.",
    };
  }
};

/**
 * Reacts to a comment
 */
export const reactToComment = async (
  communityId: number,
  commentId: number,
  reactionType: string
): Promise<{
  success: boolean;
  data?: PostReactionResponse;
  message?: string;
}> => {
  try {
    const token = getStoredToken();
    if (!token) {
      return {
        success: false,
        message: "You must be logged in to react to a comment.",
      };
    }

    const response = await fetch(
      `${API_BASE_URL}/communities/${communityId}/posts/comments/${commentId}/react`,
      {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reactionType }),
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: await parseErrorMessage(response),
      };
    }

    const data = await response.json();

    const reaction: PostReactionResponse = {
      postId: data.postId ?? data.PostId ?? commentId,
      userId: data.userId ?? data.UserId ?? 0,
      reactionType: data.reactionType ?? data.ReactionType ?? reactionType,
      createdAt: data.createdAt ?? data.CreatedAt ?? new Date().toISOString(),
      totalReactions: data.totalReactions ?? data.TotalReactions ?? 0,
      isLiked: data.isLiked ?? data.IsLiked ?? false,
    };

    return {
      success: true,
      data: reaction,
    };
  } catch (error) {
    console.error("Error reacting to comment:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to reach the server. Please try again later.",
    };
  }
};

/**
 * Gets a single post by ID
 */
export const getPostById = async (
  communityId: number,
  postId: number
): Promise<{ success: boolean; data?: PostResponse; message?: string }> => {
  try {
    const token = getStoredToken();
    if (!token) {
      return {
        success: false,
        message: "You must be logged in to view the post.",
      };
    }

    const response = await fetch(
      `${API_BASE_URL}/communities/${communityId}/posts/${postId}`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: await parseErrorMessage(response),
      };
    }

    const data = await response.json();

    const post: PostResponse = {
      id: data.id ?? data.Id ?? 0,
      communityId: data.communityId ?? data.CommunityId ?? communityId,
      userId: data.userId ?? data.UserId ?? 0,
      caption: data.caption ?? data.Caption ?? "",
      mediaUrl: data.mediaUrl ?? data.MediaUrl ?? undefined,
      createdAt: data.createdAt ?? data.CreatedAt ?? new Date().toISOString(),
      authorName: data.authorName ?? data.AuthorName ?? "",
      reactionCount: data.reactionCount ?? data.ReactionCount ?? 0,
      isLiked: data.isLiked ?? data.IsLiked ?? false,
      comments: (data.comments ?? data.Comments ?? []).map(mapCommentResponse),
    };

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to reach the server. Please try again later.",
    };
  }
};

/**
 * Creates a comment on a post
 */
export const createComment = async (
  communityId: number,
  postId: number,
  content: string,
  parentCommentId?: number
): Promise<{
  success: boolean;
  data?: PostCommentResponse;
  message?: string;
}> => {
  try {
    const token = getStoredToken();
    if (!token) {
      return {
        success: false,
        message: "You must be logged in to comment.",
      };
    }

    const response = await fetch(
      `${API_BASE_URL}/communities/${communityId}/posts/${postId}/comment`,
      {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, parentCommentId }),
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: await parseErrorMessage(response),
      };
    }

    const data = await response.json();

    const comment: PostCommentResponse = {
      id: data.id ?? data.Id ?? 0,
      postId: data.postId ?? data.PostId ?? postId,
      userId: data.userId ?? data.UserId ?? 0,
      content: data.content ?? data.Content ?? content,
      createdAt: data.createdAt ?? data.CreatedAt ?? new Date().toISOString(),
      authorName: data.authorName ?? data.AuthorName ?? "",
      parentCommentId: data.parentCommentId ?? data.ParentCommentId,
      reactionCount: data.reactionCount ?? data.ReactionCount ?? 0,
      isLiked: data.isLiked ?? data.IsLiked ?? false,
      replies: [],
    };

    return {
      success: true,
      data: comment,
    };
  } catch (error) {
    console.error("Error creating comment:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to reach the server. Please try again later.",
    };
  }
};
