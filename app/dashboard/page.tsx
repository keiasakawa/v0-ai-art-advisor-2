"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Sparkles,
  Package,
  Activity,
  AlertCircle,
  Info,
  DollarSign,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getPortfolio, type PortfolioData, type PortfolioHolding } from "@/app/actions/portfolio"
import { PortfolioChart } from "@/components/portfolio-chart"

type Signal = "sell" | "hold" | "long-term" | "listed"

interface Holding extends PortfolioHolding {
  monthsHeld: number
  holdingPeriod: string
  gain: number | null
  gainPercent: number | null
  signal: Signal
}

function formatMoney(n: number) {
  return `$${Math.round(n).toLocaleString()}`
}

function formatSigned(n: number) {
  return `${n >= 0 ? "+" : "-"}${formatMoney(Math.abs(n))}`
}

function monthsBetween(from: Date, to: Date) {
  return Math.max(0, (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()))
}

function describePeriod(months: number) {
  if (months < 1) return "< 1 month"
  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts: string[] = []
  if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`)
  if (rest > 0) parts.push(`${rest} month${rest > 1 ? "s" : ""}`)
  return parts.join(", ")
}

function toHolding(h: PortfolioHolding, now: Date): Holding {
  const monthsHeld = monthsBetween(new Date(h.acquiredAt), now)
  const hasCost = h.costBasis != null && h.costBasis > 0
  const gain = hasCost ? h.currentValue - (h.costBasis as number) : null
  const gainPercent = hasCost ? ((gain as number) / (h.costBasis as number)) * 100 : null

  let signal: Signal = "hold"
  if (h.status === "listed") signal = "listed"
  else if (gainPercent != null && gainPercent > 30 && monthsHeld >= 12) signal = "sell"
  else if (monthsHeld < 6) signal = "long-term"

  return { ...h, monthsHeld, holdingPeriod: describePeriod(monthsHeld), gain, gainPercent, signal }
}

function buildInsights(holdings: Holding[], data: PortfolioData) {
  const insights: { title: string; body: string; tone: "info" | "warn" }[] = []
  const total = holdings.reduce((s, h) => s + h.currentValue, 0)

  const concentration = (key: (h: Holding) => string | null, label: string) => {
    if (holdings.length < 2 || total <= 0) return
    const byKey = new Map<string, number>()
    for (const h of holdings) {
      const k = key(h)
      if (k) byKey.set(k, (byKey.get(k) ?? 0) + h.currentValue)
    }
    const [top, value] = [...byKey.entries()].sort((a, b) => b[1] - a[1])[0] ?? []
    if (!top || byKey.size < 1) return
    const share = (value / total) * 100
    if (share >= 50) {
      insights.push({
        title: `Concentrated in ${top}`,
        body: `${share.toFixed(0)}% of your collection's value is in ${label} ${top}. Consider diversifying.`,
        tone: "warn",
      })
    }
  }
  concentration((h) => h.artist, "works by")
  concentration((h) => h.medium, "the medium")

  const best = holdings
    .filter((h) => h.gainPercent != null)
    .sort((a, b) => (b.gainPercent as number) - (a.gainPercent as number))[0]
  if (best && (best.gainPercent as number) > 0) {
    insights.push({
      title: "Top performer",
      body: `"${best.title}" by ${best.artist} is valued ${(best.gainPercent as number).toFixed(1)}% above what you paid.`,
      tone: "info",
    })
  }

  const listed = holdings.filter((h) => h.status === "listed").length
  if (listed > 0) {
    insights.push({
      title: "On the market",
      body: `${listed} of your ${holdings.length} artwork${holdings.length > 1 ? "s are" : " is"} currently listed for sale.`,
      tone: "info",
    })
  }

  if (data.sales.length > 0) {
    const proceeds = data.sales.reduce((s, x) => s + x.amount, 0)
    insights.push({
      title: "Sales so far",
      body: `You've sold ${data.sales.length} artwork${data.sales.length > 1 ? "s" : ""} for ${formatMoney(proceeds)} in total.`,
      tone: "info",
    })
  }

  const missing = holdings.filter((h) => h.costBasis == null || h.costBasis <= 0).length
  if (missing > 0) {
    insights.push({
      title: "Missing purchase prices",
      body: `${missing} artwork${missing > 1 ? "s have" : " has"} no purchase price, so gains can't be calculated for ${missing > 1 ? "them" : "it"}.`,
      tone: "warn",
    })
  }

  return insights
}

