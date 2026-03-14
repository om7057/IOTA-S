import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BarChart3, LogOut, CheckCircle, ArrowLeft } from "lucide-react";

const ProfilePage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!user?.id || !token) {
        console.log("Missing user ID or token, skipping fetch");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching progress for user:", user.id);
        const response = await fetch(`http://localhost:5000/api/quiz-progress/user/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Progress fetch response status:", response.status);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log("No progress data found (404) - setting empty state");
            setUserData(null);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch user progress");
          }
        } else {
          const data = await response.json();
          console.log("Progress data received:", data);
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching user progress:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProgress();
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
              <p className="text-red-500 text-sm">Error loading progress: {error}</p>
            </div>
          ) : Array.isArray(userData) && userData.length > 0 ? (
            <>
              {/* Calculate stats from quiz progress data */}
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                <p className="text-2xl font-bold text-amber-600 mb-1">{userData.reduce((sum, p) => sum + (p.points || 0), 0)}</p>
                <p className="text-xs text-gray-600 font-medium">Points Earned</p>
              </div>
              <div className="bg-sky-50 rounded-xl p-4 text-center border border-sky-100">
                <p className="text-2xl font-bold text-sky-600 mb-1">{userData.filter(p => p.isCorrect).length}</p>
                <p className="text-xs text-gray-600 font-medium">Correct Answers</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                <p className="text-2xl font-bold text-emerald-600 mb-1">{userData.length}</p>
                <p className="text-xs text-gray-600 font-medium">Total Attempts</p>
              </div>
            </>
          ) : (
            <div className="col-span-3 text-center py-4">
              <p className="text-gray-500 text-sm">No progress data found. Start taking quizzes!</p>
            </div>
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
