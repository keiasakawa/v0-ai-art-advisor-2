"use server"

import { createClient } from "@/lib/supabase/server"

export interface PortfolioHolding {
  id: string
  title: string
  artist: string
  medium: string | null
  imageUrl: string
  /** "registered" = added by the user; "purchased" = bought on the platform */
  source: "registered" | "purchased"
  status: string
  /** What the user paid, if known */
  costBasis: number | null
  /** Best recorded value: asking price, else what was paid */
  currentValue: number
  valueSource: "asking price" | "purchase price" | "none"
  acquiredAt: string
}

export interface PortfolioSale {
  artworkId: string
  title: string
  artist: string
  amount: number
  soldAt: string
  costBasis: number | null
  /** Value while it was held, used for the history chart */
  heldValue: number
  acquiredAt: string
}

export interface PortfolioData {
  holdings: PortfolioHolding[]
  sales: PortfolioSale[]
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/**
 * When a registered artwork was acquired. Uses the purchase year the user
 * entered when it is earlier than the date they registered it, otherwise the
 * registration date.
 */
function registeredAcquiredAt(row: any): string {
  const created = new Date(row.created_at)
  const year = Number.parseInt(String(row.purchase_year ?? ""), 10)
  if (Number.isFinite(year) && year > 1000 && year < created.getUTCFullYear()) {
    return new Date(Date.UTC(year, 0, 1)).toISOString()
  }
  return created.toISOString()
}

/**
 * Everything the dashboard needs for the signed-in user: artworks they own
 * (registered or purchased) and artworks they have sold.
 */
export async function getPortfolio(): Promise<
  { success: true; data: PortfolioData } | { success: false; error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Not authenticated" }

  const [artworksRes, purchasesRes, salesRes] = await Promise.all([
    supabase.from("artworks").select("*").eq("user_id", user.id),
    supabase
      .from("purchases")
      .select("id, amount_paid, created_at, artworks ( id, title, artist, medium, image_url, status )")
      .eq("buyer_id", user.id),
    supabase
      .from("purchases")
      .select("amount_paid, created_at, artworks!inner ( id, user_id )")
      .eq("artworks.user_id", user.id),
  ])

  if (artworksRes.error) return { success: false, error: artworksRes.error.message }
  if (purchasesRes.error) console.error("[getPortfolio] purchases", purchasesRes.error.message)
  if (salesRes.error) console.error("[getPortfolio] sales", salesRes.error.message)

  // Latest sale record per artwork the user sold
  const saleByArtworkId = new Map<string, { amount: number; soldAt: string }>()
  for (const sale of (salesRes.data ?? []) as any[]) {
    const artworkId = sale.artworks?.id
    if (!artworkId) continue
    const prev = saleByArtworkId.get(artworkId)
    if (!prev || new Date(sale.created_at) > new Date(prev.soldAt)) {
      saleByArtworkId.set(artworkId, { amount: Number(sale.amount_paid) || 0, soldAt: sale.created_at })
    }
  }

  const holdings: PortfolioHolding[] = []
  const sales: PortfolioSale[] = []
  const seen = new Set<string>()

  for (const row of artworksRes.data ?? []) {
    const cost = toNumber(row.purchase_price)
    const asking = toNumber(row.desired_price)
    const heldValue = asking ?? cost ?? 0
    const acquiredAt = registeredAcquiredAt(row)

    if (row.status === "sold") {
      const sale = saleByArtworkId.get(row.id)
      sales.push({
        artworkId: row.id,
        title: row.title,
        artist: row.artist,
        amount: sale?.amount ?? heldValue,
        soldAt: sale?.soldAt ?? row.updated_at ?? row.created_at,
        costBasis: cost,
        heldValue,
        acquiredAt,
      })
      continue
    }

    seen.add(row.id)
    holdings.push({
      id: row.id,
      title: row.title,
      artist: row.artist,
      medium: row.medium ?? null,
      imageUrl: row.image_url || "/placeholder.svg",
      source: "registered",
      status: row.status || "draft",
      costBasis: cost,
      currentValue: heldValue,
      valueSource: asking != null ? "asking price" : cost != null ? "purchase price" : "none",
      acquiredAt,
    })
  }

  for (const purchase of (purchasesRes.data ?? []) as any[]) {
    const artwork = purchase.artworks
    if (!artwork || seen.has(artwork.id)) continue
    seen.add(artwork.id)
    const paid = Number(purchase.amount_paid) || 0
    holdings.push({
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist,
      medium: artwork.medium ?? null,
      imageUrl: artwork.image_url || "/placeholder.svg",
      source: "purchased",
      status: "owned",
      costBasis: paid,
      currentValue: paid,
      valueSource: "purchase price",
      acquiredAt: new Date(purchase.created_at).toISOString(),
    })
  }

  holdings.sort((a, b) => new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime())
  sales.sort((a, b) => new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime())

  return { success: true, data: { holdings, sales } }
}
