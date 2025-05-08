
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart, MessageSquare } from "lucide-react";
import { Post } from "@/lib/types";
import { fetchPostById, thankPost } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thanking, setThanking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await fetchPostById(id);
        if (data) {
          setPost(data);
        } else {
          setError("Post not found");
        }
      } catch (error) {
        setError("Failed to load post");
        console.error("Error loading post:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  const handleThankPost = async () => {
    if (!post || thanking) return;
    
    setThanking(true);
    try {
      const updatedPost = await thankPost(post.id);
      if (updatedPost) {
        setPost(updatedPost);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to thank post",
        variant: "destructive",
      });
    } finally {
      setThanking(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error || "Post not found"}</p>
          <Button asChild>
            <Link to="/">Go Back to Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </Button>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post.author.avatar} alt={post.author.username} />
                  <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{post.author.username}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.date), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{post.category}</Badge>
                <Badge variant="outline">{post.location}</Badge>
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
            <p className="text-lg mb-8">{post.content}</p>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-2", 
                    post.thankedByUser && "text-primary border-primary"
                  )}
                  onClick={handleThankPost}
                  disabled={thanking}
                >
                  <Heart className={cn("h-4 w-4", post.thankedByUser && "fill-current")} />
                  <span>{post.thankCount} {post.thankCount === 1 ? "Thank" : "Thanks"}</span>
                </Button>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments} {post.comments === 1 ? "Comment" : "Comments"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Comments</h2>
          
          <div className="text-center py-8 text-muted-foreground">
            <p>Comments feature coming soon!</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PostDetail;
