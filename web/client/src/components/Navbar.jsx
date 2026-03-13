import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { BookOpen, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Topics", path: "/topics" },
    { name: "Leaderboard", path: "/leaderboard" },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:block">Learning Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.path
                    ? "bg-sky-50 text-sky-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            <SignedOut>
              <Link 
                to="/login" 
                className="btn btn-primary"
              >
                Login
              </Link>
            </SignedOut>

            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9 ring-2 ring-sky-100",
                  }
                }}
              />
            </SignedIn>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.path
                      ? "bg-sky-50 text-sky-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;