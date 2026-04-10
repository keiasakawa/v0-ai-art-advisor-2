"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export type UserRole = "collector_buyer" | "collector_seller" | "curator"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  roles: UserRole[]
  activeRole: UserRole
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  selectRole: (role: UserRole) => void
  switchRole: (role: UserRole) => void
  addRole: (role: UserRole) => void
  hasRole: (role: UserRole) => boolean
  needsRoleSelection: boolean
  setNeedsRoleSelection: (value: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false)

  const supabase = createClient()

  // Fetch profile data from Supabase
  const fetchProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", supabaseUser.id)
      .single()

    if (error || !profile) {
      // If no profile exists, create a basic user from Supabase auth data
      return {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
        email: supabaseUser.email || "",
        avatar: supabaseUser.user_metadata?.avatar_url,
        roles: (profile?.roles as UserRole[]) || [],
        activeRole: (profile?.active_role as UserRole) || "collector_buyer",
        createdAt: new Date(supabaseUser.created_at),
      }
    }

    return {
      id: supabaseUser.id,
      name: profile.name || supabaseUser.email?.split("@")[0] || "User",
      email: supabaseUser.email || "",
      avatar: profile.avatar_url,
      roles: (profile.roles as UserRole[]) || [],
      activeRole: (profile.active_role as UserRole) || "collector_buyer",
      createdAt: new Date(supabaseUser.created_at),
    }
  }

  useEffect(() => {
    // Check current session on mount
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setSupabaseUser(session.user)
        const profile = await fetchProfile(session.user)
        setUser(profile)
        
        // Check if user needs role selection (no roles set)
        if (!profile?.roles || profile.roles.length === 0) {
          setNeedsRoleSelection(true)
        }
      }
      
      setIsLoading(false)
    }

    initAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user)
        const profile = await fetchProfile(session.user)
        setUser(profile)
        
        if (!profile?.roles || profile.roles.length === 0) {
          setNeedsRoleSelection(true)
        }
      } else {
        setSupabaseUser(null)
        setUser(null)
        setNeedsRoleSelection(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setIsLoading(false)
      return { success: false, error: error.message }
    }

    if (data.user) {
      setSupabaseUser(data.user)
      const profile = await fetchProfile(data.user)
      setUser(profile)
      
      // If user has multiple roles, they may need to select one
      if (profile && profile.roles.length > 1) {
        setNeedsRoleSelection(true)
      }
    }

    setIsLoading(false)
    return { success: true }
  }

  const signup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
        data: {
          name,
        },
      },
    })

    if (error) {
      setIsLoading(false)
      return { success: false, error: error.message }
    }

    if (data.user) {
      setSupabaseUser(data.user)
      // The profile will be created by the database trigger
      // For now, create a temporary user object
      const newUser: User = {
        id: data.user.id,
        name,
        email,
        roles: [],
        activeRole: "collector_buyer",
        createdAt: new Date(),
      }
      setUser(newUser)
      setNeedsRoleSelection(true)
    }

    setIsLoading(false)
    return { success: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSupabaseUser(null)
    setNeedsRoleSelection(false)
  }

  const selectRole = async (role: UserRole) => {
    if (!user) return

    const updatedRoles = user.roles.includes(role) ? user.roles : [...user.roles, role]

    // Update profile in Supabase
    const { error } = await supabase
      .from("profiles")
      .update({ roles: updatedRoles, active_role: role })
      .eq("id", user.id)

    if (!error) {
      const updatedUser: User = {
        ...user,
        roles: updatedRoles,
        activeRole: role,
      }
      setUser(updatedUser)
      setNeedsRoleSelection(false)
    }
  }

  const switchRole = async (role: UserRole) => {
    if (!user || !user.roles.includes(role)) return

    // Update active role in Supabase
    const { error } = await supabase
      .from("profiles")
      .update({ active_role: role })
      .eq("id", user.id)

    if (!error) {
      const updatedUser: User = {
        ...user,
        activeRole: role,
      }
      setUser(updatedUser)
    }
  }

  const addRole = async (role: UserRole) => {
    if (!user || user.roles.includes(role)) return

    const updatedRoles = [...user.roles, role]

    // Update roles in Supabase
    const { error } = await supabase
      .from("profiles")
      .update({ roles: updatedRoles })
      .eq("id", user.id)

    if (!error) {
      const updatedUser: User = {
        ...user,
        roles: updatedRoles,
      }
      setUser(updatedUser)
    }
  }

  const hasRole = (role: UserRole) => {
    return user?.roles.includes(role) ?? false
  }

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
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
