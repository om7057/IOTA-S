import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Lightbulb,
  BarChart3,
  Newspaper,
  CheckCircle,
  Flame,
  Shield,
  Smile,
  BookMarked,
  ArrowRight,
} from "lucide-react";
import SocialFeed from "../components/SocialFeed";

function Home() {
  const { user, isSignedIn, token, age, userType } = useAuth();
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [progressPercentage, setProgressPercentage] = useState(0);

  const isTeen = userType === "teenager" || (typeof age === "number" && age >= 13);

  useEffect(() => {
    const fetchStats = async () => {
      if (isTeen) {
        setStatsLoading(false);
        return;
      }

      if (!user?.id || !token || !isSignedIn) {
        setStatsLoading(false);
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

        const progressResponse = await fetch(`${apiUrl}/progress/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const quizResponse = await fetch(`${apiUrl}/quizzes/stats/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const leaderboardResponse = await fetch(`${apiUrl}/leaderboards/user/rank`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (progressResponse.ok && quizResponse.ok) {
          const progressData = await progressResponse.json();
          const quizData = await quizResponse.json();
          const leaderboardData = leaderboardResponse.ok ? await leaderboardResponse.json() : null;

          const totalCompleted =
            (progressData.data?.storiesCompleted || 0) +
            (progressData.data?.unitsCompleted || 0) +
            (progressData.data?.lessonsCompleted || 0);
          const totalAttempted = progressData.data?.totalAttempts || 1;
          const overallProgress =
            totalAttempted > 0 ? Math.round((totalCompleted / Math.max(totalAttempted, 5)) * 100) : 0;

          setProgressPercentage(Math.min(overallProgress, 100));

          setStatsData({
            storiesCompleted: progressData.data?.storiesCompleted || 0,
            quizzesCompleted: quizData.data?.quizzesCompleted || 0,
            streak: leaderboardData?.data?.streak || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [user, token, isSignedIn, isTeen]);

  if (isTeen) {
    return (
      <div className="space-y-4 sm:space-y-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Social Feed</h1>
          <p className="text-slate-500 mt-1">Share your thoughts and connect with your community.</p>
        </div>
        <SocialFeed embedded />
      </div>
    );
  }

  const quickActions = [
    {
      title: "How Are You Feeling?",
      description: "Log your mood for today",
      icon: <Smile className="w-6 h-6" />,
      bgColor: "bg-rose-50",
      iconColor: "text-rose-600",
      path: "/mood",
    },
    {
      title: "My Journal",
      description: "Write your private thoughts",
      icon: <BookMarked className="w-6 h-6" />,
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      path: "/journal",
    },
    {
      title: "Take a Quiz",
      description: "Test your knowledge",
      icon: <Lightbulb className="w-6 h-6" />,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-700",
      path: "/quiz-landing",
    },
    {
      title: "Leaderboard",
      description: "See top learners",
      icon: <BarChart3 className="w-6 h-6" />,
      bgColor: "bg-slate-100",
      iconColor: "text-slate-700",
      path: "/leaderboard",
    },
    {
      title: "Live Updates",
      description: "Stay updated on safety",
      icon: <Newspaper className="w-6 h-6" />,
      bgColor: "bg-cyan-50",
      iconColor: "text-cyan-700",
      path: "/live",
    },
  ];

  const stats = [
    {
      label: "Stories Completed",
      value: statsLoading ? "..." : statsData?.storiesCompleted || 0,
      icon: <BookOpen className="w-5 h-5" />,
      color: "text-teal-700",
      bg: "bg-teal-50",
    },
    {
      label: "Quizzes Passed",
      value: statsLoading ? "..." : statsData?.quizzesCompleted || 0,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Current Streak",
      value: statsLoading ? "..." : statsData?.streak ? `${statsData.streak} days` : "0 days",
      icon: <Flame className="w-5 h-5" />,
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {isSignedIn && (
        <div className="card p-5 sm:p-6 lg:p-7 overflow-hidden relative">
          <div className="absolute -right-12 -top-10 w-40 h-40 rounded-full bg-teal-100/45 blur-2xl pointer-events-none"></div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-4 ring-teal-100">
                <img src={user?.imageUrl} alt={user?.fullName} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                Welcome back, <span className="text-teal-700">{user?.firstName || "Friend"}</span>
              </h1>
              <p className="text-slate-500 mt-1">Ready to learn something new today? Let&apos;s explore together.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="card p-4 sm:p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="section-title mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className="card card-hover p-4 sm:p-5 text-left group"
            >
              <div
                className={`w-12 h-12 rounded-xl ${action.bgColor} ${action.iconColor} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
              >
                {action.icon}
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
              <p className="text-sm text-slate-500">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2 card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Continue Learning</h2>
            <button
              onClick={() => navigate("/children")}
              className="text-teal-700 hover:text-teal-800 text-sm font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-slate-100/90 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-slate-200">
            <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-teal-700">
              <Shield className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Online Safety Basics</h3>
              <p className="text-sm text-slate-500 mb-2">Continue where you left off</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-1">{progressPercentage}% Complete</p>
            </div>
            <button onClick={() => navigate("/children")} className="btn btn-primary text-sm">
              Continue
            </button>
          </div>
        </div>

        <div className="card p-5 sm:p-6 bg-amber-50/80 border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-slate-900">Daily Safety Tip</h2>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed">
            Never share your personal information like your home address, phone number, or school name with strangers online. Stay safe!
          </p>
          <button className="mt-4 text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1">
            Learn More <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
