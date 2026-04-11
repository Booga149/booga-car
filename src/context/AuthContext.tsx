"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type UserRole = 'user' | 'seller' | 'admin';

type UserProfile = {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  business_name?: string;
  dealer_status?: string;
};

type AuthContextType = {
  user: any;
  profile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'signup';
  openLoginModal: () => void;
  openSignUpModal: () => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
  // Role helpers
  isAdmin: boolean;
  isSeller: boolean;
  isUser: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Fetch user profile (role, name, etc.) from profiles table
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role, business_name, dealer_status')
        .eq('id', userId)
        .single();
      
      if (data && !error) {
        setProfile({
          id: data.id,
          full_name: data.full_name || '',
          phone: data.phone || '',
          role: (data.role as UserRole) || 'user',
          business_name: data.business_name,
          dealer_status: data.dealer_status,
        });
      } else {
        // Profile doesn't exist yet — default to user
        setProfile({ id: userId, full_name: '', phone: '', role: 'user' });
      }
    } catch {
      setProfile({ id: userId, full_name: '', phone: '', role: 'user' });
    }
  };

  const refreshProfile = async () => {
    if (user?.id) await fetchProfile(user.id);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user || null;
      setUser(u);
      if (u) await fetchProfile(u.id);
      setLoading(false);
    });

    // Listen for auth changes (including OAuth callbacks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user || null;
      setUser(u);
      if (u) {
        await fetchProfile(u.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const openLoginModal = () => { setAuthMode('login'); setIsAuthModalOpen(true); };
  const openSignUpModal = () => { setAuthMode('signup'); setIsAuthModalOpen(true); };
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Sign out error:', e);
    }
    setUser(null);
    setProfile(null);
    // Force full page reload to clear all cached state
    window.location.href = '/';
  };

  // Derived role flags
  const role = profile?.role || 'user';
  const isAdmin = role === 'admin';
  const isSeller = role === 'seller' || role === 'admin';
  const isUser = role === 'user';

  return (
    <AuthContext.Provider value={{ 
      user, profile, role, loading,
      isAuthModalOpen, authMode,
      openLoginModal, openSignUpModal, closeAuthModal,
      signOut, refreshProfile,
      isAdmin, isSeller, isUser,
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
