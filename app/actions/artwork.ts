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

  // Fetch most recent active listing for this artwork
  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("artwork_id", id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  return { success: true, data: { artwork, listing: listing ?? null } }
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
