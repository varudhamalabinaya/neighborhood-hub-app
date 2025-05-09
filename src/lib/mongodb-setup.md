
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

6. Create the MongoDB connection in `config/db.js`
7. Implement the user, post, and category models
8. Implement the authentication middleware
9. Implement all API routes as outlined in the updated API client
10. Start your server with `nodemon server.js`

## Frontend Integration

1. Create a `.env` file in your frontend project with:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

2. The API client (src/lib/api.ts) has been updated to work with your MongoDB backend
3. Both mock data fallbacks and real API calls are implemented

This approach allows you to use MongoDB with your LocalLens application while keeping the package.json file untouched in the web editor environment.
