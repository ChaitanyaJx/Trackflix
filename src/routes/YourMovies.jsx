import { MovieCard } from "@/components/movieCard";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function YourMovies() {
  const { 
    seenMovies, 
    handleWatchlistToggle, 
    handleWatchedToggle, 
    handleRatingUpdate 
  } = useOutletContext();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 border-cyan-500/50 hover:bg-cyan-950/50"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Button>
        <h2 className="text-2xl font-semibold text-cyan-400">Your Movies</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {seenMovies.map((movie) => (
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