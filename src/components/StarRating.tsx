import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRate, readonly = false, size = 20 }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="star-rating" onMouseLeave={() => !readonly && setHovered(0)}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
        <Star
          key={star}
          size={size}
          className={`star-icon ${star <= (hovered || rating) ? 'star-filled' : 'star-empty'} ${readonly ? '' : 'star-clickable'}`}
          onClick={() => !readonly && onRate?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          fill={star <= (hovered || rating) ? '#fbbf24' : 'none'}
          stroke={star <= (hovered || rating) ? '#fbbf24' : '#6b7280'}
        />
      ))}
    </div>
  );
};

export default StarRating;
