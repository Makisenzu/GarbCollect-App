import { Star } from 'lucide-react';

const StarRating = ({ rating, onRate, onHover, size = 'md', readonly = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${sizeClasses[size]} transition-all duration-200 ${
            star <= (onHover || rating)
              ? 'text-yellow-400 fill-yellow-400 transform scale-110'
              : 'text-gray-300 fill-gray-300 hover:text-yellow-300 hover:fill-yellow-300'
          } ${onRate && !readonly ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
          onClick={() => !readonly && onRate?.(star)}
          onMouseEnter={() => !readonly && onHover?.(star)}
          onMouseLeave={() => !readonly && onHover?.(0)}
          disabled={readonly}
        >
          <Star className="w-full h-full" />
        </button>
      ))}
    </div>
  );
};

export default StarRating;