import React from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Lightbulb, BarChart3, Newspaper, CheckCircle, Flame, Shield, ArrowRight } from "lucide-react";

function Home() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Safety Stories",
      description: "Learn through interactive stories",
      icon: <BookOpen className="w-6 h-6" />,
      bgColor: "bg-sky-50",
      iconColor: "text-sky-600",
      path: "/story-learning"
    },
    {
      title: "Take a Quiz",
      description: "Test your knowledge",
      icon: <Lightbulb className="w-6 h-6" />,
      bgColor: "bg-violet-50",
      iconColor: "text-violet-600",
      path: "/quizzes"
    },
    {
      title: "Leaderboard",
      description: "See top learners",
      icon: <BarChart3 className="w-6 h-6" />,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      path: "/leaderboard"
    },
    {
      title: "Live Updates",
      description: "Stay updated on safety",
      icon: <Newspaper className="w-6 h-6" />,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      path: "/latest-updates"
    }
  ];

  const stats = [
    { label: "Stories Completed", value: "12", icon: <BookOpen className="w-5 h-5" />, color: "text-sky-600", bg: "bg-sky-50" },
    { label: "Quizzes Passed", value: "8", icon: <CheckCircle className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Current Streak", value: "5 days", icon: <Flame className="w-5 h-5" />, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Section */}
      {isSignedIn && (
        <div className="card p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-4 ring-sky-100">
                <img
                  src={user?.imageUrl}
                  alt={user?.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome back, <span className="text-sky-600">{user?.firstName || 'Friend'}</span>
              </h1>
              <p className="text-gray-500 mt-1">
                Ready to learn something new today? Let's explore together.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className="card card-hover p-5 text-left group"
            >
              <div className={`w-12 h-12 rounded-xl ${action.bgColor} ${action.iconColor} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-500">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Continue Learning</h2>
            <button 
              onClick={() => navigate('/story-learning')}
              className="text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-slate-50 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-sky-600">
              <Shield className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Online Safety Basics</h3>
              <p className="text-sm text-gray-500 mb-2">Continue where you left off</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '65%' }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">65% Complete</p>
            </div>
            <button 
              onClick={() => navigate('/story-learning')}
              className="btn btn-primary text-sm"
            >
              Continue
            </button>
          </div>
        </div>

        {/* Daily Tip */}
        <div className="card p-6 bg-amber-50 border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900">Daily Safety Tip</h2>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
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
