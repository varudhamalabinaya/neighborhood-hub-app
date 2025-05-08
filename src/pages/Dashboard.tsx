
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PostCard from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchPosts } from "@/lib/api";
import { Post } from "@/lib/types";

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const allPosts = await fetchPosts();
        // Filter posts for the current user
        const userPosts = user ? allPosts.filter((post) => post.userId === user.id) : [];
        setPosts(userPosts);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadPosts();
    }
  }, [user]);

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  if (!isAuthenticated || !user) {
    return null; // Redirect will happen due to the useEffect
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your posts and account settings
            </p>
          </div>
          <Button onClick={() => navigate("/create-post")}>
            <Plus className="mr-2 h-4 w-4" /> Create Post
          </Button>
        </div>

        <Tabs defaultValue="my-posts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="my-posts">My Posts</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="my-posts" className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard key={post.id} post={post} onPostUpdate={handlePostUpdate} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't created any posts yet. Share an update with your community!
                    </p>
                    <Button onClick={() => navigate("/create-post")}>
                      <Plus className="mr-2 h-4 w-4" /> Create Your First Post
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          <TabsContent value="saved" className="space-y-4">
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Saved Posts</h3>
              <p className="text-muted-foreground">
                Coming soon! You'll be able to save posts for later.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="activity" className="space-y-4">
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Activity Feed</h3>
              <p className="text-muted-foreground">
                Coming soon! Track engagement on your posts.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
