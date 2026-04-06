"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ShoppingBag, Store, Palette, Check, ArrowRight } from "lucide-react"
import { useAuth, type UserRole } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

const roles = [
  {
    id: "collector_buyer" as UserRole,
    title: "Collector (Buyer)",
    description: "I want to discover and buy art",
    details: "Browse curated collections, get AI-powered recommendations, and build your art portfolio.",
    icon: ShoppingBag,
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    borderColor: "border-blue-500",
    textColor: "text-blue-600",
  },
  {
    id: "collector_seller" as UserRole,
    title: "Collector (Seller)",
    description: "I want to sell artworks from my collection",
    details: "List your artworks, manage inventory, track sales, and connect with buyers worldwide.",
    icon: Store,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
    borderColor: "border-emerald-500",
    textColor: "text-emerald-600",
  },
  {
    id: "curator" as UserRole,
    title: "Curator",
    description: "I'm a curator / art advisor and want to curate collections",
    details: "Create curated collections, write curatorial statements, and guide collectors.",
    icon: Palette,
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
    borderColor: "border-amber-500",
    textColor: "text-amber-600",
  },
]

export default function SelectRolePage() {
  const router = useRouter()
  const { user, selectRole, setNeedsRoleSelection } = useAuth()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContinue = async () => {
    if (!selectedRole) return

    setIsSubmitting(true)
    selectRole(selectedRole)

    // Route to appropriate dashboard
    const dashboardRoutes: Record<UserRole, string> = {
      collector_buyer: "/dashboard",
      collector_seller: "/selling",
      curator: "/curator-console",
    }

    router.push(dashboardRoutes[selectedRole])
  }

  const handleSkip = () => {
    // Default to buyer role if skipping
    selectRole("collector_buyer")
    setNeedsRoleSelection(false)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary"
          >
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">How do you want to use OFFA?</h1>
          <p className="text-muted-foreground">
            Choose your primary role. You can always add more roles later from your profile.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {roles.map((role, index) => {
            const isSelected = selectedRole === role.id
            const Icon = role.icon

            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-lg relative overflow-hidden h-full",
                    isSelected ? `border-2 ${role.borderColor} shadow-lg` : "border hover:border-foreground/20",
                  )}
                  onClick={() => setSelectedRole(role.id)}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        "absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full",
                        role.color,
                      )}
                    >
                      <Check className="h-4 w-4 text-white" />
                    </motion.div>
                  )}

                  <CardHeader className="pb-2">
                    <div
                      className={cn(
                        "mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                        isSelected ? role.color : role.lightColor,
                      )}
                    >
                      <Icon className={cn("h-6 w-6", isSelected ? "text-white" : role.textColor)} />
                    </div>
                    <CardTitle className="text-lg">{role.title}</CardTitle>
                    <CardDescription className="font-medium">{role.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground">{role.details}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={handleContinue} disabled={!selectedRole || isSubmitting} className="min-w-[200px]">
            {isSubmitting ? "Setting up..." : "Continue"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {user && user.roles.length > 0 && (
            <Button variant="ghost" size="lg" onClick={handleSkip}>
              Skip for now
            </Button>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          You can switch between roles or add new ones anytime from your profile settings.
        </p>
      </motion.div>
    </div>
  )
}
