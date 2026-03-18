import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Home, BookOpen, BarChart3, Newspaper, Lightbulb, Shield, X, Smile, BookMarked, Zap, Users, HelpCircle, Heart, MessageCircle, MessageSquare, Globe, Trophy, Settings } from "lucide-react";

const Sidebar = ({ onClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { age } = useAuth();
  
  // Determine user type based on age
  const userType = age && age >= 13 ? 'teen' : 'child';
  
  // Children navigation (age < 13)
  const childrenItems = [
    { name: "Home", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "🧬 Learn", path: "/children", icon: <BookOpen className="w-5 h-5" /> },
    { name: "📰 News", path: "/children/news", icon: <Newspaper className="w-5 h-5" /> },
    { name: "Stories", path: "/stories", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Quizzes", path: "/quizzes", icon: <Lightbulb className="w-5 h-5" /> },
    { name: "My Mood", path: "/mood", icon: <Smile className="w-5 h-5" /> },
    { name: "Leaderboard", path: "/leaderboard", icon: <BarChart3 className="w-5 h-5" /> },
    { separator: true },
    { name: "Child Mode", section: true },
    { name: "Achievements", path: "/achievements", icon: <Trophy className="w-5 h-5" /> },
    { name: "Parental Controls", path: "/parental-controls", icon: <Settings className="w-5 h-5" /> },
  ];

  // Teenager navigation (age >= 13)
  const teenagerItems = [
    { name: "Home", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Expression", path: "/expression", icon: <Heart className="w-5 h-5" /> },
    { name: "My Journal", path: "/journal", icon: <BookMarked className="w-5 h-5" /> },
    { name: "Groups", path: "/groups", icon: <Users className="w-5 h-5" /> },
    { name: "Questions", path: "/queries", icon: <HelpCircle className="w-5 h-5" /> },
    { name: "Resources", path: "/resources", icon: <Newspaper className="w-5 h-5" /> },
    { separator: true },
    { name: "Teen Mode", section: true },
    { name: "AI Friend", path: "/teen/chatbot", icon: <MessageCircle className="w-5 h-5" /> },
    { name: "Forums", path: "/teen/forums", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "Social Feed", path: "/teen/social", icon: <Globe className="w-5 h-5" /> },
  ];

  const sidebarItems = userType === 'child' ? childrenItems : teenagerItems;

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
              <h2 className="text-lg font-bold text-gray-900">IOTA-S</h2>
              <p className="text-xs text-gray-500">
                {userType === 'child' ? 'Safe Learning' : 'Teen Community'}
              </p>
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

      {/* Age Badge */}
      <div className="px-4 py-3">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600">Age: <span className="font-bold text-blue-600">{age}</span></p>
          <p className="text-xs text-gray-500 mt-1">
            {userType === 'child' ? '👶 Child Mode' : '👨‍💼 Teen Mode'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</p>
        {sidebarItems.map((item, index) => {
          if (item.separator) {
            return <div key={`sep-${index}`} className="my-3 border-t border-gray-200"></div>;
          }
          
          if (item.section) {
            return (
              <p key={`section-${index}`} className="px-3 mt-4 mb-2 text-xs font-semibold text-sky-600 uppercase tracking-wider">
                {item.name}
              </p>
            );
          }
          
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
              <p className="text-xs text-gray-400">Keep Learning</p>
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