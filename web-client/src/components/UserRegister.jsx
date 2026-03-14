import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const UserRegister = () => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // User is already registered during authentication
    // This component just shows the loading state
  }, [user]);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
        <p className="text-gray-500 font-medium">Setting up your account...</p>
      </div>
    </div>
  );
};

export default UserRegister;
