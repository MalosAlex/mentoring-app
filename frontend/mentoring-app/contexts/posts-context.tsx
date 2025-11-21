"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { type Post } from "@/lib/mock-data";

interface PostsContextType {
  userPosts: Post[];
  addPost: (post: Post) => void;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [userPosts, setUserPosts] = useState<Post[]>([]);

  const addPost = (post: Post) => {
    setUserPosts((prev) => [post, ...prev]);
  };

  return (
    <PostsContext.Provider value={{ userPosts, addPost }}>
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

