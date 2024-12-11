"use client";

import { useState, useEffect } from "react";
import { MovieCard } from "@/components/movieCard";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, LogOut, User } from "lucide-react";
import { loadFromJsonBin, saveToJsonBin, updateUserRating } from "@/utils/api";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Outlet, useNavigate } from "react-router-dom";

const OMDB_API_KEY = "804873cb";

export default function MovieTracker() {
  const [movies, setMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [seenMovies, setSeenMovies] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(
    () => localStorage.getItem("username") || "",
  );
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      loadUserData();
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      saveUserData();
    }
  }, [watchlist, seenMovies]);

  useEffect(() => {
    if (username) {
      setMovies([]);
      setIsSearching(false);
    }
  }, [username]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const userData = await loadFromJsonBin(username);

      if (userData.watchlist && userData.watchlist.length > 0) {
        const watchlistMovies = await Promise.all(
          userData.watchlist.map((movie) =>
            fetch(
              `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${movie.imdbID}`,
            )
              .then((res) => res.json())
              .then((data) => ({
                ...transformOMDBMovie(data),
                inWatchlist: true,
                watched: false,
                userRating: userData.ratings[movie.imdbID] || 0,
                addedAt: movie.addedAt || Date.now(),
              })),
          ),
        );
        setWatchlist(watchlistMovies);
      }

      if (userData.seenMovies && userData.seenMovies.length > 0) {
        const seenMoviesData = await Promise.all(
          userData.seenMovies.map((movie) =>
            fetch(
              `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${movie.imdbID}`,
            )
              .then((res) => res.json())
              .then((data) => ({
                ...transformOMDBMovie(data),
                watched: true,
                inWatchlist: false,
                userRating: userData.ratings[movie.imdbID] || 0,
                addedAt: movie.addedAt || Date.now(),
              })),
          ),
        );
        setSeenMovies(seenMoviesData);
      }
    } catch (error) {
      setError("Failed to load your data. Please try again.");
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserData = async () => {
    if (!username) return;

    try {
      const userData = {
        watchlist: watchlist.map((m) => ({
          imdbID: m.imdbID,
          title: m.title || m.Title,
          addedAt: m.addedAt || Date.now(),
        })),
        seenMovies: seenMovies.map((m) => ({
          imdbID: m.imdbID,
          title: m.title || m.Title,
          addedAt: m.addedAt || Date.now(),
        })),
        ratings: Object.fromEntries(
          [...watchlist, ...seenMovies].map((m) => [
            m.imdbID,
            m.userRating || 0,
          ]),
        ),
      };
      await saveToJsonBin(username, userData);
    } catch (error) {
      console.error("Error saving user data:", error);
      setError("Failed to save your changes. Please try again.");
    }
  };

  const handleLogin = () => {
    setShowLoginDialog(true);
  };

  const handleLoginSubmit = () => {
    if (loginInput) {
      setUsername(loginInput);
      localStorage.setItem("username", loginInput);
      setShowLoginDialog(false);
      setLoginInput("");
    }
  };

  const handleLogout = () => {
    setUsername("");
    localStorage.removeItem("username");
    setWatchlist([]);
    setSeenMovies([]);
    setMovies([]);
    setIsSearching(false);
  };

  const transformOMDBMovie = (omdbMovie) => {
    if (!omdbMovie || !omdbMovie.imdbID) {
      throw new Error("Invalid movie data");
    }

    const existingMovie = [...watchlist, ...seenMovies].find(
      (m) => m.imdbID === omdbMovie.imdbID,
    );

    return {
      title: omdbMovie.Title || "",
      year: omdbMovie.Year || "",
      imdbRating: parseFloat(omdbMovie.imdbRating) || 0,
      genre: omdbMovie.Genre ? omdbMovie.Genre.split(", ") : [],
      description: omdbMovie.Plot || "",
      language: omdbMovie.Language || "",
      director: omdbMovie.Director || "",
      actors: omdbMovie.Actors || "",
      poster:
        omdbMovie.Poster && omdbMovie.Poster !== "N/A"
          ? omdbMovie.Poster
          : "/placeholder.jpg",
      imdbID: omdbMovie.imdbID,
      inWatchlist: watchlist.some((m) => m.imdbID === omdbMovie.imdbID),
      watched: seenMovies.some((m) => m.imdbID === omdbMovie.imdbID),
      userRating: existingMovie ? existingMovie.userRating || 0 : 0,
    };
  };

  const searchOMDB = async ({ query, genre, language, minRating }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${query}&type=movie`,
      );
      const data = await response.json();

      if (data.Error) {
        throw new Error(data.Error);
      }

      if (data.Search) {
        const limitedSearch = data.Search.slice(0, 30);
        const detailedMovies = await Promise.all(
          limitedSearch.map(async (movie) => {
            const detailResponse = await fetch(
              `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${movie.imdbID}`,
            );
            const detailData = await detailResponse.json();
            return transformOMDBMovie(detailData);
          }),
        );

        const filteredMovies = detailedMovies.filter(
          (movie) =>
            (!genre || movie.genre.includes(genre)) &&
            (!language || movie.language.includes(language)) &&
            (!minRating || movie.imdbRating >= minRating),
        );

        setMovies(filteredMovies);
      }
    } catch (error) {
      setError(error.message);
      console.error("Error fetching from OMDB:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchParams) => {
    if (!username) {
      setError("Please sign in to search and track movies.");
      return;
    }
    setIsSearching(true);
    searchOMDB(searchParams);
  };

  const handleRatingUpdate = async (imdbID, rating) => {
    if (!username) return;

    try {
      await updateUserRating(username, imdbID, Number(rating));

      // Update local state
      setWatchlist(
        watchlist.map((m) =>
          m.imdbID === imdbID ? { ...m, userRating: Number(rating) } : m,
        ),
      );
      setSeenMovies(
        seenMovies.map((m) =>
          m.imdbID === imdbID ? { ...m, userRating: Number(rating) } : m,
        ),
      );
      setMovies(
        movies.map((m) =>
          m.imdbID === imdbID ? { ...m, userRating: Number(rating) } : m,
        ),
      );
    } catch (error) {
      console.error("Error updating rating:", error);
      setError("Failed to update rating. Please try again.");
    }
  };
  const handleWatchlistToggle = async (imdbID) => {
    if (!username) return;

    const movie = [...movies, ...watchlist, ...seenMovies].find(
      (m) => m.imdbID === imdbID,
    );

    if (!movie) return;

    if (movie.inWatchlist) {
      setWatchlist(watchlist.filter((m) => m.imdbID !== imdbID));
    } else {
      setWatchlist([
        ...watchlist,
        {
          ...movie,
          inWatchlist: true,
          watched: false,
          addedAt: Date.now(),
        },
      ]);
      if (movie.watched) {
        setSeenMovies(seenMovies.filter((m) => m.imdbID !== imdbID));
      }
    }

    setMovies(
      movies.map((m) =>
        m.imdbID === imdbID
          ? { ...m, inWatchlist: !m.inWatchlist, watched: false }
          : m,
      ),
    );
  };

  const handleWatchedToggle = async (imdbID) => {
    if (!username) return;

    const movie = [...movies, ...watchlist, ...seenMovies].find(
      (m) => m.imdbID === imdbID,
    );

    if (!movie) return;

    if (movie.watched) {
      setSeenMovies(seenMovies.filter((m) => m.imdbID !== imdbID));
    } else {
      setSeenMovies([
        ...seenMovies,
        {
          ...movie,
          watched: true,
          inWatchlist: false,
          addedAt: Date.now(),
        },
      ]);
      setWatchlist(watchlist.filter((m) => m.imdbID !== imdbID));
    }

    setMovies(
      movies.map((m) =>
        m.imdbID === imdbID
          ? { ...m, watched: !m.watched, inWatchlist: false }
          : m,
      ),
    );
  };

  const handleSort = (criteria) => {
    if (criteria === sortCriteria) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortCriteria(criteria);
      setSortOrder("asc");
    }
  };

  const sortMovies = (moviesToSort) => {
    return [...moviesToSort].sort((a, b) => {
      if (sortCriteria === "title") {
        return sortOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortCriteria === "rating") {
        return sortOrder === "asc"
          ? a.imdbRating - b.imdbRating
          : b.imdbRating - a.imdbRating;
      }
      return 0;
    });
  };

  const clearSearch = () => {
    setMovies([]);
    setIsSearching(false);
    setError(null);
  };

  const allMovies = [...movies, ...watchlist, ...seenMovies];
  const genres = [...new Set(allMovies.flatMap((movie) => movie.genre || []))];
  const languages = [
    ...new Set(allMovies.map((movie) => movie.language).filter(Boolean)),
  ];

  return (
    <div className="min-h-screen bg-black relative">
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="bg-black/90 border border-cyan-500/50 backdrop-blur-sm w-[90vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">Sign In</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter your username to track your movies
            </DialogDescription>
          </DialogHeader>
          <Input
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            placeholder="Username"
            className="bg-black/50 border-cyan-500/50 text-cyan-400 placeholder:text-cyan-400/50"
          />
          <Button
            onClick={handleLoginSubmit}
            className="w-full sm:w-auto bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
          >
            Sign In
          </Button>
        </DialogContent>
      </Dialog>

      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-green-900/30 through-purple-900/30 to-fuchsia-900/30" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <header className="mb-8 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <h1
              className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-green-400 to-purple-500 animate-text-glow cursor-pointer"
              onClick={() => navigate("/")}
            >
              TrackFlix
            </h1>

            {username ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-cyan-500/50 hover:bg-cyan-950/50"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/90 border-cyan-500/50 backdrop-blur-sm w-56">
                  <DropdownMenuLabel className="text-cyan-400">
                    Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-cyan-500/20" />
                  <DropdownMenuItem
                    className="text-cyan-400 focus:bg-cyan-950/50 focus:text-cyan-400 cursor-pointer"
                    onClick={() => navigate("/Home")}
                  >
                    Home
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-cyan-400 focus:bg-cyan-950/50 focus:text-cyan-400 cursor-pointer"
                    onClick={() => navigate("/your-movies")}
                  >
                    Your Movies
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-cyan-400 focus:bg-cyan-950/50 focus:text-cyan-400 cursor-pointer"
                    onClick={() => navigate("/watchlist")}
                  >
                    Watchlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-cyan-500/20" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-cyan-400 focus:bg-cyan-950/50 focus:text-cyan-400 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                className="w-full sm:w-auto border-cyan-500/50 hover:bg-cyan-950/50"
                onClick={handleLogin}
              >
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </header>

        <main className="space-y-8 sm:space-y-12">
          {!username && (
            <div className="text-center text-cyan-400 p-4 mx-4 sm:mx-0 bg-cyan-950/20 border border-cyan-500/50 rounded-lg backdrop-blur-sm">
              Please sign in to start tracking movies
            </div>
          )}

          <Outlet
            context={{
              movies: sortMovies(movies),
              watchlist: sortMovies(watchlist),
              seenMovies: sortMovies(seenMovies),
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
              isSearching,
            }}
          />
        </main>
      </div>
    </div>
  );
}
