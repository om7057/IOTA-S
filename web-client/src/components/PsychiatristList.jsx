import React, { useState, useEffect } from 'react';
import { MessageCircle, Star, Briefcase } from 'lucide-react';
import '../styles/PsychiatristSection.css';

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
      <div className="psychiatrist-list-wrapper">
        <div className="loading">Loading specialists...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="psychiatrist-list-wrapper">
        <div className="error-message">{error}</div>
        <button onClick={fetchPsychiatrists} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="psychiatrist-list">
      <h2 className="section-title">Talk to Our Specialists</h2>
      <p className="section-subtitle">
        Choose a specialist who matches your needs and concerns
      </p>

      <div className="psychiatrists-grid">
        {psychiatrists.map((psychiatrist) => (
          <div
            key={psychiatrist.id}
            className={`psychiatrist-card ${
              selectedId === psychiatrist.id ? 'selected' : ''
            }`}
            onClick={() => onSelectPsychiatrist(psychiatrist)}
          >
            <div className="card-header">
              <img
                src={psychiatrist.avatarUrl}
                alt={psychiatrist.firstName}
                className="avatar"
              />
              <div className="status-badge">
                {psychiatrist.isAvailable ? 'Available' : 'Offline'}
              </div>
            </div>

            <div className="card-content">
              <h3 className="doctor-name">
                Dr. {psychiatrist.firstName} {psychiatrist.lastName}
              </h3>

              <div className="specialization">
                <Briefcase size={16} />
                <p>{psychiatrist.specialization}</p>
              </div>

              <p className="bio">{psychiatrist.bio}</p>

              <div className="card-footer">
                <div className="rating">
                  <Star size={16} fill="gold" color="gold" />
                  <span>{psychiatrist.rating}/5</span>
                </div>

                <button className="chat-btn">
                  <MessageCircle size={18} />
                  Chat Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PsychiatristList;
