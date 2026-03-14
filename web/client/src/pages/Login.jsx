import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { Github } from "lucide-react";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      console.log("User is signed in, redirecting to home");
      navigate("/", { replace: true });
    }
  }, [isSignedIn, navigate]);

  // Handle real Google OAuth callback
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      console.log("Google OAuth success!");
      
      // Decode the Google JWT to get user info
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Google user info:", decoded);
      
      const oauthData = {
        email: decoded.email,
        firstName: decoded.given_name || decoded.name?.split(' ')[0] || '',
        lastName: decoded.family_name || decoded.name?.split(' ')[1] || '',
        imageUrl: decoded.picture,
        googleId: decoded.sub
      };
      
      console.log("Sending Google OAuth data to backend:", oauthData);
      
      const response = await fetch("http://localhost:5000/api/auth/oauth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(oauthData)
      });

      console.log("Backend OAuth response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("OAuth error response:", errorData);
        throw new Error(errorData.message || "Failed to sign in with Google");
      }

      const data = await response.json();
      console.log("OAuth success, user:", data.user);
      
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      
      toast.success("Signed in with Google! Let's set up your profile...");
      setTimeout(() => {
        window.location.href = "/select-age";
      }, 1000);
    } catch (error) {
      console.error("Google login error:", error);
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google OAuth login failed");
    toast.error("Failed to sign in with Google. Please try again.");
  };

  // Handle GitHub OAuth
  const handleGitHubLogin = async () => {
    try {
      setIsLoading(true);
      console.log("Starting GitHub OAuth...");
      
      const oauthData = {
        login: "testuser_github",
        name: "Test User",
        avatar_url: "https://via.placeholder.com/150",
        id: "github_" + Date.now()
      };
      
      console.log("Sending GitHub OAuth data:", oauthData);
      
      const response = await fetch("http://localhost:5000/api/auth/oauth/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(oauthData)
      });

      console.log("GitHub OAuth response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("GitHub OAuth error response:", errorData);
        throw new Error(errorData.message || "Failed to sign in with GitHub");
      }

      const data = await response.json();
      console.log("GitHub OAuth success, user:", data.user);
      
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      
      toast.success("Signed in with GitHub! Let's set up your profile...");
      setTimeout(() => {
        window.location.href = "/select-age";
      }, 1000);
    } catch (error) {
      console.error("GitHub login error:", error);
      toast.error(error.message || "Failed to sign in with GitHub");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Safe Space</h1>
          <p className="text-gray-600">Learn & Stay Safe</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Welcome Back</h2>
          <p className="text-gray-600 text-center mb-8">Sign in to continue to Safe Space</p>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {/* Google Login */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                size="large"
                width="100%"
                text="signin_with"
              />
            </div>

            {/* GitHub Login */}
            <button
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Github className="w-5 h-5 text-gray-900" />
              {isLoading ? "Signing in..." : "Continue with GitHub"}
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-500">Or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Email Login (Optional) */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
              />
            </div>
            <button className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200">
              Sign in with Email
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 mt-6">
            By signing in, you agree to our<br />
            <a href="#" className="text-sky-600 hover:text-sky-700 font-medium">Terms of Service</a> and{" "}
            <a href="#" className="text-sky-600 hover:text-sky-700 font-medium">Privacy Policy</a>
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-slate-800 rounded-2xl p-6 text-white text-center">
          <p className="text-sm mb-2">🛡️ Your data is encrypted and secure</p>
          <p className="text-xs text-gray-400">Designed for children aged 5-19</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
