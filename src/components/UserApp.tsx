import React, { useState, useEffect, useMemo } from 'react';
import { Film, Search, LogOut, Bookmark, X, Play, Star } from 'lucide-react';
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

// Landing page shown to guests before login
const LandingPage: React.FC<{ onShowAuth: (mode: 'login' | 'register') => void }> = ({ onShowAuth }) => {
  const movies = getMovies();
  const featured = movies[0] || null;

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <Film size={28} />
          <span>CineStream</span>
        </div>
        <div className="landing-nav-actions">
          <button className="btn btn-ghost" onClick={() => onShowAuth('login')}>Sign In</button>
          <button className="btn btn-primary" onClick={() => onShowAuth('register')}>Sign Up Free</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        className="landing-hero"
        style={{
          backgroundImage: featured?.thumbnailUrl
            ? `linear-gradient(to bottom, rgba(10,10,20,0.5) 0%, rgba(10,10,20,0.85) 60%, rgba(10,10,20,1) 100%), url(${featured.thumbnailUrl})`
            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      >
        <div className="landing-hero-content">
          {featured && (
            <>
              <div className="landing-hero-badge">🔥 Featured</div>
              <h1 className="landing-hero-title">{featured.title}</h1>
              <p className="landing-hero-desc">{featured.description?.slice(0, 120)}...</p>
              <div className="landing-hero-meta">
                <span><Star size={14} fill="gold" color="gold" /> {featured.rating}/10</span>
                <span>{featured.year}</span>
                <span>{featured.genre}</span>
              </div>
            </>
          )}
          {!featured && (
            <>
              <h1 className="landing-hero-title">Unlimited Movies, Anytime</h1>
              <p className="landing-hero-desc">Stream the best movies from around the world. Sign up free and start watching today.</p>
            </>
          )}
          <div className="landing-hero-buttons">
            <button className="btn btn-primary btn-lg" onClick={() => onShowAuth('register')}>
              <Play size={18} fill="white" /> Get Started Free
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => onShowAuth('login')}>
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Movies Preview Grid */}
      {movies.length > 0 && (
        <div className="landing-movies">
          <h2 className="landing-section-title">🎬 Popular Movies</h2>
          <div className="landing-movie-grid">
            {movies.slice(0, 8).map((movie) => (
              <div key={movie.id} className="landing-movie-card" onClick={() => onShowAuth('register')}>
                <div className="landing-movie-thumb">
                  {movie.thumbnailUrl ? (
                    <img src={movie.thumbnailUrl} alt={movie.title} />
                  ) : (
                    <div className="landing-movie-placeholder">
                      <Film size={32} />
                    </div>
                  )}
                  <div className="landing-movie-overlay">
                    <Play size={36} fill="white" color="white" />
                  </div>
                  <div className="landing-movie-rating">
                    <Star size={12} fill="gold" color="gold" /> {movie.rating}
                  </div>
                </div>
                <p className="landing-movie-title">{movie.title}</p>
                <p className="landing-movie-year">{movie.year} · {movie.genre}</p>
              </div>
            ))}
          </div>
          <div className="landing-cta">
            <p>Sign up free to watch all movies</p>
            <button className="btn btn-primary btn-lg" onClick={() => onShowAuth('register')}>
              Create Free Account
            </button>
          </div>
        </div>
      )}

      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <Film size={20} /> <span>CineStream</span>
        </div>
        <p>© 2025 CineStream. All rights reserved.</p>
      </footer>
    </div>
  );
};

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
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);

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

  // Show landing page if not logged in
  if (!user) {
    if (authMode !== null) {
      return (
        <div className="auth-page" style={{ position: 'relative' }}>
          <button
            onClick={() => setAuthMode(null)}
            style={{
              position: 'absolute', top: 16, left: 16, background: 'none',
              border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 6, zIndex: 10,
            }}
          >
            ← Back
          </button>
          <AuthForm
            onAuth={(u) => { setUser(u); setAuthMode(null); }}
            defaultMode={authMode}
          />
        </div>
      );
    }
    return <LandingPage onShowAuth={(mode) => setAuthMode(mode)} />;
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
