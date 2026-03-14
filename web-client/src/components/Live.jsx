import React, { useEffect, useState } from "react";
import { Newspaper, Globe, TreePine, Heart, School, CheckCircle, AlertCircle, Sparkles, Loader2, Search, ChevronLeft, ChevronRight, BookOpen, Play, X, Image as ImageIcon } from "lucide-react";

const Live = () => {
  const [articles, setArticles] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [generatingStoryIndex, setGeneratingStoryIndex] = useState(null);
  const [savedStories, setSavedStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [activeStory, setActiveStory] = useState(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- Fetch news articles ---
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoadingNews(true);
        const response = await fetch("http://localhost:8000/api/news");
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setError("Failed to fetch news. Please try again later.");
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  // --- Fetch saved stories ---
  useEffect(() => {
    const fetchSavedStories = async () => {
      try {
        setLoadingStories(true);
        const response = await fetch("http://localhost:8000/api/news-stories");
        const data = await response.json();
        setSavedStories(data);
      } catch (err) {
        console.error("Failed to fetch saved stories:", err);
      } finally {
        setLoadingStories(false);
      }
    };
    fetchSavedStories();
  }, []);

  // --- Generate and Save Story ---
  const handleGenerateStory = async (index) => {
    setGeneratingStoryIndex(index);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:8000/api/generate-story?article_index=${index}`,
        { method: "POST" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Story generation failed.");
      }

      const story = await response.json();
      console.log("Generated story:", story);

      // Fix the mapping of options to ensure 'to' is an index (or ID if that's your structure)
      const transformedScenes = (story.scenes || []).map((scene) => ({
        title: scene.text || scene.title || "",
        image: scene.imagePrompt || "Image placeholder",
        options: (scene.options || []).map((opt) => ({
          text: opt.text,
          to: opt.nextScene ?? opt.to ?? 0,
        })),
      }));

      const storyToSave = {
        title: story.title,
        description: articles[index]?.description || "",
        level: "6421a2fc5e7b4b5a8d3f9e7c",
        topic: articles[index]?.topicId,
        scenes: transformedScenes,
      };

      const saveResponse = await fetch(
        "http://localhost:8000/api/news-stories",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(storyToSave),
        }
      );

      if (!saveResponse.ok) {
        const data = await saveResponse.json();
        throw new Error(data.detail || "Failed to save story.");
      }

      const savedData = await saveResponse.json();
      setSuccess("Story generated and saved successfully!");
      setSavedStories((prev) => [...prev, savedData]);
    } catch (err) {
      console.error("Story generation error:", err);
      setError(err.message);
    } finally {
      setGeneratingStoryIndex(null);
    }
  };

  const startStory = (story) => {
    setActiveStory(story);
    setCurrentSceneIndex(0);
  };

  const goToScene = (nextIndex) => {
    if (
      activeStory &&
      nextIndex >= 0 &&
      nextIndex < activeStory.scenes.length
    ) {
      setCurrentSceneIndex(nextIndex);
    }
  };

  const getTopicIcon = (topic) => {
    const icons = {
      Internet: <Globe className="w-5 h-5" />,
      Outdoor: <TreePine className="w-5 h-5" />,
      Health: <Heart className="w-5 h-5" />,
      School: <School className="w-5 h-5" />,
    };
    return icons[topic] || <Newspaper className="w-5 h-5" />;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Updates</h1>
          <p className="text-gray-500">Learn about safety through interactive stories</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
          <Newspaper className="w-6 h-6" />
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-emerald-700 font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Latest News Section */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-sky-600" />
          Latest Safety Updates
        </h2>

        {loadingNews ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading news...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No news articles found</h3>
            <p className="text-gray-500">Check back later for safety updates!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article, index) => (
              <div
                key={index}
                className="card p-6 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sky-600">{getTopicIcon(article.topic)}</span>
                      <span className="px-2 py-1 bg-sky-50 text-sky-700 text-xs font-medium rounded-full">
                        {article.topic}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">Source: {article.source}</p>
                    <p className="text-gray-600">{article.description}</p>
                  </div>
                  <button
                    onClick={() => handleGenerateStory(index)}
                    disabled={generatingStoryIndex === index}
                    className={`btn flex-shrink-0 ${
                      generatingStoryIndex === index
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : "btn-primary"
                    }`}
                  >
                    {generatingStoryIndex === index ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Create Story
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Stories Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Your Story Collection
        </h2>

        {loadingStories ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading stories...</p>
          </div>
        ) : savedStories.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No stories yet</h3>
            <p className="text-gray-500">Create one from a news article above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedStories.map((story, idx) => (
              <div
                key={story._id || idx}
                className="card p-6 hover:shadow-lg transition-all group"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors">
                  {story.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{story.description}</p>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1 bg-sky-50 text-sky-700 text-xs font-medium rounded-full">
                    {story.scenes?.length || 0} Scenes
                  </span>
                  <button
                    onClick={() => startStory(story)}
                    className="btn bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 hover:shadow-xl"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Story Viewer Modal */}
      {activeStory && activeStory.scenes?.[currentSceneIndex] && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="p-4 bg-sky-500 text-white flex items-center justify-between">
              <h3 className="text-lg font-semibold truncate pr-4">{activeStory.title}</h3>
              <button
                onClick={() => setActiveStory(null)}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-sky-50 text-sky-700 text-sm font-medium rounded-full">
                  Scene {currentSceneIndex + 1} of {activeStory.scenes.length}
                </span>
              </div>
              
              <p className="text-gray-900 text-lg mb-6 leading-relaxed">
                {activeStory.scenes[currentSceneIndex].title}
              </p>
              
              {activeStory.scenes[currentSceneIndex].image && (
                <div className="rounded-xl overflow-hidden mb-6 bg-gray-100">
                  {activeStory.scenes[currentSceneIndex].image === "Image placeholder" ? (
                    <div className="w-full h-48 bg-sky-50 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-sky-300" />
                    </div>
                  ) : (
                    <img
                      src={activeStory.scenes[currentSceneIndex].image}
                      alt="scene"
                      className="w-full h-48 object-cover"
                    />
                  )}
                </div>
              )}
              
              {/* Options */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-500 mb-3">What would you do?</p>
                {activeStory.scenes[currentSceneIndex].options?.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => goToScene(option.to)}
                    className="w-full text-left p-4 rounded-xl bg-gray-50 hover:bg-sky-50 border-2 border-transparent hover:border-sky-200 transition-all flex items-center gap-3"
                  >
                    <span className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-semibold text-sm">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-gray-700 font-medium">{option.text}</span>
                  </button>
                ))}
                
                {(!activeStory.scenes[currentSceneIndex].options || 
                  activeStory.scenes[currentSceneIndex].options.length === 0) && (
                  <button
                    onClick={() => setActiveStory(null)}
                    className="w-full p-4 rounded-xl bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600"
                  >
                    <Sparkles className="w-5 h-5" />
                    Story Complete! Return to Safety Center
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Live;
