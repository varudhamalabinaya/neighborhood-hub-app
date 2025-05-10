
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection String
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://bharanidharanabinaya:49gwbSUzNS2TaS88@locallens.8fpyu0h.mongodb.net/locallens";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Call the connect function
connectDB();

// Define basic models
// User Model
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  avatar: String,
  bio: String,
  location: String,
  badges: [String]
});

const User = mongoose.model('User', UserSchema);

// Post Model
const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  thankCount: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  thankedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const Post = mongoose.model('Post', PostSchema);

// Category Model
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  icon: String
});

const Category = mongoose.model('Category', CategorySchema);

// Define routes
// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password, // In production, hash this password with bcrypt
      avatar: `https://source.unsplash.com/random/100x100/?person&${Date.now()}`
    });

    await user.save();

    // Create a simple token (in production, use JWT)
    const token = user._id.toString();

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        avatar: user.avatar,
        badges: user.badges || [],
        location: user.location
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Verify password (in production, compare hashed passwords)
    if (password !== user.password) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create token
    const token = user._id.toString();

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        avatar: user.avatar,
        badges: user.badges || [],
        location: user.location
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.get('/api/auth/user', async (req, res) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token (in production, verify JWT)
    const user = await User.findById(token).select('-password');
    if (!user) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      avatar: user.avatar,
      badges: user.badges || [],
      location: user.location
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Post Routes
app.get('/api/posts', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.location) filter.location = req.query.location;

    const posts = await Post.find(filter).sort({ date: -1 });
    
    // Format posts with author information
    const postsWithAuthor = await Promise.all(
      posts.map(async post => {
        const user = await User.findById(post.userId);
        return {
          id: post._id,
          title: post.title,
          content: post.content,
          category: post.category,
          location: post.location,
          date: post.date,
          userId: post.userId,
          author: {
            username: user ? user.username : 'Unknown User',
            avatar: user ? user.avatar : 'https://source.unsplash.com/random/100x100/?person'
          },
          thankCount: post.thankCount,
          comments: post.comments,
          thankedByUser: false // Default value for non-authenticated requests
        };
      })
    );

    res.json(postsWithAuthor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const user = await User.findById(token);
    if (!user) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      location: req.body.location,
      userId: user._id,
      thankedBy: []
    });
    
    const post = await newPost.save();
    
    res.json({
      id: post._id,
      title: post.title,
      content: post.content,
      category: post.category,
      location: post.location,
      date: post.date,
      userId: post.userId,
      author: {
        username: user.username,
        avatar: user.avatar
      },
      thankCount: post.thankCount,
      comments: post.comments,
      thankedByUser: false
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Categories Route
app.get('/api/categories', async (req, res) => {
  try {
    let categories = await Category.find();
    
    // If no categories found, create default ones
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Events' },
        { name: 'Lost & Found' },
        { name: 'Services' },
        { name: 'News' },
        { name: 'For Sale' },
        { name: 'Housing' },
        { name: 'Jobs' },
        { name: 'Discussion' }
      ];
      
      categories = await Category.insertMany(defaultCategories);
    }
    
    res.json(categories.map(cat => ({
      id: cat._id,
      name: cat.name,
      icon: cat.icon
    })));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Locations Route
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await Post.distinct('location');
    
    // If no locations found, return default set
    if (locations.length === 0) {
      return res.json(['Erode', 'Coimbatore', 'Tiruppur', 'Salem']);
    }
    
    res.json(locations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
