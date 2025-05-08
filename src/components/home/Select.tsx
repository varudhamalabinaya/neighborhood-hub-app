
import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const Select = ({ value, onValueChange }: SelectProps) => {
  return (
    <SelectComponent value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full md:w-[150px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="recent">Most Recent</SelectItem>
        <SelectItem value="popular">Most Popular</SelectItem>
      </SelectContent>
    </SelectComponent>
  );
};

export default Select;
