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
  // Additional fields from form
  signed?: boolean
  edition?: boolean
  editionNumber?: string
  editionSize?: string
  invoiceAvailable?: boolean
  depth?: string
  additionalNotes?: string
}

const STORAGE_KEY = "offcanvas_artworks"

// Initialize with default data if empty
const defaultArtworks: Artwork[] = [
  {
    id: "1",
    title: "Abstract Horizon",
    artist: "Self",
    year: "2023",
    medium: "Oil on Canvas",
    dimensions: "48 × 36 in",
    purchasePrice: "3500",
    purchaseYear: "2022",
    desiredPrice: "4500",
    provenance: "Direct from artist",
    certificate: true,
    condition: "Excellent",
    description: "A vibrant abstract piece exploring urban landscapes",
    imageUrl: "/abstract-urban-painting.png",
    status: "draft",
    createdAt: new Date("2024-11-15").toISOString(),
  },
  {
    id: "2",
    title: "Urban Fragments",
    artist: "James Lee",
    year: "2021",
    medium: "Mixed Media on Paper",
    dimensions: "24 × 24 in",
    purchasePrice: "2200",
    purchaseYear: "2021",
    desiredPrice: "3200",
    provenance: "Purchased from Sotheby's auction",
    certificate: true,
    condition: "Very Good",
    description: "Geometric abstraction with urban elements",
    imageUrl: "/geometric-abstract.png",
    status: "draft",
    createdAt: new Date("2024-10-28").toISOString(),
  },
]

export const artworkStorage = {
  // Get all artworks
  getAll: (): Artwork[] => {
    if (typeof window === "undefined") return defaultArtworks

    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      // Initialize with default data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultArtworks))
      return defaultArtworks
    }
    return JSON.parse(stored)
  },

  // Get single artwork by ID
  getById: (id: string): Artwork | undefined => {
    const artworks = artworkStorage.getAll()
    return artworks.find((artwork) => artwork.id === id)
  },

  // Add new artwork
  add: (artwork: Omit<Artwork, "id" | "createdAt">): Artwork => {
    const newArtwork: Artwork = {
      ...artwork,
      id: `art_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    const artworks = artworkStorage.getAll()
    const updated = [newArtwork, ...artworks]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return newArtwork
  },

  // Update existing artwork
  update: (id: string, updates: Partial<Artwork>): Artwork | null => {
    const artworks = artworkStorage.getAll()
    const index = artworks.findIndex((a) => a.id === id)

    if (index === -1) return null

    artworks[index] = { ...artworks[index], ...updates }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(artworks))
    return artworks[index]
  },

  // Delete artwork
  delete: (id: string): boolean => {
    const artworks = artworkStorage.getAll()
    const filtered = artworks.filter((a) => a.id !== id)

    if (filtered.length === artworks.length) return false

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  },
}
