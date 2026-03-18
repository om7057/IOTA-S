import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const StoryCard = ({ story }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/story/${story.id}`, { state: { story } });
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-105 border border-gray-200 overflow-hidden"
    >
      {/* Story Image */}
      {story.imageUrl && (
        <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
          <img
            src={story.imageUrl}
            alt={story.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Category Badge */}
        {story.category && (
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">
            {story.category}
          </span>
        )}

        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
          {story.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {story.description || 'An engaging educational story'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {story.viewCount && (
            <span className="text-xs text-gray-500">
              👁️ {story.viewCount} views
            </span>
          )}
          <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors">
            Read
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;
