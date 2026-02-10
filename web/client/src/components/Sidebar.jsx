import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, BarChart3, Newspaper, Lightbulb, Shield, X, Zap } from "lucide-react";

const Sidebar = ({ onClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Navigation items with Lucide icons
  const sidebarItems = [
    { name: "Home", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Safety Stories", path: "/story-learning", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Leaderboard", path: "/leaderboard", icon: <BarChart3 className="w-5 h-5" /> },
    { name: "Live", path: "/live", icon: <Newspaper className="w-5 h-5" /> },
    { name: "Quiz Games", path: "/quizzes", icon: <Lightbulb className="w-5 h-5" /> },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Safe Space</h2>
              <p className="text-xs text-gray-500">Learn & Stay Safe</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</p>
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                transition-all duration-200 group
                ${isActive 
                  ? "bg-sky-50 text-sky-700 font-medium" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
              onClick={() => handleNavigate(item.path)}
            >
              <span className={`
                ${isActive ? "text-sky-600" : "text-gray-400 group-hover:text-gray-600"}
                transition-colors
              `}>
                {item.icon}
              </span>
              <span>{item.name}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-600"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Card */}
      <div className="p-4">
        <div className="bg-slate-800 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Stay Safe!</p>
              <p className="text-xs text-gray-400">Have Fun Learning</p>
            </div>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-sky-500 rounded-full"></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">75% Progress</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;