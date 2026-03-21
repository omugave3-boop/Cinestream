import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Header } from './components/Header';
import { UserView } from './components/UserView';
import { AdminPanel } from './components/AdminPanel';
import { AuthScreen } from './components/AuthScreen';
import { Movie, AppView, User, AuthTab } from './types';
import { SAMPLE_MOVIES, escapeSQL, simpleHash } from './utils/helpers';

const INIT_SQL = [
  `CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    genre TEXT,
    year INTEGER,
    thumbnail_url TEXT,
    video_url TEXT,
    rating REAL DEFAULT 0,
    duration TEXT,
    views INTEGER DEFAULT 0,
    featured INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    avatar_color TEXT DEFAULT 'bg-primary',
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    UNIQUE(user_id, movie_id)
  )`,
  `CREATE TABLE IF NOT EXISTS user_ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    UNIQUE(user_id, movie_id)
  )`,
];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('auth');
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showWatchlist, setShowWatchlist] = useState(false);

  const loadMovies = useCallback(async () => {
    try {
      const rows = await window.tasklet.sqlQuery('SELECT * FROM movies ORDER BY created_at DESC');
      setMovies(rows as unknown as Movie[]);
    } catch (err) {
      console.error('Failed to load movies:', err);
    }
  }, []);

  const initDB = useCallback(async () => {
    try {
      for (const sql of INIT_SQL) {
        await window.tasklet.sqlExec(sql);
      }

      // Seed movies
      const movieRows = await window.tasklet.sqlQuery('SELECT COUNT(*) as cnt FROM movies');
      const movieCount = (movieRows[0] as { cnt: number }).cnt;
      if (movieCount === 0) {
        for (const m of SAMPLE_MOVIES) {
          await window.tasklet.sqlExec(`
            INSERT INTO movies (title, description, genre, year, thumbnail_url, video_url, rating, duration, views, featured)
            VALUES (
              '${escapeSQL(m.title)}',
              '${escapeSQL(m.description)}',
              '${escapeSQL(m.genre)}',
              ${m.year},
              '${escapeSQL(m.thumbnail_url)}',
              '${escapeSQL(m.video_url)}',
              ${m.rating},
              '${escapeSQL(m.duration)}',
              ${m.views},
              ${m.featured}
            )
          `);
        }
      }

      // Seed default admin user
      const adminRows = await window.tasklet.sqlQuery("SELECT COUNT(*) as cnt FROM users WHERE role = 'admin'");
      const adminCount = (adminRows[0] as { cnt: number }).cnt;
      if (adminCount === 0) {
        const adminPwd = simpleHash('admin123');
        await window.tasklet.sqlExec(
          `INSERT INTO users (username, email, password, role, avatar_color) VALUES ('Admin', 'admin@cinestream.com', '${adminPwd}', 'admin', 'bg-secondary')`
        );
      }

      await loadMovies();
    } catch (err) {
      console.error('Failed to initialize database:', err);
    } finally {
      setLoading(false);
    }
  }, [loadMovies]);

  // Restore user session from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('cinestream_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        // Set the view based on the user's role
        if (user.role === 'admin') {
          window.location.hash = '#admin';
        } else {
          window.location.hash = '#user';
        }
      } catch (e) {
        console.error('Failed to restore user session:', e);
        localStorage.removeItem('cinestream_user');
      }
    }
  }, []);

  useEffect(() => {
    initDB();
  }, [initDB]);

  // Hash-based routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      // Check localStorage directly in case state hasn't updated yet
      const savedUserStr = localStorage.getItem('cinestream_user');
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      const user = currentUser || savedUser;
      
      if (hash === '#admin') {
        if (user && user.role === 'admin') {
          setView('admin');
        } else {
          setAuthTab('admin-login');
          setView('auth');
        }
      } else if (hash === '#user' || hash === '#browse') {
        if (user) {
          setView('user');
        } else {
          setAuthTab('login');
          setView('auth');
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('cinestream_user', JSON.stringify(user));
    setView('user');
    window.location.hash = '#user';
  };

  const handleAdminLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('cinestream_user', JSON.stringify(user));
    setView('admin');
    window.location.hash = '#admin';
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cinestream_user');
    localStorage.removeItem('cinestream_login'); // Also clear the remember-me credentials
    setView('auth');
    setAuthTab('login');
    setSearchQuery('');
    setShowWatchlist(false);
    window.location.hash = '';
  };

  const handleViewChange = (newView: AppView) => {
    setView(newView);
    setShowWatchlist(false);
    window.location.hash = newView === 'admin' ? '#admin' : '#user';
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="mt-4 text-base-content/60">Loading CineStream...</p>
        </div>
      </div>
    );
  }

  // Auth screen
  if (view === 'auth' || !currentUser) {
    return <AuthScreen onLogin={handleLogin} onAdminLogin={handleAdminLogin} initialTab={authTab} />;
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Header
        currentView={view}
        onViewChange={handleViewChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentUser={currentUser}
        onLogout={handleLogout}
        onWatchlist={() => setShowWatchlist(!showWatchlist)}
        showingWatchlist={showWatchlist}
      />
      {view === 'user' ? (
        <UserView
          movies={movies}
          searchQuery={searchQuery}
          currentUser={currentUser}
          showWatchlist={showWatchlist}
          onClearWatchlist={() => setShowWatchlist(false)}
        />
      ) : (
        <AdminPanel movies={movies} onRefresh={loadMovies} currentUser={currentUser} />
      )}
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
