import React, { useState, useEffect, useRef } from 'react';
import { Film, LogOut, Plus, Edit, Trash2, Save, X, Users, Eye, Star, ArrowLeft, Image, Video, Link, Cloud } from 'lucide-react';
import { Movie } from '../types';
import { getMovies, saveMovies, getUsers, getRatings } from '../store';

const ADMIN_EMAIL = 'admin@cinestream.com';
const ADMIN_PASSWORD = 'admin123';

// Cloudinary config
const CLOUD_NAME = 'dbodkxhew';
const UPLOAD_PRESET = 'ml_default';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

const emptyMovie: Omit<Movie, 'id' | 'dateAdded'> = {
  title: '',
  description: '',
  genre: 'Action',
  year: new Date().getFullYear(),
  rating: 7.0,
  duration: '',
  thumbnailUrl: '',
  videoUrl: '',
  categories: { trending: false, topRated: false, newRelease: false, featured: false },
  views: 0,
};

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Documentary'];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

async function uploadToCloudinary(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('resource_type', 'auto');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_URL);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const res = JSON.parse(xhr.responseText);
        resolve(res.secure_url);
      } else {
        let msg = 'Upload failed';
        try {
          const err = JSON.parse(xhr.responseText);
          msg = err.error?.message || msg;
        } catch {}
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}

