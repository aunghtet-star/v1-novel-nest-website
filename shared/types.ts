export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface PaginatedResponse<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}
export interface Genre {
  id: string;
  name: string;
  slug: string;
}
export interface Novel {
  id: string;
  slug: string;
  title: string;
  author: string;
  authorId: string;
  coverImageUrl: string;
  summary: string;
  genres: string[]; // Array of genre slugs
  status: 'Ongoing' | 'Completed';
  rating: number;
  latestChapter?: number;
  updatedAt?: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  likeCount: number;
  viewCount: number;
}
export interface Chapter {
  id: string;
  novelId: string; // This is the novel slug
  chapterNumber: number;
  title: string;
  content: string;
  publishedAt: string;
}
export type ChapterListItem = Omit<Chapter, 'content'>;
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'author' | 'admin';
  status: 'active' | 'blocked' | 'unverified';
}
export type AuthResponse = {
  user: Omit<User, 'passwordHash'>;
  token: string;
};
export interface Bookmark {
  id: string; // e.g., `${userId}-${novelSlug}`
  userId: string;
  novelSlug: string;
  chapterNumber?: number; // Optional, to track reading progress
  createdAt: string;
}
export type BookmarkedNovel = Bookmark & {
  novel: Novel;
};
export interface Like {
  id: string; // e.g., `${userId}-${novelSlug}`
  userId: string;
  novelSlug: string;
}
export interface View {
  id: string; // e.g., `${userId}-${novelSlug}`
  userId: string;
  novelSlug: string;
}
export interface OTP {
  id: string; // Corresponds to userId
  userId: string;
  code: string;
  expiresAt: number; // Unix timestamp
}