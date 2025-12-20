import { motion } from "framer-motion";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardHeaderProps {
  userName: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterSubject: string;
  onFilterChange: (subject: string) => void;
  onCreateClick: () => void;
}

const subjects = [
  { value: "all", label: "Alle Fächer" },
  { value: "mathematik", label: "Mathematik" },
  { value: "deutsch", label: "Deutsch" },
  { value: "englisch", label: "Englisch" },
  { value: "biologie", label: "Biologie" },
  { value: "chemie", label: "Chemie" },
  { value: "physik", label: "Physik" },
  { value: "geschichte", label: "Geschichte" },
  { value: "geografie", label: "Geografie" },
  { value: "informatik", label: "Informatik" },
  { value: "kunst", label: "Kunst" },
  { value: "musik", label: "Musik" },
  { value: "sport", label: "Sport" },
  { value: "allgemein", label: "Allgemein" },
];

export const DashboardHeader = ({
  userName,
  searchQuery,
  onSearchChange,
  filterSubject,
  onFilterChange,
  onCreateClick,
}: DashboardHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Guten Tag, {userName || "Lehrer"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Verwalte deine Lernwelten und erstelle neue Abenteuer
          </p>
        </div>

        <Button
          onClick={onCreateClick}
          className="bg-gradient-to-r from-moon to-aurora text-night-sky hover:opacity-90 shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Neue Lernwelt
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Lernwelten durchsuchen..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-card/50 border-border/50"
          />
        </div>

        <Select value={filterSubject} onValueChange={onFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px] bg-card/50 border-border/50">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Fach filtern" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.value} value={subject.value}>
                {subject.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
};
