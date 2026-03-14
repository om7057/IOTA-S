import { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import AgeSelection from "./pages/AgeSelection";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ProfilePage from "./pages/ProfilePage";
import JournalPage from "./pages/JournalPage";
import StoriesPage from "./pages/StoriesPage";
import ExpressionPage from "./pages/ExpressionPage";
import GroupsPage from "./pages/GroupsPage";
import QueriesPage from "./pages/QueriesPage";
import ResourcesPage from "./pages/ResourcesPage";
import MoodTracker from "./components/MoodTracker";
import Levels from "./components/Levels";
import Quiz from "./components/Quiz";
import Leaderboard from "./components/LeaderBoard";
import Live from "./components/Live";
import StoryPlayer from "./components/StoryPlayer";
import StoryLearning from "./components/StoryLearning";
import Stories from "./components/Stories";
import StoryWithChallenges from "./components/StoryWithChallenges";
import UnitsAndLessons from "./components/UnitsAndLessons";
import QuizLandingPage from "./pages/QuizLandingPage";
import TeenForum from "./pages/TeenForum";
import TeenJournal from "./pages/TeenJournal";
import TeenCommunities from "./pages/TeenCommunities";
import TeenMessages from "./pages/TeenMessages";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "./components/common/LoadingSpinner";

const AppContent = () => {
  const { isLoading, isSignedIn, age } = useAuth();
  const [emotionTimeLine, setEmotionTimeLine] = useState([]);
  const [isLoadingApp, setIsLoadingApp] = useState(false);

  // All hooks must be at the top - before any conditionals
  useEffect(() => {
    console.log("Is signed in:", isSignedIn);
  }, [isSignedIn]);

  // Move this before the early returns
  useEffect(() => {
    if (isSignedIn) {
      // Only run emotion data fetch when signed in
      const handleSetEmotionData = (emotionData) => {
        setEmotionTimeLine(emotionData);
      };
    }
  }, [isSignedIn]);

  const handleLoading = (status) => {
    setIsLoadingApp(status);
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "linear-gradient(to right, #f0f9ff, #dbeafe)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", border: "4px solid #bae6fd", borderTop: "4px solid #0284c7", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto", marginBottom: "16px" }}></div>
          <p style={{ fontSize: "20px", fontWeight: "600", color: "#374151" }}>Loading...</p>
          <p style={{ fontSize: "14px", color: "#9ca3af" }}>Initializing authentication</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Login />;
  }

  // Signed in but age not selected - show age selection page
  if (!age) {
    return <AgeSelection />;
  }

  return (
    <Layout onLoading={handleLoading}>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/expression" element={<ExpressionPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/queries" element={<QueriesPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/mood" element={<MoodTracker onLoading={handleLoading} />} />
        <Route path="/levels" element={<Levels onLoading={handleLoading} />} />
        <Route path="/quiz" element={<Quiz onLoading={handleLoading} />} />
        <Route path="/quiz-landing" element={<QuizLandingPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/live" element={<Live />} />
        <Route path="/story/:id" element={<StoryPlayer />} />
        <Route path="/story-learning/:id" element={<StoryLearning />} />
        <Route path="/stories-list" element={<Stories />} />
        <Route path="/units/:topicId" element={<UnitsAndLessons />} />
        <Route path="/lesson/:lessonId" element={<StoryWithChallenges />} />
        <Route path="/loading" element={<LoadingSpinner />} />

        {/* Teen Section Routes */}
        {age && age >= 13 && (
          <>
            <Route path="/teen/forum" element={<TeenForum />} />
            <Route path="/teen/journal" element={<TeenJournal />} />
            <Route path="/teen/community" element={<TeenCommunities />} />
            <Route path="/teen/messages" element={<TeenMessages />} />
          </>
        )}

        {/* Catch all - navigate to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
