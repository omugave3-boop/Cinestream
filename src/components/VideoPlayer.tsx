import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, X, SkipBack, SkipForward } from 'lucide-react';
import { Movie } from '../types';

interface VideoPlayerProps {
  movie: Movie;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ movie, onClose }) => {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <div className="video-overlay" onClick={onClose}>
      <div className="video-player" onClick={(e) => e.stopPropagation()}>
        <button className="video-close" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="video-screen">
          <img src={movie.thumbnailUrl} alt={movie.title} className="video-poster" />
          {!playing && (
            <button className="video-play-btn" onClick={() => setPlaying(true)}>
              <Play size={48} fill="white" />
            </button>
          )}
          {playing && (
            <div className="video-playing-text">
              <p>▶ Now Playing</p>
              <h3>{movie.title}</h3>
              <p className="video-note">Video playback placeholder</p>
            </div>
          )}
        </div>
        <div className="video-controls">
          <div className="video-progress-bar" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setProgress(((e.clientX - rect.left) / rect.width) * 100);
          }}>
            <div className="video-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="video-buttons">
            <div className="video-buttons-left">
              <button onClick={() => setProgress(Math.max(0, progress - 10))}><SkipBack size={18} /></button>
              <button onClick={() => setPlaying(!playing)}>
                {playing ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button onClick={() => setProgress(Math.min(100, progress + 10))}><SkipForward size={18} /></button>
              <button onClick={() => setMuted(!muted)}>
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <span className="video-time">0:{String(Math.floor(progress * 1.2)).padStart(2, '0')} / 2:00:00</span>
            </div>
            <div className="video-buttons-right">
              <button><Maximize size={18} /></button>
            </div>
          </div>
        </div>
        <div className="video-info">
          <h3>{movie.title}</h3>
          <p>{movie.year} · {movie.genre} · ★ {movie.rating}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
