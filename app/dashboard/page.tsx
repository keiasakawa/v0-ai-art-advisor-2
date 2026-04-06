"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, ChevronRight, Sparkles, Package, Activity, AlertCircle, Info } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useAuth } from "@/contexts/auth-context"
import { artworkStorage, type Artwork } from "@/lib/artwork-storage"

// Mock portfolio value history data
const portfolioHistory = {
  "1D": [
    { time: "9:00", value: 242000 },
    { time: "10:00", value: 243500 },
    { time: "11:00", value: 242800 },
    { time: "12:00", value: 244200 },
    { time: "13:00", value: 243900 },
    { time: "14:00", value: 245000 },
    { time: "15:00", value: 244500 },
    { time: "16:00", value: 245000 },
  ],
  "1W": [
    { time: "Mon", value: 238000 },
    { time: "Tue", value: 240500 },
    { time: "Wed", value: 239200 },
    { time: "Thu", value: 242800 },
    { time: "Fri", value: 244100 },
    { time: "Sat", value: 243500 },
    { time: "Sun", value: 245000 },
  ],
  "1M": [
    { time: "Week 1", value: 225000 },
    { time: "Week 2", value: 232000 },
    { time: "Week 3", value: 238500 },
    { time: "Week 4", value: 245000 },
  ],
  "1Y": [
    { time: "Jan", value: 180000 },
    { time: "Feb", value: 185000 },
    { time: "Mar", value: 192000 },
    { time: "Apr", value: 188000 },
    { time: "May", value: 198000 },
    { time: "Jun", value: 205000 },
    { time: "Jul", value: 215000 },
    { time: "Aug", value: 210000 },
    { time: "Sep", value: 225000 },
    { time: "Oct", value: 232000 },
    { time: "Nov", value: 240000 },
    { time: "Dec", value: 245000 },
  ],
  ALL: [
    { time: "2020", value: 85000 },
    { time: "2021", value: 120000 },
    { time: "2022", value: 145000 },
    { time: "2023", value: 185000 },
    { time: "2024", value: 245000 },
  ],
}

// Mock holdings data
interface Holding extends Artwork {
  currentValue: number
  holdingPeriod: string
  signal: "sell" | "hold" | "long-term"
}

// Sell opportunities (will be populated from holdings)
let sellOpportunities: Holding[] = []

// Buy suggestions (categories)
const buyCategories = [
  {
    id: "1",
    title: "Emerging Japanese Painters",
    description:
      "Strong auction results and growing institutional interest signal rising demand for contemporary Japanese painting.",
    trend: "+18% avg. price growth",
    imageQuery: "japanese contemporary painting abstract minimal",
  },
  {
    id: "2",
    title: "Post-Internet Photography",
    description:
      "Digital-native artists are gaining museum recognition. Early acquisitions in this space show strong appreciation.",
    trend: "+24% avg. price growth",
    imageQuery: "digital photography art contemporary glitch",
  },
  {
    id: "3",
    title: "Women Artists in Abstraction",
    description:
      "Market correction ongoing as institutions actively acquire. Historically undervalued works seeing rapid appreciation.",
    trend: "+32% avg. price growth",
    imageQuery: "abstract art female artist colorful contemporary",
  },
]