const signalLabel: Record<Signal, string> = {
  sell: "Sell Opportunity",
  hold: "Hold",
  "long-term": "Long-term",
  listed: "Listed",
}

function SignalBadge({ signal, short }: { signal: Signal; short?: boolean }) {
  const className =
    signal === "sell"
      ? "bg-amber-500 hover:bg-amber-600 text-white"
      : signal === "hold"
        ? "bg-blue-100 text-blue-700"
        : signal === "listed"
          ? "bg-green-100 text-green-700"
          : ""
  return (
    <Badge variant={signal === "long-term" ? "outline" : "secondary"} className={className}>
      {short && signal === "sell" ? "Sell" : signalLabel[signal]}
    </Badge>
  )
}

function GainText({ gain, percent }: { gain: number | null; percent: number | null }) {
  if (gain == null || percent == null) return <span className="text-muted-foreground">—</span>
  const up = gain >= 0
  return (
    <span className={up ? "text-emerald-600" : "text-red-600"}>
      {formatSigned(gain)} ({up ? "+" : ""}
      {percent.toFixed(1)}%)
    </span>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [data, setData] = useState<PortfolioData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }
    if (!isAuthenticated) return
    let cancelled = false
    getPortfolio().then((res) => {
      if (cancelled) return
      if (res.success) setData(res.data)
      else setError(res.error)
    })
    return () => {
      cancelled = true
    }
  }, [isLoading, isAuthenticated, router])

  const now = useMemo(() => new Date(), [data])
  const holdings = useMemo(() => (data ? data.holdings.map((h) => toHolding(h, now)) : []), [data, now])
  const insights = useMemo(() => (data ? buildInsights(holdings, data) : []), [holdings, data])

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-600" />
        <p className="text-muted-foreground">Couldn't load your portfolio: {error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0)
  const priced = holdings.filter((h) => h.gain != null)
  const totalInvested = priced.reduce((s, h) => s + (h.costBasis as number), 0)
  const totalGain = priced.reduce((s, h) => s + (h.gain as number), 0)
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0
  const gainUp = totalGain >= 0

  const realizedProceeds = data.sales.reduce((s, x) => s + x.amount, 0)
  const realizedGain = data.sales
    .filter((s) => s.costBasis != null && s.costBasis > 0)
    .reduce((sum, s) => sum + (s.amount - (s.costBasis as number)), 0)

  const sellOpportunities = holdings.filter((h) => h.signal === "sell")

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      {/* Portfolio Summary */}
      <div className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-6 flex items-center justify-between gap-4">
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
            <div className="mb-2 flex flex-wrap items-baseline gap-3">
              <h2 className="text-4xl font-bold">{formatMoney(totalValue)}</h2>
              {totalInvested > 0 && (
                <div className={`flex items-center gap-1 ${gainUp ? "text-emerald-600" : "text-red-600"}`}>
                  {gainUp ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  <span className="text-xl font-semibold">
                    {formatSigned(totalGain)} ({gainUp ? "+" : ""}
                    {totalGainPercent.toFixed(2)}%)
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Total invested: {formatMoney(totalInvested)}
              {priced.length < holdings.length && ` (${holdings.length - priced.length} without a purchase price)`}
            </p>
          </div>

          {/* Chart */}
          <Card>
            <CardContent className="p-6">
              <PortfolioChart data={data} now={now} />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                    <p className="text-sm text-muted-foreground">Unrealized Gain</p>
                    <p className={`text-2xl font-bold ${gainUp ? "text-emerald-600" : "text-red-600"}`}>
                      {gainUp ? "+" : ""}
                      {totalGainPercent.toFixed(1)}%
                    </p>
                  </div>
                  {gainUp ? (
                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sold ({data.sales.length})</p>
                    <p className="text-2xl font-bold">{formatMoney(realizedProceeds)}</p>
                    {realizedGain !== 0 && (
                      <p className={`text-xs ${realizedGain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {formatSigned(realizedGain)} realized
                      </p>
                    )}
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sell Signals</p>
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
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Your Holdings</h2>
          <p className="text-muted-foreground">Artworks you've registered or purchased</p>
        </div>

        {holdings.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent>
              <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No holdings yet</h3>
              <p className="mb-4 text-muted-foreground">
                Add or buy artworks to start tracking their value and performance.
              </p>
              <div className="flex justify-center gap-2">
                <Button asChild>
                  <Link href="/my-collection">Go to Collection</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/browse">Browse Artworks</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-hidden rounded-lg border bg-background md:block">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Artwork</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Value</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Purchase Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Gain/Loss</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Holding Period</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Signal</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {holdings.map((h) => (
                    <tr key={h.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-md">
                            <img src={h.imageUrl} alt={h.title} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium">{h.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {h.artist}
                              {h.source === "purchased" && " · Purchased"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-medium">
                        {h.valueSource === "none" ? "—" : formatMoney(h.currentValue)}
                        {h.valueSource === "asking price" && (
                          <p className="text-xs font-normal text-muted-foreground">asking</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right text-muted-foreground">
                        {h.costBasis != null ? formatMoney(h.costBasis) : "—"}
                      </td>
                      <td className="px-4 py-4 text-right font-medium">
                        <GainText gain={h.gain} percent={h.gainPercent} />
                      </td>
                      <td className="px-4 py-4 text-right text-muted-foreground">{h.holdingPeriod}</td>
                      <td className="px-4 py-4 text-center">
                        <SignalBadge signal={h.signal} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/artwork/${h.id}`}>
                            View <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-4 md:hidden">
              {holdings.map((h) => (
                <Card key={h.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md">
                        <img src={h.imageUrl} alt={h.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{h.title}</p>
                            <p className="text-sm text-muted-foreground">{h.artist}</p>
                          </div>
                          <SignalBadge signal={h.signal} short />
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <p className="text-lg font-semibold">
                              {h.valueSource === "none" ? "—" : formatMoney(h.currentValue)}
                            </p>
                            <p className="text-sm">
                              <GainText gain={h.gain} percent={h.gainPercent} />
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/artwork/${h.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {holdings.length > 0 && (
          <div className={`mt-8 grid gap-6 ${sellOpportunities.length > 0 ? "lg:grid-cols-2" : ""}`}>
            {sellOpportunities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                    Sell Opportunities
                  </CardTitle>
                  <CardDescription>Held over a year and valued 30%+ above what you paid</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sellOpportunities.slice(0, 3).map((h) => (
                    <div key={h.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <img src={h.imageUrl} alt={h.title} className="h-12 w-12 rounded object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{h.title}</p>
                        <p className="text-sm">
                          <GainText gain={h.gain} percent={h.gainPercent} />
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/artwork/${h.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Collection Insights
                </CardTitle>
                <CardDescription>Based on the artworks in your collection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.length === 0 && (
                  <p className="text-sm text-muted-foreground">No notable patterns in your collection yet.</p>
                )}
                {insights.slice(0, 4).map((insight) => (
                  <div key={insight.title} className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-start gap-2">
                      {insight.tone === "warn" ? (
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      ) : (
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{insight.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{insight.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
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
