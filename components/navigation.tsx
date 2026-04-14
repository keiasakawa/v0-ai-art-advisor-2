"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  MessageSquare,
  Menu,
  Users,
  LogOut,
  Settings,
  ShoppingBag,
  Store,
  Palette,
  ChevronDown,
  Check,
  UserPlus,
  Search,
  Package,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth, type UserRole } from "@/contexts/auth-context"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Browse", href: "/browse", icon: Search },
  { name: "Curators", href: "/curators", icon: Users },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chat", href: "/chat", icon: MessageSquare },
]

const roleConfig: Record<UserRole, { label: string; icon: typeof ShoppingBag; color: string; href: string }> = {
  collector_buyer: {
    label: "Buyer",
    icon: ShoppingBag,
    color: "bg-primary/20 text-primary",
    href: "/dashboard",
  },
  collector_seller: {
    label: "Seller",
    icon: Store,
    color: "bg-emerald-500/20 text-emerald-400",
    href: "/selling",
  },
  curator: {
    label: "Curator",
    icon: Palette,
    color: "bg-primary/20 text-primary",
    href: "/curator-console",
  },
}

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout, switchRole, hasRole } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleSwitchRole = (role: UserRole) => {
    switchRole(role)
    router.push(roleConfig[role].href)
  }

  const activeRoleConfig = user?.activeRole ? roleConfig[user.activeRole] : null

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-primary">OFF</span>
              <span className="text-foreground ml-1">CANVAS</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  asChild
                  className={cn(
                    "gap-2 text-sm",
                    isActive
                      ? "bg-secondary text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Link href={item.href}>
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.name}
                  </Link>
                </Button>
              )
            })}

            {isAuthenticated && hasRole("collector_seller") && (
              <>
                <Button
                  variant={pathname.startsWith("/my-collection") ? "secondary" : "ghost"}
                  asChild
                  className={cn(
                    "gap-2 text-sm",
                    pathname.startsWith("/my-collection")
                      ? "bg-secondary font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Link href="/my-collection">
                    <Package className="h-4 w-4" />
                    My Collection
                  </Link>
                </Button>
                <Button
                  variant={pathname.startsWith("/selling") ? "secondary" : "ghost"}
                  asChild
                  className={cn(
                    "gap-2 text-sm",
                    pathname.startsWith("/selling")
                      ? "bg-secondary font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Link href="/selling">
                    <Store className="h-4 w-4" />
                    Selling
                  </Link>
                </Button>
              </>
            )}

            {isAuthenticated && hasRole("curator") && (
              <Button
                variant={pathname.startsWith("/curator-console") ? "secondary" : "ghost"}
                asChild
                className={cn(
                  "gap-2 text-sm",
                  pathname.startsWith("/curator-console")
                    ? "bg-secondary font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Link href="/curator-console">
                  <Palette className="h-4 w-4" />
                  Curator
                </Link>
              </Button>
            )}
          </div>

          {/* Desktop Auth / Profile */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2 pr-3">
                    <Avatar className="h-7 w-7 border border-border">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-secondary text-xs">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{user.name.split(" ")[0]}</span>
                    {activeRoleConfig && (
                      <Badge variant="secondary" className={cn("text-xs", activeRoleConfig.color)}>
                        {activeRoleConfig.label}
                      </Badge>
                    )}
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => router.push("/profile")} className="gap-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Role Switcher */}
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Role</DropdownMenuLabel>
                  {user.roles.map((role) => {
                    const config = roleConfig[role]
                    const Icon = config.icon
                    const isActive = user.activeRole === role

                    return (
                      <DropdownMenuItem key={role} onClick={() => handleSwitchRole(role)} className="gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="flex-1">{config.label}</span>
                        {isActive && <Check className="h-4 w-4 text-primary" />}
                      </DropdownMenuItem>
                    )
                  })}

                  {/* Add Role Option */}
                  {user.roles.length < 3 && (
                    <DropdownMenuItem onClick={() => router.push("/select-role")} className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      <span>Add Role</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")} className="gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background border-border">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-border pb-4">
                  <span className="text-xl font-bold tracking-tight">
                    <span className="text-primary">OFF</span>
                    <span className="text-foreground ml-1">CANVAS</span>
                  </span>
                </div>

                {/* User Profile (Mobile) */}
                {isAuthenticated && user && (
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-secondary">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      {activeRoleConfig && (
                        <Badge variant="secondary" className={cn("text-xs mt-1", activeRoleConfig.color)}>
                          {activeRoleConfig.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <nav className="flex flex-col gap-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                    return (
                      <Button
                        key={item.name}
                        variant={isActive ? "secondary" : "ghost"}
                        asChild
                        className={cn("justify-start gap-2", isActive && "bg-secondary font-medium")}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href={item.href}>
                          {item.icon && <item.icon className="h-4 w-4" />}
                          {item.name}
                        </Link>
                      </Button>
                    )
                  })}

                  {isAuthenticated && hasRole("collector_seller") && (
                    <>
                      <Button
                        variant={pathname.startsWith("/my-collection") ? "secondary" : "ghost"}
                        asChild
                        className="justify-start gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href="/my-collection">
                          <Package className="h-4 w-4" />
                          My Collection
                        </Link>
                      </Button>
                      <Button
                        variant={pathname.startsWith("/selling") ? "secondary" : "ghost"}
                        asChild
                        className="justify-start gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href="/selling">
                          <Store className="h-4 w-4" />
                          Selling Dashboard
                        </Link>
                      </Button>
                    </>
                  )}

                  {isAuthenticated && hasRole("curator") && (
                    <Button
                      variant={pathname.startsWith("/curator-console") ? "secondary" : "ghost"}
                      asChild
                      className="justify-start gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/curator-console">
                        <Palette className="h-4 w-4" />
                        Curator Console
                      </Link>
                    </Button>
                  )}

                  {isAuthenticated && (
                    <Button
                      variant={pathname === "/profile" ? "secondary" : "ghost"}
                      asChild
                      className="justify-start gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/profile">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </Button>
                  )}
                </nav>

                {/* Role Switcher (Mobile) */}
                {isAuthenticated && user && user.roles.length > 1 && (
                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground mb-2">Switch Role</p>
                    <div className="flex flex-col gap-1">
                      {user.roles.map((role) => {
                        const config = roleConfig[role]
                        const Icon = config.icon
                        const isActive = user.activeRole === role

                        return (
                          <Button
                            key={role}
                            variant={isActive ? "secondary" : "ghost"}
                            className="justify-start gap-2"
                            onClick={() => {
                              handleSwitchRole(role)
                              setMobileMenuOpen(false)
                            }}
                          >
                            <Icon className="h-4 w-4" />
                            {config.label}
                            {isActive && <Check className="ml-auto h-4 w-4" />}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 bg-transparent"
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" asChild className="w-full bg-transparent">
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                          Sign in
                        </Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                          Get Started
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
