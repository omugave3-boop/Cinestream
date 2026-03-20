import React from 'react';
import { Play, Plus, Check, Eye, Star } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  inWatchlist: boolean;
  onPlay: () => void;
  onToggleWatchlist: () => void;
  userRating: number;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, inWatchlist, onPlay, onToggleWatchlist, userRating }) => {
  return (
    <div className="movie-card">
      <div className="movie-card-poster" onClick={onPlay}>
        <img src={movie.thumbnailUrl} alt={movie.title} loading="lazy" />
        <div className="movie-card-overlay">
          <button className="play-circle-btn">
            <Play size={32} fill="white" />
          </button>
        </div>
        <div className="movie-card-badges">
          {movie.categories.trending && <span className="badge badge-trending">Trending</span>}
          {movie.categories.newRelease && <span className="badge badge-new">New</span>}
        </div>
      </div>
      <div className="movie-card-info">
        <h3 className="movie-card-title">{movie.title}</h3>
        <div className="movie-card-meta">
          <span>{movie.year}</span>
          <span className="dot">·</span>
          <span>{movie.genre}</span>
          <span className="dot">·</span>
          <span className="movie-rating"><Star size={12} fill="#fbbf24" stroke="#fbbf24" /> {movie.rating}</span>
        </div>
        <div className="movie-card-stats">
          <span className="views"><Eye size={14} /> {movie.views.toLocaleString()}</span>
          {userRating > 0 && <span className="user-score">Your: {userRating}/10</span>}
        </div>
        <div className="movie-card-actions">
          <button className="btn btn-sm btn-primary" onClick={onPlay}>
            <Play size={14} /> Watch
          </button>
          <button
            className={`btn btn-sm ${inWatchlist ? 'btn-success' : 'btn-secondary'}`}
            onClick={onToggleWatchlist}
          >
            {inWatchlist ? <><Check size={14} /> Listed</> : <><Plus size={14} /> Watchlist</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