// AI Insights (kept from original for now, but will be replaced by AI Market Intelligence section)
const insights = [
  {
    id: "1",
    title: "Biennial Recognition",
    description: "Two artists in your collection were recently included in the Venice Biennale.",
    type: "positive",
    expandedContent:
      "Maya Rodriguez and Isabella Santos have both been selected for the upcoming Venice Biennale. Historically, biennial inclusion correlates with 15-25% value appreciation within 18 months.",
  },
  {
    id: "2",
    title: "Value Increase Alert",
    description: 'Your work "Temporal Shift" has seen a 50% estimated value increase in the last 12 months.',
    type: "positive",
    expandedContent:
      "Based on recent auction results and comparable sales, we estimate this work has appreciated significantly. Consider this may be an optimal time to sell or hold for further gains.",
  },
  {
    id: "3",
    title: "Market Trend",
    description: "Abstract digital art category showing increased auction activity this quarter.",
    type: "neutral",
    expandedContent:
      "Q4 2024 has seen a 40% increase in auction lots for digital and new media art. Your holdings in this category may benefit from this trend.",
  },
  {
    id: "4",
    title: "Portfolio Diversification",
    description: "Your collection is concentrated in abstract works. Consider exploring figurative art.",
    type: "suggestion",
    expandedContent:
      "Diversification across art movements can reduce volatility. Figurative painting has shown stable 8-12% annual returns over the past decade.",
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [timeRange, setTimeRange] = useState<keyof typeof portfolioHistory>("1M")
  const [showAIInsights, setShowAIInsights] = useState(false) // This state is not used in the updated code, can be removed
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [currentValue, setCurrentValue] = useState<number>(0) // Declare currentValue variable

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    } else if (isAuthenticated) {
      const artworks = artworkStorage.getAll()

      // Transform artworks into holdings with mock current values and signals
      const transformedHoldings: Holding[] = artworks
        .filter((a) => a.purchasePrice) // Only include artworks with purchase price
        .map((artwork) => {
          const purchasePrice = Number.parseInt(artwork.purchasePrice) || 0
          const purchaseDate = new Date(artwork.createdAt)
          const now = new Date()
          const monthsDiff =
            (now.getFullYear() - purchaseDate.getFullYear()) * 12 + (now.getMonth() - purchaseDate.getMonth())
          const yearsDiff = Math.floor(monthsDiff / 12)
          const remainingMonths = monthsDiff % 12

          // Mock current value (increase by 10-50% based on time held)
          const appreciationRate = 1 + (Math.random() * 0.4 + 0.1)
          const currentValue = Math.round(purchasePrice * appreciationRate)

          // Determine signal based on gain and holding period
          const gainPercent = ((currentValue - purchasePrice) / purchasePrice) * 100
          let signal: "sell" | "hold" | "long-term" = "hold"
          if (gainPercent > 30 && monthsDiff > 12) {
            signal = "sell"
          } else if (monthsDiff < 6) {
            signal = "long-term"
          }

          const holdingPeriod =
            yearsDiff > 0
              ? `${yearsDiff} year${yearsDiff > 1 ? "s" : ""}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}` : ""}`
              : `${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`

          return {
            ...artwork,
            currentValue,
            holdingPeriod,
            signal,
          }
        })

      setHoldings(transformedHoldings)
      sellOpportunities = transformedHoldings.filter((h) => h.signal === "sell") // Update global sellOpportunities
      setCurrentValue(transformedHoldings.reduce((sum, h) => sum + h.currentValue, 0)) // Set currentValue state
    }
  }, [isLoading, isAuthenticated, router])

  const chartData = portfolioHistory[timeRange]
  const previousValue = chartData[0].value // This is used for the old chart, but the new chart uses totalPortfolioValue
  const valueChange = currentValue - previousValue // This is not used in the new dashboard summary
  const percentChange = ((valueChange / previousValue) * 100).toFixed(2) // This is not used in the new dashboard summary
  // const isPositive = valueChange >= 0 // This is not used in the new dashboard summary

  const totalPortfolioValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
  const totalInvested = holdings.reduce((sum, h) => sum + (Number.parseInt(h.purchasePrice) || 0), 0)
  const totalGain = totalPortfolioValue - totalInvested
  const totalGainPercent = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : "0.00"

  // const sellOpportunities = holdings.filter((h) => h.signal === "sell") // Moved to global scope

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      {/* Portfolio Summary */}
      <div className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Investment Portfolio</h1>
              <p className="text-muted-foreground">Track your art collection performance</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/my-collection">
                <Package className="mr-2 h-4 w-4" />
                View Collection
              </Link>
            </Button>
          </div>

          {/* Portfolio Value */}
          <div className="mb-6">
            <div className="mb-2 flex items-baseline gap-3">
              <h2 className="text-4xl font-bold">${totalPortfolioValue.toLocaleString()}</h2>
              <div
                className={`flex items-center gap-1 ${Number(totalGainPercent) >= 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                {Number(totalGainPercent) >= 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                <span className="text-xl font-semibold">
                  {Number(totalGainPercent) >= 0 ? "+" : ""}${totalGain.toLocaleString()} (
                  {Number(totalGainPercent) >= 0 ? "+" : ""}
                  {totalGainPercent}%)
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Total invested: ${totalInvested.toLocaleString()}</p>
          </div>

          {/* Chart */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-1 rounded-lg bg-muted p-1">
                  {(["1D", "1W", "1M", "1Y", "ALL"] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                        timeRange === range ? "bg-background shadow-sm" : "hover:bg-background/50"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Holdings</p>
                    <p className="text-2xl font-bold">{holdings.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Gain</p>
                    <p className="text-2xl font-bold text-emerald-600">+{totalGainPercent}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Signals</p>
                    <p className="text-2xl font-bold">{sellOpportunities.length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Holdings Section */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Your Holdings</h2>
            <p className="text-muted-foreground">Artworks in your collection</p>
          </div>
        </div>

        {holdings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No holdings yet</h3>
              <p className="text-muted-foreground mb-4">
                Add artworks to your collection to start tracking their value and performance.
              </p>
              <Button asChild>
                <Link href="/my-collection">Go to Collection</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-hidden rounded-lg border md:block">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Artwork</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Current Value</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Purchase Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Gain/Loss</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Holding Period</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Signal</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {holdings.map((holding) => {
                    const purchasePrice = Number.parseInt(holding.purchasePrice) || 0
                    const gainLoss = holding.currentValue - purchasePrice
                    const gainLossPercent = purchasePrice > 0 ? ((gainLoss / purchasePrice) * 100).toFixed(1) : "0.0"
                    const isGain = gainLoss >= 0

                    return (
                      <tr key={holding.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-md">
                              <img
                                src={holding.imageUrl || "/placeholder.svg"}
                                alt={holding.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{holding.title}</p>
                              <p className="text-sm text-muted-foreground">{holding.artist}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-medium">${holding.currentValue.toLocaleString()}</td>
                        <td className="px-4 py-4 text-right text-muted-foreground">
                          ${purchasePrice.toLocaleString()}
                        </td>
                        <td
                          className={`px-4 py-4 text-right font-medium ${isGain ? "text-emerald-600" : "text-red-600"}`}
                        >
                          <div className="flex items-center justify-end gap-1">
                            {isGain ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            <span>
                              {isGain ? "+" : ""}${gainLoss.toLocaleString()} ({isGain ? "+" : ""}
                              {gainLossPercent}%)
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right text-muted-foreground">{holding.holdingPeriod}</td>
                        <td className="px-4 py-4 text-center">
                          <Badge
                            variant={
                              holding.signal === "sell"
                                ? "default"
                                : holding.signal === "hold"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              holding.signal === "sell"
                                ? "bg-amber-500 hover:bg-amber-600"
                                : holding.signal === "hold"
                                  ? "bg-blue-100 text-blue-700"
                                  : ""
                            }
                          >
                            {holding.signal === "sell"
                              ? "Sell Opportunity"
                              : holding.signal === "hold"
                                ? "Hold"
                                : "Long-term"}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/artwork/${holding.id}`}>
                              View <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-4 md:hidden">
              {holdings.map((holding) => {
                const purchasePrice = Number.parseInt(holding.purchasePrice) || 0
                const gainLoss = holding.currentValue - holding.purchasePrice
                const gainLossPercent = purchasePrice > 0 ? ((gainLoss / purchasePrice) * 100).toFixed(1) : "0.0"
                const isGain = gainLoss >= 0

                return (
                  <Card key={holding.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md">
                          <img
                            src={holding.imageUrl || "/placeholder.svg"}
                            alt={holding.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{holding.title}</p>
                              <p className="text-sm text-muted-foreground">{holding.artist}</p>
                            </div>
                            <Badge
                              variant={holding.signal === "sell" ? "default" : "secondary"}
                              className={holding.signal === "sell" ? "bg-amber-500" : ""}
                            >
                              {holding.signal === "sell" ? "Sell" : holding.signal === "hold" ? "Hold" : "Long-term"}
                            </Badge>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div>
                              <p className="text-lg font-semibold">${holding.currentValue.toLocaleString()}</p>
                              <p className={`text-sm ${isGain ? "text-emerald-600" : "text-red-600"}`}>
                                {isGain ? "+" : ""}${gainLoss.toLocaleString()} ({isGain ? "+" : ""}
                                {gainLossPercent}%)
                              </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/artwork/${holding.id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}

        {/* Buy/Sell Timing Section */}
        {sellOpportunities.length > 0 && (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Sell Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                  Sell Opportunities
                </CardTitle>
                <CardDescription>AI-identified artworks with strong appreciation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sellOpportunities.slice(0, 3).map((artwork) => {
                  const purchasePrice = Number.parseInt(artwork.purchasePrice) || 0
                  const gain = artwork.currentValue - purchasePrice
                  const gainPercent = purchasePrice > 0 ? ((gain / purchasePrice) * 100).toFixed(1) : "0.0"

                  return (
                    <div key={artwork.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <img
                        src={artwork.imageUrl || "/placeholder.svg"}
                        alt={artwork.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{artwork.title}</p>
                        <p className="text-sm text-emerald-600">
                          +${gain.toLocaleString()} (+{gainPercent}%)
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/artwork/${artwork.id}`}>View</Link>
                      </Button>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Market Intelligence
                </CardTitle>
                <CardDescription>Personalized insights for your collection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="mb-2 flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Strong Market Momentum</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Abstract artworks in your collection are experiencing increased demand (+23% this quarter)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="mb-2 flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium">Consider Diversification</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your collection is heavily weighted towards contemporary abstract. Explore emerging artists or
                        different mediums.
                      </p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/chat?q=What should I know about my art portfolio?">
                    Ask AI Advisor
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
