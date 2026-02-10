import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TeenSidebar from "./TeenSidebar";
import TeenBottomNav from "./TeenBottomNav";
import { Menu, Bell } from "lucide-react";
import { useTeen } from "../contexts/TeenContext";

const TeenLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { showSupportBanner } = useTeen();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location, isMobile]);

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <aside
        className={`
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          fixed lg:static inset-y-0 left-0 z-50
          w-72 transition-transform duration-300 ease-in-out
          lg:translate-x-0 hidden lg:block
        `}
      >
        <TeenSidebar onClose={() => setIsSidebarOpen(false)} isMobile={isMobile} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 lg:h-16 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 flex items-center justify-between px-3 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="p-2 rounded-xl text-gray-600 hover:bg-sky-50 hover:text-sky-600 transition-colors hidden md:block lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div>
              <h1 className="text-lg lg:text-xl font-semibold text-sky-600">SafeSpace</h1>
              <p className="text-[10px] lg:text-xs text-gray-500 hidden sm:block">Teen Wellness Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <button className="p-2 rounded-xl text-gray-600 hover:bg-sky-50 hover:text-sky-600 transition-colors relative">
              <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-sky-100 flex items-center justify-center">
              <span className="text-sky-600 font-medium text-sm lg:text-base">T</span>
            </div>
          </div>
        </header>

        {/* Support Banner */}
        {showSupportBanner && (
          <div className="bg-sky-50 border-b border-sky-100 px-3 lg:px-6 py-2 lg:py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs lg:text-sm text-sky-700 flex-1">
                Additional support options are available.
              </p>
              <a
                href="/teen/support"
                className="text-xs lg:text-sm font-medium text-sky-600 hover:text-sky-700 underline whitespace-nowrap"
              >
                View
              </a>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="p-3 lg:p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <TeenBottomNav />
    </div>
  );
};

export default TeenLayout;
