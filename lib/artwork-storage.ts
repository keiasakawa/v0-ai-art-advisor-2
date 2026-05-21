import { createClient } from "@/lib/supabase/client"

export interface Artwork {
  id: string
  title: string
  artist: string
  year: string
  medium: string
  dimensions: string
  purchasePrice: string
  purchaseYear: string
  desiredPrice: string
  provenance: string
  certificate: boolean
  condition: string
  description: string
  imageUrl: string
  status: "draft" | "listed" | "sold"
  createdAt: string
  userId?: string
  // Additional fields from form
  signed?: boolean
  edition?: boolean
  editionNumber?: string
  editionSize?: string
  invoiceAvailable?: boolean
  depth?: string
  additionalNotes?: string
}

// Database row type (snake_case from Supabase)
interface ArtworkRow {
  id: string
  user_id: string
  title: string
  artist: string
  year: string | null
  medium: string | null
  dimensions: string | null
  purchase_price: number | null
  purchase_year: string | null
  desired_price: number | null
  provenance: string | null
  certificate: boolean
  condition: string | null
  description: string | null
  image_url: string | null
  status: "draft" | "listed" | "sold"
  signed: boolean
  edition: boolean
  edition_number: string | null
  edition_size: string | null
  invoice_available: boolean
  depth: string | null
  additional_notes: string | null
  created_at: string
  updated_at: string
}

// Convert database row to Artwork type
function rowToArtwork(row: ArtworkRow): Artwork {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    year: row.year || "",
    medium: row.medium || "",
    dimensions: row.dimensions || "",
    purchasePrice: row.purchase_price?.toString() || "",
    purchaseYear: row.purchase_year || "",
    desiredPrice: row.desired_price?.toString() || "",
    provenance: row.provenance || "",
    certificate: row.certificate,
    condition: row.condition || "",
    description: row.description || "",
    imageUrl: row.image_url || "/placeholder.svg",
    status: row.status,
    createdAt: row.created_at,
    userId: row.user_id,
    signed: row.signed,
    edition: row.edition,
    editionNumber: row.edition_number || "",
    editionSize: row.edition_size || "",
    invoiceAvailable: row.invoice_available,
    depth: row.depth || "",
    additionalNotes: row.additional_notes || "",
  }
}

// Convert Artwork to database row format
function artworkToRow(artwork: Omit<Artwork, "id" | "createdAt">, userId: string): Omit<ArtworkRow, "id" | "created_at" | "updated_at"> {
  return {
    user_id: userId,
    title: artwork.title,
    artist: artwork.artist,
    year: artwork.year || null,
    medium: artwork.medium || null,
    dimensions: artwork.dimensions || null,
    purchase_price: artwork.purchasePrice ? parseFloat(artwork.purchasePrice) : null,
    purchase_year: artwork.purchaseYear || null,
    desired_price: artwork.desiredPrice ? parseFloat(artwork.desiredPrice) : null,
    provenance: artwork.provenance || null,
    certificate: artwork.certificate || false,
    condition: artwork.condition || null,
    description: artwork.description || null,
    image_url: artwork.imageUrl || null,
    status: artwork.status || "draft",
    signed: artwork.signed || false,
    edition: artwork.edition || false,
    edition_number: artwork.editionNumber || null,
    edition_size: artwork.editionSize || null,
    invoice_available: artwork.invoiceAvailable || false,
    depth: artwork.depth || null,
    additional_notes: artwork.additionalNotes || null,
  }
}

export const artworkStorage = {
  // Get all artworks for current user
  getAll: async (): Promise<Artwork[]> => {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from("artworks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching artworks:", error)
      return []
    }

    return (data as ArtworkRow[]).map(rowToArtwork)
  },

  // Get all listed artworks (public browse)
  getAllListed: async (): Promise<Artwork[]> => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("artworks")
      .select("*")
      .eq("status", "listed")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching listed artworks:", error)
      return []
    }

    return (data as ArtworkRow[]).map(rowToArtwork)
  },

  // Get single artwork by ID
  getById: async (id: string): Promise<Artwork | null> => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("artworks")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("[v0] Error fetching artwork:", error)
      return null
    }

    return rowToArtwork(data as ArtworkRow)
  },

  // Add new artwork
  add: async (artwork: Omit<Artwork, "id" | "createdAt">): Promise<Artwork | null> => {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("[v0] User not authenticated")
      return null
    }

    const row = artworkToRow(artwork, user.id)

    const { data, error } = await supabase
      .from("artworks")
      .insert(row)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error adding artwork:", error)
      return null
    }

    return rowToArtwork(data as ArtworkRow)
  },

  // Update existing artwork
  update: async (id: string, updates: Partial<Artwork>): Promise<Artwork | null> => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("[v0] User not authenticated")
      return null
    }

    // Convert updates to snake_case
    const updateRow: Record<string, any> = {}
    if (updates.title !== undefined) updateRow.title = updates.title
    if (updates.artist !== undefined) updateRow.artist = updates.artist
    if (updates.year !== undefined) updateRow.year = updates.year
    if (updates.medium !== undefined) updateRow.medium = updates.medium
    if (updates.dimensions !== undefined) updateRow.dimensions = updates.dimensions
    if (updates.purchasePrice !== undefined) updateRow.purchase_price = updates.purchasePrice ? parseFloat(updates.purchasePrice) : null
    if (updates.purchaseYear !== undefined) updateRow.purchase_year = updates.purchaseYear
    if (updates.desiredPrice !== undefined) updateRow.desired_price = updates.desiredPrice ? parseFloat(updates.desiredPrice) : null
    if (updates.provenance !== undefined) updateRow.provenance = updates.provenance
    if (updates.certificate !== undefined) updateRow.certificate = updates.certificate
    if (updates.condition !== undefined) updateRow.condition = updates.condition
    if (updates.description !== undefined) updateRow.description = updates.description
    if (updates.imageUrl !== undefined) updateRow.image_url = updates.imageUrl
    if (updates.status !== undefined) updateRow.status = updates.status
    if (updates.signed !== undefined) updateRow.signed = updates.signed
    if (updates.edition !== undefined) updateRow.edition = updates.edition
    if (updates.editionNumber !== undefined) updateRow.edition_number = updates.editionNumber
    if (updates.editionSize !== undefined) updateRow.edition_size = updates.editionSize
    if (updates.invoiceAvailable !== undefined) updateRow.invoice_available = updates.invoiceAvailable
    if (updates.depth !== undefined) updateRow.depth = updates.depth
    if (updates.additionalNotes !== undefined) updateRow.additional_notes = updates.additionalNotes
    updateRow.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from("artworks")
      .update(updateRow)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating artwork:", error)
      return null
    }

    return rowToArtwork(data as ArtworkRow)
  },

  // Delete artwork
  delete: async (id: string): Promise<boolean> => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("[v0] User not authenticated")
      return false
    }

    const { error } = await supabase
      .from("artworks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("[v0] Error deleting artwork:", error)
      return false
    }

    return true
  },
}
