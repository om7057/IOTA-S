import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users, ArrowRight } from 'lucide-react';

const AgeSelection = () => {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selected) return;
    
    localStorage.setItem('age_selection', selected);
    
    if (selected === 'preteen') {
      navigate('/');
    } else {
      navigate('/teen');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-sky-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h1>
          <p className="text-gray-500">Please select your age group to continue</p>
        </div>

        {/* Options */}
        <div className="space-y-4 mb-8">
          {/* Pre-Teen Option */}
          <button
            onClick={() => setSelected('preteen')}
            className={`w-full p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
              selected === 'preteen'
                ? 'border-sky-500 bg-sky-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selected === 'preteen' ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-lg ${
                  selected === 'preteen' ? 'text-sky-700' : 'text-gray-900'
                }`}>
                  Pre-Teen
                </h3>
                <p className="text-gray-500 text-sm mt-1">Ages 8-12</p>
                <p className="text-gray-400 text-sm mt-2">
                  Fun and interactive safety learning with stories and games
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selected === 'preteen'
                  ? 'border-sky-500 bg-sky-500'
                  : 'border-gray-300'
              }`}>
                {selected === 'preteen' && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </button>

          {/* Teen Option */}
          <button
            onClick={() => setSelected('teen')}
            className={`w-full p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
              selected === 'teen'
                ? 'border-sky-500 bg-sky-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selected === 'teen' ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-lg ${
                  selected === 'teen' ? 'text-sky-700' : 'text-gray-900'
                }`}>
                  Teen
                </h3>
                <p className="text-gray-500 text-sm mt-1">Ages 13-19</p>
                <p className="text-gray-400 text-sm mt-2">
                  Mood tracking, journaling, and community support
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selected === 'teen'
                  ? 'border-sky-500 bg-sky-500'
                  : 'border-gray-300'
              }`}>
                {selected === 'teen' && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selected}
          className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
            selected
              ? 'bg-sky-600 text-white hover:bg-sky-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          You can change this selection later in settings
        </p>
      </div>
    </div>
  );
};

export default AgeSelection;
