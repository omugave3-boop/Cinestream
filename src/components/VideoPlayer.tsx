import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, X, SkipBack, SkipForward } from 'lucide-react';
import { Movie } from '../types';

interface VideoPlayerProps {
  movie: Movie;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function isPlayableVideo(url: string): boolean {
  if (!url) return false;
  // Cloudinary URLs, direct video URLs, data URLs
  if (url.includes('cloudinary.com')) return true;
  if (url.startsWith('data:video')) return true;
  if (url.startsWith('blob:')) return true;
  if (url.match(/\.(mp4|webm|ogg|mov|mkv|avi)(\?.*)?$/i)) return true;
  if (url.includes('/video/upload/')) return true;
  return false;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ movie, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasVideo, setHasVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    setHasVideo(isPlayableVideo(movie.videoUrl));
    setVideoError(false);
  }, [movie.videoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => setVideoError(true));
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
    }
    setMuted(!muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration || 0);
    setProgress(videoRef.current.duration ? (videoRef.current.currentTime / videoRef.current.duration) * 100 : 0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !videoRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
    setProgress(pct * 100);
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds));
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="video-overlay" onClick={onClose}>
      <div className="video-player" onClick={(e) => e.stopPropagation()}>
        <button className="video-close" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="video-screen">
          {hasVideo && movie.videoUrl && !videoError ? (
            <video
              ref={videoRef}
              src={movie.videoUrl}
              poster={movie.thumbnailUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleTimeUpdate}
              onEnded={() => setPlaying(false)}
              onError={() => setVideoError(true)}
              onClick={togglePlay}
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
            />
          ) : (
            <>
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
                  <p className="video-note">
                    {videoError ? 'Video failed to load. Try a different format.' : 'Upload a video file in Admin to enable playback'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        <div className="video-controls">
          <div className="video-progress-bar" onClick={hasVideo && !videoError ? handleSeek : (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setProgress(((e.clientX - rect.left) / rect.width) * 100);
          }}>
            <div className="video-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="video-buttons">
            <div className="video-buttons-left">
              <button onClick={() => hasVideo && !videoError ? skip(-10) : setProgress(Math.max(0, progress - 10))}><SkipBack size={18} /></button>
              <button onClick={hasVideo && !videoError ? togglePlay : () => setPlaying(!playing)}>
                {playing ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button onClick={() => hasVideo && !videoError ? skip(10) : setProgress(Math.min(100, progress + 10))}><SkipForward size={18} /></button>
              <button onClick={hasVideo && !videoError ? toggleMute : () => setMuted(!muted)}>
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <span className="video-time">
                {hasVideo && !videoError ? `${formatTime(currentTime)} / ${formatTime(duration)}` : `0:${String(Math.floor(progress * 1.2)).padStart(2, '0')} / 2:00:00`}
              </span>
            </div>
            <div className="video-buttons-right">
              <button onClick={hasVideo && !videoError ? handleFullscreen : undefined}><Maximize size={18} /></button>
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
