import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import ProfileDropdown from "./ProfileDropDown";
import { useLocation } from "react-router-dom";
import { Menu, Bell, Search } from "lucide-react";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Handle responsive sidebar
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

  // Close sidebar on route change (mobile)
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
        <Sidebar onClose={() => setIsSidebarOpen(false)} isMobile={isMobile} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 lg:h-16 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 flex items-center justify-between px-3 lg:px-6 sticky top-0 z-30">
          {/* Left: Logo on mobile, Menu toggle on tablet */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="p-2 rounded-xl text-gray-600 hover:bg-sky-50 hover:text-sky-600 transition-colors hidden md:block lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <h1 className="text-lg lg:text-xl font-semibold text-sky-600">Safe Space</h1>
          </div>

          {/* Center: Search (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search stories, topics..."
                className="input pl-10 py-2.5 bg-gray-50/80"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Right: Profile */}
          <div className="flex items-center gap-2 lg:gap-3">
            <button className="p-2 rounded-xl text-gray-600 hover:bg-sky-50 hover:text-sky-600 transition-colors relative">
              <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <ProfileDropdown />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="p-3 lg:p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <BottomNav />
    </div>
  );
};

export default Layout;
