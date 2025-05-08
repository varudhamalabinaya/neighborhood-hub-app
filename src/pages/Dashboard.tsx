
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchPosts, deletePost } from "@/lib/api";
import { Post } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  const handleDeletePost = async (id: string) => {
    try {
      const success = await deletePost(id);
      if (success) {
        setPosts(posts.filter(post => post.id !== id));
        toast({
          title: "Success",
          description: "Post deleted successfully",
        });
      } else {
        throw new Error("Failed to delete post");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const PostItem = ({ post }: { post: Post }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const onDelete = async () => {
      setIsDeleting(true);
      await handleDeletePost(post.id);
      setIsDeleting(false);
    };

    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author.avatar} alt={post.author.username} />
                <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{post.author.username}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.date), { addSuffix: true })}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="bg-muted/50">
              {post.category}
            </Badge>
          </div>
          <Link to={`/post/${post.id}`} className="hover:underline">
            <h3 className="text-lg font-semibold mt-3">{post.title}</h3>
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-sm line-clamp-3">{post.content}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Location: {post.location}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="gap-1"
              asChild
            >
              <Link to={`/edit-post/${post.id}`}>
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-1">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your post.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={onDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>
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
                    <PostItem key={post.id} post={post} />
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
