import { useState, useEffect } from "react";
import { SearchBar } from "@/components/searchBar";
import { MovieCard } from "@/components/movieCard";
import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, X } from "lucide-react";

export default function Discover() {
  const { 
    movies, 
    handleSearch, 
    handleWatchlistToggle, 
    handleWatchedToggle, 
    handleRatingUpdate,
    isLoading,
    error,
    username,
    genres,
    languages,
    clearSearch,
    handleSort,
    sortCriteria,
    sortOrder,
    isSearching
  } = useOutletContext();

  const [sortTitleAscending, setSortTitleAscending] = useState(true);
  const [sortRatingAscending, setSortRatingAscending] = useState(true);

  useEffect(() => {
    if (sortCriteria === "title") {
      setSortTitleAscending(sortOrder === "asc");
    } else if (sortCriteria === "rating") {
      setSortRatingAscending(sortOrder === "asc");
    }
  }, [sortCriteria, sortOrder]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1">
<SearchBar key="search-bar" onSearch={handleSearch} genres={genres} languages={languages} />
        </div>
        <div className="flex gap-2">
          {isSearching && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSearch}
              className="flex items-center gap-1 border-cyan-500/50 hover:bg-cyan-950/50"
            >
              <X className="h-4 w-4" />
              Clear Search
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleSort("title");
              setSortTitleAscending(!sortTitleAscending);
            }}
            className="flex items-center gap-1 border-cyan-500/50 hover:bg-cyan-950/50"
          >
            Title
            <ArrowUpDown
              className={`h-4 w-4 ${sortCriteria === "title" ? (sortTitleAscending ? "" : "rotate-180") : ""}`}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleSort("rating");
              setSortRatingAscending(!sortRatingAscending);
            }}
            className="flex items-center gap-1 border-cyan-500/50 hover:bg-cyan-950/50"
          >
            Rating
            <ArrowUpDown
              className={`h-4 w-4 ${sortCriteria === "rating" ? (sortRatingAscending ? "" : "rotate-180") : ""}`}
            />
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center text-cyan-400 p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-2">Loading movies...</p>
        </div>
      )}

      {error && (
        <div className="text-center text-red-400 p-4 bg-red-950/20 border border-red-500/50 rounded-lg backdrop-blur-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {movies.map((movie) => (
          <MovieCard
            key={movie.imdbID}
            {...movie}
            onWatchlistToggle={() => handleWatchlistToggle(movie.imdbID)}
            onWatchedToggle={() => handleWatchedToggle(movie.imdbID)}
            onRatingChange={(rating) => handleRatingUpdate(movie.imdbID, rating)}
          />
        ))}
      </div>
    </div>
  );
}
