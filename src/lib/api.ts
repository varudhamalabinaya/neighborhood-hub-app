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

// Mock data for when backend isn't available
const mockUsers = [
  {
    id: '1',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123',
    createdAt: new Date().toISOString(),
    avatar: 'https://source.unsplash.com/random/100x100/?portrait',
    location: 'Coimbatore',
    badges: ['Top Contributor', 'Verified Local']
  },
  {
    id: '2',
    username: 'janedoe',
    email: 'jane@example.com',
    password: 'password123',
    createdAt: new Date().toISOString(),
    avatar: 'https://source.unsplash.com/random/100x100/?woman',
    location: 'Erode',
    badges: ['New Member']
  }
];

const mockPosts = [
  {
    id: '1',
    title: 'Community Cleanup Drive This Saturday',
    content: 'Join us for a community cleanup drive at Erode Central Park this Saturday from 9 AM to 12 PM. Bring gloves and water!',
    category: 'Events',
    location: 'Erode',
    date: new Date().toISOString(),
    userId: '1',
    author: {
      username: 'johndoe',
      avatar: 'https://source.unsplash.com/random/100x100/?portrait'
    },
    thankCount: 15,
    comments: 5,
    thankedByUser: false
  },
  {
    id: '2',
    title: 'Found a Black Labrador Near Shopping Mall',
    content: 'I found a black labrador retriever without a collar near GNC Shopping Mall. Very friendly and well-behaved. Contact me if it\'s yours!',
    category: 'Lost & Found',
    location: 'Coimbatore',
    date: new Date(Date.now() - 86400000).toISOString(),
    userId: '2',
    author: {
      username: 'janedoe',
      avatar: 'https://source.unsplash.com/random/100x100/?woman'
    },
    thankCount: 8,
    comments: 3,
    thankedByUser: false
  },
  {
    id: '3',
    title: 'Local Farmer\'s Market Every Sunday',
    content: 'Don\'t miss the weekly farmer\'s market every Sunday at Salem Community Center. Fresh organic produce, handmade crafts, and local delicacies!',
    category: 'News',
    location: 'Salem',
    date: new Date(Date.now() - 172800000).toISOString(),
    userId: '1',
    author: {
      username: 'johndoe',
      avatar: 'https://source.unsplash.com/random/100x100/?portrait'
    },
    thankCount: 24,
    comments: 7,
    thankedByUser: false
  },
  {
    id: '4',
    title: 'Mobile Repair Service at Your Doorstep',
    content: 'Professional mobile phone repair service. We come to your location in Tiruppur area. All brands, affordable rates. Call 9876543210 for appointments.',
    category: 'Services',
    location: 'Tiruppur',
    date: new Date(Date.now() - 259200000).toISOString(),
    userId: '2',
    author: {
      username: 'janedoe',
      avatar: 'https://source.unsplash.com/random/100x100/?woman'
    },
    thankCount: 5,
    comments: 2,
    thankedByUser: false
  }
];

// Auth API functions
export async function loginUser(email: string, password: string): Promise<User> {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data.user;
  } catch (error) {
    console.error('Login error:', error);

    // For development only: Allow mock login when backend isn't available
    if (error.message.includes('Network Error')) {
      console.warn('Using mock login as fallback');
      const mockUser = mockUsers.find(u => u.email === email && u.password === password);
      if (mockUser) {
        const { password, ...userWithoutPassword } = mockUser;
        localStorage.setItem('auth_token', 'mock-token');
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        return userWithoutPassword as User;
      }
    }
    
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

    // For development only: Allow mock registration when backend isn't available
    if (error.message.includes('Network Error')) {
      console.warn('Using mock registration as fallback');
      // Check if email is already used in mock users
      if (mockUsers.some(u => u.email === email)) {
        throw new Error('Email already in use');
      }

      // Create mock user
      const newUser = {
        id: (mockUsers.length + 1).toString(),
        username,
        email,
        password,
        createdAt: new Date().toISOString(),
        avatar: `https://source.unsplash.com/random/100x100/?person&${Date.now()}`,
        location: 'Coimbatore',
        badges: ['New Member']
      };

      const { password: _, ...userWithoutPassword } = newUser;
      mockUsers.push(newUser);
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      return userWithoutPassword as User;
    }
    
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

    // If token is mock-token, we're in development mode
    if (token === 'mock-token') {
      console.warn('Using mock authentication');
      return JSON.parse(userJson);
    }

    // Try to get current user from server to validate token
    try {
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
  } catch (error) {
    console.error('Get current user error:', error);
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
    
    // In development, use mock posts if server isn't available
    if (error.message.includes('Network Error')) {
      console.warn('Using mock posts as fallback');
      if (filters && (filters.category || filters.location)) {
        return mockPosts.filter(post => {
          const categoryMatch = !filters.category || post.category === filters.category;
          const locationMatch = !filters.location || filters.location === 'all' || post.location === filters.location;
          return categoryMatch && locationMatch;
        });
      }
      return [...mockPosts];
    }
    
    throw new Error('Failed to fetch posts');
  }
}