const AdminApp: React.FC = () => {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [editing, setEditing] = useState<Movie | null>(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState<Omit<Movie, 'id' | 'dateAdded'>>(emptyMovie);
  const [thumbMode, setThumbMode] = useState<'file' | 'url'>('file');
  const [videoMode, setVideoMode] = useState<'file' | 'url'>('file');
  const [thumbFileName, setThumbFileName] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [thumbPreview, setThumbPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadPercent, setUploadPercent] = useState(0);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [pendingThumbFile, setPendingThumbFile] = useState<File | null>(null);
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);

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

  const handleThumbFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingThumbFile(file);
    setThumbFileName(file.name + ' (' + formatFileSize(file.size) + ')');
    const reader = new FileReader();
    reader.onload = () => setThumbPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingVideoFile(file);
    setVideoFileName(file.name + ' (' + formatFileSize(file.size) + ')');
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;
    setUploading(true);
    setUploadPercent(0);

    const movieId = editing ? editing.id : 'movie-' + Date.now();
    let thumbUrl = formData.thumbnailUrl;
    let vidUrl = formData.videoUrl;

    try {
      // Upload thumbnail to Cloudinary
      if (thumbMode === 'file' && pendingThumbFile) {
        setUploadProgress('Uploading thumbnail to cloud...');
        thumbUrl = await uploadToCloudinary(pendingThumbFile, (pct) => {
          setUploadPercent(pct);
          setUploadProgress(`Uploading thumbnail... ${pct}%`);
        });
      }

      // Upload video to Cloudinary
      if (videoMode === 'file' && pendingVideoFile) {
        setUploadProgress('Uploading video to cloud (0%)...');
        setUploadPercent(0);
        vidUrl = await uploadToCloudinary(pendingVideoFile, (pct) => {
          setUploadPercent(pct);
          setUploadProgress(`Uploading video... ${pct}% (${formatFileSize(pendingVideoFile!.size)})`);
        });
      }

      const updated = [...movies];
      if (editing) {
        const idx = updated.findIndex((m) => m.id === editing.id);
        if (idx > -1) {
          updated[idx] = { ...editing, ...formData, thumbnailUrl: thumbUrl, videoUrl: vidUrl };
          saveMovies(updated);
          setMovies(updated);
        }
      } else if (adding) {
        const newMovie: Movie = {
          ...formData,
          thumbnailUrl: thumbUrl,
          videoUrl: vidUrl,
          id: movieId,
          dateAdded: new Date().toISOString(),
        };
        updated.push(newMovie);
        saveMovies(updated);
        setMovies(updated);
      }

      setUploadProgress('✅ Saved successfully!');
      setTimeout(() => setUploadProgress(''), 2000);
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Upload failed: ' + (err.message || 'Unknown error. Please try again.'));
    }

    setUploading(false);
    setUploadPercent(0);
    setEditing(null);
    setAdding(false);
    setFormData(emptyMovie);
    setPendingThumbFile(null);
    setPendingVideoFile(null);
    setThumbFileName('');
    setVideoFileName('');
    setThumbPreview('');
  };

  const handleDelete = async (id: string) => {
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
      duration: movie.duration,
      thumbnailUrl: movie.thumbnailUrl,
      videoUrl: movie.videoUrl,
      categories: { ...movie.categories },
      views: movie.views,
    });
    const isCloudUrl = movie.thumbnailUrl.startsWith('http');
    const isVideoCloud = movie.videoUrl.startsWith('http');
    setThumbMode(isCloudUrl ? 'url' : 'file');
    setVideoMode(isVideoCloud ? 'url' : 'file');
    setThumbFileName('');
    setVideoFileName('');
    setThumbPreview(isCloudUrl ? movie.thumbnailUrl : '');
    setPendingThumbFile(null);
    setPendingVideoFile(null);
  };

  const startAdd = () => {
    setAdding(true);
    setEditing(null);
    setFormData(emptyMovie);
    setThumbMode('file');
    setVideoMode('file');
    setThumbFileName('');
    setVideoFileName('');
    setThumbPreview('');
    setPendingThumbFile(null);
    setPendingVideoFile(null);
  };

  const cancelForm = () => {
    setEditing(null);
    setAdding(false);
    setFormData(emptyMovie);
    setPendingThumbFile(null);
    setPendingVideoFile(null);
    setThumbFileName('');
    setVideoFileName('');
    setThumbPreview('');
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
            <div className="cloud-badge">
              <Cloud size={14} /> Files upload to Cloudinary (25 GB free cloud storage)
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
              <div className="form-group">
                <label>Duration</label>
                <input type="text" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="2h 15m" />
              </div>
              <div className="form-group form-group-full">
                <label>Description</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>

              {/* Thumbnail Upload */}
              <div className="form-group form-group-full">
                <label>Thumbnail</label>
                <div className="upload-mode-toggle">
                  <button type="button" className={`toggle-btn ${thumbMode === 'file' ? 'active' : ''}`} onClick={() => setThumbMode('file')}>
                    <Cloud size={14} /> Upload to Cloud
                  </button>
                  <button type="button" className={`toggle-btn ${thumbMode === 'url' ? 'active' : ''}`} onClick={() => setThumbMode('url')}>
                    <Link size={14} /> Paste URL
                  </button>
                </div>
                {thumbMode === 'file' ? (
                  <div className="file-upload-area">
                    <input ref={thumbInputRef} type="file" accept="image/*" onChange={handleThumbFileChange} style={{ display: 'none' }} />
                    <button type="button" className="btn btn-upload" onClick={() => thumbInputRef.current?.click()}>
                      <Image size={20} />
                      <span>{thumbFileName || 'Choose Image File'}</span>
                    </button>
                    {thumbPreview && (
                      <div className="upload-preview">
                        <img src={thumbPreview} alt="Preview" className="thumb-preview-img" />
                      </div>
                    )}
                  </div>
                ) : (
                  <input type="url" value={formData.thumbnailUrl} onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })} placeholder="https://example.com/poster.jpg" />
                )}
              </div>

              {/* Video Upload */}
              <div className="form-group form-group-full">
                <label>Video</label>
                <div className="upload-mode-toggle">
                  <button type="button" className={`toggle-btn ${videoMode === 'file' ? 'active' : ''}`} onClick={() => setVideoMode('file')}>
                    <Cloud size={14} /> Upload to Cloud
                  </button>
                  <button type="button" className={`toggle-btn ${videoMode === 'url' ? 'active' : ''}`} onClick={() => setVideoMode('url')}>
                    <Link size={14} /> Paste URL
                  </button>
                </div>
                {videoMode === 'file' ? (
                  <div className="file-upload-area">
                    <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoFileChange} style={{ display: 'none' }} />
                    <button type="button" className="btn btn-upload" onClick={() => videoInputRef.current?.click()}>
                      <Video size={20} />
                      <span>{videoFileName || 'Choose Video File'}</span>
                    </button>
                    {videoFileName && (
                      <div className="upload-file-info">
                        <Video size={16} />
                        <span>{videoFileName}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <input type="url" value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} placeholder="https://example.com/movie.mp4" />
                )}
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

            {/* Upload progress bar */}
            {uploading && uploadPercent > 0 && (
              <div className="upload-progress-container">
                <div className="upload-progress-bar">
                  <div className="upload-progress-fill" style={{ width: `${uploadPercent}%` }} />
                </div>
                <span className="upload-progress-text">{uploadPercent}%</span>
              </div>
            )}

            <div className="admin-form-actions">
              <button className="btn btn-primary" onClick={handleSave} disabled={uploading}>
                {uploading ? (
                  <><span className="spinner" /> {uploadProgress || 'Uploading...'}</>
                ) : (
                  <><Save size={16} /> {editing ? 'Update Movie' : 'Add Movie'}</>
                )}
              </button>
              <button className="btn btn-secondary" onClick={cancelForm} disabled={uploading}>Cancel</button>
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
