import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// API URL for the backend server
const API_URL = 'http://192.168.95.229:3000/api';

interface UserProfile extends SupabaseUser {
  display_name?: string;
  age?: number;
  gender?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  session: Session | null;
  user: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, age: number, gender: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  fetchUserProfile: () => Promise<void>;
  userProfile: UserProfile | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async () => {
    if (!session?.user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      setUser(data);
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

    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, displayName, age, gender }),
    });

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

    if (!data.user) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response from server');
    }

    // You can store user info if needed (your logic)
    setUser(data.user);
    console.log('Signup successful:', { user: data.user });
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      signIn, 
      signUp, 
      signOut, 
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