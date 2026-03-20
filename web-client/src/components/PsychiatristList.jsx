import React, { useState, useEffect } from 'react';
import { MessageCircle, Star, Briefcase } from 'lucide-react';

const PsychiatristList = ({ onSelectPsychiatrist, selectedId }) => {
  const [psychiatrists, setPsychiatrists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPsychiatrists();
  }, []);

  const fetchPsychiatrists = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/psychiatrists');
      if (!response.ok) throw new Error('Failed to fetch psychiatrists');
      const data = await response.json();
      setPsychiatrists(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching psychiatrists:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 h-64">
        <div className="text-lg text-gray-500 font-medium animate-pulse">Loading specialists...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-2xl h-64 border-2 border-red-100">
        <div className="text-red-600 font-medium mb-4">{error}</div>
        <button 
          onClick={fetchPsychiatrists} 
          className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Talk to Our Specialists</h2>
        <p className="text-gray-500 mt-1">
          Choose a specialist who matches your needs and concerns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {psychiatrists.map((psychiatrist) => (
          <div
            key={psychiatrist.id}
            className={`bg-white rounded-2xl p-6 border-2 transition-all cursor-pointer hover:shadow-lg flex flex-col ${
              selectedId === psychiatrist.id 
                ? 'border-sky-500 ring-4 ring-sky-50' 
                : 'border-gray-200 hover:border-sky-300'
            }`}
            onClick={() => onSelectPsychiatrist(psychiatrist)}
          >
            <div className="flex justify-between items-start mb-4">
              <img
                src={psychiatrist.avatarUrl || `https://ui-avatars.com/api/?name=${psychiatrist.firstName}+${psychiatrist.lastName}&background=random`}
                alt={psychiatrist.firstName}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shadow-sm"
              />
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                psychiatrist.isAvailable 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {psychiatrist.isAvailable ? 'Available' : 'Offline'}
              </span>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Dr. {psychiatrist.firstName} {psychiatrist.lastName}
              </h3>

              <div className="flex items-center gap-2 text-sky-600 font-medium text-sm mb-3">
                <Briefcase size={16} />
                <p>{psychiatrist.specialization}</p>
              </div>

              <p className="text-gray-600 text-sm line-clamp-3 mb-6">
                {psychiatrist.bio}
              </p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
              <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg font-bold text-sm">
                <Star size={16} className="fill-current" />
                <span>{psychiatrist.rating}/5</span>
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold rounded-lg transition-colors">
                <MessageCircle size={18} />
                Chat Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PsychiatristList;
