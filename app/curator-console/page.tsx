"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Palette, Plus, Users, FolderOpen, Eye, TrendingUp, Edit, ArrowRight, Sparkles, Heart } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

// Mock data for curator dashboard
const curatorStats = {
  totalCollections: 5,
  publishedCollections: 3,
  totalFollowers: 1247,
  totalViews: 8934,
  engagementRate: 12.4,
  recommendedArtists: 18,
}

const collections = [
  {
    id: "1",
    title: "Material Futures: Sculpture Beyond Boundaries",
    description: "Exploring post-minimalist sculpture through unconventional materials",
    artworkCount: 8,
    views: 2341,
    likes: 156,
    status: "published",
    coverImage: "/abstract-latex-sculpture-hanging-organic-forms.jpg",
    createdAt: "2024-11-01",
  },
  {
    id: "2",
    title: "Digital Dreamscapes",
    description: "Contemporary digital art that blurs the line between reality and imagination",
    artworkCount: 12,
    views: 1856,
    likes: 203,
    status: "published",
    coverImage: "/digital-art-colorful.jpg",
    createdAt: "2024-10-15",
  },
  {
    id: "3",
    title: "Emerging Voices 2024",
    description: "Spotlight on breakthrough artists redefining contemporary art",
    artworkCount: 6,
    views: 0,
    likes: 0,
    status: "draft",
    coverImage: "/contemporary-abstract.jpg",
    createdAt: "2024-12-01",
  },
]

const statusConfig = {
  published: { label: "Published", color: "bg-green-100 text-green-700" },
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700" },
}

export default function CuratorConsolePage() {
  const router = useRouter()
  const { user, isAuthenticated, hasRole, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!hasRole("curator")) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100">
              <Palette className="h-7 w-7 text-amber-600" />
            </div>
            <CardTitle>Become a Curator</CardTitle>
            <CardDescription>You need to add the Curator role to access this console.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/select-role")}>
              Add Curator Role
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Palette className="h-8 w-8 text-amber-600" />
              Curator Console
            </h1>
            <p className="text-muted-foreground mt-1">Create and manage your curated collections</p>
          </div>
          <Button size="lg" asChild>
            <Link href="/curator-console/create">
              <Plus className="mr-2 h-4 w-4" />
              New Collection
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Collections</p>
                    <p className="text-3xl font-bold">{curatorStats.totalCollections}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                    <FolderOpen className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Followers</p>
                    <p className="text-3xl font-bold">{curatorStats.totalFollowers.toLocaleString()}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-3xl font-bold">{curatorStats.totalViews.toLocaleString()}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                    <Eye className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Engagement Rate</p>
                    <p className="text-3xl font-bold">{curatorStats.engagementRate}%</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">AI Curation Assistant</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get AI-powered suggestions for your next collection theme or artwork pairings.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/chat">
                      Start AI Session
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Artist Recommendations</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    You have {curatorStats.recommendedArtists} artists matching your curatorial focus.
                  </p>
                  <Button variant="outline" size="sm">
                    Browse Artists
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collections */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Collections</CardTitle>
                <CardDescription>Curated collections you've created</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection, index) => {
                const status = statusConfig[collection.status as keyof typeof statusConfig]

                return (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                      <div className="relative aspect-[16/9]">
                        <img
                          src={collection.coverImage || "/placeholder.svg"}
                          alt={collection.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Button variant="secondary" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                        <Badge className={`absolute top-3 right-3 ${status.color}`}>{status.label}</Badge>
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold line-clamp-1 mb-1">{collection.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{collection.description}</p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{collection.artworkCount} artworks</span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              {collection.views.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3.5 w-3.5" />
                              {collection.likes}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
