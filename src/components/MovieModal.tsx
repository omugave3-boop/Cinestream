import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Cloud, Check } from 'lucide-react';
import { Movie } from '../types';
import { GENRES } from '../utils/helpers';

declare global {
  interface Window {
    cloudinary: any;
  }
}

interface MovieModalProps {
  movie: Movie | null;
  onSave: (movie: Omit<Movie, 'id' | 'dateAdded'>) => void;
  onClose: () => void;
}

export const MovieModal: React.FC<MovieModalProps> = ({ movie, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('Action');
  const [year, setYear] = useState(2025);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [rating, setRating] = useState(7.0);
  const [duration, setDuration] = useState('');
  const [featured, setFeatured] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const initializeCloudinary = () => {
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/latest/index.js';
    script.async = true;
    document.head.appendChild(script);
  };

  useEffect(() => {
    if (movie) {
      setTitle(movie.title);
      setDescription(movie.description);
      setGenre(movie.genre);
      setYear(movie.year);
      setThumbnailUrl(movie.thumbnailUrl);
      setVideoUrl(movie.videoUrl);
      setRating(movie.rating);
      setDuration(movie.duration);
      setFeatured(movie.categories.featured);
    }
    initializeCloudinary();
  }, [movie]);

  const openCloudinaryWidget = (type: 'image' | 'video') => {
    if (!window.cloudinary) {
      alert('Cloudinary is loading... please try again in a moment');
      return;
    }

    if (type === 'video') setUploadingVideo(true);
    else setUploadingThumbnail(true);

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dbodkxhew',
        uploadPreset: type === 'video' ? 'cinestream_video' : 'cinestream_images',
        maxFileSize: 5 * 1024 * 1024 * 1024,
        multiple: false,
        folder: type === 'video' ? 'cinestream/videos' : 'cinestream/thumbnails',
        resourceType: type === 'video' ? 'video' : 'image',
        showAdvancedOptions: false,
        cropping: false,
        showCompletedButton: true,
      },
      (error: any, result: any) => {
        if (error) {
          console.error('Upload error:', error);
          alert(`Upload failed: ${error?.message || 'Unknown error'}`);
          if (type === 'video') setUploadingVideo(false);
          else setUploadingThumbnail(false);
          return;
        }

        if (result.event === 'success') {
          const url = result.info.secure_url;
          if (type === 'video') {
            setVideoUrl(url);
            setUploadingVideo(false);
          } else {
            setThumbnailUrl(url);
            setUploadingThumbnail(false);
          }
        }
      }
    );

    widget.open();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a movie title');
      return;
    }
    if (!thumbnailUrl.trim()) {
      alert('Please upload a thumbnail');
      return;
    }
    if (!videoUrl.trim()) {
      alert('Please upload a video file');
      return;
    }

    onSave({
      title,
      description,
      genre,
      year,
      thumbnailUrl,
      videoUrl,
      rating,
      duration,
      views: movie?.views || 0,
      categories: {
        trending: movie?.categories.trending || false,
        topRated: movie?.categories.topRated || false,
        newRelease: movie?.categories.newRelease || false,
        featured,
      },
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>
            {movie ? 'Edit Movie' : 'Add New Movie'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '1.5rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Movie title"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Genre *</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Movie description..."
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'inherit',
                height: '100px',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1900}
                max={2030}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Rating</label>
              <input
                type="number"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                min={0}
                max={10}
                step={0.1}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="2h 15m"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Thumbnail *</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {thumbnailUrl ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={thumbnailUrl} alt="Thumbnail" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={14} /> Uploaded
                  </span>
                </div>
              ) : (
                <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-muted)' }}>No thumbnail uploaded</div>
              )}
              <button
                type="button"
                onClick={() => openCloudinaryWidget('image')}
                disabled={uploadingThumbnail}
                style={{
                  padding: '8px 16px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  opacity: uploadingThumbnail ? 0.6 : 1,
                }}
              >
                <Upload size={14} />
                {uploadingThumbnail ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Video File *</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {videoUrl ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cloud size={16} style={{ color: 'var(--success)' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={14} /> Uploaded
                  </span>
                </div>
              ) : (
                <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-muted)' }}>No video uploaded</div>
              )}
              <button
                type="button"
                onClick={() => openCloudinaryWidget('video')}
                disabled={uploadingVideo}
                style={{
                  padding: '8px 16px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  opacity: uploadingVideo ? 0.6 : 1,
                }}
              >
                <Upload size={14} />
                {uploadingVideo ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Supports up to 5GB files • Direct upload to cloud</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label style={{ cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Featured movie</label>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px 20px',
                background: 'var(--border)',
                color: 'var(--text-primary)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '10px 20px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Save size={16} /> {movie ? 'Update Movie' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};