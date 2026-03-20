import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PsychiatristList from '../components/PsychiatristList';
import PsychiatristChat from '../components/PsychiatristChat';
import { ArrowLeft, Heart, Eye, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PsychiatristPage.css';

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
      <div className="container">
        <div className="unauthorized">
          <p>Please log in to access this feature.</p>
          <button onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="psychiatrist-page">
      {/* Header */}
      <div className="page-header">
        <button
          onClick={() => navigate(-1)}
          className="back-btn"
          title="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="header-content">
          <h1>Mental Health Support</h1>
          <p>Connect with professional psychiatrists and counselors</p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="feature-cards">
        <div className="feature-card">
          <div className="icon-wrapper blue">
            <Heart size={32} />
          </div>
          <h3>Confidential Support</h3>
          <p>All conversations are private and secure</p>
        </div>

        <div className="feature-card">
          <div className="icon-wrapper green">
            <Brain size={32} />
          </div>
          <h3>Professional Guidance</h3>
          <p>Expert psychiatrists and psychologists</p>
        </div>

        <div className="feature-card">
          <div className="icon-wrapper purple">
            <Eye size={32} />
          </div>
          <h3>No Judgment</h3>
          <p>Safe, judgment-free environment</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-wrapper">
        {!chatActive ? (
          <PsychiatristList
            onSelectPsychiatrist={handleSelectPsychiatrist}
            selectedId={selectedPsychiatrist?.id}
          />
        ) : selectedPsychiatrist ? (
          <div className="chat-section">
            <PsychiatristChat
              psychiatrist={selectedPsychiatrist}
              userId={user.id}
              onClose={handleCloseChat}
            />
          </div>
        ) : null}
      </div>

      {/* Info Section */}
      <div className="info-section">
        <h3>Need Help?</h3>
        <div className="info-content">
          <p>
            <strong>Crisis Support:</strong> If you're in crisis, please contact emergency services or visit your nearest hospital.
          </p>
          <p>
            <strong>Confidentiality:</strong> All conversations are encrypted and protected under privacy regulations.
          </p>
          <p>
            <strong>Availability:</strong> Our specialists are available during various hours to support you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PsychiatristPage;
