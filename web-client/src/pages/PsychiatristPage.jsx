import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PsychiatristList from '../components/PsychiatristList';
import PsychiatristChat from '../components/PsychiatristChat';
import { ArrowLeft, Heart, Eye, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PsychiatristPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPsychiatrist, setSelectedPsychiatrist] = useState(null);
  const [chatActive, setChatActive] = useState(false);

  const handleSelectPsychiatrist = (psychiatrist) => {
    setSelectedPsychiatrist(psychiatrist);
    setChatActive(true);
  };

  const handleCloseChat = () => {
    setChatActive(false);
    setSelectedPsychiatrist(null);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pt-6">
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-gray-200">
          <p className="text-xl text-gray-600 mb-6">Please log in to access this feature.</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-4 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white border-2 border-gray-200 hover:border-sky-400 hover:bg-sky-50 rounded-full text-gray-700 hover:text-sky-600 transition-all"
          title="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mental Health Support</h1>
          <p className="text-sm text-gray-500 mt-1">Connect with professional psychiatrists and counselors</p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-sky-200 transition-all text-center group">
          <div className="w-14 h-14 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Heart className="w-7 h-7 text-sky-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Confidential Support</h3>
          <p className="text-gray-500 text-sm">All conversations are private and secure</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-green-200 transition-all text-center group">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Brain className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Professional Guidance</h3>
          <p className="text-gray-500 text-sm">Expert psychiatrists and psychologists</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-purple-200 transition-all text-center group">
          <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Eye className="w-7 h-7 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Judgment</h3>
          <p className="text-gray-500 text-sm">Safe, judgment-free environment</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-sm min-h-[500px]">
        {!chatActive ? (
          <PsychiatristList
            onSelectPsychiatrist={handleSelectPsychiatrist}
            selectedId={selectedPsychiatrist?.id}
          />
        ) : selectedPsychiatrist ? (
          <div className="h-full">
            <PsychiatristChat
              psychiatrist={selectedPsychiatrist}
              userId={user.id}
              onClose={handleCloseChat}
            />
          </div>
        ) : null}
      </div>

      {/* Info Section */}
      <div className="bg-sky-50 rounded-2xl p-6 border-2 border-sky-100">
        <h3 className="text-lg font-bold text-sky-900 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-sky-600" fill="currentColor" /> Need Help?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <p className="text-sm text-sky-800">
            <strong className="block text-sky-950 mb-1">Crisis Support:</strong> If you're in crisis, please contact emergency services or visit your nearest hospital.
          </p>
          <p className="text-sm text-sky-800">
            <strong className="block text-sky-950 mb-1">Confidentiality:</strong> All conversations are encrypted and protected under privacy regulations.
          </p>
          <p className="text-sm text-sky-800">
            <strong className="block text-sky-950 mb-1">Availability:</strong> Our specialists are available during various hours to support you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PsychiatristPage;
