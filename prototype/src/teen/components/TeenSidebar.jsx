import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Heart, 
  BookOpen, 
  MessageCircle, 
  Users, 
  LifeBuoy, 
  X, 
  Sparkles,
  ArrowLeft
} from "lucide-react";

const TeenSidebar = ({ onClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const sidebarItems = [
    { name: "Dashboard", path: "/teen", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Journal", path: "/teen/journal", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Ask", path: "/teen/ask", icon: <MessageCircle className="w-5 h-5" /> },
    { name: "Community Circles", path: "/teen/community", icon: <Users className="w-5 h-5" /> },
    { name: "Your Profile", path: "/teen/profile", icon: <Heart className="w-5 h-5" /> },
    { name: "Support & Resources", path: "/teen/support", icon: <LifeBuoy className="w-5 h-5" /> },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleBackToSelection = () => {
    localStorage.removeItem('age_selection');
    navigate('/age-selection');
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">SafeSpace</h2>
              <p className="text-xs text-gray-500">Your Wellness Hub</p>
            </div>
          </div>
          
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

      {/* Footer */}
      <div className="p-4 space-y-3">
        <button
          onClick={handleBackToSelection}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors border border-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Switch Mode</span>
        </button>
        
        <div className="bg-slate-800 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">You matter</p>
              <p className="text-xs text-gray-400">We're here for you</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeenSidebar;
