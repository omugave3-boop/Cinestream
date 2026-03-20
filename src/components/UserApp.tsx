import React, { useState, useEffect, useMemo } from 'react';
import { Film, Search, LogOut, Bookmark, X } from 'lucide-react';
import { User, Movie } from '../types';
import {
  getMovies,
  getCurrentUser,
  setCurrentUser,
  getUserWatchlist,
  toggleWatchlistItem,
  getUserRating,
  setUserRating,
  incrementViews,
} from '../store';
import AuthForm from './AuthForm';
import MovieCard from './MovieCard';
import VideoPlayer from './VideoPlayer';
import StarRating from './StarRating';
import GoogleAd from './GoogleAd';

type Category = 'all' | 'trending' | 'topRated' | 'newRelease' | 'featured' | 'watchlist';
const GENRES = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Documentary'];

const UserApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [movies, setMovies] = useState<Movie[]>(getMovies());
  const [category, setCategory] = useState<Category>('all');
  const [genre, setGenre] = useState('All');
  const [search, setSearch] = useState('');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const [ratingMovie, setRatingMovie] = useState<Movie | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user) {
      setWatchlist(getUserWatchlist(user.id));
    }
  }, [user, refreshKey]);

  useEffect(() => {
    setMovies(getMovies());
  }, [refreshKey]);

  const filteredMovies = useMemo(() => {
    let list = movies;
    if (category === 'trending') list = list.filter((m) => m.categories.trending);
    else if (category === 'topRated') list = list.filter((m) => m.categories.topRated);
    else if (category === 'newRelease') list = list.filter((m) => m.categories.newRelease);
    else if (category === 'featured') list = list.filter((m) => m.categories.featured);
    else if (category === 'watchlist') list = list.filter((m) => watchlist.includes(m.id));

    if (genre !== 'All') list = list.filter((m) => m.genre === genre);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
    }
    return list;
  }, [movies, category, genre, search, watchlist]);

  const handlePlay = (movie: Movie) => {
    incrementViews(movie.id);
    setPlayingMovie(movie);
    setRefreshKey((k) => k + 1);
  };

  const handleToggleWatchlist = (movieId: string) => {
    if (!user) return;
    const updated = toggleWatchlistItem(user.id, movieId);
    setWatchlist(updated);
  };

  const handleRate = (movieId: string, rating: number) => {
    if (!user) return;
    setUserRating(user.id, movieId, rating);
    setRefreshKey((k) => k + 1);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
  };

  if (!user) {
    return <AuthForm onAuth={(u) => setUser(u)} />;
  }

  const categoryLabels: { key: Category; label: string }[] = [
    { key: 'all', label: 'All Movies' },
    { key: 'trending', label: 'Trending' },
    { key: 'topRated', label: 'Top Rated' },
    { key: 'newRelease', label: 'New Releases' },
    { key: 'featured', label: 'Featured' },
    { key: 'watchlist', label: 'My Watchlist' },
  ];

  return (
    <div className="user-app">
      <header className="header">
        <div className="header-inner">
          <div className="header-brand" onClick={() => { setCategory('all'); setGenre('All'); setSearch(''); }}>
            <Film size={28} />
            <span className="brand-name">CineStream</span>
          </div>
          <div className="header-search">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>
                <X size={16} />
              </button>
            )}
          </div>
          <div className="header-user">
            <span className="header-greeting">Hi, {user.name}</span>
            <button className="btn btn-sm btn-ghost" onClick={() => { window.location.hash = '#admin'; }}>Admin</button>
            <button className="btn btn-sm btn-ghost" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="ad-container ad-leaderboard">
        <GoogleAd type="leaderboard" />
      </div>

      <nav className="category-nav">
        <div className="category-nav-inner">
          {categoryLabels.map((c) => (
            <button
              key={c.key}
              className={`category-btn ${category === c.key ? 'active' : ''}`}
              onClick={() => setCategory(c.key)}
            >
              {c.key === 'watchlist' && <Bookmark size={14} />}
              {c.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="main-content">
        <div className="content-area">
          <div className="genre-filter">
            {GENRES.map((g) => (
              <button
                key={g}
                className={`genre-btn ${genre === g ? 'active' : ''}`}
                onClick={() => setGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="results-info">
            <h2>{category === 'watchlist' ? 'My Watchlist' : category === 'all' ? 'All Movies' : categoryLabels.find(c => c.key === category)?.label}</h2>
            <span className="results-count">{filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''}</span>
          </div>

          {filteredMovies.length === 0 ? (
            <div className="empty-state">
              <Film size={48} />
              <h3>No movies found</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="movie-grid">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  inWatchlist={watchlist.includes(movie.id)}
                  onPlay={() => handlePlay(movie)}
                  onToggleWatchlist={() => handleToggleWatchlist(movie.id)}
                  userRating={getUserRating(user.id, movie.id)}
                />
              ))}
            </div>
          )}

          <div className="ad-container ad-banner">
            <GoogleAd type="banner" />
          </div>
        </div>

        <aside className="sidebar">
          <GoogleAd type="sidebar" />
          <div className="sidebar-section">
            <h3>Quick Rate</h3>
            <p className="sidebar-hint">Click a movie below to rate it</p>
            {movies.slice(0, 5).map((movie) => (
              <div
                key={movie.id}
                className="sidebar-rate-item"
                onClick={() => setRatingMovie(movie)}
              >
                <span className="sidebar-rate-title">{movie.title}</span>
                <span className="sidebar-rate-score">
                  {getUserRating(user.id, movie.id) > 0 ? `${getUserRating(user.id, movie.id)}/10` : 'Rate'}
                </span>
              </div>
            ))}
          </div>
          <GoogleAd type="sidebar" />
        </aside>
      </main>

      {playingMovie && (
        <VideoPlayer movie={playingMovie} onClose={() => setPlayingMovie(null)} />
      )}

      {ratingMovie && (
        <div className="rating-modal-overlay" onClick={() => setRatingMovie(null)}>
          <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
            <button className="rating-modal-close" onClick={() => setRatingMovie(null)}>
              <X size={20} />
            </button>
            <h3>Rate: {ratingMovie.title}</h3>
            <p className="rating-modal-year">{ratingMovie.year} · {ratingMovie.genre}</p>
            <StarRating
              rating={getUserRating(user.id, ratingMovie.id)}
              onRate={(r) => {
                handleRate(ratingMovie.id, r);
                setTimeout(() => setRatingMovie(null), 300);
              }}
              size={28}
            />
            <p className="rating-modal-hint">Click a star to rate</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserApp;
