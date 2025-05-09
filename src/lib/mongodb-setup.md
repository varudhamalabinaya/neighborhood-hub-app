
# MongoDB Integration Instructions

Since the `package.json` file is read-only in this environment, you'll need to set up the MongoDB backend separately. Here's how to proceed:

## Backend Setup (In a Separate Project)

1. Create a new directory for your backend:
```bash
mkdir locallens-backend
cd locallens-backend
```

2. Initialize a new Node.js project:
```bash
npm init -y
```

3. Install required dependencies:
```bash
npm install express mongoose bcryptjs jsonwebtoken dotenv cors
npm install -D nodemon
```

4. Create the basic file structure:
```
locallens-backend/
├── config/
│   └── db.js
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   ├── Post.js
│   └── Category.js
├── routes/
│   ├── auth.js
│   ├── posts.js
│   ├── categories.js
│   └── locations.js
├── .env
└── server.js
```

5. Configure your `.env` file with:
```
MONGODB_URI=your_mongodb_connection_url
JWT_SECRET=your_jwt_secret
PORT=5000
```

6. In `config/db.js`:
```javascript
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

7. Create a User model in `models/User.js`:
```javascript
const mongoose = require('mongoose');

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

module.exports = mongoose.model('User', UserSchema);
```

8. Create a Post model in `models/Post.js`:
```javascript
const mongoose = require('mongoose');

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

module.exports = mongoose.model('Post', PostSchema);
```

9. Create a Category model in `models/Category.js`:
```javascript
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  icon: String
});

module.exports = mongoose.model('Category', CategorySchema);
```

10. Create auth middleware in `middleware/auth.js`:
```javascript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
```

11. Create auth routes in `routes/auth.js`:
```javascript
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      username,
      email,
      password,
      avatar: `https://source.unsplash.com/random/100x100/?person&${Date.now()}`
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        const userToReturn = {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          avatar: user.avatar,
          badges: user.badges || [],
          location: user.location
        };
        res.json({ token, user: userToReturn });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        const userToReturn = {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          avatar: user.avatar,
          badges: user.badges || [],
          location: user.location
        };
        res.json({ token, user: userToReturn });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
```

12. Create post routes in `routes/posts.js`:
```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

// @route   GET /api/posts
// @desc    Get all posts
// @access  Public
router.get('/', async (req, res) => {
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
            avatar: user ? user.avatar : null
          },
          thankCount: post.thankCount,
          comments: post.comments,
          thankedByUser: req.user ? post.thankedBy.includes(req.user.id) : false
        };
      })
    );

    res.json(postsWithAuthor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/posts/:id
// @desc    Get post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    const user = await User.findById(post.userId);
    
    const formattedPost = {
      id: post._id,
      title: post.title,
      content: post.content,
      category: post.category,
      location: post.location,
      date: post.date,
      userId: post.userId,
      author: {
        username: user ? user.username : 'Unknown User',
        avatar: user ? user.avatar : null
      },
      thankCount: post.thankCount,
      comments: post.comments,
      thankedByUser: req.user ? post.thankedBy.includes(req.user.id) : false
    };
    
    res.json(formattedPost);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   POST /api/posts
// @desc    Create a post
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      location: req.body.location,
      userId: req.user.id,
      thankedBy: []
    });
    
    const post = await newPost.save();
    
    const formattedPost = {
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
    };
    
    res.json(formattedPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    // Check post exists
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check user owns the post
    if (post.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await post.remove();
    
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    // Check post exists
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check user owns the post
    if (post.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Update fields
    const { title, content, category, location } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (location) post.location = location;
    
    await post.save();
    
    const user = await User.findById(post.userId);
    
    const updatedPost = {
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
      thankedByUser: post.thankedBy.includes(req.user.id)
    };
    
    res.json(updatedPost);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/posts/:id/thank
// @desc    Thank/unthank a post
// @access  Private
router.put('/:id/thank', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    // Check post exists
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check if already thanked
    const alreadyThanked = post.thankedBy.includes(req.user.id);
    
    if (alreadyThanked) {
      // Remove thank
      post.thankedBy = post.thankedBy.filter(
        userId => userId.toString() !== req.user.id
      );
      post.thankCount--;
    } else {
      // Add thank
      post.thankedBy.push(req.user.id);
      post.thankCount++;
    }
    
    await post.save();
    
    const user = await User.findById(post.userId);
    
    const updatedPost = {
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
      thankedByUser: !alreadyThanked
    };
    
    res.json(updatedPost);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    res.status(500).send('Server error');
  }
});

module.exports = router;
```

13. Create category routes in `routes/categories.js`:
```javascript
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
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

// @route   POST /api/categories
// @desc    Create a category
// @access  Private (admin only in a real app)
router.post('/', auth, async (req, res) => {
  try {
    const newCategory = new Category({
      name: req.body.name,
      icon: req.body.icon
    });

    const category = await newCategory.save();
    res.json({
      id: category._id,
      name: category.name,
      icon: category.icon
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
```

14. Create location routes in `routes/locations.js`:
```javascript
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// @route   GET /api/locations
// @desc    Get all unique locations from posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const locations = await Post.distinct('location');
    
    // If no locations found yet, return a default set
    if (locations.length === 0) {
      return res.json(['Erode', 'Coimbatore', 'Tiruppur', 'Salem']);
    }
    
    res.json(locations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
```

15. Create the server file in `server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/locations', require('./routes/locations'));

// Welcome route
app.get('/', (req, res) => {
  res.send('LocalLens API is running');
});

// Define PORT
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
```

16. Update your package.json:
```json
{
  "name": "locallens-backend",
  "version": "1.0.0",
  "description": "Backend for LocalLens community app",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^6.9.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

17. Start your server:
```bash
npm run dev
```

## Frontend Integration

1. Create a `.env` file in your frontend project with:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

2. The API client (src/lib/api.ts) has been updated to work with your MongoDB backend with fallback to mock data during development when the backend isn't available.

With this setup, you'll have a fully functional MongoDB backend for your LocalLens application. When the backend is running, the frontend will communicate with it. When it's not available, it will fall back to using mock data.
