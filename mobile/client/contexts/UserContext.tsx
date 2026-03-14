import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface UserProfile {
  id: string;
  age?: number;
  userType?: 'child' | 'teenager';
  displayName?: string;
  email?: string;
}

interface UserContextType {
  userProfile: UserProfile | null;
  userType: 'child' | 'teenager' | null;
  age: number | null;
  hasAge: boolean;
  setUserAge: (age: number) => Promise<void>;
  loading: boolean;
  fetchUserProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { session, user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://10.236.168.104:3000/api';

  const fetchUserProfile = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUserProfile({
          id: session.user.id,
          age: data.age,
          userType: data.userType || calculateUserType(data.age),
          displayName: data.display_name,
          email: session.user.email,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateUserType = (age?: number): 'child' | 'teenager' => {
    if (!age) return 'child';
    return age < 13 ? 'child' : 'teenager';
  };

  const setUserAge = async (age: number) => {
    if (!session?.user?.id) throw new Error('No user session');

    try {
      const userType = calculateUserType(age);
      const response = await fetch(`${API_URL}/users/${session.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age, userType }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile({
          id: session.user.id,
          age: data.age,
          userType: data.userType,
          displayName: data.display_name,
          email: session.user.email,
        });
      } else {
        throw new Error('Failed to set age');
      }
    } catch (error) {
      console.error('Error setting user age:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProfile();
    }
  }, [session?.user?.id]);

  const hasAge = userProfile?.age !== undefined && userProfile.age !== null;

  return (
    <UserContext.Provider
      value={{
        userProfile,
        userType: userProfile?.userType || null,
        age: userProfile?.age || null,
        hasAge,
        setUserAge,
        loading,
        fetchUserProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserProfile must be used within UserProvider');
  }
  return context;
}
