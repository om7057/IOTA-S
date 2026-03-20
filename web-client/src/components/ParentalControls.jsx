import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './ParentalControls.css';

const ParentalControls = () => {
  const { user, token } = useAuth();
  const [mode, setMode] = useState('parent');
  const [children, setChildren] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [childLookup, setChildLookup] = useState('');
  const [newParentAccountId, setNewParentAccountId] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedChildActivity, setSelectedChildActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token || localStorage.getItem('authToken') || ''}`,
    }),
    [token]
  );

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      setLoading(true);
      if (mode === 'parent') {
        await fetchMyChildren();
      } else {
        await fetchMyParents();
      }
      setLoading(false);
    };

    load();
  }, [mode, user?.id]);

  const fetchMyChildren = async () => {
    try {
      const response = await axios.get(`/api/parental/children/${user.id}`, { headers: authHeaders });
      const list = Array.isArray(response?.data?.data) ? response.data.data : [];
      setChildren(list);
    } catch (error) {
      console.error('Error fetching children:', error);
      setChildren([]);
    }
  };

  const fetchMyParents = async () => {
    try {
      const response = await axios.get(`/api/parental/parents/${user.id}`, { headers: authHeaders });
      const list = Array.isArray(response?.data?.data) ? response.data.data : [];
      setParents(list);
    } catch (error) {
      console.error('Error fetching parents:', error);
      setParents([]);
    }
  };

  const handleAddChild = async () => {
    const lookup = childLookup.trim();
    if (!lookup) return;

    setSubmitting(true);
    try {
      const isEmail = lookup.includes('@');
      const response = await axios.post(
        '/api/parental/link',
        isEmail ? { childEmail: lookup } : { childUserId: lookup },
        { headers: authHeaders }
      );
      setNewParentAccountId(response?.data?.data?.id || null);
      setChildLookup('');
      await fetchMyChildren();
    } catch (error) {
      console.error('Error adding child:', error);
      alert(error?.response?.data?.message || 'Failed to add child account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveParent = async (parentalAccountId) => {
    try {
      await axios.post(`/api/parental/link/${parentalAccountId}/approve`, {}, { headers: authHeaders });
      await fetchMyParents();
    } catch (error) {
      console.error('Error approving parent:', error);
      alert(error?.response?.data?.message || 'Failed to approve parent link');
    }
  };

  const handleUpdateSettings = async (parentalAccountId, newSettings) => {
    try {
      await axios.put(`/api/parental/settings/${parentalAccountId}`, newSettings, {
        headers: authHeaders,
      });
      await fetchMyChildren();
    } catch (error) {
      console.error('Error updating settings:', error);
      alert(error?.response?.data?.message || 'Failed to update settings');
    }
  };

  const handleViewActivity = async (linkData) => {
    if (!linkData?.child?.id) return;
    setSelectedChild(linkData);
    setSelectedChildActivity(null);
    setActivityLoading(true);

    try {
      const response = await axios.get(`/api/parental/activity/${linkData.child.id}`, {
        headers: authHeaders,
      });
      setSelectedChildActivity(response?.data?.data || null);
    } catch (error) {
      console.error('Error fetching child activity:', error);
      setSelectedChildActivity(null);
    } finally {
      setActivityLoading(false);
    }
  };

  if (loading) {
    return <div className="parental-loading">Loading...</div>;
  }

  return (
    <div className="parental-container">
      <div className="parental-header">
        <h1>Parental Controls</h1>
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
                placeholder="Enter child email or user ID"
                value={childLookup}
                onChange={(e) => setChildLookup(e.target.value)}
              />
              <button onClick={handleAddChild} className="btn-primary" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Child'}
              </button>
            </div>
            {newParentAccountId && (
              <p className="success-msg">✓ Link created! Waiting for child approval...</p>
            )}
          </div>

          <div className="children-grid">
            {children.length > 0 ? (
              children.map((linkData) => (
                <div key={linkData.id} className="child-card">
                  <div className="child-avatar">
                    {linkData.child?.avatarUrl ? (
                      <img src={linkData.child.avatarUrl} alt={linkData.child?.name || 'Child avatar'} />
                    ) : (
                      <span className="avatar-emoji">👧</span>
                    )}
                  </div>

                  <div className="child-info">
                    <h3>{linkData.child?.name || 'Child'}</h3>
                    <p className="joined">
                      Joined:{' '}
                      {linkData.child?.joinedAt
                        ? new Date(linkData.child.joinedAt).toLocaleDateString()
                        : 'Unknown'}
                    </p>
                    <p className="joined">Status: {linkData.isActive ? 'Active' : 'Pending approval'}</p>
                    <p className="joined">Points: {linkData.progress?.totalPoints ?? 0}</p>
                  </div>

                  <div className="child-settings">
                    <div className="setting-item">
                      <label>Screen Time Limit (min/day):</label>
                      <input
                        type="number"
                        value={linkData.screenTimeLimit ?? 120}
                        onChange={(e) =>
                          handleUpdateSettings(linkData.id, {
                            screenTimeLimit: Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="setting-item">
                      <label>Content Filter:</label>
                      <select
                        value={linkData.contentFilter || 'moderate'}
                        onChange={(e) =>
                          handleUpdateSettings(linkData.id, {
                            contentFilter: e.target.value,
                          })
                        }
                      >
                        <option value="unrestricted">Unrestricted</option>
                        <option value="moderate">Moderate (Default)</option>
                        <option value="strict">Strict</option>
                      </select>
                    </div>

                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={!!linkData.allowNotifications}
                        onChange={(e) =>
                          handleUpdateSettings(linkData.id, {
                            allowNotifications: e.target.checked,
                          })
                        }
                      />
                      Allow Notifications
                    </label>
                  </div>

                  <button className="btn-secondary" onClick={() => handleViewActivity(linkData)}>
                    View Activity
                  </button>
                </div>
              ))
            ) : (
              <p className="no-children">No children linked yet</p>
            )}
          </div>
        </div>
      ) : (
        <div className="child-section">
          <h2>Your Parents/Guardians</h2>

          {parents.length > 0 ? (
            <div className="parents-list">
              {parents.map((linkData) => (
                <div key={linkData.id} className="parent-card">
                  <div className="parent-info">
                    <h3>{linkData.parent?.name || 'Parent'}</h3>
                    <p className="relationship">
                      {(linkData.relationship || 'parent').charAt(0).toUpperCase() +
                        (linkData.relationship || 'parent').slice(1)}
                    </p>
                  </div>

                  <div className="parent-status">
                    {linkData.isActive ? (
                      <span className="status active">✓ Active</span>
                    ) : (
                      <>
                        <span className="status pending">⏳ Pending Approval</span>
                        <button className="btn-approve" onClick={() => handleApproveParent(linkData.id)}>
                          Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-parents">No parents linked yet. Ask your parent/guardian to add you.</p>
          )}
        </div>
      )}

      {selectedChild && (
        <div className="activity-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedChild(null)}>
              ✕
            </button>
            <h2>{selectedChild.child?.name || 'Child'} Activity</h2>

            {activityLoading ? (
              <p>Loading dashboard...</p>
            ) : selectedChildActivity ? (
              <>
                <div className="child-settings" style={{ marginBottom: '1rem' }}>
                  <div className="setting-item">
                    <label>Stories Completed:</label>
                    <p>{selectedChildActivity.activity?.stats?.storiesCompleted ?? 0}</p>
                  </div>
                  <div className="setting-item">
                    <label>Total Challenge Attempts:</label>
                    <p>{selectedChildActivity.activity?.stats?.totalChallengesAttempted ?? 0}</p>
                  </div>
                  <div className="setting-item">
                    <label>Repeated Wrong Attempts:</label>
                    <p>{selectedChildActivity.activity?.stats?.repeatedWrongAttempts ?? 0}</p>
                  </div>
                  <div className="setting-item">
                    <label>Total Points:</label>
                    <p>{selectedChildActivity.activity?.stats?.totalPoints ?? 0}</p>
                  </div>
                </div>

                <div className="child-settings" style={{ marginBottom: '1rem' }}>
                  <h3 style={{ marginBottom: '0.75rem' }}>Latest Alerts</h3>
                  {Array.isArray(selectedChildActivity.activity?.alerts) &&
                  selectedChildActivity.activity.alerts.length > 0 ? (
                    selectedChildActivity.activity.alerts.slice(0, 5).map((alertItem) => (
                      <div className="setting-item" key={alertItem.id || alertItem.createdAt}>
                        <label>{alertItem.type}</label>
                        <p>
                          Attempts: {alertItem.attempts || '-'} |{' '}
                          {alertItem.createdAt
                            ? new Date(alertItem.createdAt).toLocaleString()
                            : 'Unknown time'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>No alerts yet.</p>
                  )}
                </div>

                <div className="child-settings">
                  <h3 style={{ marginBottom: '0.75rem' }}>Completed Stories</h3>
                  {Array.isArray(selectedChildActivity.activity?.completedStories) &&
                  selectedChildActivity.activity.completedStories.length > 0 ? (
                    selectedChildActivity.activity.completedStories.slice(0, 8).map((story) => (
                      <div className="setting-item" key={`${story.storyId}-${story.completedAt}`}>
                        <label>{story.title}</label>
                        <p>
                          {story.category} |{' '}
                          {story.completedAt
                            ? new Date(story.completedAt).toLocaleDateString()
                            : 'Unknown date'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>No stories completed yet.</p>
                  )}
                </div>
              </>
            ) : (
              <p>Could not load child activity.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentalControls;
