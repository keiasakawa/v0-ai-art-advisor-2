"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Store,
  Plus,
  Package,
  DollarSign,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Upload,
  X,
  ImageIcon,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { artworkStorage, type Artwork } from "@/lib/artwork-storage"

const statusConfig = {
  active: { label: "Active", icon: CheckCircle2, color: "bg-green-100 text-green-700" },
  pending_offer: { label: "Pending Offer", icon: Clock, color: "bg-amber-100 text-amber-700" },
  sold: { label: "Sold", icon: DollarSign, color: "bg-blue-100 text-blue-700" },
  draft: { label: "Draft", icon: AlertCircle, color: "bg-gray-100 text-gray-700" },
  listed: { label: "Listed", icon: CheckCircle2, color: "bg-green-100 text-green-700" },
}

export default function SellingDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, hasRole, isLoading } = useAuth()
  const [listings, setListings] = useState<Artwork[]>([])
  const [isListDialogOpen, setIsListDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [newArtwork, setNewArtwork] = useState({
    title: "",
    artist: "",
    year: "",
    medium: "",
    height: "",
    width: "",
    unit: "in",
    desiredPrice: "",
    description: "",
    images: [] as File[],
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    } else if (isAuthenticated) {
      const fetchArtworks = async () => {
        const artworks = await artworkStorage.getAll()
        setListings(artworks)
      }
      fetchArtworks()
    }
  }, [isLoading, isAuthenticated, router])

  const sellerStats = {
    totalListings: listings.length,
    activeListings: listings.filter((a) => a.status === "listed").length,
    soldArtworks: listings.filter((a) => a.status === "sold").length,
    totalRevenue: listings
      .filter((a) => a.status === "sold")
      .reduce((sum, a) => sum + (Number.parseInt(a.desiredPrice) || Number.parseInt(a.purchasePrice) || 0), 0),
    pendingOffers: 0, // Would come from offers system
    viewsThisMonth: listings.reduce((sum) => sum + Math.floor(Math.random() * 100), 0), // Mock views for now
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    if (newArtwork.images.length + newFiles.length > 5) {
      return
    }

    const previews = newFiles.map((file) => URL.createObjectURL(file))
    setImagePreviews([...imagePreviews, ...previews])
    setNewArtwork({ ...newArtwork, images: [...newArtwork.images, ...newFiles] })
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
    setNewArtwork({
      ...newArtwork,
      images: newArtwork.images.filter((_, i) => i !== index),
    })
  }

  const handleListArtwork = async () => {
    if (!newArtwork.title || !newArtwork.artist || !newArtwork.desiredPrice) return

    setIsSubmitting(true)
    try {
      const imageUrl = imagePreviews.length > 0 ? "/abstract-colorful-artwork.png" : "/placeholder.svg"

      const result = await artworkStorage.add({
        title: newArtwork.title,
        artist: newArtwork.artist,
        year: newArtwork.year,
        medium: newArtwork.medium,
        dimensions: newArtwork.height && newArtwork.width 
          ? `${newArtwork.height} × ${newArtwork.width} ${newArtwork.unit}` 
          : "",
        purchasePrice: "",
        purchaseYear: "",
        desiredPrice: newArtwork.desiredPrice,
        provenance: "",
        certificate: false,
        condition: "Excellent",
        description: newArtwork.description,
        imageUrl,
        status: "listed",
      })

      if (result) {
        setListings([result, ...listings])
        setNewArtwork({
          title: "",
          artist: "",
          year: "",
          medium: "",
          height: "",
          width: "",
          unit: "in",
          desiredPrice: "",
          description: "",
          images: [],
        })
        setImagePreviews([])
        setIsListDialogOpen(false)
      }
    } catch (error) {
      console.error("Error listing artwork:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!hasRole("collector_seller")) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">
              <Store className="h-7 w-7 text-emerald-600" />
            </div>
            <CardTitle>Become a Seller</CardTitle>
            <CardDescription>You need to add the Seller role to access this dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/select-role")}>
              Add Seller Role
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Store className="h-8 w-8 text-emerald-600" />
              Seller Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Manage your art listings and sales</p>
          </div>
          <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                List New Artwork
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>List New Artwork</DialogTitle>
                <DialogDescription>Add details about your artwork to list it for sale</DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Image Upload */}
                <div className="space-y-3">
                  <Label>Artwork Images</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                    {imagePreviews.length < 5 && (
                      <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Upload up to 5 images. First image will be the main image.</p>
                </div>

                {/* Title and Artist */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Artwork title"
                      value={newArtwork.title}
                      onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artist">Artist *</Label>
                    <Input
                      id="artist"
                      placeholder="Artist name"
                      value={newArtwork.artist}
                      onChange={(e) => setNewArtwork({ ...newArtwork, artist: e.target.value })}
                    />
                  </div>
                </div>

                {/* Year and Medium */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year Created</Label>
                    <Input
                      id="year"
                      placeholder="e.g., 2023"
                      value={newArtwork.year}
                      onChange={(e) => setNewArtwork({ ...newArtwork, year: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medium">Medium</Label>
                    <Select
                      value={newArtwork.medium}
                      onValueChange={(value) => setNewArtwork({ ...newArtwork, medium: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select medium" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Oil on Canvas">Oil on Canvas</SelectItem>
                        <SelectItem value="Acrylic on Canvas">Acrylic on Canvas</SelectItem>
                        <SelectItem value="Watercolor">Watercolor</SelectItem>
                        <SelectItem value="Mixed Media">Mixed Media</SelectItem>
                        <SelectItem value="Digital Print">Digital Print</SelectItem>
                        <SelectItem value="Photography">Photography</SelectItem>
                        <SelectItem value="Sculpture">Sculpture</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="space-y-2">
                  <Label>Dimensions</Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      placeholder="Height"
                      value={newArtwork.height}
                      onChange={(e) => setNewArtwork({ ...newArtwork, height: e.target.value })}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">×</span>
                    <Input
                      placeholder="Width"
                      value={newArtwork.width}
                      onChange={(e) => setNewArtwork({ ...newArtwork, width: e.target.value })}
                      className="w-24"
                    />
                    <Select
                      value={newArtwork.unit}
                      onValueChange={(value) => setNewArtwork({ ...newArtwork, unit: value })}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">in</SelectItem>
                        <SelectItem value="cm">cm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Listing Price *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      placeholder="0.00"
                      value={newArtwork.desiredPrice}
                      onChange={(e) => setNewArtwork({ ...newArtwork, desiredPrice: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell potential buyers about this artwork..."
                    value={newArtwork.description}
                    onChange={(e) => setNewArtwork({ ...newArtwork, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsListDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleListArtwork} 
                  disabled={isSubmitting || !newArtwork.title || !newArtwork.artist || !newArtwork.desiredPrice}
                >
                  {isSubmitting ? "Listing..." : "List Artwork"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Listings</p>
                    <p className="text-3xl font-bold">{sellerStats.activeListings}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                    <Package className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold">${sellerStats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Views This Month</p>
                    <p className="text-3xl font-bold">{sellerStats.viewsThisMonth}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                    <Eye className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Offers</p>
                    <p className="text-3xl font-bold">{sellerStats.pendingOffers}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Listings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Listings</CardTitle>
                <CardDescription>Manage and track your artwork listings</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/selling/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding an artwork to your collection, then list it for sale.
                </p>
                <Button asChild>
                  <Link href="/artwork/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Artwork
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((listing, index) => {
                  const status = statusConfig[listing.status as keyof typeof statusConfig] || statusConfig.draft
                  const StatusIcon = status.icon
                  const mockViews = Math.floor(Math.random() * 200) + 20
                  const mockInquiries = Math.floor(Math.random() * 8)

                  return (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <img
                        src={listing.imageUrl || "/placeholder.svg"}
                        alt={listing.title}
                        className="h-20 w-20 rounded-lg object-cover"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{listing.title}</h3>
                          <Badge variant="secondary" className={status.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Added on {new Date(listing.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {mockViews} views
                          </span>
                          <span>{mockInquiries} inquiries</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold">
                          $
                          {(
                            Number.parseInt(listing.desiredPrice) ||
                            Number.parseInt(listing.purchasePrice) ||
                            0
                          ).toLocaleString()}
                        </p>
                        <Button variant="outline" size="sm" className="mt-2 bg-transparent" asChild>
                          <Link href={`/artwork/${listing.id}/edit`}>Manage</Link>
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
