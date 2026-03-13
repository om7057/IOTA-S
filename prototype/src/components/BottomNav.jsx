import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, BarChart3, Newspaper, Lightbulb } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/home", icon: Home },
    { name: "Stories", path: "/story-learning", icon: BookOpen },
    { name: "Quiz", path: "/quizzes", icon: Lightbulb },
    { name: "Ranks", path: "/leaderboard", icon: BarChart3 },
    { name: "News", path: "/latest-updates", icon: Newspaper },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path === "/home" && location.pathname === "/");
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full px-1 transition-colors ${
                isActive 
                  ? "text-sky-600" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : ""}`} />
              <span className={`text-[10px] mt-1 ${isActive ? "font-semibold" : "font-medium"}`}>
                {item.name}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-sky-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
