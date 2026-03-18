import { createContext, useContext, useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [age, setAge] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    const storedAge = localStorage.getItem('userAge');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      if (storedAge) {
        setAge(parseInt(storedAge));
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email, password, displayName, userAge, gender) => {
    try {
      const nameParts = (displayName || '').trim().split(/\s+/).filter(Boolean);
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          displayName,
          firstName,
          lastName,
          age: parseInt(userAge),
          gender: gender.toLowerCase(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sign up failed');
      }

      const data = await response.json();
      const accessToken = data?.tokens?.accessToken || data?.token;
      if (!accessToken) {
        throw new Error('Invalid auth response: missing access token');
      }
      setToken(accessToken);
      setUser(data.user);
      if (userAge) {
        setAge(parseInt(userAge));
        localStorage.setItem('userAge', userAge);
      }
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('authUser', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sign in failed');
      }

      const data = await response.json();
      const accessToken = data?.tokens?.accessToken || data?.token;
      if (!accessToken) {
        throw new Error('Invalid auth response: missing access token');
      }
      setToken(accessToken);
      setUser(data.user);
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('authUser', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (code) => {
    try {
      const response = await fetch(`${API_URL}/auth/google/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          platform: 'web',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Google sign in failed');
      }

      const data = await response.json();
      const accessToken = data?.tokens?.accessToken || data?.token;
      if (!accessToken) {
        throw new Error('Invalid auth response: missing access token');
      }
      setToken(accessToken);
      setUser(data.user);
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('authUser', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setToken(null);
      setUser(null);
      setAge(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('userAge');
    }
  };

  // Alias for logout (for consistency with component naming)
  const logout = signOut;
  
  // Alias for isLoading (for consistency with component naming)
  const isLoading = loading;
  
  // Alias for isSignedIn (for consistency with Clerk naming)
  const isSignedIn = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        age,
        loading,
        isLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        logout,
        isAuthenticated: !!token,
        isSignedIn: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
