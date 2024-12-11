"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SearchBar({ onSearch, genres, languages }) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [language, setLanguage] = useState("all");
  const [minRating, setMinRating] = useState("none");

  const handleSearch = () => {
    // Only perform search if query is not empty
    if (query.trim()) {
      onSearch({
        query,
        genre: genre === "all" ? "" : genre,
        language: language === "all" ? "" : language,
        minRating: minRating === "none" ? 0 : parseFloat(minRating),
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && query.trim()) {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-grow">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-blue-400" />
        <Input
          placeholder="Search movies..."
          className="pl-8 bg-white/10 border-slate-700 text-white placeholder:text-slate-400 focus:border-blue-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filter Movies</SheetTitle>
            <SheetDescription>
              Apply filters to refine your movie search.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <Select onValueChange={setGenre} value={genre}>
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setLanguage} value={language}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setMinRating} value={minRating}>
              <SelectTrigger>
                <SelectValue placeholder="Minimum rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No minimum</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((rating) => (
                  <SelectItem key={rating} value={rating.toString()}>
                    {rating}+
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSearch} disabled={!query.trim()}>
            Apply Filters
          </Button>
        </SheetContent>
      </Sheet>
      <Button onClick={handleSearch} disabled={!query.trim()}>
        Search
      </Button>
    </div>
  );
}
