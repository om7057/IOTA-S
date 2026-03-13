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

// Teen Mode Imports
import {
  TeenProvider,
  TeenLayout,
  AgeGate,
  InitialRedirect,
  AgeSelection,
  TeenDashboard,
  Express,
  Journal,
  AnonymousQuestions,
  CommunityCircles,
  Support,
  ProfileAnalyzer,
} from "./teen";

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

        {/* Root redirects to age selection or appropriate mode */}
        <Route
          path="/"
          element={
            <SignedIn>
              <InitialRedirect />
            </SignedIn>
          }
        />

        {/* Child/Pre-teen Home Route */}
        <Route
          path="/home"
          element={
            <SignedIn>
              <AgeGate requiredMode="preteen">
                <Layout setIsLoading={handleLoading}>
                  <Home />
                </Layout>
              </AgeGate>
            </SignedIn>
          }
        />

        <Route
          path="/profile"
          element={
            <SignedIn>
              <AgeGate requiredMode="preteen">
                <Layout setIsLoading={handleLoading}>
                  <ProfilePage />
                </Layout>
              </AgeGate>
            </SignedIn>
          }
        />

        <Route
          path="/stories/:levelId"
          element={
            <SignedIn>
              <AgeGate requiredMode="preteen">
                <Layout setIsLoading={handleLoading}>
                  <Stories
                    emotionTimeLine={emotionTimeLine}
                    setEmotionTimeLine={setEmotionTimeLine}
                  />
                </Layout>
              </AgeGate>
            </SignedIn>
          }
        />

        <Route
          path="/levels/:topicId"
          element={
            <SignedIn>
              <AgeGate requiredMode="preteen">
                <Layout setIsLoading={handleLoading}>
                  <Levels />
                </Layout>
              </AgeGate>
            </SignedIn>
          }
        />

        <Route
          path="/quiz/:storyId"
          element={
            <SignedIn>
              <AgeGate requiredMode="preteen">
                <Layout setIsLoading={handleLoading}>
                  <Quiz />
                </Layout>
              </AgeGate>
            </SignedIn>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <SignedIn>
              <AgeGate requiredMode="preteen">
                <Layout setIsLoading={handleLoading}>
                  <Leaderboard />
                </Layout>
              </AgeGate>
            </SignedIn>
          }
        />

        <Route
          path="/live"
          element={
            <SignedIn>
              <AgeGate requiredMode="preteen">
                <Layout setIsLoading={handleLoading}>
                  <Live />
                </Layout>
              </AgeGate>
            </SignedIn>
          }
        />

        <Route
          path="/story-play/:storyId"
          element={
            <SignedIn>
              <AgeGate requiredMode="preteen">
                <Layout setIsLoading={handleLoading}>
                  <StoryPlayer
                    emotionTimeline={emotionTimeLine}
                    setEmotionTimeline={setEmotionTimeLine}
                  />
                </Layout>
              </AgeGate>
            </SignedIn>
          }
        />

        <Route
          path="/story-learning"
          element={
            <SignedIn>
              <AgeGate requiredMode="preteen">
                <Layout setIsLoading={handleLoading}>
                  <StoryLearning />
                </Layout>
              </AgeGate>
            </SignedIn>
          }
        />

        <Route
          path="/quizzes"
          element={
            <SignedIn>
              <AgeGate requiredMode="preteen">
                <Layout setIsLoading={handleLoading}>
                  <QuizLandingPage />
                </Layout>
              </AgeGate>
            </SignedIn>
          }
        />

        {/* Age Selection Route */}
        <Route
          path="/age-selection"
          element={
            <SignedIn>
              <AgeSelection />
            </SignedIn>
          }
        />

        {/* Teen Mode Routes */}
        <Route
          path="/teen"
          element={
            <SignedIn>
              <TeenProvider>
                <TeenLayout>
                  <TeenDashboard />
                </TeenLayout>
              </TeenProvider>
            </SignedIn>
          }
        />

        <Route
          path="/teen/express"
          element={
            <SignedIn>
              <TeenProvider>
                <TeenLayout>
                  <Express />
                </TeenLayout>
              </TeenProvider>
            </SignedIn>
          }
        />

        <Route
          path="/teen/journal"
          element={
            <SignedIn>
              <TeenProvider>
                <TeenLayout>
                  <Journal />
                </TeenLayout>
              </TeenProvider>
            </SignedIn>
          }
        />

        <Route
          path="/teen/ask"
          element={
            <SignedIn>
              <TeenProvider>
                <TeenLayout>
                  <AnonymousQuestions />
                </TeenLayout>
              </TeenProvider>
            </SignedIn>
          }
        />

        <Route
          path="/teen/community"
          element={
            <SignedIn>
              <TeenProvider>
                <TeenLayout>
                  <CommunityCircles />
                </TeenLayout>
              </TeenProvider>
            </SignedIn>
          }
        />

        <Route
          path="/teen/support"
          element={
            <SignedIn>
              <TeenProvider>
                <TeenLayout>
                  <Support />
                </TeenLayout>
              </TeenProvider>
            </SignedIn>
          }
        />

        <Route
          path="/teen/profile"
          element={
            <SignedIn>
              <TeenProvider>
                <TeenLayout>
                  <ProfileAnalyzer />
                </TeenLayout>
              </TeenProvider>
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