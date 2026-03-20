import React, { useState, useEffect } from 'react';
import { Film, LogOut, Plus, Edit, Trash2, Save, X, BarChart3, Users, Eye, Star, ArrowLeft } from 'lucide-react';
import { Movie } from '../types';
import { getMovies, saveMovies, getUsers, getRatings } from '../store';

const ADMIN_EMAIL = 'admin@cinestream.com';
const ADMIN_PASSWORD = 'admin123';

const emptyMovie: Omit<Movie, 'id' | 'dateAdded'> = {
  title: '',
  description: '',
  genre: 'Action',
  year: new Date().getFullYear(),
  rating: 7.0,
  thumbnailUrl: '',
  videoUrl: '',
  categories: { trending: false, topRated: false, newRelease: false, featured: false },
  views: 0,
};

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Documentary'];

const AdminApp: React.FC = () => {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [editing, setEditing] = useState<Movie | null>(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState<Omit<Movie, 'id' | 'dateAdded'>>(emptyMovie);

  useEffect(() => {
    if (authed) setMovies(getMovies());
  }, [authed]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setAuthed(true);
      setLoginError('');
    } else {
      setLoginError('Invalid admin credentials');
    }
  };

  const totalUsers = getUsers().length;
  const totalRatings = getRatings().length;
  const totalViews = movies.reduce((sum, m) => sum + m.views, 0);

  const handleSave = () => {
    const updated = [...movies];
    if (editing) {
      const idx = updated.findIndex((m) => m.id === editing.id);
      if (idx > -1) {
        updated[idx] = { ...editing, ...formData };
        saveMovies(updated);
        setMovies(updated);
      }
    } else if (adding) {
      const newMovie: Movie = {
        ...formData,
        id: 'movie-' + Date.now(),
        dateAdded: new Date().toISOString(),
      };
      updated.push(newMovie);
      saveMovies(updated);
      setMovies(updated);
    }
    setEditing(null);
    setAdding(false);
    setFormData(emptyMovie);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;
    const updated = movies.filter((m) => m.id !== id);
    saveMovies(updated);
    setMovies(updated);
  };

  const startEdit = (movie: Movie) => {
    setEditing(movie);
    setAdding(false);
    setFormData({
      title: movie.title,
      description: movie.description,
      genre: movie.genre,
      year: movie.year,
      rating: movie.rating,
      thumbnailUrl: movie.thumbnailUrl,
      videoUrl: movie.videoUrl,
      categories: { ...movie.categories },
      views: movie.views,
    });
  };

  const startAdd = () => {
    setAdding(true);
    setEditing(null);
    setFormData(emptyMovie);
  };

  const cancelForm = () => {
    setEditing(null);
    setAdding(false);
    setFormData(emptyMovie);
  };

  if (!authed) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <Film size={40} className="auth-logo" />
            <h1>Admin Panel</h1>
            <p>Sign in with admin credentials</p>
          </div>
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@cinestream.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {loginError && <div className="auth-error">{loginError}</div>}
            <button type="submit" className="btn btn-primary btn-full">Sign In to Admin</button>
          </form>
          <div className="auth-switch">
            <p><button onClick={() => { window.location.hash = '#user'; }}>← Back to User App</button></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-app">
      <header className="header admin-header">
        <div className="header-inner">
          <div className="header-brand">
            <Film size={28} />
            <span className="brand-name">CineStream</span>
            <span className="admin-badge">Admin</span>
          </div>
          <div className="header-user">
            <button className="btn btn-sm btn-ghost" onClick={() => { window.location.hash = '#user'; }}>
              <ArrowLeft size={16} /> User View
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => setAuthed(false)}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-stats">
          <div className="stat-card">
            <Film size={24} />
            <div>
              <span className="stat-number">{movies.length}</span>
              <span className="stat-label">Total Movies</span>
            </div>
          </div>
          <div className="stat-card">
            <Users size={24} />
            <div>
              <span className="stat-number">{totalUsers}</span>
              <span className="stat-label">Registered Users</span>
            </div>
          </div>
          <div className="stat-card">
            <Eye size={24} />
            <div>
              <span className="stat-number">{totalViews.toLocaleString()}</span>
              <span className="stat-label">Total Views</span>
            </div>
          </div>
          <div className="stat-card">
            <Star size={24} />
            <div>
              <span className="stat-number">{totalRatings}</span>
              <span className="stat-label">Total Ratings</span>
            </div>
          </div>
        </div>

        {(editing || adding) && (
          <div className="admin-form-card">
            <div className="admin-form-header">
              <h2>{editing ? 'Edit Movie' : 'Add New Movie'}</h2>
              <button className="btn btn-sm btn-ghost" onClick={cancelForm}><X size={18} /></button>
            </div>
            <div className="admin-form-grid">
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Genre</label>
                <select value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })}>
                  {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Year</label>
                <input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2025 })} />
              </div>
              <div className="form-group">
                <label>Rating (0-10)</label>
                <input type="number" step="0.1" min="0" max="10" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="form-group form-group-full">
                <label>Description</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Thumbnail URL</label>
                <input type="url" value={formData.thumbnailUrl} onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })} placeholder="https://picsum.photos/seed/name/400/600" />
              </div>
              <div className="form-group">
                <label>Video URL</label>
                <input type="url" value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} placeholder="https://example.com/video.mp4" />
              </div>
              <div className="form-group form-group-full">
                <label>Categories</label>
                <div className="checkbox-group">
                  {(['trending', 'topRated', 'newRelease', 'featured'] as const).map((cat) => (
                    <label key={cat} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.categories[cat]}
                        onChange={(e) => setFormData({
                          ...formData,
                          categories: { ...formData.categories, [cat]: e.target.checked },
                        })}
                      />
                      {cat === 'topRated' ? 'Top Rated' : cat === 'newRelease' ? 'New Release' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="admin-form-actions">
              <button className="btn btn-primary" onClick={handleSave}>
                <Save size={16} /> {editing ? 'Update Movie' : 'Add Movie'}
              </button>
              <button className="btn btn-secondary" onClick={cancelForm}>Cancel</button>
            </div>
          </div>
        )}

        <div className="admin-movies-header">
          <h2>Movies ({movies.length})</h2>
          <button className="btn btn-primary" onClick={startAdd}>
            <Plus size={16} /> Add Movie
          </button>
        </div>

        <div className="admin-movies-table">
          <table>
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Title</th>
                <th>Genre</th>
                <th>Year</th>
                <th>Rating</th>
                <th>Views</th>
                <th>Categories</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id}>
                  <td><img src={movie.thumbnailUrl} alt={movie.title} className="table-thumb" /></td>
                  <td className="table-title">{movie.title}</td>
                  <td>{movie.genre}</td>
                  <td>{movie.year}</td>
                  <td>★ {movie.rating}</td>
                  <td>{movie.views.toLocaleString()}</td>
                  <td className="table-cats">
                    {movie.categories.trending && <span className="mini-badge">Trending</span>}
                    {movie.categories.topRated && <span className="mini-badge">Top</span>}
                    {movie.categories.newRelease && <span className="mini-badge">New</span>}
                    {movie.categories.featured && <span className="mini-badge">Featured</span>}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => startEdit(movie)}><Edit size={14} /></button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(movie.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminApp;
