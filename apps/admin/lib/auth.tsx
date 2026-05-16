'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from './supabase';
import { migrateLocalStorageToSupabase } from './migration';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();

    // 1. Récupère la session existante au montage
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      // Si déjà authentifié, lance la migration localStorage → Supabase
      // (no-op si déjà faite ou si Supabase n'est pas vide).
      if (data.session?.user) {
        void migrateLocalStorageToSupabase();
      }
    });

    // 2. Écoute les changements (login/logout/refresh token)
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      // Au SIGNED_IN (premier login), lance la migration une seule fois
      if (event === 'SIGNED_IN' && newSession?.user) {
        void migrateLocalStorageToSupabase();
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Messages d'erreur traduits en français
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid login credentials')) {
        return { error: 'Email ou mot de passe incorrect.' };
      }
      if (msg.includes('email not confirmed')) {
        return { error: 'Email non confirmé. Vérifie ta boîte mail.' };
      }
      return { error: error.message };
    }
    return { error: null };
  };

  const signOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'<AuthProvider>.');
  }
  return ctx;
}
