import { SignIn, SignUp, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle } from "lucide-react";

const Login = () => {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-600 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Safe Space</h1>
          <p className="text-gray-500 mt-2">Learn. Play. Stay Safe.</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <SignedOut>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                {isSigningUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-center text-gray-500 mt-1">
                {isSigningUp 
                  ? "Start your safety learning journey" 
                  : "Continue your learning adventure"}
              </p>
            </div>

            {/* Clerk Auth Component */}
            <div className="clerk-container">
              {isSigningUp ? (
                <SignUp 
                  redirectUrl="/" 
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none p-0",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: "border border-gray-200 hover:bg-gray-50",
                      formFieldInput: "rounded-xl border-gray-200 focus:border-sky-500 focus:ring-sky-500",
                      formButtonPrimary: "bg-sky-600 hover:bg-sky-700 rounded-xl",
                    }
                  }}
                />
              ) : (
                <SignIn 
                  redirectUrl="/"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none p-0",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: "border border-gray-200 hover:bg-gray-50",
                      formFieldInput: "rounded-xl border-gray-200 focus:border-sky-500 focus:ring-sky-500",
                      formButtonPrimary: "bg-sky-600 hover:bg-sky-700 rounded-xl",
                    }
                  }}
                />
              )}
            </div>

            {/* Toggle Sign In/Up */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <button
                onClick={() => setIsSigningUp(!isSigningUp)}
                className="text-sky-600 hover:text-sky-700 font-medium transition-colors"
              >
                {isSigningUp 
                  ? "Already have an account? Sign In" 
                  : "Don't have an account? Sign Up"}
              </button>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">You're signed in!</h3>
              <p className="text-gray-500 mb-6">Ready to start learning?</p>
              <button
                onClick={() => navigate('/')}
                className="btn btn-primary"
              >
                Go to Dashboard
              </button>
            </div>
          </SignedIn>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default Login;
