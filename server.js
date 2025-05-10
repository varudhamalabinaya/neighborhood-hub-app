
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));
app.use(express.json());

// MongoDB Connection String
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "Gz38j2x97_hsy821fklS73mS";

// Connect to MongoDB with proper options
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected Successfully...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Make connection errors more visible
    console.error('Please check your MongoDB connection string and network');
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

// Middleware to validate JWT token
const auth = async (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Define routes
// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    const { username, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      username,
      email,
      password: hashedPassword, // Store hashed password
      avatar: `https://source.unsplash.com/random/100x100/?person&${Date.now()}`
    });

    await user.save();
    console.log('User saved to database:', user.username);

    // Create JWT token
    const payload = {
      id: user._id
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        
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
      }
    );
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).send('Server error during registration');
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create token
    const payload = {
      id: user._id
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        
        console.log('User logged in successfully:', user.username);
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
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server error during login');
  }
});

app.get('/api/auth/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
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
    console.error('Get user error:', err.message);
    res.status(500).send('Server error while getting user');
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
    console.error('Error fetching posts:', err.message);
    res.status(500).send('Server error while getting posts');
  }
});

app.post('/api/posts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
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
    console.log('New post created:', post.title);
    
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
    console.error('Error creating post:', err.message);
    res.status(500).send('Server error while creating post');
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
    console.error('Error fetching categories:', err.message);
    res.status(500).send('Server error while getting categories');
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
    console.error('Error fetching locations:', err.message);
    res.status(500).send('Server error while getting locations');
  }
});

// Thank/Unthank a post
app.put('/api/posts/:id/thank', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check if already thanked
    const thankedIndex = post.thankedBy.indexOf(req.user.id);
    
    if (thankedIndex === -1) {
      // Add thank
      post.thankedBy.push(req.user.id);
      post.thankCount++;
    } else {
      // Remove thank
      post.thankedBy.splice(thankedIndex, 1);
      post.thankCount--;
    }
    
    await post.save();
    
    const author = await User.findById(post.userId);
    
    res.json({
      id: post._id,
      title: post.title,
      content: post.content,
      category: post.category,
      location: post.location,
      date: post.date,
      userId: post.userId,
      author: {
        username: author ? author.username : 'Unknown User',
        avatar: author ? author.avatar : 'https://source.unsplash.com/random/100x100/?person'
      },
      thankCount: post.thankCount,
      comments: post.comments,
      thankedByUser: thankedIndex === -1 // If it wasn't thanked before, it is now
    });
  } catch (err) {
    console.error('Error thanking post:', err.message);
    res.status(500).send('Server error while updating post');
  }
});

// Root route to check if the server is running
app.get('/', (req, res) => {
  res.send('LocalLens API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

