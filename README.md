
# LocalLens - Community Notice Board Web App

LocalLens is a digital notice board for neighborhoods, towns, or college campuses. Users can post updates, find services, and connect with locals.

## Features

- User authentication (login/register)
- Create, read, update, and delete community posts
- Filter posts by category and location
- User profiles with badges
- Dashboard for managing personal posts

## Tech Stack

- **Frontend:**
  - React with Hooks
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components
  - React Router for navigation
  - React Query for data fetching

- **Backend (Setup for future implementation):**
  - Node.js + Express.js
  - MongoDB with Mongoose
  - JWT Authentication

## Project Setup

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone this repository:
   ```
   git clone <repo-url>
   cd locallens
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:8080`

### Environment Variables

For a complete backend integration, create a `.env` file in the server directory with:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/locallens
JWT_SECRET=Gz38jZx97_hsy82!Fkls73mS
NODE_ENV=http://localhost:5000
```

## Project Structure

```
/src
  /components            # Reusable UI components
    /auth               # Authentication related components
    /home               # Home page components
    /layout             # Layout components (header, footer)
    /posts              # Post related components
    /ui                 # shadcn UI components
  /contexts             # React contexts (Auth)
  /lib                  # Utility functions and API client
  /pages                # Page components
  App.tsx               # Main application component
  index.css             # Global styles
  main.tsx              # Entry point
```

## Mock Authentication

For the frontend demo, use these credentials:

- Email: `john@example.com`
- Password: `password`

Or

- Email: `jane@example.com`
- Password: `password`

## Development Notes

- The current implementation uses mock API functions in `src/lib/api.ts`
- To connect to a real backend, replace the mock functions with actual API calls
- The project is set up for a future MongoDB/Express backend

## Future Enhancements

- Comments system for posts
- Real-time notifications
- Direct messaging between users
- Post attachments (images, files)
- Advanced search and filtering

## License

This project is licensed under the MIT License.
