import { useEffect, useState } from "react";
import { Trophy, Medal, Award, Info, Users, RefreshCw } from "lucide-react";
import { API_CONFIG } from "../config/api";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState([]);
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState("");
  const [filteredScores, setFilteredScores] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log("📢 Fetching initial leaderboard data...");
        const responses = await Promise.all([
          fetch(API_CONFIG.USERS),
          fetch(API_CONFIG.STORIES),
          fetch(API_CONFIG.LEADERBOARD),
        ]);

        if (responses.some((res) => !res.ok)) {
          throw new Error("❌ One or more API requests failed.");
        }

        const [usersData, storiesData, leaderboardData] = await Promise.all(
          responses.map((res) => res.json())
        );

        console.log("✅ Users fetched:", usersData);
        console.log("✅ Stories fetched:", storiesData);
        console.log("✅ Leaderboard fetched:", leaderboardData);

        setUsers(usersData);
        setStories(storiesData);
        setScores(leaderboardData);
        setFilteredScores(leaderboardData);
        setErrorMessage("");
      } catch (err) {
        console.error("❌ Error fetching initial data:", err);
        setErrorMessage("Oops! We couldn't load the learning heroes board. Try again later!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        let url = API_CONFIG.LEADERBOARD;
        if (selectedStory) {
          url = API_CONFIG.LEADERBOARD_BY_STORY(selectedStory);
        }

        console.log(`📢 Fetching leaderboard for story: ${selectedStory || "All"}`);

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          console.error("❌ Error loading leaderboard:", data.error || "Unknown error");
          setFilteredScores([]);
          setErrorMessage("No learning heroes found for this topic yet. Be the first one!");
          return;
        }

        console.log("✅ Leaderboard updated:", data);
        setScores(data);
        setFilteredScores(data);
        setErrorMessage("");
      } catch (err) {
        console.error("❌ Error fetching leaderboard:", err);
        setFilteredScores([]);
        setErrorMessage("No learning heroes found for this topic yet. Be the first one!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedStory]);

  useEffect(() => {
    console.log("📊 Scores state updated:", scores);
    console.log("📊 Filtered Scores updated:", filteredScores);
  }, [scores, filteredScores]);

  const getUser = (userId) => {
    if (!userId) return null;
    if (typeof userId === "object" && userId._id) return userId;
    return users.find((u) => u._id === userId) || null;
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-4 h-4" />;
    if (index === 1) return <Medal className="w-4 h-4" />;
    if (index === 2) return <Award className="w-4 h-4" />;
    return index + 1;
  };

  const getRankStyle = (index) => {
    if (index === 0) return "bg-amber-100 text-amber-700";
    if (index === 1) return "bg-gray-100 text-gray-600";
    if (index === 2) return "bg-orange-100 text-orange-700";
    return "bg-gray-50 text-gray-600";
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-500">See how you rank among learning heroes</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
          <Trophy className="w-6 h-6" />
        </div>
      </div>

      <div className="card p-6">
        {/* Filter */}
        <div className="mb-6">
          <label htmlFor="story-select" className="block mb-2 text-sm font-medium text-gray-700">Filter by Topic</label>
          <select
            id="story-select"
            className="w-full md:w-64 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition cursor-pointer"
            value={selectedStory}
            onChange={(e) => setSelectedStory(e.target.value)}
          >
            <option value="">All Topics</option>
            {stories.map((s) => (
              <option key={s._id} value={s._id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading leaderboard...</p>
          </div>
        ) : (
          <>
            {errorMessage ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg mb-4">{errorMessage}</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            ) : filteredScores.length > 0 ? (
              <div className="space-y-3">
                {filteredScores.map((entry, index) => {
                  const user = getUser(entry.userId);
                  return (
                    <div 
                      key={entry._id || entry.userId} 
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        index < 3 ? 'bg-slate-50' : 'bg-white hover:bg-slate-50 border border-gray-100'
                      }`}
                    >
                      {/* Rank */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${getRankStyle(index)}`}>
                        {getRankIcon(index)}
                      </div>
                      
                      {/* Avatar */}
                      <div className="relative">
                        {user?.imageUrl ? (
                          <img
                            src={user.imageUrl}
                            alt={user.username}
                            className={`w-12 h-12 rounded-full border-2 ${
                              index === 0 ? 'border-amber-400' : index === 1 ? 'border-gray-400' : index === 2 ? 'border-amber-600' : 'border-gray-200'
                            }`}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold">
                            {user?.username?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      
                      {/* Name & Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{user?.username || "Mystery Hero"}</p>
                        {selectedStory && entry.topic?.name && (
                          <p className="text-sm text-gray-500 truncate">
                            {entry.topic?.name} • Level {entry.level?.levelNumber || 1}
                          </p>
                        )}
                      </div>
                      
                      {/* Score */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-sky-600">
                          {entry.totalScore || entry.score || 0}
                        </p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No heroes yet</h3>
                <p className="text-gray-500">Be the first to learn and earn points!</p>
              </div>
            )}
          </>
        )}
        
        {/* Info Card */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">How to Become a Learning Hero</h3>
              <p className="text-sm text-gray-600">
                Complete lessons and quizzes to earn points! The more you learn about important topics, the higher your score will be on the Heroes Board.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;