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
  movie: Movie | null; // null = add new
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

  // Initialize Cloudinary Upload Widget
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
        maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
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
            <div className="flex gap-2 items-center">
              {thumbnailUrl ? (
                <div className="flex-1 flex items-center gap-2">
                  <img src={thumbnailUrl} alt="Thumbnail" className="w-16 h-10 object-cover rounded" />
                  <span className="text-sm text-success flex items-center gap-1">
                    <Check size={14} /> Uploaded
                  </span>
                </div>
              ) : (
                <div className="flex-1 text-sm text-gray-400">No thumbnail uploaded</div>
              )}
              <button
                type="button"
                className="btn btn-primary btn-outline gap-2"
                onClick={() => openCloudinaryWidget('image')}
                disabled={uploadingThumbnail}
              >
                <Upload size={16} />
                {uploadingThumbnail ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>

          <div>
            <label className="label"><span className="label-text font-medium">Video File *</span></label>
            <div className="flex gap-2 items-center">
              {videoUrl ? (
                <div className="flex-1 flex items-center gap-2">
                  <Cloud size={16} className="text-success" />
                  <span className="text-sm text-success flex items-center gap-1">
                    <Check size={14} /> Uploaded
                  </span>
                </div>
              ) : (
                <div className="flex-1 text-sm text-gray-400">No video uploaded</div>
              )}
              <button
                type="button"
                className="btn btn-primary btn-outline gap-2"
                onClick={() => openCloudinaryWidget('video')}
                disabled={uploadingVideo}
              >
                <Upload size={16} />
                {uploadingVideo ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-2">Supports up to 5GB files • Direct upload to cloud</div>
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
      <div className="modal-backdrop" onClick={onClose}"></div>
    </div>
  );
};