import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Eye, Plus, Star, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MovieCard({
  title = "",
  year = "",
  imdbRating = 0,
  genre = [],
  description = "",
  watched = false,
  inWatchlist = false,
  onWatchlistToggle,
  onWatchedToggle,
  onRatingChange,
  language = "",
  poster = "/placeholder.jpg",
  director = "",
  actors = "",
  userRating = 0,
  imdbID,
}) {
  const [currentRating, setCurrentRating] = useState(userRating);
  const [imageError, setImageError] = useState(false);
  const [isHoveringRating, setIsHoveringRating] = useState(false);
  const [tempRating, setTempRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedRating, setHasUnsavedRating] = useState(false); // New state

  useEffect(() => {
    setCurrentRating(userRating);
  }, [userRating]);

  const handleRating = async (rating) => {
    if (!imdbID || isLoading) return;

    setIsLoading(true);
    try {
      const numericRating = Number(rating); // Convert to number explicitly
      setCurrentRating(numericRating);
      if (onRatingChange) {
        await onRatingChange(imdbID, numericRating);
      }
      setHasUnsavedRating(false);
    } catch (error) {
      console.error("Error updating rating:", error);
      setCurrentRating(userRating); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRating = async () => {
    if (!imdbID || isLoading || !hasUnsavedRating) return;

    setIsLoading(true);
    try {
      await onRatingChange(imdbID, currentRating);
      setHasUnsavedRating(false);
    } catch (error) {
      console.error("Error saving rating:", error);
      // Optionally show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchlistToggle = async () => {
    if (!imdbID || isLoading) return;

    setIsLoading(true);
    try {
      if (watched) {
        await onWatchedToggle(imdbID);
        await onWatchlistToggle(imdbID);
      } else {
        await onWatchlistToggle(imdbID);
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchedToggle = async () => {
    if (!imdbID || isLoading) return;

    setIsLoading(true);
    try {
      await onWatchedToggle(imdbID);
    } catch (error) {
      console.error("Error toggling watched status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Card className="relative overflow-hidden border border-green-500/20 bg-black/40 backdrop-blur-sm hover:border-green-500/40 transition-all duration-300 group">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-purple-900/20 to-fuchsia-900/20" />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
          </div>
        )}

        {/* Poster Section */}
        <div className="relative w-full h-[300px]">
          <img
            src={imageError ? "/placeholder.jpg" : poster}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* IMDB Rating Badge */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-yellow-500/80 text-black px-2 py-1 rounded backdrop-blur-sm">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-semibold">{imdbRating.toFixed(1)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>IMDB Rating</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <CardContent className="pt-6 relative z-10">
          {/* Movie Header */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-400">
              {title}
            </h3>
            <p className="text-sm text-gray-400">{year}</p>
          </div>

          {/* Genre Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {genre.map((g) => (
              <span
                key={g}
                className="px-2 py-1 text-xs rounded-full bg-green-950/50 text-green-300 border border-green-500/30"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Movie Details */}
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-300 line-clamp-3">{description}</p>
            <div className="space-y-1 text-sm text-gray-400">
              {director && director !== "N/A" && (
                <p>
                  <span className="font-semibold text-green-400">
                    Director:
                  </span>{" "}
                  {director}
                </p>
              )}
              {actors && actors !== "N/A" && (
                <p>
                  <span className="font-semibold text-green-400">Cast:</span>{" "}
                  {actors}
                </p>
              )}
              {language && language !== "N/A" && (
                <p>
                  <span className="font-semibold text-green-400">
                    Language:
                  </span>{" "}
                  {language}
                </p>
              )}
            </div>
          </div>

          {/* User Rating */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-400">Your Rating:</span>
            <div className="flex flex-1 items-center gap-2">
              <div
                className="flex gap-1"
                onMouseLeave={() => {
                  setIsHoveringRating(false);
                  setTempRating(0);
                }}
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Tooltip key={rating}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        className={`p-0 hover:bg-transparent ${
                          rating <=
                          (isHoveringRating ? tempRating : currentRating)
                            ? "text-green-400 hover:text-green-300"
                            : "text-gray-600 hover:text-gray-500"
                        }`}
                        onClick={() => handleRating(rating)}
                        onMouseEnter={() => {
                          setIsHoveringRating(true);
                          setTempRating(rating);
                        }}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            rating <=
                            (isHoveringRating ? tempRating : currentRating)
                              ? "fill-current"
                              : ""
                          }`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Rate {rating} star{rating !== 1 ? "s" : ""}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>

              {hasUnsavedRating && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      disabled={isLoading}
                      onClick={handleSaveRating}
                      className="ml-2 bg-green-950/50 text-green-400 hover:bg-green-900/50 border border-green-500/50 h-7 px-2"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save rating to database</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </CardContent>

        {/* Card Footer with Action Buttons */}
        <CardFooter className="flex gap-2 border-t border-green-500/20 bg-black/60 backdrop-blur-sm p-4">
          {!watched ? (
            <>
              <Button
                variant="default"
                size="sm"
                disabled={isLoading}
                className="w-1/2 bg-green-950/50 text-green-400 hover:bg-green-900/50 border border-green-500/50"
                onClick={handleWatchedToggle}
              >
                <Eye className="mr-2 h-4 w-4" />
                Mark as Watched
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={isLoading}
                className={`w-1/2 ${
                  inWatchlist
                    ? "bg-fuchsia-950/50 text-fuchsia-400 hover:bg-fuchsia-900/50 border border-fuchsia-500/50"
                    : "bg-purple-950/50 text-purple-400 hover:bg-purple-900/50 border border-purple-500/50"
                }`}
                onClick={handleWatchlistToggle}
              >
                {inWatchlist ? (
                  <>
                    <Trash className="mr-2 h-4 w-4" />
                    Remove from Watchlist
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Watchlist
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="flex gap-2 w-full">
              <Button
                variant="secondary"
                size="sm"
                disabled={isLoading}
                className="w-1/2 bg-green-950/50 text-green-400 hover:bg-green-900/50 border border-green-500/50"
                onClick={handleWatchedToggle}
              >
                <Eye className="mr-2 h-4 w-4" />
                Watched
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={isLoading}
                className="w-1/2 bg-purple-950/50 text-purple-400 hover:bg-purple-900/50 border border-purple-500/50"
                onClick={handleWatchlistToggle}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to Watchlist
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
