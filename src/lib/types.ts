
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  avatar?: string;
  bio?: string;
  location?: string;
  badges?: string[];
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  location: string;
  date: string;
  userId: string;
  author: {
    username: string;
    avatar: string; // Changed from optional to required to fix type errors
  };
  thankCount: number;
  comments: number;
  thankedByUser?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export type LocationFilter = string;
export type CategoryFilter = string;
export type SortOption = 'recent' | 'popular';

export interface PostFilters {
  location?: LocationFilter;
  category?: CategoryFilter;
  sort?: SortOption;
}
