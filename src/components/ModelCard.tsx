import React from 'react';
import { Star, GitFork, ArrowRight } from 'lucide-react';

interface ModelCardProps {
  name: string;
  description: string;
  stars: number;
  forks: number;
  author: string;
  tags: string[];
  image: string;
}

const ModelCard: React.FC<ModelCardProps> = ({
  name,
  description,
  stars,
  forks,
  author,
  tags,
  image
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <img
        src={image}
        alt={name}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-gray-600">
            <div className="flex items-center">
              <Star size={16} className="mr-1" />
              <span>{stars}k</span>
            </div>
            <div className="flex items-center">
              <GitFork size={16} className="mr-1" />
              <span>{forks}</span>
            </div>
          </div>
          <button className="text-blue-600 hover:text-blue-700 flex items-center">
            View Model
            <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;