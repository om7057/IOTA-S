import { createContext, useState, useContext, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const { user, isLoaded } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [userType, setUserType] = useState(null); // 'child' or 'teen'
  const [age, setAge] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from backend
  useEffect(() => {
    if (isLoaded && user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [isLoaded, user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/clerk/${user.id}`);
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
        if (profile.age) {
          setAge(profile.age);
          setUserType(profile.age >= 13 ? 'teen' : 'child');
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const setUserAge = async (userAge) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}/age`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age: userAge })
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile(updatedProfile);
        setAge(userAge);
        setUserType(userAge >= 13 ? 'teen' : 'child');
        return true;
      }
    } catch (error) {
      console.error('Error setting user age:', error);
    }
    return false;
  };

  return (
    <UserContext.Provider value={{
      userProfile,
      age,
      userType,
      loading,
      setUserAge,
      user
    }}>
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
