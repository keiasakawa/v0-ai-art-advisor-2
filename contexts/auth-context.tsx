"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser, SupabaseClient } from "@supabase/supabase-js";

export type UserRole = "collector_buyer" | "collector_seller" | "curator" | "dev";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roles: UserRole[];
  activeRole: UserRole;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  selectRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  addRole: (role: UserRole) => void;
  hasRole: (role: UserRole) => boolean;
  needsRoleSelection: boolean;
  setNeedsRoleSelection: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to safely create client
function getSupabaseClient(): SupabaseClient | null {
  try {
    return createClient();
  } catch {
    // Supabase not configured
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
  const [supabase] = useState<SupabaseClient | null>(() => getSupabaseClient());

  // Fetch profile data from Supabase
  const fetchProfile = async (
    supabaseUser: SupabaseUser,
  ): Promise<User | null> => {
    if (!supabase) return null;
    
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", supabaseUser.id)
      .single();

    if (error || !profile) {
      // If no profile exists, create a basic user from Supabase auth data
      return {
        id: supabaseUser.id,
        name:
          supabaseUser.user_metadata?.name ||
          supabaseUser.email?.split("@")[0] ||
          "User",
        email: supabaseUser.email || "",
        avatar: supabaseUser.user_metadata?.avatar_url,
        roles: (profile?.roles as UserRole[]) || [],
        activeRole: (profile?.active_role as UserRole) || "collector_buyer",
        createdAt: new Date(supabaseUser.created_at),
      };
    }

    return {
      id: supabaseUser.id,
      name: profile.name || supabaseUser.email?.split("@")[0] || "User",
      email: supabaseUser.email || "",
      avatar: profile.avatar_url,
      roles: (profile.roles as UserRole[]) || [],
      activeRole: (profile.active_role as UserRole) || "collector_buyer",
      createdAt: new Date(supabaseUser.created_at),
    };
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // onAuthStateChange fires immediately with INITIAL_SESSION on mount —
    // this is the single source of truth for session state. We do NOT call
    // getSession() separately because it returns cached (possibly stale) data
    // and creates a race condition with the listener.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        const profile = await fetchProfile(session.user);
        setUser(profile);

        if (!profile?.roles || profile.roles.length === 0) {
          setNeedsRoleSelection(true);
        }
      } else {
        setSupabaseUser(null);
        setUser(null);
        setNeedsRoleSelection(false);
      }

      // Mark loading done after the first event (INITIAL_SESSION or SIGNED_IN)
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: "Supabase is not configured" };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { success: false, error: error.message };
    }

    // onAuthStateChange handles all state updates — do nothing here
    return { success: true };
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: "Supabase is not configured" };
    }

    const redirectUrl =
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
      `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // onAuthStateChange handles state updates after sign-up
    setNeedsRoleSelection(true);
    return { success: true };
  };

  const logout = async () => {
    // Clear state immediately so UI reflects logout without waiting for the listener
    setUser(null);
    setSupabaseUser(null);
    setNeedsRoleSelection(false);
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const selectRole = async (role: UserRole) => {
    if (!user || !supabase) return;

    const updatedRoles = user.roles.includes(role)
      ? user.roles
      : [...user.roles, role];

    // Update profile in Supabase
    const { error } = await supabase
      .from("profiles")
      .update({ roles: updatedRoles, active_role: role })
      .eq("id", user.id);

    if (!error) {
      const updatedUser: User = {
        ...user,
        roles: updatedRoles,
        activeRole: role,
      };
      setUser(updatedUser);
      setNeedsRoleSelection(false);
    }
  };

  const switchRole = async (role: UserRole) => {
    if (!user || !user.roles.includes(role) || !supabase) return;

    // Update active role in Supabase
    const { error } = await supabase
      .from("profiles")
      .update({ active_role: role })
      .eq("id", user.id);

    if (!error) {
      const updatedUser: User = {
        ...user,
        activeRole: role,
      };
      setUser(updatedUser);
    }
  };

  const addRole = async (role: UserRole) => {
    if (!user || user.roles.includes(role) || !supabase) return;

    const updatedRoles = [...user.roles, role];

    // Update roles in Supabase
    const { error } = await supabase
      .from("profiles")
      .update({ roles: updatedRoles })
      .eq("id", user.id);

    if (!error) {
      const updatedUser: User = {
        ...user,
        roles: updatedRoles,
      };
      setUser(updatedUser);
    }
  };

  const hasRole = (role: UserRole) => {
    return user?.roles.includes(role) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        selectRole,
        switchRole,
        addRole,
        hasRole,
        needsRoleSelection,
        setNeedsRoleSelection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
