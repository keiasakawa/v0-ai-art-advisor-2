"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, needsRoleSelection } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const result = await login(email, password)

    if (!result.success) {
      setError(result.error || "Login failed")
      return
    }

    // Redirect based on role selection needs
    if (needsRoleSelection) {
      router.push("/select-role")
    } else {
      router.push("/dashboard")
    }
  }

  // Demo account buttons - these use real Supabase accounts
  const demoAccounts = {
    buyer: { email: "buyer@demo.offcanvas.art", password: "demobuyer123" },
    seller: { email: "seller@demo.offcanvas.art", password: "demoseller123" },
    curator: { email: "curator@demo.offcanvas.art", password: "democurator123" },
  }

  const loginAs = async (accountType: "buyer" | "seller" | "curator") => {
    const account = demoAccounts[accountType]
    setEmail(account.email)
    setPassword(account.password)
    setError("")
    
    const result = await login(account.email, account.password)
    if (result.success) {
      router.push(needsRoleSelection ? "/select-role" : "/dashboard")
    } else {
      setError(`Demo account not set up. Please sign up with your own email or contact support.`)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to your OFFA account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-muted-foreground hover:text-primary">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                or try a demo account
              </span>
            </div>

            <div className="grid gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loginAs("buyer")}
                disabled={isLoading}
                className="justify-start"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-blue-600 text-xs font-medium mr-2">
                  B
                </span>
                Demo Buyer Account
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loginAs("seller")}
                disabled={isLoading}
                className="justify-start"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-green-100 text-green-600 text-xs font-medium mr-2">
                  S
                </span>
                Demo Seller Account (multi-role)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loginAs("curator")}
                disabled={isLoading}
                className="justify-start"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-purple-100 text-purple-600 text-xs font-medium mr-2">
                  C
                </span>
                Demo Curator Account (multi-role)
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
