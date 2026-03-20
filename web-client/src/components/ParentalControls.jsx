import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

  const fetchMyChildren = async (isRetry = false) => {
    try {
      const response = await axios.get(`${API_URL}/parental/children/${user.id}`, { headers: authHeaders });
      const list = Array.isArray(response?.data?.data) ? response.data.data : [];
      
      if (list.length === 0 && !isRetry) {
        try {
          await axios.post(`${API_URL}/parental/seed-defaults`, {}, { headers: authHeaders });
          return fetchMyChildren(true);
        } catch (seedErr) {
          console.error('Auto-seeding parental data failed:', seedErr);
        }
      }
      
      setChildren(list);
    } catch (error) {
      console.error('Error fetching children:', error);
      setChildren([]);
    }
  };

  const fetchMyParents = async () => {
    try {
      const response = await axios.get(`${API_URL}/parental/parents/${user.id}`, { headers: authHeaders });
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
        `${API_URL}/parental/link`,
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
      await axios.post(`${API_URL}/parental/link/${parentalAccountId}/approve`, {}, { headers: authHeaders });
      await fetchMyParents();
    } catch (error) {
      console.error('Error approving parent:', error);
      alert(error?.response?.data?.message || 'Failed to approve parent link');
    }
  };

  const handleUpdateSettings = async (parentalAccountId, newSettings) => {
    try {
      await axios.put(`${API_URL}/parental/settings/${parentalAccountId}`, newSettings, {
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
      const response = await axios.get(`${API_URL}/parental/activity/${linkData.child.id}`, {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium text-lg">
        <div className="flex bg-white/80 backdrop-blur-md px-6 py-4 rounded-xl shadow border border-slate-100 items-center justify-center animate-pulse gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-teal-500 border-t-transparent animate-spin"></div>
          Loading parental controls...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6 mb-8 pt-4">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Parental Controls</h1>
        
        <div className="flex p-1.5 bg-slate-100 rounded-2xl md:max-w-fit w-full">
          <button
            className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
              mode === 'parent' 
                ? 'bg-white text-teal-700 shadow border border-slate-200/60' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
            onClick={() => setMode('parent')}
          >
            Parent View
          </button>
          <button
            className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
              mode === 'child' 
                ? 'bg-white text-teal-700 shadow border border-slate-200/60' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
            onClick={() => setMode('child')}
          >
            As Child
          </button>
        </div>
      </div>

      {mode === 'parent' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-2xl font-bold text-slate-800">Manage Your Children</h2>

          {/* Add Child Segment */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 max-w-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-100 text-teal-700 text-sm">
                +
              </span>
              Link Child Account
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter child email or exact user ID..."
                className="flex-1 w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium text-slate-700 placeholder:font-normal"
                value={childLookup}
                onChange={(e) => setChildLookup(e.target.value)}
              />
              <button 
                onClick={handleAddChild} 
                className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm hover:shadow"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/80 border-t-white animate-spin"></div>
                ) : (
                  'Send Invite'
                )}
              </button>
            </div>
            {newParentAccountId && (
              <div className="mt-4 p-4 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-teal-200 text-teal-800">✓</span> 
                Link request sent securely! Awaiting your child's approval.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
            {children.length > 0 ? (
              children.map((linkData) => (
                <div key={linkData.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  
                  {/* Decorative background accent */}
                  <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-teal-400 to-indigo-400 opacity-60"></div>
                  
                  <div className="w-24 h-24 mx-auto mt-2 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl overflow-hidden mb-5 border-4 border-white shadow-sm ring-1 ring-slate-100 group-hover:scale-105 transition-transform duration-300">
                    {linkData.child?.avatarUrl ? (
                      <img src={linkData.child.avatarUrl} alt={linkData.child?.name || 'Child avatar'} className="w-full h-full object-cover" />
                    ) : (
                      <span>👦</span>
                    )}
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-2 truncate px-2">{linkData.child?.name || 'Child'}</h3>
                    <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold text-slate-600">
                       <span className="px-3 py-1 bg-slate-100 rounded-full">
                         Joined: {linkData.child?.joinedAt ? new Date(linkData.child.joinedAt).toLocaleDateString() : 'Unknown'}
                       </span>
                       <span className={`px-3 py-1 rounded-full ${linkData.isActive ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                         {linkData.isActive ? 'Active' : 'Pending'}
                       </span>
                    </div>
                  </div>

                  {/* Settings Box */}
                  <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-5 mb-6 flex-1">
                    
                    <div className="flex flex-col gap-2 relative">
                      <label className="text-sm font-semibold text-slate-700 flex justify-between items-center whitespace-nowrap overflow-hidden text-ellipsis">
                        Screen Time Limit
                        <span className="text-xs font-medium text-slate-400 font-mono ml-2">(min)</span>
                      </label>
                      <input
                        type="number"
                        min="10"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold text-slate-700 overflow-hidden"
                        value={linkData.screenTimeLimit ?? 120}
                        onChange={(e) => handleUpdateSettings(linkData.id, { screenTimeLimit: Number(e.target.value) })}
                      />
                    </div>

                    <div className="flex flex-col gap-2 overflow-hidden">
                      <label className="text-sm font-semibold text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis">Content Rule</label>
                      <select
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium text-slate-700 appearance-none cursor-pointer overflow-hidden"
                        value={linkData.contentFilter || 'moderate'}
                        onChange={(e) => handleUpdateSettings(linkData.id, { contentFilter: e.target.value })}
                      >
                        <option value="unrestricted">Unrestricted</option>
                        <option value="moderate">Moderate (Standard)</option>
                        <option value="strict">Strict</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-white/60 transition-colors mt-2 overflow-hidden">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-teal-600 focus:ring-teal-500 border-slate-300 rounded cursor-pointer transition-all shrink-0"
                        checked={!!linkData.allowNotifications}
                        onChange={(e) => handleUpdateSettings(linkData.id, { allowNotifications: e.target.checked })}
                      />
                      <span className="text-sm font-semibold text-slate-700 select-none whitespace-nowrap overflow-hidden text-ellipsis">Send parent alerts</span>
                    </label>
                  </div>

                  <button 
                    className="w-full mt-auto py-3.5 bg-white border-2 border-slate-100 hover:border-teal-200 hover:bg-teal-50 text-teal-700 font-bold rounded-xl transition-all" 
                    onClick={() => handleViewActivity(linkData)}
                  >
                    View Progress & Activity
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-slate-50 border border-slate-200 border-dashed rounded-3xl">
                <div className="text-5xl mb-4 opacity-50">👥</div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">No children linked</h3>
                <p className="text-slate-500 font-medium">Use the widget above to link a child's account safely.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-800">Your Parents/Guardians</h2>

          {parents.length > 0 ? (
            <div className="grid gap-4">
              {parents.map((linkData) => (
                <div key={linkData.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-5 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center font-bold text-xl ring-4 ring-white shadow-sm shrink-0">
                      {linkData.parent?.name?.charAt(0) || 'P'}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-lg font-bold text-slate-800 mb-0.5 truncate">{linkData.parent?.name || 'Parent'}</h3>
                      <p className="text-sm font-medium text-slate-500 capitalize truncate">
                        {linkData.relationship || 'Guardian'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center shrink-0">
                    {linkData.isActive ? (
                      <span className="px-4 py-2 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-sm font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                        Active Link
                      </span>
                    ) : (
                      <div className="flex w-full sm:w-auto items-center gap-3">
                        <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">Pending</span>
                        <button 
                          className="flex-1 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-sm whitespace-nowrap" 
                          onClick={() => handleApproveParent(linkData.id)}
                        >
                          Approve Link
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-slate-50 border border-slate-200 border-dashed rounded-3xl">
               <p className="text-slate-600 font-medium text-lg">No parents linked yet. Provide your parent with your email to get started.</p>
            </div>
          )}
        </div>
      )}

      {selectedChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 pt-16 mt-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-white px-8 py-6 flex justify-between items-center border-b border-slate-100 z-10 sticky top-0 shrink-0">
              <h2 className="text-2xl font-bold text-slate-800 truncate">
                <span className="text-teal-600">{selectedChild.child?.name?.split(' ')[0] || 'Child'}</span>'s Dashboard
              </h2>
              <button 
                className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0" 
                onClick={() => setSelectedChild(null)}
              >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* Modal Content - Scrolling Data */}
            <div className="overflow-y-auto p-8 space-y-10">
              {activityLoading ? (
                <div className="flex flex-col animate-pulse space-y-8">
                  <div className="h-28 bg-slate-100 border border-slate-200 rounded-2xl"></div>
                  <div className="space-y-4">
                    <div className="h-6 w-1/3 bg-slate-200 rounded"></div>
                    <div className="h-16 bg-slate-100 rounded-2xl"></div>
                    <div className="h-16 bg-slate-100 rounded-2xl"></div>
                  </div>
                </div>
              ) : selectedChildActivity && selectedChildActivity.activity ? (
                <>
                  {/* Grid Stats */}
                  <div>
                    <h3 className="text-sm uppercase tracking-wider font-bold text-slate-400 mb-4 min-w-0 break-words">Overview Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      
                      <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex flex-col overflow-hidden">
                        <span className="text-indigo-800 font-semibold mb-1 truncate">Total Points</span>
                        <span className="text-3xl font-black text-indigo-600 truncate">{selectedChildActivity.activity?.stats?.totalPoints ?? 0}</span>
                      </div>
                      
                      <div className="bg-teal-50 border border-teal-100 p-5 rounded-2xl flex flex-col overflow-hidden">
                        <span className="text-teal-800 font-semibold mb-1 truncate">Stories Done</span>
                        <span className="text-3xl font-black text-teal-600 truncate">{selectedChildActivity.activity?.stats?.storiesCompleted ?? 0}</span>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex flex-col overflow-hidden">
                        <span className="text-amber-800 font-semibold mb-1 truncate">Challenges Trying</span>
                        <span className="text-3xl font-black text-amber-600 truncate">{selectedChildActivity.activity?.stats?.totalChallengesAttempted ?? 0}</span>
                      </div>
                      
                      <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex flex-col overflow-hidden">
                        <span className="text-red-800 font-semibold mb-1 truncate">Mistakes Repeated</span>
                        <span className="text-3xl font-black text-red-600 truncate">{selectedChildActivity.activity?.stats?.repeatedWrongAttempts ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Alerts */}
                  <div>
                    <h3 className="text-sm uppercase tracking-wider font-bold text-slate-400 mb-4">Latest Alerts</h3>
                    <div className="space-y-3">
                      {Array.isArray(selectedChildActivity.activity?.alerts) && selectedChildActivity.activity.alerts.length > 0 ? (
                        selectedChildActivity.activity.alerts.slice(0, 5).map((alertItem) => (
                          <div className="flex justify-between items-center p-4 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden" key={alertItem.id || alertItem.createdAt}>
                            <div className="flex items-start gap-4 overflow-hidden">
                              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold">!</div>
                              <div className="overflow-hidden">
                                <h4 className="font-bold text-slate-800 truncate">{alertItem.type}</h4>
                                <p className="text-sm font-medium text-slate-500 mt-0.5 truncate">
                                  {alertItem.createdAt ? new Date(alertItem.createdAt).toLocaleString([], {hour: '2-digit', minute:'2-digit', day: 'numeric', month: 'short'}) : 'Unknown time'}
                                  {alertItem.attempts ? ` • ${alertItem.attempts} attempts` : ''}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                          <p className="text-slate-500 font-medium">All clear! No alerts reported.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stories */}
                  <div>
                    <h3 className="text-sm uppercase tracking-wider font-bold text-slate-400 mb-4">Recent Stories</h3>
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl divide-y divide-slate-100 overflow-hidden">
                      {Array.isArray(selectedChildActivity.activity?.completedStories) && selectedChildActivity.activity.completedStories.length > 0 ? (
                        selectedChildActivity.activity.completedStories.slice(0, 8).map((story) => (
                          <div className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 overflow-hidden" key={`${story.storyId}-${story.completedAt}`}>
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-bold text-slate-800 truncate">{story.title}</span>
                              <span className="text-sm font-semibold text-teal-600 uppercase tracking-widest truncate">{story.category}</span>
                            </div>
                            <span className="text-sm font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-lg self-start sm:self-auto shrink-0">
                              {story.completedAt ? new Date(story.completedAt).toLocaleDateString() : 'Unknown date'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-500 font-medium">No stories completed yet.</div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-rose-500 font-medium bg-rose-50 border border-rose-100 rounded-2xl">
                  Could not load child activity. Backend response was unstable.
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 text-center rounded-b-3xl mt-auto shrink-0">
               <button className="text-slate-500 hover:text-slate-800 font-bold transition-colors" onClick={() => setSelectedChild(null)}>Close Dashboard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentalControls;
