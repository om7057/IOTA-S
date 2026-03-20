import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
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
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/auth/google/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...oauthData, platform: 'web' })
      });

      console.log("Backend OAuth response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("OAuth error response:", errorData);
        throw new Error(errorData.message || "Failed to sign in with Google");
      }

      const data = await response.json();
      console.log("OAuth success, user:", data.user);
      const accessToken = data?.tokens?.accessToken || data?.token;
      const refreshToken = data?.tokens?.refreshToken || data?.refreshToken;
      if (!accessToken) {
        throw new Error("Invalid auth response: missing access token");
      }
      
      localStorage.setItem("authToken", accessToken);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
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



  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo Section */}
        <div className="mb-7 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-600 shadow-xl shadow-teal-900/25 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-1">Safe Space</h1>
          <p className="text-slate-600">Learn smart. Stay safe.</p>
        </div>

        {/* Login Card */}
        <div className="card p-6 sm:p-8 border-slate-200/90">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2 text-center">Welcome Back</h2>
          <p className="text-slate-600 text-center mb-7">Sign in to continue to Safe Space</p>

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
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-sm text-slate-500">Or</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Email Login (Optional) */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button className="w-full btn btn-primary">
              Sign in with Email
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-slate-600 mt-6">
            By signing in, you agree to our<br />
            <a href="#" className="text-teal-700 hover:text-teal-800 font-medium">Terms of Service</a> and{" "}
            <a href="#" className="text-teal-700 hover:text-teal-800 font-medium">Privacy Policy</a>
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-5 bg-[#172530] rounded-2xl p-5 text-white text-center border border-white/10">
          <p className="text-sm mb-2">Your data is encrypted and secure</p>
          <p className="text-xs text-gray-400">Designed for children aged 5-19</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
