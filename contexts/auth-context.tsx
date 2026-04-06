"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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

// Mock user database
const mockUsers: { email: string; password: string; user: Omit<User, "activeRole"> }[] = [
  {
    email: "buyer@example.com",
    password: "password123",
    user: {
      id: "1",
      name: "Alex Chen",
      email: "buyer@example.com",
      avatar: "/male-artist-portrait.png",
      roles: ["collector_buyer"],
      createdAt: new Date("2024-01-15"),
    },
  },
  {
    email: "seller@example.com",
    password: "password123",
    user: {
      id: "2",
      name: "Maria Rodriguez",
      email: "seller@example.com",
      avatar: "/female-artist-portrait.png",
      roles: ["collector_buyer", "collector_seller"],
      createdAt: new Date("2024-02-20"),
    },
  },
  {
    email: "curator@example.com",
    password: "password123",
    user: {
      id: "3",
      name: "Dr. Sarah Mitchell",
      email: "curator@example.com",
      avatar: "/female-art-curator-portrait-professional.jpg",
      roles: ["curator", "collector_buyer"],
      createdAt: new Date("2023-11-10"),
    },
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false)

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem("offa_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

    if (!foundUser) {
      setIsLoading(false)
      return { success: false, error: "Invalid email or password" }
    }

    const loggedInUser: User = {
      ...foundUser.user,
      activeRole: foundUser.user.roles[0],
    }

    setUser(loggedInUser)
    localStorage.setItem("offa_user", JSON.stringify(loggedInUser))
    setIsLoading(false)

    // If user has multiple roles, they need to select one
    if (foundUser.user.roles.length > 1) {
      setNeedsRoleSelection(true)
    }

    return { success: true }
  }

  const signup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Check if user already exists
    if (mockUsers.find((u) => u.email === email)) {
      setIsLoading(false)
      return { success: false, error: "An account with this email already exists" }
    }

    // Create new user (no roles yet - will be selected in onboarding)
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      roles: [],
      activeRole: "collector_buyer", // Default, will be set during role selection
      createdAt: new Date(),
    }

    setUser(newUser)
    localStorage.setItem("offa_user", JSON.stringify(newUser))
    setIsLoading(false)
    setNeedsRoleSelection(true)

    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("offa_user")
    setNeedsRoleSelection(false)
  }

  const selectRole = (role: UserRole) => {
    if (!user) return

    const updatedUser: User = {
      ...user,
      roles: user.roles.includes(role) ? user.roles : [...user.roles, role],
      activeRole: role,
    }

    setUser(updatedUser)
    localStorage.setItem("offa_user", JSON.stringify(updatedUser))
    setNeedsRoleSelection(false)
  }

  const switchRole = (role: UserRole) => {
    if (!user || !user.roles.includes(role)) return

    const updatedUser: User = {
      ...user,
      activeRole: role,
    }

    setUser(updatedUser)
    localStorage.setItem("offa_user", JSON.stringify(updatedUser))
  }

  const addRole = (role: UserRole) => {
    if (!user || user.roles.includes(role)) return

    const updatedUser: User = {
      ...user,
      roles: [...user.roles, role],
    }

    setUser(updatedUser)
    localStorage.setItem("offa_user", JSON.stringify(updatedUser))
  }

  const hasRole = (role: UserRole) => {
    return user?.roles.includes(role) ?? false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
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
