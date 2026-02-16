import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * fetchRole: Centralized logic to verify user permissions.
   * Priority 1: Check JWT app_metadata (Fastest, works with RLS).
   * Priority 2: Sync with Flask Backend (Full profile data).
   */
  const fetchRole = async (supabaseUser) => {
    if (!supabaseUser) {
      setUser(null);
      return null;
    }

    // 1. Get role from JWT Metadata (Fastest fallback)
    const roleFromMetadata = supabaseUser.app_metadata?.role || 'student';

    // 2. Sync with Backend Profile
    let profileData = { role: roleFromMetadata };
    try {
      const res = await fetch(`http://localhost:5000/api/user/${supabaseUser.id}`);
      if (res.ok) {
        const backendData = await res.json();
        // Merge metadata role with backend profile details
        profileData = { ...profileData, ...backendData };
      }
    } catch (err) {
      console.warn("Backend profile sync failed. Relying on JWT metadata role.");
    }

    const fullUser = { 
      ...supabaseUser, 
      ...profileData,
      role: profileData.role // Explicitly set for easy access in components
    };

    setUser(fullUser);
    return fullUser;
  };

  useEffect(() => {
    // Initial Session Load
    const initSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchRole(session.user);
      }
      setLoading(false);
    };

    initSession();

    // Listen for Auth State Changes (Login, Logout, Token Refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchRole(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      if (authListener?.subscription) authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, supabase, fetchRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);