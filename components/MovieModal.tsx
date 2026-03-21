import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Cloud } from 'lucide-react';
import { Movie } from '../types';
import { GENRES, escapeSQL } from '../utils/helpers';

interface MovieModalProps {
  movie: Movie | null; // null = add new
  onSave: (movie: Omit<Movie, 'id' | 'created_at'>) => void;
  onClose: () => void;
}

const CLOUDINARY_CLOUD_NAME = 'dbodkxhew';

// Load Cloudinary widget script
declare global {
  interface Window {
    cloudinary: any;
  }
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

  useEffect(() => {
    if (movie) {
      setTitle(movie.title);
      setDescription(movie.description);
      setGenre(movie.genre);
      setYear(movie.year);
      setThumbnailUrl(movie.thumbnail_url);
      setVideoUrl(movie.video_url);
      setRating(movie.rating);
      setDuration(movie.duration);
      setFeatured(movie.featured === 1);
    }
  }, [movie]);

  // Load Cloudinary widget on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/latest/index.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const openVideoUploadWidget = () => {
    if (!window.cloudinary) {
      alert('Upload widget not loaded. Please refresh and try again.');
      return;
    }

    setUploadingVideo(true);
    window.cloudinary.openUploadWidget(
      {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: 'cinestream_video',
        resourceType: 'video',
        multiple: false,
        folder: 'cinestream/videos',
        maxFileSize: 5368709120, // 5GB
        maxFiles: 1,
      },
      (error: any, result: any) => {
        setUploadingVideo(false);
        if (error) {
          console.error('Upload error:', error);
          alert(`Upload failed: ${error.statusText || error.message}`);
          return;
        }
        if (result?.event === 'success') {
          setVideoUrl(result.info.secure_url);
          alert('✅ Video uploaded successfully!');
        }
      }
    );
  };

  const openThumbnailUploadWidget = () => {
    if (!window.cloudinary) {
      alert('Upload widget not loaded. Please refresh and try again.');
      return;
    }

    setUploadingThumbnail(true);
    window.cloudinary.openUploadWidget(
      {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: 'cinestream_images',
        resourceType: 'image',
        multiple: false,
        folder: 'cinestream/thumbnails',
        maxFileSize: 10485760, // 10MB for images
        maxFiles: 1,
      },
      (error: any, result: any) => {
        setUploadingThumbnail(false);
        if (error) {
          console.error('Upload error:', error);
          alert(`Upload failed: ${error.statusText || error.message}`);
          return;
        }
        if (result?.event === 'success') {
          setThumbnailUrl(result.info.secure_url);
        }
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      genre,
      year,
      thumbnail_url: thumbnailUrl,
      video_url: videoUrl,
      rating,
      duration,
      views: movie?.views || 0,
      featured: featured ? 1 : 0,
    });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl bg-base-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{movie ? 'Edit Movie' : 'Add New Movie'}</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label"><span className="label-text font-medium">Title *</span></label>
              <input
                className="input input-bordered w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Movie title"
              />
            </div>
            <div>
              <label className="label"><span className="label-text font-medium">Genre *</span></label>
              <select
                className="select select-bordered w-full"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label"><span className="label-text font-medium">Description</span></label>
            <textarea
              className="textarea textarea-bordered w-full h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Movie description..."
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="label"><span className="label-text font-medium">Year</span></label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1900}
                max={2030}
              />
            </div>
            <div>
              <label className="label"><span className="label-text font-medium">Rating</span></label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                min={0}
                max={10}
                step={0.1}
              />
            </div>
            <div>
              <label className="label"><span className="label-text font-medium">Duration</span></label>
              <input
                className="input input-bordered w-full"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="2h 15m"
              />
            </div>
          </div>

          <div>
            <label className="label"><span className="label-text font-medium">Thumbnail *</span></label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  className="input input-bordered w-full"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="Paste URL or upload below"
                />
              </div>
              <button
                type="button"
                className="btn btn-primary btn-outline gap-2"
                onClick={openThumbnailUploadWidget}
                disabled={uploadingThumbnail}
              >
                <Upload size={16} />
                {uploadingThumbnail ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            {thumbnailUrl && <div className="text-xs text-success mt-1">✅ Thumbnail URL set <Cloud size={12} className="inline" /></div>}
          </div>

          <div>
            <label className="label"><span className="label-text font-medium">Video File *</span></label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  className="input input-bordered w-full"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste URL or upload below"
                />
              </div>
              <button
                type="button"
                className="btn btn-primary btn-outline gap-2"
                onClick={openVideoUploadWidget}
                disabled={uploadingVideo}
              >
                <Upload size={16} />
                {uploadingVideo ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            {videoUrl && <div className="text-xs text-success mt-1">✅ Video URL set <Cloud size={12} className="inline" /></div>}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            <span className="label-text">Featured movie</span>
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> {movie ? 'Update Movie' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};