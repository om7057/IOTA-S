import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BarChart3, LogOut, CheckCircle, ArrowLeft } from "lucide-react";

const ProfilePage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.id || !token) {
        console.log("Missing user ID or token, skipping fetch");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching stats for user:", user.id);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        
        // Fetch quiz progress data (for backward compatibility and detailed attempts)
        const quizProgressResponse = await fetch(`${apiUrl}/quiz-progress/user/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch comprehensive progress stats
        const progressStatsResponse = await fetch(`${apiUrl}/progress/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch quiz stats
        const quizStatsResponse = await fetch(`${apiUrl}/quizzes/stats/all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (quizProgressResponse.ok && progressStatsResponse.ok && quizStatsResponse.ok) {
          const quizProgressData = await quizProgressResponse.json();
          const progressStats = await progressStatsResponse.json();
          const quizStats = await quizStatsResponse.json();

          console.log("All data fetched successfully");
          setUserData(Array.isArray(quizProgressData) ? quizProgressData : quizProgressData.data || []);
          setStatsData({
            storiesCompleted: progressStats.data?.storiesCompleted || 0,
            unitsCompleted: progressStats.data?.unitsCompleted || 0,
            lessonsCompleted: progressStats.data?.lessonsCompleted || 0,
            totalPointsEarned: progressStats.data?.totalPointsEarned || 0,
            quizzesCompleted: quizStats.data?.quizzesCompleted || 0,
            quizPointsEarned: quizStats.data?.totalPoints || 0,
            avgScore: quizStats.data?.avgScore || 0,
            totalAttempts: (progressStats.data?.totalAttempts || 0) + (quizStats.data?.totalAttempts || 0),
          });
        } else {
          if (!quizProgressResponse.ok && quizProgressResponse.status !== 404) {
            const errorData = await quizProgressResponse.json();
            throw new Error(errorData.message || "Failed to fetch quiz progress");
          }
          // Set partial data if available
          if (progressStatsResponse.ok) {
            const progressStats = await progressStatsResponse.json();
            setStatsData({
              storiesCompleted: progressStats.data?.storiesCompleted || 0,
              unitsCompleted: progressStats.data?.unitsCompleted || 0,
              lessonsCompleted: progressStats.data?.lessonsCompleted || 0,
              totalPointsEarned: progressStats.data?.totalPointsEarned || 0,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user, token]);

  return (
    <div className="max-w-lg mx-auto">
      <div className="card p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
          <div className="h-1 w-16 bg-sky-500 mx-auto rounded-full"></div>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-sky-100 p-1">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center border-4 border-white text-4xl text-white font-bold">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.email || "Your Email"}</h2>
          <p className="text-gray-500">Learner</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </>
          ) : error ? (
            <div className="col-span-3 text-center py-4">
              <p className="text-red-500 text-sm">Error loading stats: {error}</p>
            </div>
          ) : (
            <>
              {/* Total Points */}
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                <p className="text-2xl font-bold text-amber-600 mb-1">
                  {(statsData?.totalPointsEarned || 0) + (statsData?.quizPointsEarned || 0)}
                </p>
                <p className="text-xs text-gray-600 font-medium">Total Points</p>
              </div>
              {/* Quizzes Completed */}
              <div className="bg-sky-50 rounded-xl p-4 text-center border border-sky-100">
                <p className="text-2xl font-bold text-sky-600 mb-1">{statsData?.quizzesCompleted || 0}</p>
                <p className="text-xs text-gray-600 font-medium">Quizzes Completed</p>
              </div>
              {/* Content Completed */}
              <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                <p className="text-2xl font-bold text-emerald-600 mb-1">
                  {(statsData?.storiesCompleted || 0) + (statsData?.unitsCompleted || 0) + (statsData?.lessonsCompleted || 0)}
                </p>
                <p className="text-xs text-gray-600 font-medium">Content Items</p>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/my-progress")}
            className="w-full btn bg-emerald-600 text-white hover:bg-emerald-700 justify-center"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            My Learning Progress
          </button>

          <button
            onClick={handleLogout}
            className="w-full btn btn-secondary justify-center"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Log Out
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center text-sky-600 hover:text-sky-700 font-medium py-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
