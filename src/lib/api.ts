
// API client for communicating with MongoDB backend
import { User, Post, Category } from './types';
import axios from 'axios';

// API base URL - can be configured based on environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API functions
export async function loginUser(email: string, password: string): Promise<User> {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data.user;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.response?.data?.msg || 'Failed to login');
  }
}

export async function registerUser(username: string, email: string, password: string): Promise<User> {
  try {
    const response = await apiClient.post('/auth/register', { username, email, password });
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error(error.response?.data?.msg || 'Failed to register');
  }
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  return Promise.resolve();
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      return null;
    }

    // Verify token is still valid by checking with the server
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return null;
    }

    // Try to get current user from server to validate token
    const response = await apiClient.get('/auth/user');
    return response.data;
  } catch (error) {
    // If token is invalid, clear localStorage
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
    return null;
  }
}

// Posts API functions
export async function fetchPosts(filters?: { category?: string; location?: string }): Promise<Post[]> {
  try {
    let url = '/posts';
    if (filters) {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);
      url += `?${params.toString()}`;
    }
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw new Error('Failed to fetch posts');
  }
}

export async function fetchPostById(id: string): Promise<Post | null> {
  try {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching post:', error);
    throw new Error('Failed to fetch post');
  }
}

export async function createPost(postData: Omit<Post, 'id' | 'author' | 'date' | 'thankCount' | 'comments'>): Promise<Post> {
  try {
    const response = await apiClient.post('/posts', postData);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error('Failed to create post');
  }
}

export async function deletePost(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/posts/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw new Error('Failed to delete post');
  }
}

export async function updatePost(id: string, updateData: Partial<Post>): Promise<Post | null> {
  try {
    const response = await apiClient.put(`/posts/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating post:', error);
    throw new Error('Failed to update post');
  }
}

export async function thankPost(id: string): Promise<Post | null> {
  try {
    const response = await apiClient.put(`/posts/${id}/thank`);
    return response.data;
  } catch (error) {
    console.error('Error thanking post:', error);
    throw new Error('Failed to thank post');
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await apiClient.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Fallback to mock data if server isn't ready yet
    console.warn('Using mock category data as fallback');
    return [
      { id: '1', name: 'Events' },
      { id: '2', name: 'Lost & Found' },
      { id: '3', name: 'Services' },
      { id: '4', name: 'News' },
      { id: '5', name: 'For Sale' },
      { id: '6', name: 'Housing' },
      { id: '7', name: 'Jobs' },
      { id: '8', name: 'Discussion' }
    ];
  }
}

export async function fetchLocations(): Promise<string[]> {
  try {
    const response = await apiClient.get('/locations');
    return response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    
    // Fallback to mock data if server isn't ready yet
    console.warn('Using mock location data as fallback');
    return ['Erode', 'Coimbatore', 'Tiruppur', 'Salem'];
  }
}
