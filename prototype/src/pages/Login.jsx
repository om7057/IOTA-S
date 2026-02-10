import { SignIn, SignUp, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle } from "lucide-react";

const Login = () => {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const navigate = useNavigate();

  const clerkAppearance = {
    elements: {
      rootBox: "w-full",
      card: "bg-white shadow-none border border-gray-200 rounded-2xl",
      headerTitle: "hidden",
      headerSubtitle: "hidden",
      dividerLine: "bg-gray-200",
      dividerText: "text-gray-500",
      socialButtonsBlockButton: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 rounded-xl font-medium",
      socialButtonsBlockButtonText: "font-medium",
      formFieldLabel: "text-gray-700 font-medium",
      formFieldInput: "rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20",
      formButtonPrimary: "bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-medium",
      footerActionLink: "text-sky-600 hover:text-sky-700",
      // Hide footer links to avoid confusion
      footer: "hidden",
    },
    variables: {
      colorPrimary: "#0ea5e9",
      colorText: "#1f2937",
      colorTextSecondary: "#6b7280",
      colorBackground: "#ffffff",
      colorInputBackground: "#f3f4f6",
      colorInputText: "#1f2937",
      colorDanger: "#ef4444",
      borderRadius: "0.75rem",
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-600 mb-4 shadow-lg">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Safe Space</h1>
          <p className="text-gray-500 mt-2 text-lg">Learn. Play. Stay Safe.</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <SignedOut>
            {/* Title */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                {isSigningUp ? "Create Your Account" : "Welcome Back"}
              </h2>
              <p className="text-center text-gray-600 mt-2 text-sm">
                {isSigningUp 
                  ? "Start your safety learning journey today" 
                  : "Continue your learning adventure"}
              </p>
            </div>

            {/* Clerk Auth Component */}
            <div className="w-full">
              {isSigningUp ? (
                <SignUp 
                  redirectUrl="/" 
                  appearance={clerkAppearance}
                />
              ) : (
                <SignIn 
                  redirectUrl="/"
                  appearance={clerkAppearance}
                />
              )}
            </div>

            {/* Toggle Sign In/Up */}
            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm mb-3">
                {isSigningUp 
                  ? "Already have an account?" 
                  : "Don't have an account?"}
              </p>
              <button
                onClick={() => setIsSigningUp(!isSigningUp)}
                className="text-sky-600 hover:text-sky-700 font-semibold transition-colors hover:underline"
              >
                {isSigningUp 
                  ? "Sign In Instead" 
                  : "Create New Account"}
              </button>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h3>
              <p className="text-gray-600 mb-8">You're all set and ready to go</p>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </SignedIn>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Login;
