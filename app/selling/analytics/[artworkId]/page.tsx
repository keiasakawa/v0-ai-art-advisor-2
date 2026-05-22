"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { artworkStorage, type Artwork } from "@/lib/artwork-storage"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock comparable sales data
const generateComparableSales = (artwork: Artwork) => [
  {
    date: "2024-11-15",
    venue: "Christie's",
    workType: `${artwork.medium} - Similar size`,
    price: Math.floor(Number.parseInt(artwork.desiredPrice) * 0.9),
    source: "Auction",
  },
  {
    date: "2024-10-28",
    venue: "Artsy Marketplace",
    workType: `${artwork.medium} - Larger`,
    price: Math.floor(Number.parseInt(artwork.desiredPrice) * 1.15),
    source: "Private Sale",
  },
  {
    date: "2024-09-12",
    venue: "Sotheby's",
    workType: `${artwork.medium} - Similar`,
    price: Math.floor(Number.parseInt(artwork.desiredPrice) * 0.95),
    source: "Auction",
  },
  {
    date: "2024-08-05",
    venue: "Gallery Network",
    workType: `${artwork.medium} - Smaller`,
    price: Math.floor(Number.parseInt(artwork.desiredPrice) * 0.75),
    source: "Gallery",
  },
]

export default function ArtworkAnalyticsPage() {
  const router = useRouter()
  const params = useParams()
  const artworkId = params?.artworkId as string
  const { isAuthenticated, hasRole, isLoading } = useAuth()
  const [artwork, setArtwork] = useState<Artwork | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    } else if (isAuthenticated && !hasRole("collector_seller")) {
      router.push("/selling")
    } else if (isAuthenticated && artworkId) {
      const foundArtwork = artworkStorage.getById(artworkId)
      if (!foundArtwork) {
        router.push("/selling/analytics")
      } else {
        setArtwork(foundArtwork)
      }
    }
  }, [isLoading, isAuthenticated, hasRole, artworkId, router])

  if (isLoading || !artwork) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  // Mock analytics data
  const impressions = Math.floor(Math.random() * 1000) + 500
  const views = Math.floor(Math.random() * 300) + 150
  const saves = Math.floor(Math.random() * 50) + 20
  const inquiries = Math.floor(Math.random() * 15) + 5
  const offers = Math.floor(Math.random() * 3)

  const listingPrice = Number.parseInt(artwork.desiredPrice) || 0
  const estimatedMin = Math.floor(listingPrice * 0.85)
  const estimatedMax = Math.floor(listingPrice * 1.15)

  const pricePosition = listingPrice < estimatedMin ? "below" : listingPrice > estimatedMax ? "above" : "within"

  const comparableSales = generateComparableSales(artwork)

  // Mock artist trend
  const artistTrend: "up" | "flat" | "down" = Math.random() > 0.5 ? "up" : "flat"
  const trendIcon =
    artistTrend === "up" ? (
      <TrendingUp className="h-5 w-5 text-green-600" />
    ) : artistTrend === "down" ? (
      <TrendingDown className="h-5 w-5 text-red-600" />
    ) : (
      <Minus className="h-5 w-5 text-gray-600" />
    )

  const aiInsight =
    artistTrend === "up"
      ? "Recent comparable sales show increasing demand for this artist's works in this size and medium. Market momentum is positive."
      : "Market activity for this artist remains stable. Consider holding position or adjusting price slightly to attract offers."

  const suggestedActions = []
  if (pricePosition === "above") {
    suggestedActions.push("Consider adjusting price closer to market range to increase interest")
  }
  if (views < 100) {
    suggestedActions.push("Add more photos and improve description to boost visibility")
  }
  if (artistTrend === "up") {
    suggestedActions.push("Strong market momentum - consider promoting via curator feature")
  } else {
    suggestedActions.push("Wait: monitor market trends before making pricing adjustments")
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/selling/analytics">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Analytics
            </Link>
          </Button>
        </div>

        {/* Artwork Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={artwork.imageUrl || "/placeholder.svg"}
                alt={artwork.title}
                className="w-full md:w-64 h-64 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{artwork.title}</h1>
                    <p className="text-xl text-muted-foreground mb-1">{artwork.artist}</p>
                    <p className="text-sm text-muted-foreground">
                      {artwork.year} • {artwork.medium} • {artwork.dimensions}
                    </p>
                  </div>
                  <Badge variant={artwork.status === "listed" ? "default" : "secondary"} className="capitalize">
                    {artwork.status}
                  </Badge>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-1">Listing Price</p>
                  <p className="text-3xl font-bold text-primary">${listingPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Funnel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Engagement Funnel</CardTitle>
            <CardDescription>How users interact with your listing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Step 1</span>
                </div>
                <p className="text-2xl font-bold mb-1">{impressions}</p>
                <p className="text-sm text-muted-foreground">Impressions</p>
              </div>

              <div className="p-4 rounded-lg bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span className="text-xs text-muted-foreground">Step 2</span>
                </div>
                <p className="text-2xl font-bold mb-1">{views}</p>
                <p className="text-sm text-muted-foreground">Views</p>
                <p className="text-xs text-blue-600 mt-1">{((views / impressions) * 100).toFixed(1)}% rate</p>
              </div>

              <div className="p-4 rounded-lg bg-red-50">
                <div className="flex items-center justify-between mb-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <span className="text-xs text-muted-foreground">Step 3</span>
                </div>
                <p className="text-2xl font-bold mb-1">{saves}</p>
                <p className="text-sm text-muted-foreground">Saves</p>
                <p className="text-xs text-red-600 mt-1">{((saves / views) * 100).toFixed(1)}% rate</p>
              </div>

              <div className="p-4 rounded-lg bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  <span className="text-xs text-muted-foreground">Step 4</span>
                </div>
                <p className="text-2xl font-bold mb-1">{inquiries}</p>
                <p className="text-sm text-muted-foreground">Inquiries</p>
                <p className="text-xs text-green-600 mt-1">{((inquiries / saves) * 100).toFixed(1)}% rate</p>
              </div>

              <div className="p-4 rounded-lg bg-amber-50">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                  <span className="text-xs text-muted-foreground">Step 5</span>
                </div>
                <p className="text-2xl font-bold mb-1">{offers}</p>
                <p className="text-sm text-muted-foreground">Offers</p>
                {inquiries > 0 && (
                  <p className="text-xs text-amber-600 mt-1">{((offers / inquiries) * 100).toFixed(1)}% rate</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-2 mb-8">
          {/* Market Demand */}
          <Card>
            <CardHeader>
              <CardTitle>Market Demand & Interest</CardTitle>
              <CardDescription>Artist-level market signals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Market Momentum</p>
                    <div className="flex items-center gap-2">
                      {trendIcon}
                      <span className="font-semibold capitalize">{artistTrend}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Auction Volume</p>
                    <p className="text-sm font-semibold">{artistTrend === "up" ? "Increasing" : "Stable"}</p>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">{aiInsight}</AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Benchmark */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Benchmark</CardTitle>
              <CardDescription>How your price compares to market</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Estimated Market Range</span>
                    <span className="font-semibold">
                      ${estimatedMin.toLocaleString()} - ${estimatedMax.toLocaleString()}
                    </span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-primary/20" />
                    <div
                      className="absolute top-0 h-full w-1 bg-primary"
                      style={{
                        left: `${Math.max(0, Math.min(100, ((listingPrice - estimatedMin) / (estimatedMax - estimatedMin)) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">${estimatedMin.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">${estimatedMax.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  {pricePosition === "within" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                  <div>
                    <p className="font-semibold">
                      {pricePosition === "within"
                        ? "Within Range"
                        : pricePosition === "above"
                          ? "Above Range"
                          : "Below Range"}
                    </p>
                    <p className="text-xs text-muted-foreground">Your listing price vs market comparables</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparable Sales */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Comparable Sales</CardTitle>
            <CardDescription>Recent transactions of similar works</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-semibold">Date</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold">Venue</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold">Work Type</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold">Price</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {comparableSales.map((sale, index) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-2 text-sm">{new Date(sale.date).toLocaleDateString()}</td>
                      <td className="py-3 px-2 text-sm">{sale.venue}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{sale.workType}</td>
                      <td className="py-3 px-2 text-sm font-semibold text-right">${sale.price.toLocaleString()}</td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className="text-xs">
                          {sale.source}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Next Steps</CardTitle>
            <CardDescription>Actions to improve listing performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestedActions.map((action, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <p className="text-sm">{action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
