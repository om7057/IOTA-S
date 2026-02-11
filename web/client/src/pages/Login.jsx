import { SignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <SignedOut>
          {/* Show default Clerk SignIn component */}
          <SignIn 
            redirectUrl="/"
            appearance={{
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
            }}
          />
        </SignedOut>

        <SignedIn>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
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
    </div>
  );
};

export default Login;
