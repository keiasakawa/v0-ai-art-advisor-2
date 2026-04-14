"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Mail, Calendar, Shield, Plus, Check, ShoppingBag, Store, Palette, Camera, Save } from "lucide-react"
import { useAuth, type UserRole } from "@/contexts/auth-context"

const roleConfig = {
  collector_buyer: {
    label: "Collector (Buyer)",
    icon: ShoppingBag,
    color: "bg-blue-100 text-blue-700",
    description: "Browse and collect artworks",
  },
  collector_seller: {
    label: "Collector (Seller)",
    icon: Store,
    color: "bg-emerald-100 text-emerald-700",
    description: "List and sell your artworks",
  },
  curator: {
    label: "Curator",
    icon: Palette,
    color: "bg-amber-100 text-amber-700",
    description: "Curate collections and advise collectors",
  },
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, addRole, switchRole } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    specialties: "",
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        bio: "",
        specialties: "",
      })
    }
  }, [isLoading, isAuthenticated, router, user])

  if (isLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSaving(false)
    setIsEditing(false)
  }

  const handleAddRole = (role: UserRole) => {
    addRole(role)
  }

  const allRoles: UserRole[] = ["collector_buyer", "collector_seller", "curator"]
  const availableRoles = allRoles.filter((role) => !user.roles.includes(role))

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Avatar & Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="relative inline-block">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {user.roles.map((role) => {
                    const config = roleConfig[role]
                    return (
                      <Badge key={role} className={config.color}>
                        {config.label}
                      </Badge>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {user.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>Account verified</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your profile details</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself and your interest in art..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
                {user.roles.includes("curator") && (
                  <div className="space-y-2">
                    <Label htmlFor="specialties">Specialty Tags (comma separated)</Label>
                    <Input
                      id="specialties"
                      placeholder="Contemporary Art, Abstract Expressionism, Emerging Artists"
                      value={formData.specialties}
                      onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Role Management */}
            <Card>
              <CardHeader>
                <CardTitle>Your Roles</CardTitle>
                <CardDescription>Manage your roles on OFFA - you can have multiple roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Roles */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Active Roles</h4>
                    <div className="space-y-2">
                      {user.roles.map((role) => {
                        const config = roleConfig[role]
                        const Icon = config.icon
                        const isActive = user.activeRole === role

                        return (
                          <motion.div
                            key={role}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              isActive ? "border-primary bg-primary/5" : "border-border"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${config.color}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">{config.label}</p>
                                <p className="text-xs text-muted-foreground">{config.description}</p>
                              </div>
                            </div>
                            {isActive ? (
                              <Badge variant="default">
                                <Check className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => switchRole(role)}>
                                Switch
                              </Button>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Available Roles to Add */}
                  {availableRoles.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-3">Add More Roles</h4>
                        <div className="space-y-2">
                          {availableRoles.map((role) => {
                            const config = roleConfig[role]
                            const Icon = config.icon

                            return (
                              <div
                                key={role}
                                className="flex items-center justify-between p-3 rounded-lg border border-dashed"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg bg-muted`}>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{config.label}</p>
                                    <p className="text-xs text-muted-foreground">{config.description}</p>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleAddRole(role)}>
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Role
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
