"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Heart, Search, SlidersHorizontal, Grid3X3, LayoutList, X, Loader2 } from "lucide-react"
import { getListedArtworks } from "@/app/actions/artwork"

interface BrowseArtwork {
  id: string
  title: string
  artist: string
  price: number
  category: string
  medium: string
  year: number
  size: string
  imageUrl: string
}

// Derive a display category from the artwork medium
function deriveCategory(medium: string | null): string {
  const m = (medium || "").toLowerCase()
  if (m.includes("digital") || m.includes("print") || m.includes("nft") || m.includes("photo")) return "Digital"
  if (
    m.includes("steel") ||
    m.includes("metal") ||
    m.includes("bronze") ||
    m.includes("sculpture") ||
    m.includes("wood") ||
    m.includes("ceramic") ||
    m.includes("marble") ||
    m.includes("felt")
  )
    return "Sculpture"
  if (m.includes("landscape")) return "Landscape"
  if (m.includes("oil") || m.includes("acrylic") || m.includes("watercolor") || m.includes("canvas")) return "Painting"
  return "Contemporary"
}

// Map a Supabase artwork row (snake_case) to the shape used by this page
function mapArtwork(row: any): BrowseArtwork {
  return {
    id: row.id,
    title: row.title || "Untitled",
    artist: row.artist || "Unknown Artist",
    price: Number(row.desired_price) || Number(row.purchase_price) || 0,
    category: deriveCategory(row.medium),
    medium: row.medium || "—",
    year: Number.parseInt(row.year) || 0,
    size: row.dimensions || "—",
    imageUrl: row.image_url || "/placeholder.svg",
  }
}

export default function BrowsePage() {
  const [artworks, setArtworks] = useState<BrowseArtwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("All")
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [savedArtworks, setSavedArtworks] = useState<string[]>([])

  useEffect(() => {
    const loadArtworks = async () => {
      setIsLoading(true)
      const result = await getListedArtworks()
      if (result.success) {
        setArtworks(result.data.map(mapArtwork))
      }
      setIsLoading(false)
    }
    loadArtworks()
  }, [])

  // Build category list dynamically from loaded artworks
  const categories = ["All", ...Array.from(new Set(artworks.map((a) => a.category))).sort()]

  const toggleSave = (id: string) => {
    setSavedArtworks((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const filteredArtworks = artworks
    .filter((art) => {
      const matchesSearch =
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.artist.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = category === "All" || art.category === category
      const matchesPrice = art.price >= priceRange[0] && art.price <= priceRange[1]
      return matchesSearch && matchesCategory && matchesPrice
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price
      if (sortBy === "price-high") return b.price - a.price
      if (sortBy === "newest") return b.year - a.year
      return 0
    })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <h1 className="text-3xl font-bold">Browse Artworks</h1>
          <p className="text-muted-foreground mt-1">
            {isLoading
              ? "Loading artworks..."
              : `Discover ${artworks.length} curated artwork${artworks.length !== 1 ? "s" : ""} from leading galleries`}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by artist or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-primary text-primary-foreground" : ""}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <div className="hidden sm:flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Price Range</Label>
                    <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={50000} step={1000} />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0].toLocaleString()}</span>
                      <span>${priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Active Filters */}
        {(category !== "All" || searchQuery || priceRange[0] > 0 || priceRange[1] < 50000) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {category !== "All" && (
              <Badge variant="secondary" className="gap-1">
                {category}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setCategory("All")} />
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                "{searchQuery}"
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
              </Badge>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 50000) && (
              <Badge variant="secondary" className="gap-1">
                ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setPriceRange([0, 50000])} />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCategory("All")
                setSearchQuery("")
                setPriceRange([0, 50000])
              }}
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredArtworks.length} artwork{filteredArtworks.length !== 1 ? "s" : ""}
        </p>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground mt-4">Loading artworks...</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredArtworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group overflow-hidden">
                  <div className="relative aspect-[4/5]">
                    <img
                      src={artwork.imageUrl || "/placeholder.svg"}
                      alt={artwork.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <Button
                      variant="secondary"
                      size="icon"
                      className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity ${
                        savedArtworks.includes(artwork.id) ? "opacity-100 bg-red-50 text-red-500" : ""
                      }`}
                      onClick={() => toggleSave(artwork.id)}
                    >
                      <Heart className={`h-4 w-4 ${savedArtworks.includes(artwork.id) ? "fill-current" : ""}`} />
                    </Button>
                    <Badge className="absolute bottom-3 left-3" variant="secondary">
                      {artwork.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <Link href={`/artwork/${artwork.id}`} className="hover:underline">
                      <h3 className="font-semibold line-clamp-1">{artwork.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">{artwork.artist}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {artwork.medium}, {artwork.year}
                    </p>
                    <p className="text-lg font-bold mt-2">${artwork.price.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArtworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden">
                  <div className="flex">
                    <div className="w-48 shrink-0">
                      <img
                        src={artwork.imageUrl || "/placeholder.svg"}
                        alt={artwork.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <CardContent className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link href={`/artwork/${artwork.id}`} className="hover:underline">
                            <h3 className="font-semibold">{artwork.title}</h3>
                          </Link>
                          <p className="text-muted-foreground">{artwork.artist}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {artwork.medium} · {artwork.size} · {artwork.year}
                          </p>
                          <Badge variant="secondary" className="mt-2">
                            {artwork.category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">${artwork.price.toLocaleString()}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 bg-transparent"
                            onClick={() => toggleSave(artwork.id)}
                          >
                            <Heart
                              className={`h-4 w-4 mr-2 ${savedArtworks.includes(artwork.id) ? "fill-current text-red-500" : ""}`}
                            />
                            {savedArtworks.includes(artwork.id) ? "Saved" : "Save"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && filteredArtworks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No artworks found matching your criteria.</p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => {
                setCategory("All")
                setSearchQuery("")
                setPriceRange([0, 50000])
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
