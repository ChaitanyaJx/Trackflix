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
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-400" />
          <Input
            placeholder="Search movies..."
            className="pl-10 h-12 sm:h-10 text-base sm:text-sm bg-black/50 border-cyan-500/50 text-cyan-400 placeholder:text-cyan-400/50 focus:border-cyan-500 focus:ring-cyan-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-12 sm:h-10 aspect-square border-cyan-500/50 hover:bg-cyan-950/50"
              >
                <Filter className="h-5 w-5 text-cyan-400" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[90vw] sm:max-w-md border-cyan-500/50 bg-black/95 backdrop-blur-sm">
              <SheetHeader>
                <SheetTitle className="text-cyan-400">Filter Movies</SheetTitle>
                <SheetDescription className="text-cyan-400/70">
                  Apply filters to refine your movie search.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-6">
                <Select onValueChange={setGenre} value={genre}>
                  <SelectTrigger className="h-12 sm:h-10 bg-black/50 border-cyan-500/50 text-cyan-400">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-cyan-500/50 text-cyan-400">
                    <SelectItem value="all">All Genres</SelectItem>
                    {genres.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={setLanguage} value={language}>
                  <SelectTrigger className="h-12 sm:h-10 bg-black/50 border-cyan-500/50 text-cyan-400">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-cyan-500/50 text-cyan-400">
                    <SelectItem value="all">All Languages</SelectItem>
                    {languages.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={setMinRating} value={minRating}>
                  <SelectTrigger className="h-12 sm:h-10 bg-black/50 border-cyan-500/50 text-cyan-400">
                    <SelectValue placeholder="Minimum rating" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-cyan-500/50 text-cyan-400">
                    <SelectItem value="none">No minimum</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating}+
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSearch}
                disabled={!query.trim()}
                className="w-full h-12 sm:h-10 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50"
              >
                Apply Filters
              </Button>
            </SheetContent>
          </Sheet>

          <Button
            onClick={handleSearch}
            disabled={!query.trim()}
            className="h-12 sm:h-10 px-6 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50"
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
