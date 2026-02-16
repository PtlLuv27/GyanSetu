import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Renamed back to fetchRole to match your Login.jsx requirements
  const fetchRole = async (supabaseUser) => {
    if (!supabaseUser) {
      setUser(null);
      return null;
    }

    // 1. Get role from JWT Metadata (Fastest)
    const roleFromMetadata = supabaseUser.app_metadata?.role || 'student';

    // 2. Sync with Backend
    let roleData = { role: roleFromMetadata };
    try {
      const res = await fetch(`http://localhost:5000/api/user/${supabaseUser.id}`);
      if (res.ok) {
        const backendData = await res.json();
        roleData = { ...roleData, ...backendData };
      }
    } catch (err) {
      console.warn("Backend profile sync failed, using metadata role.");
    }

    const fullUser = { 
      ...supabaseUser, 
      ...roleData,
      role: roleData.role 
    };

    setUser(fullUser);
    return fullUser;
  };

  useEffect(() => {
    const initSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchRole(session.user);
      }
      setLoading(false);
    };

    initSession();

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
    // We export fetchRole here so Login.jsx can find it
    <AuthContext.Provider value={{ user, loading, supabase, fetchRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);