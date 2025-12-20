import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GalleryFiltersProps {
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

const subjects = [
  { value: "all", label: "Alle" },
  { value: "mathematik", label: "Mathe" },
  { value: "deutsch", label: "Deutsch" },
  { value: "englisch", label: "Englisch" },
  { value: "biologie", label: "Bio" },
  { value: "physik", label: "Physik" },
  { value: "chemie", label: "Chemie" },
  { value: "geschichte", label: "Geschichte" },
  { value: "geographie", label: "Geo" },
  { value: "informatik", label: "Info" },
];

export const GalleryFilters = ({ selectedSubject, onSubjectChange }: GalleryFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Filter className="h-4 w-4 text-muted-foreground" />
      {subjects.map((subject) => (
        <Badge
          key={subject.value}
          variant={selectedSubject === subject.value ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={() => onSubjectChange(subject.value)}
        >
          {subject.label}
        </Badge>
      ))}
    </div>
  );
};