export async function fetchPostById(id: string): Promise<Post | null> {
  try {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data;
  } catch (error) {
    // In development, use mock post if server isn't available
    if (error.message.includes('Network Error')) {
      console.warn('Using mock post as fallback');
      const mockPost = mockPosts.find(post => post.id === id);
      return mockPost || null;
    }
    
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
    
    // In development, create mock post if server isn't available
    if (error.message.includes('Network Error')) {
      console.warn('Using mock post creation as fallback');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Fix the type issue by ensuring avatar is always provided, even if it's a default value
      const newPost: Post = {
        id: (mockPosts.length + 1).toString(),
        title: postData.title,
        content: postData.content,
        category: postData.category,
        location: postData.location,
        date: new Date().toISOString(),
        userId: user.id || '1',
        author: {
          username: user.username || 'Anonymous',
          avatar: user.avatar || 'https://source.unsplash.com/random/100x100/?person' // Default avatar if none provided
        },
        thankCount: 0,
        comments: 0,
        thankedByUser: false
      };
      
      mockPosts.unshift(newPost);
      return newPost;
    }
    
    throw new Error('Failed to create post');
  }
}

export async function deletePost(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/posts/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    
    // In development, delete mock post if server isn't available
    if (error.message.includes('Network Error')) {
      console.warn('Using mock post deletion as fallback');
      const index = mockPosts.findIndex(post => post.id === id);
      if (index !== -1) {
        mockPosts.splice(index, 1);
        return true;
      }
    }
    
    throw new Error('Failed to delete post');
  }
}

export async function updatePost(id: string, updateData: Partial<Post>): Promise<Post | null> {
  try {
    const response = await apiClient.put(`/posts/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating post:', error);
    
    // In development, update mock post if server isn't available
    if (error.message.includes('Network Error')) {
      console.warn('Using mock post update as fallback');
      const index = mockPosts.findIndex(post => post.id === id);
      if (index !== -1) {
        // Ensure avatar is always provided in author
        if (updateData.author && updateData.author.avatar === undefined) {
          if (mockPosts[index].author.avatar) {
            updateData.author.avatar = mockPosts[index].author.avatar;
          } else {
            updateData.author.avatar = 'https://source.unsplash.com/random/100x100/?person';
          }
        }
        
        mockPosts[index] = { ...mockPosts[index], ...updateData };
        return mockPosts[index];
      }
      return null;
    }
    
    throw new Error('Failed to update post');
  }
}

export async function thankPost(id: string): Promise<Post | null> {
  try {
    const response = await apiClient.put(`/posts/${id}/thank`);
    return response.data;
  } catch (error) {
    console.error('Error thanking post:', error);
    
    // In development, thank mock post if server isn't available
    if (error.message.includes('Network Error')) {
      console.warn('Using mock thank functionality as fallback');
      const index = mockPosts.findIndex(post => post.id === id);
      if (index !== -1) {
        if (!mockPosts[index].thankedByUser) {
          mockPosts[index].thankCount += 1;
          mockPosts[index].thankedByUser = true;
        } else {
          mockPosts[index].thankCount -= 1;
          mockPosts[index].thankedByUser = false;
        }
        return mockPosts[index];
      }
      return null;
    }
    
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
