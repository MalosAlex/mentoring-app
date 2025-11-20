// Mock data for communities and posts

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

export const mockCommunities: Community[] = [
  {
    id: "1",
    name: "Web Development",
    description: "A community for web developers to share knowledge and experiences",
    memberCount: 1250,
    isJoined: true,
  },
  {
    id: "2",
    name: "Data Science",
    description: "Discuss data science, machine learning, and analytics",
    memberCount: 890,
    isJoined: true,
  },
  {
    id: "3",
    name: "Mobile Development",
    description: "iOS, Android, and cross-platform mobile development",
    memberCount: 650,
    isJoined: false,
  },
  {
    id: "4",
    name: "UI/UX Design",
    description: "Share and discuss design principles, tools, and inspiration",
    memberCount: 1100,
    isJoined: false,
  },
  {
    id: "5",
    name: "Career Advice",
    description: "Get mentorship and advice on your tech career journey",
    memberCount: 2300,
    isJoined: true,
  },
  {
    id: "6",
    name: "Cloud Computing",
    description: "AWS, Azure, GCP, and cloud architecture discussions",
    memberCount: 780,
    isJoined: false,
  },
];

export const mockPosts: Post[] = [
  // Web Development posts
  {
    id: "1",
    communityId: "1",
    author: {
      name: "Sarah Johnson",
    },
    content: "Just launched my first Next.js 15 project! The new features are amazing. Anyone else experimenting with server actions?",
    image: "/test.png",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likes: 45,
    isLiked: false,
    comments: 5,
  },
  {
    id: "2",
    communityId: "1",
    author: {
      name: "Mike Chen",
    },
    content: "Hot take: CSS Grid is still underutilized. Here's why you should be using it more often in your layouts...",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    likes: 89,
    isLiked: false,
    comments: 4,
  },
  {
    id: "3",
    communityId: "1",
    author: {
      name: "Emily Rodriguez",
    },
    content: "Built a beautiful landing page today using Tailwind CSS. The productivity boost is real! 🚀",
    image: "/test.png",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    likes: 67,
    isLiked: false,
    comments: 0,
  },
  
  // Data Science posts
  {
    id: "4",
    communityId: "2",
    author: {
      name: "David Park",
    },
    content: "Just finished training a transformer model on my custom dataset. The results are impressive! Anyone interested in NLP applications?",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    likes: 112,
    isLiked: false,
    comments: 0,
  },
  {
    id: "5",
    communityId: "2",
    author: {
      name: "Lisa Wang",
    },
    content: "Data visualization tip: Sometimes a simple bar chart is more effective than a complex dashboard. Keep it simple!",
    image: "/test.png",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    likes: 78,
    isLiked: false,
    comments: 0,
  },
  
  // Career Advice posts
  {
    id: "6",
    communityId: "5",
    author: {
      name: "Robert Taylor",
    },
    content: "After 5 years as a developer, I finally made the switch to senior role. Here are the top 3 things that helped me get there...",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    likes: 234,
    isLiked: false,
    comments: 0,
  },
  {
    id: "7",
    communityId: "5",
    author: {
      name: "Jennifer Lee",
    },
    content: "Reminder: Your first tech job doesn't have to be at a FAANG company. Start where you can learn and grow!",
    image: "/test.png",
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000),
    likes: 189,
    isLiked: false,
    comments: 0,
  },
];

// Mock comments with nested replies
export const mockComments: Comment[] = [
  // Comments for post 1 (Sarah Johnson's Next.js post)
  {
    id: "c1",
    postId: "1",
    author: {
      name: "Alex Martinez",
    },
    content: "Server actions are a game changer! I've been using them for form submissions and it's so much cleaner than the old API route approach.",
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    likes: 12,
    replies: [
      {
        id: "c1-r1",
        postId: "1",
        author: {
          name: "Sarah Johnson",
        },
        content: "Exactly! The progressive enhancement aspect is also really nice. Forms work even without JS enabled.",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        likes: 5,
      },
    ],
  },
  {
    id: "c2",
    postId: "1",
    author: {
      name: "Tom Wilson",
    },
    content: "How's the performance compared to Next.js 14? Noticed any improvements?",
    timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000),
    likes: 8,
    replies: [
      {
        id: "c2-r1",
        postId: "1",
        author: {
          name: "Sarah Johnson",
        },
        content: "The build times are noticeably faster! Also the new caching strategies give you more control.",
        timestamp: new Date(Date.now() - 1.2 * 60 * 60 * 1000),
        likes: 3,
        replies: [
          {
            id: "c2-r1-r1",
            postId: "1",
            author: {
              name: "Tom Wilson",
            },
            content: "Thanks! Will definitely upgrade my projects soon.",
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            likes: 2,
          },
        ],
      },
    ],
  },
  {
    id: "c3",
    postId: "1",
    author: {
      name: "Rachel Green",
    },
    content: "Great work! Do you have the project deployed anywhere we can check out?",
    timestamp: new Date(Date.now() - 1.3 * 60 * 60 * 1000),
    likes: 4,
  },

  // Comments for post 2 (Mike Chen's CSS Grid post)
  {
    id: "c4",
    postId: "2",
    author: {
      name: "Nina Patel",
    },
    content: "100% agree! Grid + subgrid is incredibly powerful. I barely use flexbox for layouts anymore.",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    likes: 23,
    replies: [
      {
        id: "c4-r1",
        postId: "2",
        author: {
          name: "Mike Chen",
        },
        content: "Subgrid is a game changer! Browser support has gotten really good too.",
        timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
        likes: 11,
      },
    ],
  },
  {
    id: "c5",
    postId: "2",
    author: {
      name: "Carlos Rodriguez",
    },
    content: "Can you share some use cases where Grid is better than Flexbox? Still learning the differences.",
    timestamp: new Date(Date.now() - 4.5 * 60 * 60 * 1000),
    likes: 15,
    replies: [
      {
        id: "c5-r1",
        postId: "2",
        author: {
          name: "Mike Chen",
        },
        content: "Grid excels at 2D layouts (rows AND columns). Flexbox is better for 1D layouts. For example, a card grid with equal heights? Grid. A navigation bar? Flexbox.",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        likes: 28,
        replies: [
          {
            id: "c5-r1-r1",
            postId: "2",
            author: {
              name: "Carlos Rodriguez",
            },
            content: "That makes so much sense! Thanks for the clear explanation.",
            timestamp: new Date(Date.now() - 3.8 * 60 * 60 * 1000),
            likes: 6,
          },
        ],
      },
    ],
  },
  {
    id: "c6",
    postId: "2",
    author: {
      name: "Emma Davis",
    },
    content: "I always found Grid syntax more intuitive than Flexbox. The grid-template-areas feature is chef's kiss 👨‍🍳💋",
    timestamp: new Date(Date.now() - 4.2 * 60 * 60 * 1000),
    likes: 19,
  },
];

// Helper function to get posts for a specific community
export function getPostsByCommunity(communityId: string): Post[] {
  return mockPosts.filter(post => post.communityId === communityId);
}

// Helper function to get a specific post
export function getPostById(postId: string): Post | undefined {
  return mockPosts.find(post => post.id === postId);
}

// Helper function to get comments for a specific post (only top-level comments)
export function getCommentsByPostId(postId: string): Comment[] {
  return mockComments.filter(comment => comment.postId === postId);
}

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

