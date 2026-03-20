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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/users/${user.id}/age`, {
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-3">
            Welcome to IOTA
          </h1>
          <p className="text-base sm:text-lg text-slate-600">
            Let us know your age so we can show you the perfect experience
          </p>
        </div>

        {/* Age Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-6">
          {/* Children Option (8-12) */}
          <button
            onClick={() => handleAgeSelect(10)}
            disabled={loading}
            className={`p-6 sm:p-7 rounded-3xl border transition-all hover:-translate-y-0.5 ${selectedAge === 10 || (selectedAge && selectedAge < 13)
                ? 'border-emerald-300 bg-emerald-50/70 shadow-lg shadow-emerald-100/80'
                : 'border-slate-200 bg-white/90 hover:border-emerald-200 shadow-md'
              } disabled:opacity-50`}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-2xl flex items-center justify-center mb-4">C</div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              I'm a Kid
            </h2>
            <p className="text-slate-600 mb-4">Ages 7-12</p>
            <div className="text-sm text-slate-700 space-y-1">
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
            className={`p-6 sm:p-7 rounded-3xl border transition-all hover:-translate-y-0.5 ${selectedAge === 16 || (selectedAge && selectedAge >= 13)
                ? 'border-indigo-300 bg-indigo-50/70 shadow-lg shadow-indigo-100/80'
                : 'border-slate-200 bg-white/90 hover:border-indigo-200 shadow-md'
              } disabled:opacity-50`}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-100 text-2xl flex items-center justify-center mb-4">T</div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              I'm a Teen
            </h2>
            <p className="text-slate-600 mb-4">13 and above</p>
            <div className="text-sm text-slate-700 space-y-1">
              <p>✓ All Kid Features</p>
              <p>✓ Express Yourself</p>
              <p>✓ Community Circles</p>
              <p>✓ Support Resources</p>
            </div>
          </button>
        </div>

        {/* Custom Age Input */}
        <div className="card rounded-2xl p-5 sm:p-6 text-center border-slate-200">
          <p className="text-slate-600 mb-4">Or enter your exact age</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <input
              type="number"
              min="8"
              max="99"
              placeholder="Enter your age"
              onChange={(e) => {
                const val = e.target.value;
                if (val) setSelectedAge(parseInt(val));
              }}
              className="input w-full sm:w-28 text-center text-xl font-semibold"
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
              className="btn btn-primary w-full sm:w-auto disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </div>

        {/* Info Footer */}
        <div className="text-center mt-6 text-sm text-slate-600">
          <p>Your age will help us personalize your experience</p>
          <p className="mt-1">You can change this anytime in your profile settings.</p>
        </div>
      </div>
    </div>
  );
};

export default AgeSelection;
