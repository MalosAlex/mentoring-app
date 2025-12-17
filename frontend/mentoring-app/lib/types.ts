export interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  likes: number;
  replies?: Comment[];
}

export interface Post {
  id: string;
  communityId: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  image?: string;
  timestamp: Date;
  likes: number;
  isLiked?: boolean;
  comments: number;
}


