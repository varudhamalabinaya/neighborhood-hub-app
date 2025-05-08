
# LocalLens - Community Notice Board Web App

LocalLens is a digital notice board for neighborhoods, towns, or college campuses. Users can post updates, find services, and connect with locals.

## Features

- User authentication (register/login)
- Create, edit, and delete posts
- Browse posts with category and location filters
- User dashboard
- Thank/react to posts
- Responsive design with Tailwind CSS

## Tech Stack

- React (with Hooks)
- Tailwind CSS
- Node.js + Express.js (placeholder)
- Mock API with simulated authentication and database operations

## Setup Instructions

### Prerequisites

- Node.js (v16.0.0 or higher)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd locallens
```

2. Install dependencies:
```bash
npm install
```
Or if you use yarn:
```bash
yarn install
```

3. Start the development server:
```bash
npm run dev
```
Or with yarn:
```bash
yarn dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## Project Structure

```
locallens/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/       # Authentication components
│   │   ├── home/       # Homepage components
│   │   ├── layout/     # Layout components (header, footer)
│   │   ├── posts/      # Post-related components
│   │   └── ui/         # Reusable UI components
│   ├── contexts/       # React contexts (auth, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities, API functions, types
│   ├── pages/          # Page components
│   ├── App.tsx         # App component with routes
│   └── main.tsx        # Entry point
└── server.js           # Placeholder for server implementation
```

## Using VS Code

This project is set up to work seamlessly with Visual Studio Code. Here are some recommended extensions:

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

## Backend Development

Currently, the app uses mock API functions in `src/lib/api.ts`. To implement a real backend:

1. Set up a MongoDB database
2. Implement the Express.js API in `server.js`
3. Create proper models for users, posts, etc.
4. Update the API client in `src/lib/api.ts` to use real endpoints

## Environment Variables

Create a `.env` file in the server directory with:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/locallens
JWT_SECRET=Gz38jZx97_hsy82!Fkls73mS 
NODE_ENV=development
```

## Future Enhancements

- Implement real backend with MongoDB
- Add social features (comments, user profiles)
- Add image upload capability
- Add real-time notifications
