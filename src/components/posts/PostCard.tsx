
import { useState } from "react";
import { Post } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { thankPost } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  onPostUpdate?: (updatedPost: Post) => void;
}

const PostCard = ({ post, onPostUpdate }: PostCardProps) => {
  const [thanking, setThanking] = useState(false);
  const { toast } = useToast();

  const handleThankPost = async () => {
    if (thanking) return;
    
    setThanking(true);
    try {
      const updatedPost = await thankPost(post.id);
      if (updatedPost && onPostUpdate) {
        onPostUpdate(updatedPost);
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

  return (
    <Card className="post-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author.avatar} alt={post.author.username} />
              <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{post.author.username}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(post.date), { addSuffix: true })}
                </span>
                <span className="mx-1">•</span>
                <span>{post.location}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-muted/50 hover:bg-muted">
            {post.category}
          </Badge>
        </div>
        <Link to={`/post/${post.id}`} className="hover:underline">
          <h3 className="text-lg font-semibold mt-3">{post.title}</h3>
        </Link>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{post.content}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "hover:text-primary gap-1 flex items-center px-2", 
              post.thankedByUser && "text-primary"
            )}
            onClick={handleThankPost}
            disabled={thanking}
          >
            <Heart className={cn("h-4 w-4", post.thankedByUser && "fill-current")} />
            <span>{post.thankCount}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="hover:text-primary gap-1 flex items-center px-2"
            asChild
          >
            <Link to={`/post/${post.id}`}>
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments}</span>
            </Link>
          </Button>
        </div>
        <Link 
          to={`/post/${post.id}`}
          className="text-xs text-primary hover:underline font-medium"
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
