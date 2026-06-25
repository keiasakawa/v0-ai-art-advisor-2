"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface ArtworkInsert {
  title: string
  artist: string
  year?: string
  medium?: string
  dimensions?: string
  depth?: string
  purchase_price?: number
  purchase_year?: string
  desired_price?: number
  provenance?: string
  certificate?: boolean
  condition?: string
  description?: string
  image_url?: string
  status?: string
  signed?: boolean
  edition?: boolean
  edition_number?: string
  edition_size?: string
  invoice_available?: boolean
  additional_notes?: string
}

export interface ArtworkUpdate extends Partial<ArtworkInsert> {
  id: string
}

export async function createArtwork(data: ArtworkInsert) {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { success: false, error: "Not authenticated" }
  }

  const { data: artwork, error } = await supabase
    .from("artworks")
    .insert({
      ...data,
      user_id: user.id,
      status: data.status || "draft",
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating artwork:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/my-collection")
  return { success: true, data: artwork }
}

export async function updateArtwork(data: ArtworkUpdate) {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { success: false, error: "Not authenticated" }
  }

  const { id, ...updates } = data
  
  const { data: artwork, error } = await supabase
    .from("artworks")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id) // Ensure user owns this artwork
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating artwork:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/my-collection")
  revalidatePath(`/artwork/${id}`)
  return { success: true, data: artwork }
}

export async function deleteArtwork(id: string) {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("artworks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id) // Ensure user owns this artwork

  if (error) {
    console.error("[v0] Error deleting artwork:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/my-collection")
  return { success: true }
}

export async function getArtwork(id: string) {
  const supabase = await createClient()
  
  const { data: artwork, error } = await supabase
    .from("artworks")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("[v0] Error fetching artwork:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data: artwork }
}

export async function getListedArtworks() {
  const supabase = await createClient()

  const { data: artworks, error } = await supabase
    .from("artworks")
    .select("*")
    .eq("status", "listed")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching listed artworks:", error)
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: artworks || [] }
}

export async function getArtworkWithListing(id: string) {
  const supabase = await createClient()

  // Fetch artwork row
  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .select("*")
    .eq("id", id)
    .single()

  if (artworkError || !artwork) {
    return { success: false, error: artworkError?.message ?? "Not found" }
  }

  // Fetch most recent active listing (or most recently ended auction) for this artwork
  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("artwork_id", id)
    .in("status", ["active", "ended"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  const currentUserId = user?.id ?? null

  // For auction listings, fetch highest bid and bid count
  let highestBid: { amount: number; bidder_id: string } | null = null
  let bidCount = 0
  let isAuctionEnded = false
  let currentUserIsWinner = false

  if (listing && listing.listing_type === "auction") {
    const endDate = listing.auction_end_date ? new Date(listing.auction_end_date) : null
    isAuctionEnded = endDate ? endDate < new Date() : false

    const { data: topBid } = await supabase
      .from("bids")
      .select("amount, bidder_id")
      .eq("listing_id", listing.id)
      .order("amount", { ascending: false })
      .limit(1)
      .maybeSingle()

    const { count } = await supabase
      .from("bids")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", listing.id)

    highestBid = topBid ?? null
    bidCount = count ?? 0
    currentUserIsWinner =
      isAuctionEnded && !!currentUserId && highestBid?.bidder_id === currentUserId
  }

  return {
    success: true,
    data: {
      artwork,
      listing: listing ?? null,
      highestBid,
      bidCount,
      isAuctionEnded,
      currentUserId,
      currentUserIsWinner,
    },
  }
}

export async function getUserArtworks() {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { success: false, error: "Not authenticated", data: [] }
  }

  const { data: artworks, error } = await supabase
    .from("artworks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching artworks:", error)
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: artworks || [] }
}
