import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import AgeSelection from "./pages/AgeSelection";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ProfilePage from "./pages/ProfilePage";
import JournalPage from "./pages/JournalPage";
import GroupsPage from "./pages/GroupsPage";
import GroupChatPage from "./pages/GroupChatPage";
import ResourcesPage from "./pages/ResourcesPage";
import Levels from "./components/Levels";
import Quiz from "./components/Quiz";
import Leaderboard from "./components/LeaderBoard";
import Live from "./components/Live";
import QuizLandingPage from "./pages/QuizLandingPage";
import TeenForum from "./pages/TeenForum";
import TeenJournal from "./pages/TeenJournal";
import TeenCommunities from "./pages/TeenCommunities";
import TeenMessages from "./pages/TeenMessages";
import Chatbot from "./components/Chatbot";
import Forums from "./components/Forums";
import SocialFeed from "./components/SocialFeed";
import Achievements from "./components/Achievements";
import ParentalControls from "./components/ParentalControls";
import ChildrenCoursesPage from "./pages/ChildrenCoursesPage";
import ChildrenLessonPage from "./pages/ChildrenLessonPage";
import ChildrenNewsStoryPage from "./pages/ChildrenNewsStoryPage";
import ChildrenNewsGenerationPage from "./pages/ChildrenNewsGenerationPage";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "./components/common/LoadingSpinner";

const AppContent = () => {
  const { isLoading, isSignedIn, age } = useAuth();

  const handleLoading = () => {};

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "radial-gradient(circle at top left, rgba(13,122,123,0.08), transparent 40%), #f4f7f8" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "58px", height: "58px", border: "3px solid #dbe4e8", borderTop: "3px solid #0d7a7b", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto", marginBottom: "16px" }}></div>
          <p style={{ fontSize: "20px", fontWeight: "600", color: "#0f1720" }}>Loading...</p>
          <p style={{ fontSize: "14px", color: "#60707b" }}>Initializing authentication</p>
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
        <Route path="/expression" element={<SocialFeed />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:groupId" element={<GroupChatPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/levels" element={<Levels onLoading={handleLoading} />} />
        <Route path="/quiz" element={<QuizLandingPage />} />
        <Route path="/quiz/:quizId" element={<Quiz onLoading={handleLoading} />} />
        <Route path="/quiz-landing" element={<QuizLandingPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/live" element={<Live />} />
        <Route path="/loading" element={<LoadingSpinner />} />

        {/* Child Mode Routes (age < 13) - Phase 8A */}
        {age && age < 13 && (
          <>
            <Route path="/children" element={<ChildrenCoursesPage />} />
            <Route path="/children/news" element={<ChildrenNewsGenerationPage />} />
            <Route path="/children/news-story/:storyId" element={<ChildrenNewsStoryPage />} />
            <Route path="/children/course/:courseId" element={<ChildrenLessonPage />} />
            <Route path="/children/lesson/:lessonId" element={<ChildrenLessonPage />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/parental-controls" element={<ParentalControls />} />
          </>
        )}

        {/* Teen Section Routes */}
        {age && age >= 13 && (
          <>
            <Route path="/teen/forum" element={<TeenForum />} />
            <Route path="/teen/journal" element={<TeenJournal />} />
            <Route path="/teen/community" element={<TeenCommunities />} />
            <Route path="/teen/messages" element={<TeenMessages />} />
            <Route path="/teen/chatbot" element={<Chatbot />} />
            <Route path="/teen/forums" element={<Forums />} />
            <Route path="/teen/social" element={<Navigate to="/expression" replace />} />
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
