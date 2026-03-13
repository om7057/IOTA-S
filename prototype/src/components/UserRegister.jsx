import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { registerUser } from "../services/auth";
import { Loader2 } from "lucide-react";

const UserRegister = () => {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      registerUser({
        clerkId: user.id,
        username: user.username,
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.profileImageUrl,
      }).then((res) => console.log("User registered:", res));
    }
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
