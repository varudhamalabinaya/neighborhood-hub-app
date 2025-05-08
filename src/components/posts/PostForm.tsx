
import { useState } from "react";
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
import { createPost } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { fetchCategories, fetchLocations } from "@/lib/api";
import { Category } from "@/lib/types";

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

const PostForm = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      location: user?.location || "",
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to create a post.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [isAuthenticated, navigate, toast]);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [categoriesData, locationsData] = await Promise.all([
          fetchCategories(),
          fetchLocations(),
        ]);
        setCategories(categoriesData);
        setLocations(locationsData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load form data",
          variant: "destructive",
        });
      }
    };

    loadFormData();
  }, [toast]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const newPost = await createPost({
        title: data.title,
        content: data.content,
        category: data.category,
        location: data.location,
        userId: user.id,
      });
      
      toast({
        title: "Success",
        description: "Your post has been created!",
      });
      
      navigate(`/post/${newPost.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Post</CardTitle>
        <CardDescription>
          Share updates, ask questions, or connect with your local community.
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
                      defaultValue={field.value}
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
                      defaultValue={field.value}
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Posting..." : "Submit Post"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PostForm;
