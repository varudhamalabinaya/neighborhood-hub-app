
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchCategories, fetchLocations, fetchPostById, updatePost } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Category, Post } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }).max(100, {
    message: "Title must not exceed 100 characters."
  }),
  content: z.string().min(20, {
    message: "Content must be at least 20 characters.",
  }).max(2000, {
    message: "Content must not exceed 2000 characters."
  }),
  category: z.string({ 
    required_error: "Please select a category."
  }),
  location: z.string({
    required_error: "Please select a location."
  }),
});

type FormData = z.infer<typeof formSchema>;

interface EditPostFormProps {
  postId: string;
}

const EditPostForm = ({ postId }: EditPostFormProps) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [post, setPost] = useState<Post | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      location: "",
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to edit this post.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [isAuthenticated, navigate, toast]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [postData, categoriesData, locationsData] = await Promise.all([
          fetchPostById(postId),
          fetchCategories(),
          fetchLocations(),
        ]);
        
        if (!postData) {
          toast({
            title: "Error",
            description: "Post not found",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        // Check if user is authorized to edit this post
        if (user && postData.userId !== user.id) {
          toast({
            title: "Unauthorized",
            description: "You can only edit your own posts",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setPost(postData);
        setCategories(categoriesData);
        setLocations(locationsData);

        // Set form values
        form.reset({
          title: postData.title,
          content: postData.content,
          category: postData.category,
          location: postData.location,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load post data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [postId, user, form, navigate, toast]);

  const onSubmit = async (data: FormData) => {
    if (!user || !post) return;
    
    setIsLoading(true);
    try {
      const updatedPost = await updatePost(postId, {
        title: data.title,
        content: data.content,
        category: data.category,
        location: data.location,
      });
      
      toast({
        title: "Success",
        description: "Your post has been updated!",
      });
      
      navigate(`/post/${postId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !post) {
    return (
      <Card>
        <CardHeader>
          <div className="h-8 bg-muted animate-pulse rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-muted animate-pulse rounded"></div>
            <div className="h-32 bg-muted animate-pulse rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-10 bg-muted animate-pulse rounded"></div>
              <div className="h-10 bg-muted animate-pulse rounded"></div>
            </div>
            <div className="h-10 bg-muted animate-pulse rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Your Post</CardTitle>
        <CardDescription>
          Update your post details and content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="What's this post about?" {...field} />
                  </FormControl>
                  <FormDescription>
                    Be clear and specific in your title.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share the details here..." 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Include all relevant information in your post.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button type="button" variant="outline" className="sm:flex-1" onClick={() => navigate(`/post/${postId}`)}>
                Cancel
              </Button>
              <Button type="submit" className="sm:flex-1" disabled={isLoading}>
                {isLoading ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditPostForm;
