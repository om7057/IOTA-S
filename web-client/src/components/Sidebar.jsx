import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Home, BookOpen, BarChart3, Newspaper, Lightbulb, Shield, X, BookMarked, Zap, Users, Heart, MessageCircle, MessageSquare, Trophy, Settings } from "lucide-react";

const Sidebar = ({ onClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { age } = useAuth();
  
  // Determine user type based on age
  const userType = age && age >= 13 ? 'teen' : 'child';
  
  // Children navigation (age < 13)
  const childrenItems = [
    { name: "Home", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Learn", path: "/children", icon: <BookOpen className="w-5 h-5" /> },
    { name: "News", path: "/children/news", icon: <Newspaper className="w-5 h-5" /> },
    { name: "Quizzes", path: "/quiz-landing", icon: <Lightbulb className="w-5 h-5" /> },
    { name: "Leaderboard", path: "/leaderboard", icon: <BarChart3 className="w-5 h-5" /> },
    { separator: true },
    { name: "Child Mode", section: true },
    { name: "Achievements", path: "/achievements", icon: <Trophy className="w-5 h-5" /> },
    { name: "Parental Controls", path: "/parental-controls", icon: <Settings className="w-5 h-5" /> },
  ];

  // Teenager navigation (age >= 13)
  const teenagerItems = [
    { name: "Home", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Social Feed", path: "/expression", icon: <Heart className="w-5 h-5" /> },
    { name: "My Journal", path: "/journal", icon: <BookMarked className="w-5 h-5" /> },
    { name: "Groups", path: "/groups", icon: <Users className="w-5 h-5" /> },
    { name: "Resources", path: "/resources", icon: <Newspaper className="w-5 h-5" /> },
    { separator: true },
    { name: "Teen Mode", section: true },
    { name: "AI Friend", path: "/teen/chatbot", icon: <MessageCircle className="w-5 h-5" /> },
    { name: "Forums", path: "/teen/forums", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "Specialists", path: "/teen/psychiatrist", icon: <Heart className="w-5 h-5" /> },
  ];

  const sidebarItems = userType === 'child' ? childrenItems : teenagerItems;

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div className="h-full bg-white/92 backdrop-blur-xl border-r border-slate-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center shadow-md shadow-teal-900/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">IOTA-S</h2>
              <p className="text-xs text-slate-500">
                {userType === 'child' ? 'Safe Learning' : 'Teen Community'}
              </p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Age Badge */}
      <div className="px-4 pt-3 pb-2">
        <div className="bg-slate-100 rounded-xl p-3 text-center border border-slate-200">
          <p className="text-xs text-slate-600">Age <span className="font-semibold text-slate-900">{age || "-"}</span></p>
          <p className="text-xs text-slate-500 mt-1">
            {userType === 'child' ? 'Child Mode' : 'Teen Mode'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Menu</p>
        {sidebarItems.map((item, index) => {
          if (item.separator) {
            return <div key={`sep-${index}`} className="my-3 border-t border-slate-200"></div>;
          }
          
          if (item.section) {
            return (
              <p key={`section-${index}`} className="px-3 mt-4 mb-2 text-[11px] font-semibold text-teal-700 uppercase tracking-wider">
                {item.name}
              </p>
            );
          }
          
          const isActive = location.pathname === item.path || (item.path === '/groups' && location.pathname.startsWith('/groups/'));
          return (
            <button
              key={item.path}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                transition-all duration-200 group
                ${isActive 
                  ? "bg-teal-50 text-teal-800 font-medium border border-teal-100" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                }
              `}
              onClick={() => handleNavigate(item.path)}
            >
              <span className={`
                ${isActive ? "text-teal-700" : "text-slate-400 group-hover:text-slate-600"}
                transition-colors
              `}>
                {item.icon}
              </span>
              <span>{item.name}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-700"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Card */}
      <div className="p-4">
        <div className="bg-[#132029] rounded-2xl p-4 text-white">
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
            <div className="h-full w-3/4 bg-teal-500 rounded-full"></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">75% Progress</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;