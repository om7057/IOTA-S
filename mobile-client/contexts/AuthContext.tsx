import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { API_URL } from '../constants';

WebBrowser.maybeCompleteAuthSession();

interface User {
  id: string;
  email: string;
  displayName?: string;
  age?: number;
  gender?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Session {
  user: User;
  token: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, age: number, gender: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  fetchUserProfile: () => Promise<void>;
  userProfile: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedSession = await AsyncStorage.getItem('authSession');
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          setSession(sessionData);
          setUser(sessionData.user);
          await fetchUserProfile(sessionData.token);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchUserProfile = async (token?: string) => {
    if (!session?.token && !token) return;

    const authToken = token || session?.token;
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        // Also update session with the new user data
        if (session) {
          const updatedSession = { ...session, user: data };
          setSession(updatedSession);
          await AsyncStorage.setItem('authSession', JSON.stringify(updatedSession));
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

 const signUp = async (
  email: string,
  password: string,
  displayName: string,
  age: number,
  gender: string
) => {
  try {
    console.log('Attempting signup with:', { email, displayName, age, gender });

    // Add timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, displayName, age, gender }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      let errorMessage = 'Failed to sign up';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = await response.text();
      }
      console.error('Server error response:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Server response:', data);

    if (!data.user || !data.token) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response from server');
    }

    const sessionData = { user: data.user, token: data.token };
    await AsyncStorage.setItem('authSession', JSON.stringify(sessionData));
    setSession(sessionData);
    setUser(data.user);
    console.log('Signup successful:', { user: data.user });
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting signin with:', { email });

      // Add timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sign in');
      }

      const data = await response.json();
      const sessionData = { user: data.user, token: data.token };
      await AsyncStorage.setItem('authSession', JSON.stringify(sessionData));
      setSession(sessionData);
      setUser(data.user);
      console.log('✓ Sign in successful');
    } catch (error) {
      console.error('✗ Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const token = session?.token;
      if (token) {
        await fetch(`${API_URL}/auth/signout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      await AsyncStorage.removeItem('authSession');
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Get the Google OAuth URL from our backend
      const response = await fetch(`${API_URL}/auth/google/mobile`);
      const data = await response.json();
      
      if (!data.authUrl) {
        throw new Error('Failed to get Google auth URL');
      }

      // Use AuthSession to handle the OAuth flow
      const result = await AuthSession.startAsync({
        authUrl: data.authUrl,
        returnUrl: 'myapp://auth/callback',
      });

      if (result.type !== 'success') {
        throw new Error('Google authentication failed');
      }

      // Extract the authorization code from the redirect URL
      const url = new URL(result.url);
      const code = url.searchParams.get('code');

      if (!code) {
        throw new Error('No authorization code received');
      }

      // Exchange code for app token
      const tokenResponse = await fetch(`${API_URL}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          platform: 'mobile',
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        throw new Error(error.error || 'Google sign in failed');
      }

      const tokenData = await tokenResponse.json();
      const sessionData = { user: tokenData.user, token: tokenData.token };
      await AsyncStorage.setItem('authSession', JSON.stringify(sessionData));
      setSession(sessionData);
      setUser(tokenData.user);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      signIn, 
      signUp, 
      signOut,
      signInWithGoogle,
      loading,
      fetchUserProfile,
      userProfile: user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}