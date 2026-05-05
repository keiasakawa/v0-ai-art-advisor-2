"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Package,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { artworkStorage, type Artwork } from "@/lib/artwork-storage"

// Mock analytics data generator
const generateAnalytics = (artwork: Artwork) => ({
  views7d: Math.floor(Math.random() * 150) + 50,
  views30d: Math.floor(Math.random() * 500) + 200,
  saves: Math.floor(Math.random() * 30) + 5,
  inquiries: Math.floor(Math.random() * 12) + 1,
  offers: Math.floor(Math.random() * 3),
})

// Mock artist demand data
const artistDemandData: Record<string, { trend: "up" | "flat" | "down"; score: number; sparkline: number[] }> = {
  "James Lee": { trend: "up", score: 78, sparkline: [45, 52, 58, 62, 70, 75, 78] },
  Self: { trend: "flat", score: 55, sparkline: [50, 52, 54, 53, 55, 54, 55] },
  "Marina Chen": { trend: "up", score: 82, sparkline: [60, 65, 72, 76, 78, 80, 82] },
  "David Wong": { trend: "down", score: 48, sparkline: [65, 62, 58, 55, 52, 50, 48] },
}

const getTrendIcon = (trend: "up" | "flat" | "down") => {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-green-600" />
    case "down":
      return <TrendingDown className="h-4 w-4 text-red-600" />
    default:
      return <Minus className="h-4 w-4 text-gray-600" />
  }
}

const getPricingFit = (listingPrice: number, estimatedMin: number, estimatedMax: number) => {
  if (listingPrice < estimatedMin) return { label: "Below Market", color: "text-blue-600 bg-blue-100" }
  if (listingPrice > estimatedMax) return { label: "Above Market", color: "text-amber-600 bg-amber-100" }
  return { label: "Good Fit", color: "text-green-600 bg-green-100" }
}

export default function SellingAnalyticsPage() {
  const router = useRouter()
  const { isAuthenticated, hasRole, isLoading } = useAuth()
  const [listings, setListings] = useState<Artwork[]>([])
  const [analyticsData, setAnalyticsData] = useState<Record<string, ReturnType<typeof generateAnalytics>>>({})

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    } else if (isAuthenticated && !hasRole("collector_seller")) {
      router.push("/selling")
    } else if (isAuthenticated) {
      const fetchArtworks = async () => {
        const artworks = await artworkStorage.getAll()
        setListings(artworks)

        // Generate analytics for each artwork
        const analytics: Record<string, ReturnType<typeof generateAnalytics>> = {}
        artworks.forEach((artwork) => {
          analytics[artwork.id] = generateAnalytics(artwork)
        })
        setAnalyticsData(analytics)
      }
      fetchArtworks()
    }
  }, [isLoading, isAuthenticated, hasRole, router])

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const totalViews7d = Object.values(analyticsData).reduce((sum, data) => sum + data.views7d, 0)
  const totalViews30d = Object.values(analyticsData).reduce((sum, data) => sum + data.views30d, 0)
  const totalSaves = Object.values(analyticsData).reduce((sum, data) => sum + data.saves, 0)
  const totalInquiries = Object.values(analyticsData).reduce((sum, data) => sum + data.inquiries, 0)
  const totalOffers = Object.values(analyticsData).reduce((sum, data) => sum + data.offers, 0)

  // Group by artist
  const artistGroups = listings.reduce(
    (acc, artwork) => {
      if (!acc[artwork.artist]) acc[artwork.artist] = []
      acc[artwork.artist].push(artwork)
      return acc
    },
    {} as Record<string, Artwork[]>,
  )

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/selling">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
          <p className="text-muted-foreground mt-1">Track performance across all your listings</p>
        </div>

        {/* Overview KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mx-auto mb-2">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold">{listings.length}</p>
                <p className="text-xs text-muted-foreground">Active Listings</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 mx-auto mb-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{totalViews7d}</p>
                <p className="text-xs text-muted-foreground">Views (7d)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 mx-auto mb-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold">{totalViews30d}</p>
                <p className="text-xs text-muted-foreground">Views (30d)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 mx-auto mb-2">
                  <Heart className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold">{totalSaves}</p>
                <p className="text-xs text-muted-foreground">Saves</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 mx-auto mb-2">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{totalInquiries}</p>
                <p className="text-xs text-muted-foreground">Inquiries</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 mx-auto mb-2">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-2xl font-bold">{totalOffers}</p>
                <p className="text-xs text-muted-foreground">Offers</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Artist Demand Trends */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Market Demand by Artist</CardTitle>
            <CardDescription>Track interest and market momentum for artists in your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(artistGroups).map(([artist, artworks]) => {
                const demand = artistDemandData[artist] || {
                  trend: "flat",
                  score: 50,
                  sparkline: [50, 50, 50, 50, 50, 50, 50],
                }

                return (
                  <div key={artist} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{artist}</h4>
                        <Badge variant="outline" className="text-xs">
                          {artworks.length} {artworks.length === 1 ? "work" : "works"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getTrendIcon(demand.trend)}
                        <span className="capitalize">{demand.trend} trend</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Sparkline */}
                      <div className="hidden sm:flex items-end gap-1 h-10">
                        {demand.sparkline.map((value, i) => (
                          <div
                            key={i}
                            className="w-2 bg-primary/20 rounded-t"
                            style={{ height: `${(value / 100) * 100}%` }}
                          />
                        ))}
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Market Score</p>
                        <p className="text-2xl font-bold text-primary">{demand.score}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Listing Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Listing Performance</CardTitle>
            <CardDescription>Detailed performance metrics for each artwork</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {listings.map((artwork) => {
                const analytics = analyticsData[artwork.id] || {
                  views7d: 0,
                  views30d: 0,
                  saves: 0,
                  inquiries: 0,
                }
                const listingPrice = Number.parseInt(artwork.desiredPrice) || 0
                const estimatedMin = listingPrice * 0.85
                const estimatedMax = listingPrice * 1.15
                const pricingFit = getPricingFit(listingPrice, estimatedMin, estimatedMax)

                return (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <img
                      src={artwork.imageUrl || "/placeholder.svg"}
                      alt={artwork.title}
                      className="h-20 w-20 rounded-lg object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{artwork.title}</h4>
                      <p className="text-sm text-muted-foreground">{artwork.artist}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          {analytics.views7d} / {analytics.views30d}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                          {analytics.saves}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          {analytics.inquiries}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <p className="text-lg font-bold">${listingPrice.toLocaleString()}</p>
                      <Badge variant="secondary" className={pricingFit.color}>
                        {pricingFit.label}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/selling/analytics/${artwork.id}`}>View Analytics</Link>
                      </Button>
                    </div>
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
