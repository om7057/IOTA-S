import { useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ProfilePage from "./pages/ProfilePage";
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

const App = () => {
  const [emotionTimeLine, setEmotionTimeLine] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoading = (status) => {
    setIsLoading(status);
  };

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
      
      <Routes>
        <Route 
          path="/login" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <Login />
            </div>
          } 
        />
        <Route 
          path="/sign-in" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <Login />
            </div>
          } 
        />
        <Route 
          path="/sign-up" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <Login />
            </div>
          } 
        />

        <Route
          path="/"
          element={
            <SignedIn>
              <Layout setIsLoading={handleLoading}>
                <Home />
              </Layout>
            </SignedIn>
          }
        />

        <Route
          path="/profile"
          element={
            <SignedIn>
              <Layout setIsLoading={handleLoading}>
                <ProfilePage />
              </Layout>
            </SignedIn>
          }
        />

        <Route
          path="/stories/:levelId"
          element={
            <SignedIn>
              <Layout setIsLoading={handleLoading}>
                <Stories
                  emotionTimeLine={emotionTimeLine}
                  setEmotionTimeLine={setEmotionTimeLine}
                />
              </Layout>
            </SignedIn>
          }
        />

        <Route
          path="/levels/:topicId"
          element={
            <SignedIn>
              <Layout setIsLoading={handleLoading}>
                <Levels />
              </Layout>
            </SignedIn>
          }
        />

        <Route
          path="/quiz/:storyId"
          element={
            <SignedIn>
              <Layout setIsLoading={handleLoading}>
                <Quiz />
              </Layout>
            </SignedIn>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <SignedIn>
              <Layout setIsLoading={handleLoading}>
                <Leaderboard />
              </Layout>
            </SignedIn>
          }
        />

        <Route
          path="/live"
          element={
            <SignedIn>
              <Layout setIsLoading={handleLoading}>
                <Live />
              </Layout>
            </SignedIn>
          }
        />

        <Route
          path="/story-play/:storyId"
          element={
            <SignedIn>
              <Layout setIsLoading={handleLoading}>
                <StoryPlayer
                  emotionTimeline={emotionTimeLine}
                  setEmotionTimeline={setEmotionTimeLine}
                />
              </Layout>
            </SignedIn>
          }
        />

        <Route
          path="/story-learning"
          element={
            <SignedIn>
              <Layout setIsLoading={handleLoading}>
                <StoryLearning />
              </Layout>
            </SignedIn>
          }
        />

        <Route
          path="/quizzes"
          element={
            <SignedIn>
              <Layout setIsLoading={handleLoading}>
                <QuizLandingPage />
              </Layout>
            </SignedIn>
          }
        />

        <Route 
          path="*" 
          element={
            <Navigate to="/" />
          } 
        />
      </Routes>
    </div>
  );
};

export default App;