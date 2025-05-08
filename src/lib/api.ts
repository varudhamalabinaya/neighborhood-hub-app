
// This is a mock API client that would be replaced with actual API calls
import { User, Post, Category } from './types';

// Mock data
const users: User[] = [
  {
    id: '1',
    username: 'johndoe',
    email: 'john@example.com',
    createdAt: '2023-01-15',
    avatar: 'https://i.pravatar.cc/150?u=johndoe',
    location: 'Downtown',
    badges: ['Active User', 'Verified']
  },
  {
    id: '2',
    username: 'janedoe',
    email: 'jane@example.com',
    createdAt: '2023-02-10',
    avatar: 'https://i.pravatar.cc/150?u=janedoe',
    location: 'Uptown',
    badges: ['Verified']
  }
];

const posts: Post[] = [
  {
    id: '1',
    title: 'Community Cleanup This Weekend',
    content: 'Join us for a community cleanup event this Saturday at 10 AM in Central Park. Bring gloves and bags if possible!',
    category: 'Events',
    location: 'Downtown',
    date: '2023-05-10T14:30:00Z',
    userId: '1',
    author: {
      username: 'johndoe',
      avatar: 'https://i.pravatar.cc/150?u=johndoe'
    },
    thankCount: 24,
    comments: 5,
    thankedByUser: false
  },
  {
    id: '2',
    title: 'Lost Cat - Orange Tabby',
    content: 'My orange tabby cat, Whiskers, went missing yesterday near Oak Street. Please contact me if you see him.',
    category: 'Lost & Found',
    location: 'Westside',
    date: '2023-05-12T09:15:00Z',
    userId: '2',
    author: {
      username: 'janedoe',
      avatar: 'https://i.pravatar.cc/150?u=janedoe'
    },
    thankCount: 12,
    comments: 8,
    thankedByUser: true
  },
  {
    id: '3',
    title: 'Free Piano Lessons for Kids',
    content: 'I am offering free piano lessons for children ages 7-12 every Sunday afternoon. Limited spots available!',
    category: 'Services',
    location: 'Downtown',
    date: '2023-05-11T16:45:00Z',
    userId: '1',
    author: {
      username: 'johndoe',
      avatar: 'https://i.pravatar.cc/150?u=johndoe'
    },
    thankCount: 18,
    comments: 3,
    thankedByUser: false
  },
  {
    id: '4',
    title: 'New Coffee Shop Opening',
    content: 'Just wanted to let everyone know that a new coffee shop called "Bean There" is opening next week on Main Street.',
    category: 'News',
    location: 'Uptown',
    date: '2023-05-09T11:20:00Z',
    userId: '2',
    author: {
      username: 'janedoe',
      avatar: 'https://i.pravatar.cc/150?u=janedoe'
    },
    thankCount: 31,
    comments: 12,
    thankedByUser: false
  }
];

const categories: Category[] = [
  { id: '1', name: 'Events' },
  { id: '2', name: 'Lost & Found' },
  { id: '3', name: 'Services' },
  { id: '4', name: 'News' },
  { id: '5', name: 'For Sale' },
  { id: '6', name: 'Housing' },
  { id: '7', name: 'Jobs' },
  { id: '8', name: 'Discussion' }
];

// Mock API functions
export async function loginUser(email: string, password: string): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.email === email);
      if (user && password === 'password') { // In real app, we'd use bcrypt to compare passwords
        localStorage.setItem('auth_token', 'mock_jwt_token');
        localStorage.setItem('user', JSON.stringify(user));
        resolve(user);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 800); // Simulate network delay
  });
}

export async function registerUser(username: string, email: string, password: string): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (users.some(u => u.email === email)) {
        reject(new Error('Email already in use'));
        return;
      }
      
      const newUser: User = {
        id: String(users.length + 1),
        username,
        email,
        createdAt: new Date().toISOString(),
        badges: []
      };
      
      users.push(newUser);
      localStorage.setItem('auth_token', 'mock_jwt_token');
      localStorage.setItem('user', JSON.stringify(newUser));
      resolve(newUser);
    }, 800);
  });
}

export async function logoutUser(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      resolve();
    }, 300);
  });
}

export async function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        resolve(JSON.parse(userJson));
      } else {
        resolve(null);
      }
    }, 300);
  });
}

export async function fetchPosts(filters?: { category?: string; location?: string }): Promise<Post[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredPosts = [...posts];
      
      if (filters?.category) {
        filteredPosts = filteredPosts.filter(post => post.category === filters.category);
      }
      
      if (filters?.location) {
        filteredPosts = filteredPosts.filter(post => post.location === filters.location);
      }
      
      resolve(filteredPosts);
    }, 500);
  });
}

export async function fetchPostById(id: string): Promise<Post | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const post = posts.find(p => p.id === id);
      resolve(post || null);
    }, 300);
  });
}

export async function createPost(postData: Omit<Post, 'id' | 'author' | 'date' | 'thankCount' | 'comments'>): Promise<Post> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userJson = localStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;
      
      const newPost: Post = {
        id: String(posts.length + 1),
        ...postData,
        date: new Date().toISOString(),
        author: {
          username: user?.username || 'Anonymous',
          avatar: user?.avatar
        },
        thankCount: 0,
        comments: 0
      };
      
      posts.unshift(newPost); // Add to the beginning of the array
      resolve(newPost);
    }, 500);
  });
}

export async function deletePost(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = posts.findIndex(p => p.id === id);
      if (index !== -1) {
        posts.splice(index, 1);
        resolve(true);
      } else {
        resolve(false);
      }
    }, 300);
  });
}

export async function updatePost(id: string, updateData: Partial<Post>): Promise<Post | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const post = posts.find(p => p.id === id);
      if (post) {
        const updatedPost = { ...post, ...updateData };
        const index = posts.findIndex(p => p.id === id);
        posts[index] = updatedPost;
        resolve(updatedPost);
      } else {
        resolve(null);
      }
    }, 300);
  });
}

export async function thankPost(id: string): Promise<Post | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const post = posts.find(p => p.id === id);
      if (post) {
        const thanked = post.thankedByUser || false;
        const updatedPost = { 
          ...post, 
          thankCount: thanked ? post.thankCount - 1 : post.thankCount + 1,
          thankedByUser: !thanked
        };
        const index = posts.findIndex(p => p.id === id);
        posts[index] = updatedPost;
        resolve(updatedPost);
      } else {
        resolve(null);
      }
    }, 300);
  });
}

export async function fetchCategories(): Promise<Category[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(categories);
    }, 300);
  });
}

export async function fetchLocations(): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const locations = [...new Set(posts.map(post => post.location))];
      resolve(locations);
    }, 300);
  });
}
