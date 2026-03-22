import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Cloud } from 'lucide-react';
import { Movie } from '../types';
import { GENRES } from '../utils/helpers';

interface MovieModalProps {
  movie: Movie | null; // null = add new
  onSave: (movie: Omit<Movie, 'id' | 'dateAdded'>) => void;
  onClose: () => void;
}

interface CloudinaryUploadResponse {
  secure_url: string;
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
  const [uploadProgress, setUploadProgress] = useState(0);

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
  }, [movie]);

  const uploadToCloudinary = async (file: File, resourceType: 'video' | 'image'): Promise<string> => {
    try {
      // Read file as base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string;
            
            // Call backend API instead of direct Cloudinary upload
            const response = await fetch('/api/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                file: base64Data,
                resourceType: resourceType,
              }),
            });

            if (!response.ok) {
              throw new Error(`Upload failed: ${response.statusText}`);
            }

            const data = (await response.json()) as CloudinaryUploadResponse;
            setUploadProgress(0);
            resolve(data.secure_url);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    } catch (error) {
      throw error;
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const url = await uploadToCloudinary(file, 'video');
      setVideoUrl(url);
    } catch (error) {
      alert(`Video upload failed: ${error}`);
    } finally {
      setUploadingVideo(false);
      setUploadProgress(0);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const url = await uploadToCloudinary(file, 'image');
      setThumbnailUrl(url);
    } catch (error) {
      alert(`Thumbnail upload failed: ${error}`);
    } finally {
      setUploadingThumbnail(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  className="input input-bordered w-full"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="Paste URL or upload below"
                />
              </div>
              <label className="btn btn-primary btn-outline gap-2">
                <Upload size={16} />
                {uploadingThumbnail ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  disabled={uploadingThumbnail}
                  className="hidden"
                />
              </label>
            </div>
            {uploadingThumbnail && <div className="text-xs text-info mt-1">Uploading: {uploadProgress}%</div>}
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
              <label className="btn btn-primary btn-outline gap-2">
                <Upload size={16} />
                {uploadingVideo ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={uploadingVideo}
                  className="hidden"
                />
              </label>
            </div>
            {uploadingVideo && <div className="text-xs text-info mt-1">Uploading: {uploadProgress}%</div>}
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
