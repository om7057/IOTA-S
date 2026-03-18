import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './ParentalControls.css';

const ParentalControls = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState('parent'); // 'parent' or 'child'
  const [children, setChildren] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [childEmail, setChildEmail] = useState('');
  const [newParentAccountId, setNewParentAccountId] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    if (mode === 'parent') {
      fetchMyChildren();
    } else {
      fetchMyParents();
    }
  }, [mode, user?.id]);

  const fetchMyChildren = async () => {
    try {
      const response = await axios.get(`/api/parental/children/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setChildren(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching children:', error);
      setLoading(false);
    }
  };

  const fetchMyParents = async () => {
    try {
      const response = await axios.get(`/api/parental/parents/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setParents(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching parents:', error);
      setLoading(false);
    }
  };

  const handleAddChild = async () => {
    try {
      const response = await axios.post(
        '/api/parental/link',
        {
          parentUserId: user.id,
          childUserId: childEmail, // In real app, would need to lookup by email first
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      setNewParentAccountId(response.data.data.id);
      setChildEmail('');
      fetchMyChildren();
    } catch (error) {
      console.error('Error adding child:', error);
    }
  };

  const handleApproveParent = async (parentalAccountId) => {
    try {
      await axios.post(
        `/api/parental/link/${parentalAccountId}/approve`,
        { childUserId: user.id },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      fetchMyParents();
    } catch (error) {
      console.error('Error approving parent:', error);
    }
  };

  const handleUpdateSettings = async (parentalAccountId, newSettings) => {
    try {
      await axios.put(
        `/api/parental/settings/${parentalAccountId}`,
        newSettings,
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      fetchMyChildren();
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  if (loading) {
    return <div className="parental-loading">Loading...</div>;
  }

  return (
    <div className="parental-container">
      <div className="parental-header">
        <h1>👨‍👩‍👧 Parental Controls</h1>
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'parent' ? 'active' : ''}`}
            onClick={() => setMode('parent')}
          >
            Parent View
          </button>
          <button
            className={`mode-btn ${mode === 'child' ? 'active' : ''}`}
            onClick={() => setMode('child')}
          >
            As Child
          </button>
        </div>
      </div>

      {mode === 'parent' ? (
        <div className="parent-section">
          <h2>Manage Your Children</h2>

          <div className="add-child-card">
            <h3>Add Child Account</h3>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter child's username or ID"
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
              />
              <button onClick={handleAddChild} className="btn-primary">
                Add Child
              </button>
            </div>
            {newParentAccountId && (
              <p className="success-msg">
                ✓ Link created! Waiting for child approval...
              </p>
            )}
          </div>

          <div className="children-grid">
            {children.length > 0 ? (
              children.map(linkData => (
                <div key={linkData.id} className="child-card">
                  <div className="child-avatar">
                    {linkData.child.avatar ? (
                      <img src={linkData.child.avatar} alt={linkData.child.name} />
                    ) : (
                      <span className="avatar-emoji">👧</span>
                    )}
                  </div>

                  <div className="child-info">
                    <h3>{linkData.child.name}</h3>
                    <p className="joined">
                      Joined: {new Date(linkData.child.joinedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="child-settings">
                    <div className="setting-item">
                      <label>Screen Time Limit (min/day):</label>
                      <input
                        type="number"
                        defaultValue={linkData.screenTimeLimit}
                        onChange={(e) => {
                          const newSettings = {
                            ...linkData,
                            screenTimeLimit: parseInt(e.target.value)
                          };
                          handleUpdateSettings(linkData.id, newSettings);
                        }}
                      />
                    </div>

                    <div className="setting-item">
                      <label>Content Filter:</label>
                      <select
                        defaultValue={linkData.contentFilter}
                        onChange={(e) => {
                          const newSettings = {
                            ...linkData,
                            contentFilter: e.target.value
                          };
                          handleUpdateSettings(linkData.id, newSettings);
                        }}
                      >
                        <option value="unrestricted">Unrestricted</option>
                        <option value="moderate">Moderate (Default)</option>
                        <option value="strict">Strict</option>
                      </select>
                    </div>

                    <label className="checkbox">
                      <input
                        type="checkbox"
                        defaultChecked={linkData.allowNotifications}
                      />
                      Allow Notifications
                    </label>
                  </div>

                  <button className="btn-secondary" onClick={() => setSelectedChild(linkData)}>
                    View Activity
                  </button>
                </div>
              ))
            ) : (
              <p className="no-children">No children added yet</p>
            )}
          </div>
        </div>
      ) : (
        <div className="child-section">
          <h2>Your Parents/Guardians</h2>

          {parents.length > 0 ? (
            <div className="parents-list">
              {parents.map(linkData => (
                <div key={linkData.id} className="parent-card">
                  <div className="parent-info">
                    <h3>{linkData.parent.name}</h3>
                    <p className="relationship">
                      {linkData.relationship.charAt(0).toUpperCase() + linkData.relationship.slice(1)}
                    </p>
                  </div>

                  <div className="parent-status">
                    {linkData.isActive ? (
                      <span className="status active">✓ Active</span>
                    ) : (
                      <>
                        <span className="status pending">⏳ Pending Approval</span>
                        <button
                          className="btn-approve"
                          onClick={() => handleApproveParent(linkData.id)}
                        >
                          Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <p className="no-parents">
                No parents linked yet. Ask your parent/guardian to add you!
              </p>
            )}
          </div>
      )}

      {selectedChild && (
        <div className="activity-modal">
          <div className="modal-content">
            <button
              className="close-btn"
              onClick={() => setSelectedChild(null)}
            >
              ✕
            </button>
            <h2>{selectedChild.child.name}'s Activity</h2>
            <p>Last updated: Just now</p>
            {/* Add activity details here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentalControls;
