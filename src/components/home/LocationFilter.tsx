
import { useState, useEffect } from "react";
import { fetchLocations } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationFilterProps {
  onSelectLocation: (location: string | null) => void;
  selectedLocation: string | null;
}

const LocationFilter = ({ onSelectLocation, selectedLocation }: LocationFilterProps) => {
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLocations = async () => {
      try {
        const data = await fetchLocations();
        setLocations(data);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      } finally {
        setLoading(false);
      }
    };

    getLocations();
  }, []);

  return (
    <Select 
      value={selectedLocation || "all"} 
      onValueChange={(value) => onSelectLocation(value === "all" ? null : value)}
    >
      <SelectTrigger className="w-full md:w-[180px]">
        <SelectValue placeholder="Filter by location" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Locations</SelectItem>
        {!loading &&
          locations.map((location) => (
            <SelectItem key={location} value={location}>
              {location}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
};

export default LocationFilter;
