import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types/models';
import type { UserRole } from '@/types/models';

/**
 * Optional metadata for registration.
 * For parent role: child info creates a linked student record.
 */
export interface SignUpOptions {
  phone?: string;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  childFirstName?: string;
  childLastName?: string;
  childLevelCategory?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, role: UserRole, options?: SignUpOptions) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provides authentication state and methods to the component tree.
 * On mount: reads the Supabase session, fetches the user profile from
 * the `users` table, and listens for `onAuthStateChange` events.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const [profileRes, userRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase.auth.getUser(),
      ]);

      const userMeta = userRes.data?.user?.user_metadata || {};
      const data = profileRes.data;

      if (data && !profileRes.error) {
        setProfile({
          id: data.id,
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          role: data.role as UserProfile['role'],
          status: data.status as UserProfile['status'],
          emailVerified: data.email_verified,
          phone: data.phone || undefined,
          photoUrl: data.photo_url || undefined,
          guardianName: userMeta.guardian_name || undefined,
          guardianEmail: userMeta.guardian_email || undefined,
          guardianPhone: userMeta.guardian_phone || undefined,
        });
      }
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: 'Identifiants invalides' };
      return {};
    } catch {
      return { error: 'Identifiants invalides' };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, role: UserRole, options?: SignUpOptions) => {
    const meta: Record<string, any> = { first_name: firstName, last_name: lastName, role };
    if (options?.guardianName) meta.guardian_name = options.guardianName;
    if (options?.guardianEmail) meta.guardian_email = options.guardianEmail;
    if (options?.guardianPhone) meta.guardian_phone = options.guardianPhone;
    if (options?.childFirstName) meta.child_first_name = options.childFirstName;
    if (options?.childLastName) meta.child_last_name = options.childLastName;
    if (options?.childLevelCategory) meta.child_level = options.childLevelCategory;
    if (options?.phone) meta.phone = options.phone;

    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: meta } });
      if (error) return { error: 'Une erreur est survenue lors de l\'inscription' };
      if (!data.user) return { error: 'Création du compte échouée' };

      const { error: rpcErr } = await supabase.rpc('register_user', {
        p_id: data.user.id,
        p_email: email,
        p_first_name: firstName,
        p_last_name: lastName,
        p_role: role,
        p_status: role === 'student' ? 'active' : 'pending',
        p_phone: options?.phone || null,
      });
      if (rpcErr) {
        await supabase.auth.signOut();
        return { error: rpcErr.message };
      }

      if (role === 'parent' && options?.childFirstName) {
        const { error: childErr } = await supabase.rpc('register_child', {
          p_parent_id: data.user.id,
          p_first_name: options.childFirstName,
          p_last_name: options.childLastName || '',
          p_level_category: options.childLevelCategory || '',
        });
        if (childErr) {
          try { await supabase.rpc('unregister_user', { p_id: data.user.id }); } catch { /* best-effort rollback */ }
          await supabase.auth.signOut();
          return { error: 'Échec de la création du profil enfant. Veuillez réessayer.' };
        }
      }

      return {};
    } catch (err: any) {
      return { error: err?.message ?? 'Une erreur est survenue lors de l\'inscription' };
    }
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // proceed with local cleanup regardless of network errors
    }
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signIn, signUp, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Returns the current auth context. Must be called within an AuthProvider.
 * Provides `user`, `profile`, `isLoading`, `signIn`, `signUp`, `signOut`,
 * and `refreshProfile`.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
