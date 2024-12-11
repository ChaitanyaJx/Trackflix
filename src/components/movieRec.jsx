import { Card, CardContent } from "@/components/ui/card";
import { Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MovieRec({ movies, onWatchlistToggle }) {
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [recentMovies, setRecentMovies] = useState([]);

  // Get unique genres and languages
  const genres = [...new Set(movies.flatMap((movie) => movie.genre))];
  const languages = [...new Set(movies.map((movie) => movie.language))];

  useEffect(() => {
    const filtered = movies
      .filter(
        (movie) =>
          (selectedGenre === "all" || movie.genre.includes(selectedGenre)) &&
          (selectedLanguage === "all" ||
            movie.language.includes(selectedLanguage)),
      )
      .sort((a, b) => b.year - a.year)
      .slice(0, 5);

    setRecentMovies(filtered);
  }, [movies, selectedGenre, selectedLanguage]);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">
          Recommended For You
        </h2>
        <div className="flex gap-2">
          <Select onValueChange={setSelectedGenre} value={selectedGenre}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setSelectedLanguage} value={selectedLanguage}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languages.map((language) => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentMovies.map((movie) => (
          <Card
            key={movie.imdbID}
            className="glass-effect hover:animate-glow transition-all duration-300"
          >
            <div className="relative h-[200px]">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover rounded-t-lg"
                onError={(e) => {
                  e.target.src = "/placeholder.jpg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-500/80 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-sm font-semibold">
                  {movie.imdbRating}
                </span>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-white mb-1 truncate">
                {movie.title}
              </h3>
              <p className="text-sm text-gray-400 mb-2">{movie.year}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {movie.genre.slice(0, 2).map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                onClick={() => onWatchlistToggle(movie.title)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to Watchlist
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
