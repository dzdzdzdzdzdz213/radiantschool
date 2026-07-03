import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types/models';
import type { UserRole } from '@/types/models';

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
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err?.message ?? 'Une erreur est survenue lors de la connexion' };
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
      if (error) return { error: error.message };
      if (!data.user) return { error: 'Création du compte échouée' };

      const { error: insertError } = await supabase.from('users').insert({
        id: data.user.id, email, first_name: firstName, last_name: lastName, role,
        status: role === 'student' ? 'active' : 'pending',
        email_verified: false, phone: options?.phone || null,
      });
      if (insertError) {
        await supabase.auth.signOut();
        return { error: insertError.message };
      }

      try {
        if (role === 'student') {
          await supabase.from('students').insert({
            id: data.user.id, student_type: 'regular',
            registration_number: `STU-${String(Date.now()).slice(-8)}`,
          });
        } else if (role === 'teacher') {
          await supabase.from('teachers').insert({ id: data.user.id });
        } else if (role === 'assistant') {
          await supabase.from('assistants').insert({ id: data.user.id });
        } else if (role === 'parent') {
          await supabase.from('parents').insert({ id: data.user.id });
          if (options?.childFirstName) {
            const { data: childData, error: childErr } = await supabase.from('users').insert({
              email: `child-${Date.now()}@radiant.dz`,
              first_name: options.childFirstName,
              last_name: options.childLastName || '',
              role: 'student', status: 'active', email_verified: false,
            }).select('id').single();
            if (!childErr && childData) {
              await supabase.from('students').insert({
                id: childData.id, student_type: 'regular',
                registration_number: `STU-${String(Date.now()).slice(-8)}`,
              });
              await supabase.from('student_parent').insert({
                student_id: childData.id, parent_id: data.user.id, relationship: 'parent',
              });
            }
          }
        }
      } catch {
        try { await supabase.from('users').delete().eq('id', data.user.id); } catch {}
        await supabase.auth.signOut();
        return { error: 'Échec de la création du profil. Veuillez réessayer.' };
      }

      return {};
    } catch (err: any) {
      return { error: err?.message ?? 'Une erreur est survenue lors de l\'inscription' };
    }
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
    <AuthContext.Provider value={{ user, profile, isLoading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
