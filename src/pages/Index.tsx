
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import CategoryFilter from "@/components/home/CategoryFilter";
import LocationFilter from "@/components/home/LocationFilter";
import PostCard from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { fetchPosts } from "@/lib/api";
import { Post } from "@/lib/types";
import Select from "@/components/home/Select"; // Add the correct import for the Select component

const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"recent" | "popular">("recent");

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const filters = {
          ...(selectedCategory && { category: selectedCategory }),
          ...(selectedLocation && { location: selectedLocation }),
        };

        const data = await fetchPosts(filters);
        
        // Sort posts based on the selected sort order
        const sortedPosts = [...data].sort((a, b) => {
          if (sortOrder === "recent") {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          } else {
            return b.thankCount - a.thankCount;
          }
        });
        
        setPosts(sortedPosts);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [selectedCategory, selectedLocation, sortOrder]);

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  return (
    <Layout>
      <section className="bg-muted/30 py-12">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Welcome to LocalLens</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Your digital notice board for neighborhood updates, local services, and community connections.
            </p>
            <Button size="lg">Join Your Community</Button>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-auto">
              <CategoryFilter
                onSelectCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
              />
            </div>
            <div className="flex w-full md:w-auto items-center gap-2">
              <LocationFilter
                onSelectLocation={setSelectedLocation}
                selectedLocation={selectedLocation}
              />
              <Select
                value={sortOrder}
                onValueChange={(value) => setSortOrder(value as "recent" | "popular")}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} onPostUpdate={handlePostUpdate} />
                ))
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">No posts found</h3>
                  <p className="text-muted-foreground mt-2">
                    {selectedCategory || selectedLocation
                      ? "Try changing your filters to see more posts."
                      : "Be the first to create a post in your community!"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
