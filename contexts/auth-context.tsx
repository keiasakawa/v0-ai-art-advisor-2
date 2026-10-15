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
  ) => Promise<{ success: boolean; error?: string; needsRoleSelection?: boolean }>;
  signup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  selectRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  addRole: (role: UserRole) => void;
  removeRole: (role: UserRole) => void;
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
    //
    // The callback must stay synchronous: it runs while the Supabase auth lock
    // is held, so awaiting another Supabase call here (e.g. the profiles query)
    // deadlocks until the lock times out — which made login very slow. The
    // profile fetch is deferred with setTimeout so it runs after the lock is
    // released.
    let latestEvent = 0;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const eventId = ++latestEvent;

      if (session?.user) {
        const sessionUser = session.user;
        setSupabaseUser(sessionUser);

        setTimeout(async () => {
          const profile = await fetchProfile(sessionUser);
          // Ignore results that were superseded by a later auth event
          if (eventId !== latestEvent) return;

          setUser(profile);
          if (!profile?.roles || profile.roles.length === 0) {
            setNeedsRoleSelection(true);
          }
          setIsLoading(false);
        }, 0);
      } else {
        setSupabaseUser(null);
        setUser(null);
        setNeedsRoleSelection(false);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string; needsRoleSelection?: boolean }> => {
    if (!supabase) {
      return { success: false, error: "Supabase is not configured" };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { success: false, error: error.message };
    }

    // onAuthStateChange handles all state updates. We only look up roles here
    // so the caller can redirect to the right page straight away.
    const { data: profile } = await supabase
      .from("profiles")
      .select("roles")
      .eq("id", data.user.id)
      .maybeSingle();

    return {
      success: true,
      needsRoleSelection: !profile?.roles || profile.roles.length === 0,
    };
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

  const removeRole = async (role: UserRole) => {
    // Always keep at least one role so the user isn't left in a broken state
    if (!user || !supabase || user.roles.length <= 1 || !user.roles.includes(role)) return;

    const updatedRoles = user.roles.filter((r) => r !== role);
    const isRemovingActiveRole = user.activeRole === role;
    const nextActiveRole = isRemovingActiveRole ? updatedRoles[0] : user.activeRole;

    // Update roles (and active role if needed) in Supabase
    const { error } = await supabase
      .from("profiles")
      .update({ roles: updatedRoles, active_role: nextActiveRole })
      .eq("id", user.id);

    if (!error) {
      const updatedUser: User = {
        ...user,
        roles: updatedRoles,
        activeRole: nextActiveRole,
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
        removeRole,
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
