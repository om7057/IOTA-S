import { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, useClerk } from "@clerk/clerk-react";
import { UserProvider, useUserProfile } from "./contexts/UserContext";
import Login from "./pages/Login";
import AgeSelection from "./pages/AgeSelection";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ProfilePage from "./pages/ProfilePage";
import JournalPage from "./pages/JournalPage";
import MoodTracker from "./components/MoodTracker";
import Levels from "./components/Levels";
import Quiz from "./components/Quiz";
import Leaderboard from "./components/LeaderBoard";
import Live from "./components/Live";
import StoryPlayer from "./components/StoryPlayer";
import StoryLearning from "./components/StoryLearning";
import Stories from "./components/Stories";
import QuizLandingPage from "./pages/QuizLandingPage";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Age gate wrapper component
const AgeGateWrapper = ({ children }) => {
  const { age, loading } = useUserProfile();
  const { isSignedIn, loaded } = useClerk();

  // Still loading user profile
  if (!loaded || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "linear-gradient(to right, #f0f9ff, #dbeafe)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", border: "4px solid #bae6fd", borderTop: "4px solid #0284c7", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto", marginBottom: "16px" }}></div>
          <p style={{ fontSize: "20px", fontWeight: "600", color: "#374151" }}>Loading your profile...</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Signed in but no age set
  if (isSignedIn && !age) {
    return <AgeSelection />;
  }

  return children;
};

const AppContent = () => {
  const { loaded, isSignedIn } = useClerk();
  const [emotionTimeLine, setEmotionTimeLine] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("Clerk loaded:", loaded);
    console.log("Is signed in:", isSignedIn);
  }, [loaded, isSignedIn]);

  const handleLoading = (status) => {
    setIsLoading(status);
  };

  if (!loaded) {
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

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans antialiased">
      {isLoading && <LoadingSpinner />}
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#FFF',
            color: '#333',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#4CAF50',
              secondary: '#FFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#E53E3E',
              secondary: '#FFF',
            },
          },
        }}
      />
      
      <AgeGateWrapper>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/sign-in" element={<Login />} />
          <Route path="/sign-up" element={<Login />} />
          <Route path="/age-selection" element={<AgeSelection />} />

          <Route 
            path="/" 
            element={
              <>
                <SignedIn>
                  <Layout setIsLoading={handleLoading}>
                    <Home />
                  </Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            } 
          />
          
          <Route 
            path="/mood" 
            element={
              <>
                <SignedIn>
                  <Layout setIsLoading={handleLoading}>
                    <div className="max-w-2xl mx-auto">
                      <MoodTracker />
                    </div>
                  </Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            } 
          />
          
          <Route 
            path="/journal" 
            element={
              <>
                <SignedIn>
                  <Layout setIsLoading={handleLoading}>
                    <JournalPage />
                  </Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <>
                <SignedIn>
                  <Layout setIsLoading={handleLoading}>
                    <ProfilePage />
                  </Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            } 
          />
          
          <Route 
            path="/stories/:levelId" 
            element={
              <>
                <SignedIn>
                  <Layout setIsLoading={handleLoading}>
                    <Stories emotionTimeLine={emotionTimeLine} setEmotionTimeLine={setEmotionTimeLine} />
                  </Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            } 
          />
          
          <Route 
            path="/levels/:topicId" 
            element={
              <>
                <SignedIn>
                  <Layout setIsLoading={handleLoading}>
                    <Levels />
                  </Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            } 
          />
          
          <Route 
            path="/quiz/:storyId" 
            element={
              <>
                <SignedIn>
                  <Layout setIsLoading={handleLoading}>
                    <Quiz />
                  </Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            } 
          />
          
          <Route 
            path="/leaderboard" 
            element={
              <>
                <SignedIn>
                  <Layout setIsLoading={handleLoading}>
                    <Leaderboard />
                  </Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            } 
          />
          
          <Route 
            path="/live" 
            element={
              <>
                <SignedIn>
                  <Layout setIsLoading={handleLoading}>
                    <Live />
                  </Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            } 
          />
          
          <Route 
            path="/story-play/:storyId" 
            element={
              <>
                <SignedIn>
                  <Layout setIsLoading={handleLoading}>
                    <StoryPlayer emotionTimeline={emotionTimeLine} setEmotionTimeline={setEmotionTimeLine} />
                  </Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            } 
          />
          
          <Route 
            path="/story-learning" 
            element={
              <>
                <SignedIn>
                  <Layout setIsLoading={handleLoading}>
                    <StoryLearning />
                  </Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            } 
          />
          
          <Route 
            path="/quizzes" 
            element={
              <>
                <SignedIn>
                  <Layout setIsLoading={handleLoading}>
                    <QuizLandingPage />
                  </Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AgeGateWrapper>
    </div>
  );
};

const App = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;
