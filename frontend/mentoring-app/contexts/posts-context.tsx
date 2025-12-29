"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { type Post } from "@/lib/types";
import { useAuth } from "./auth-context";
import { getPostsForUser } from "@/lib/posts-service";
import { mapPostResponseToPost } from "@/lib/helper";

interface PostsContextType {
  userPosts: Post[];
  addPost: (post: Post) => void;
  isLoading: boolean;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    console.log("Fetching posts for user:", user.id);
    const fetchUserPosts = async () => {
      setIsLoading(true);
      try {
        const result = await getPostsForUser(user.id, 1, 20);
        console.log("Fetched posts:", result);
         if (result.data) {
          const normalizedPosts = result.data.posts.map(mapPostResponseToPost);
          setUserPosts(normalizedPosts);
         }
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPosts();
  }, [user?.id]);

  const addPost = (post: Post) => {
    setUserPosts((prev) => [post, ...prev]);
  };

  return (
    <PostsContext.Provider value={{ userPosts, addPost, isLoading }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
}