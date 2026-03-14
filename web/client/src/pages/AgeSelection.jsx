import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AgeSelection = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [selectedAge, setSelectedAge] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAgeSelect = async (age) => {
    setSelectedAge(age);
    setLoading(true);
    
    try {
      // Update age in backend
      const response = await fetch(`http://localhost:5000/api/users/${user.id}/age`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ age })
      });

      if (response.ok) {
        // Update localStorage
        localStorage.setItem('userAge', age);
        const updatedUser = { ...user, age };
        localStorage.setItem('authUser', JSON.stringify(updatedUser));
        
        toast.success(`Welcome! You're all set! 🎉`);
        // Now redirect to home where user can start using the app
        window.location.href = '/';
      } else {
        toast.error('Failed to save age. Please try again.');
        setSelectedAge(null);
      }
    } catch (error) {
      console.error('Error setting age:', error);
      toast.error('Failed to save age. Please try again.');
      setSelectedAge(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            ✨ Welcome to IOTA!
          </h1>
          <p className="text-lg text-gray-600">
            Let us know your age so we can show you the perfect experience
          </p>
        </div>

        {/* Age Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Children Option (8-12) */}
          <button
            onClick={() => handleAgeSelect(10)}
            disabled={loading}
            className={`p-8 rounded-3xl border-4 transition-all transform hover:scale-105 ${
              selectedAge === 10 || (selectedAge && selectedAge < 13)
                ? 'border-green-500 bg-green-50 shadow-lg'
                : 'border-green-200 bg-white hover:border-green-300 shadow'
            } disabled:opacity-50`}
          >
            <div className="text-6xl mb-4">👶</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              I'm a Kid
            </h2>
            <p className="text-gray-600 mb-4">Ages 8-12</p>
            <div className="text-sm text-gray-700 space-y-1">
              <p>✓ Mood Tracking</p>
              <p>✓ My Journal</p>
              <p>✓ Safety Stories</p>
              <p>✓ Quizzes & Games</p>
            </div>
          </button>

          {/* Teenager Option (13+) */}
          <button
            onClick={() => handleAgeSelect(16)}
            disabled={loading}
            className={`p-8 rounded-3xl border-4 transition-all transform hover:scale-105 ${
              selectedAge === 16 || (selectedAge && selectedAge >= 13)
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-purple-200 bg-white hover:border-purple-300 shadow'
            } disabled:opacity-50`}
          >
            <div className="text-6xl mb-4">🧑</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              I'm a Teen
            </h2>
            <p className="text-gray-600 mb-4">Ages 13+</p>
            <div className="text-sm text-gray-700 space-y-1">
              <p>✓ All Kid Features</p>
              <p>✓ Express Yourself</p>
              <p>✓ Community Circles</p>
              <p>✓ Support Resources</p>
            </div>
          </button>
        </div>

        {/* Custom Age Input */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 text-center">
          <p className="text-gray-600 mb-4">Or enter your exact age:</p>
          <div className="flex gap-2 justify-center items-center">
            <input
              type="number"
              min="8"
              max="99"
              placeholder="Enter your age"
              onChange={(e) => {
                const val = e.target.value;
                if (val) setSelectedAge(parseInt(val));
              }}
              className="w-24 px-4 py-2 border-2 border-gray-300 rounded-lg text-center text-xl font-bold focus:outline-none focus:border-sky-600"
            />
            <button
              onClick={() => {
                if (selectedAge && selectedAge >= 8 && selectedAge <= 99) {
                  handleAgeSelect(selectedAge);
                } else {
                  toast.error('Please enter a valid age (8-99)');
                }
              }}
              disabled={loading || !selectedAge}
              className="px-6 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </div>

        {/* Info Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Your age will help us personalize your experience</p>
          <p className="mt-1">You can change this anytime in your profile settings</p>
        </div>
      </div>
    </div>
  );
};

export default AgeSelection;
