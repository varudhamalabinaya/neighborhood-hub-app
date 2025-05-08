
import { useState, useEffect } from "react";
import { Category } from "@/lib/types";
import { fetchCategories } from "@/lib/api";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  onSelectCategory: (category: string | null) => void;
  selectedCategory: string | null;
}

const CategoryFilter = ({ onSelectCategory, selectedCategory }: CategoryFilterProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, []);

  return (
    <ScrollArea className="w-full whitespace-nowrap py-2">
      <div className="flex space-x-2">
        <Badge 
          variant="outline"
          className={cn(
            "cursor-pointer hover:bg-muted py-1 px-3 hover:text-foreground",
            !selectedCategory && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={() => onSelectCategory(null)}
        >
          All
        </Badge>
        
        {loading ? (
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-16 animate-pulse bg-muted rounded-full" />
            ))}
          </div>
        ) : (
          categories.map((category) => (
            <Badge
              key={category.id}
              variant="outline"
              className={cn(
                "cursor-pointer hover:bg-muted py-1 px-3",
                selectedCategory === category.name && 
                "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              onClick={() => onSelectCategory(category.name)}
            >
              {category.name}
            </Badge>
          ))
        )}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default CategoryFilter;
