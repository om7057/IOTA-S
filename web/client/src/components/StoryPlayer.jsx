import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useEmotionDetection from "../components/useEmotionDetection";
import EmotionChart from "./EmotionChart";
import { Loader2, AlertCircle, Search, Sparkles, ChevronLeft, Lightbulb, Video } from "lucide-react";

const StoryPlayer = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [storyCompleted, setStoryCompleted] = useState(false);
  const [sceneTransition, setSceneTransition] = useState(false);

  const {
    videoRef,
    emotionTimeline,
    startDetection,
    stopDetection,
  } = useEmotionDetection();

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/stories/${storyId}`);
        if (!res.ok) throw new Error("Failed to fetch story");
        const data = await res.json();
        setStory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [storyId]);

  useEffect(() => {
    let localStream;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        localStream = stream;

        const waitForVideoRef = () => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          } else {
            requestAnimationFrame(waitForVideoRef);
          }
        };
        waitForVideoRef();

        startDetection();
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
      });

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
        console.log("Video stream stopped on unmount");
      }
      stopDetection();
    };
  }, [videoRef, startDetection, stopDetection]);

  useEffect(() => {
    // Auto-complete if no options exist in current scene
    if (story && story.scenes[currentSceneIndex].options.length === 0) {
      console.log("Scene has no options, auto-ending story");
      setStoryCompleted(true);
      stopDetection();
    }
  }, [currentSceneIndex, story, stopDetection]);

  const handleOptionClick = (nextIndex, optionText) => {
    console.log("Option clicked:", optionText, "| nextIndex:", nextIndex);
    const isEnding = optionText.toLowerCase().includes("end") || nextIndex === -1;

    if (isEnding) {
      console.log("Ending story due to option:", optionText);
      stopDetection();

      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
        console.log("Video stream stopped");
      }

      setStoryCompleted(true);
      return;
    }

    if (nextIndex < 0 || nextIndex >= story.scenes.length) {
      alert("Invalid story path.");
      return;
    }

    setSceneTransition(true);
    setTimeout(() => {
      setCurrentSceneIndex(nextIndex);
      setSceneTransition(false);
    }, 500);
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
      <div className="card p-8 text-center">
        <Loader2 className="w-16 h-16 text-sky-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading your story adventure...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
      <div className="card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</p>
        <p className="text-gray-500 mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary">
          Go Back
        </button>
      </div>
    </div>
  );

  if (!story) return (
    <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
      <div className="card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-amber-500" />
        </div>
        <p className="text-xl font-semibold text-gray-900 mb-2">Story not found</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary mt-4">
          Go Back
        </button>
      </div>
    </div>
  );

  const currentScene = story.scenes[currentSceneIndex];
  const progress = ((currentSceneIndex + 1) / story.scenes.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-6 lg:p-8 relative">
        {/* Header */}
        <div className="mb-6 pr-52">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{story.title}</h1>
          <p className="text-gray-500">{story.description}</p>
        </div>

        {/* Webcam Feed */}
        <div className="absolute top-6 right-6 w-44 rounded-xl overflow-hidden shadow-lg border-2 border-sky-200">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-32 object-cover"
          />
          <div className="bg-sky-500 text-white text-xs py-1.5 text-center font-medium flex items-center justify-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
            Emotion Tracker
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Scene {currentSceneIndex + 1} of {story.scenes.length}</span>
            <span className="text-sm font-medium text-sky-600">{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar h-2">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Scene Content */}
        <div className={`bg-sky-50 rounded-2xl p-6 ${sceneTransition ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            {currentScene.title}
          </h2>

          {currentScene.image && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <img
                src={currentScene.image}
                alt={currentScene.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div className="space-y-3">
            {currentScene.options.map((option, index) => (
              <button
                key={index}
                className="w-full p-4 rounded-xl text-left transition-all duration-200 bg-white hover:bg-sky-50 border-2 border-transparent hover:border-sky-200 flex items-center gap-4 shadow-sm hover:shadow"
                onClick={() => handleOptionClick(option.to, option.text)}
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-100 text-sky-600 font-semibold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="font-medium text-gray-700">{option.text}</span>
              </button>
            ))}
          </div>

          {currentScene.options.length === 0 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <p className="font-bold text-2xl text-gray-900 mb-2">Story Complete!</p>
            </div>
          )}
        </div>

        {/* Emotion Chart & Quiz Button */}
        {storyCompleted && (
          <div className="mt-8 p-6 bg-sky-50 rounded-2xl">
            <h2 className="text-xl font-bold text-center text-gray-900 mb-6">Your Emotion Journey</h2>
            <EmotionChart emotionTimeline={emotionTimeline} />
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate(`/quiz/${storyId}`)}
                className="btn bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 hover:shadow-xl"
              >
                <Lightbulb className="w-5 h-5 mr-2" />
                Take the Quiz
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="mt-6 text-center">
        <button 
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back to Stories
        </button>
      </div>
    </div>
  );
};

export default StoryPlayer;
