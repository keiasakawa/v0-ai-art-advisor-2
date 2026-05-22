"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
} from "@/components/ui/dialog"
import {
  Plus,
  Upload,
  ImageIcon,
  Package,
  DollarSign,
  Eye,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Award,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { artworkStorage } from "@/lib/artwork-storage"

const statusConfig = {
  draft: { label: "Draft", icon: Clock, color: "bg-gray-100 text-gray-700" },
  listed: { label: "Listed", icon: CheckCircle2, color: "bg-green-100 text-green-700" },
  sold: { label: "Sold", icon: DollarSign, color: "bg-blue-100 text-blue-700" },
}

export default function MyCollectionPage() {
  const router = useRouter()
  const { user, isAuthenticated, hasRole, isLoading } = useAuth()
  const [collection, setCollection] = useState<any[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newArtwork, setNewArtwork] = useState<any>({
    certificate: false,
    condition: "Excellent",
    status: "draft",
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    } else if (isAuthenticated) {
      const artworks = artworkStorage.getAll()
      setCollection(artworks)
    }
  }, [isLoading, isAuthenticated, router])

  const handleAddArtwork = () => {
    if (!newArtwork.title || !newArtwork.artist) return

    const addedArtwork = artworkStorage.add({
      title: newArtwork.title || "",
      artist: newArtwork.artist || "",
      year: newArtwork.year || "",
      medium: newArtwork.medium || "",
      dimensions: newArtwork.dimensions || "",
      purchasePrice: newArtwork.purchasePrice || "",
      purchaseYear: newArtwork.purchaseYear || "",
      desiredPrice: newArtwork.desiredPrice || "",
      provenance: newArtwork.provenance || "",
      certificate: newArtwork.certificate || false,
      condition: newArtwork.condition || "Good",
      description: newArtwork.description || "",
      imageUrl: "/abstract-colorful-artwork.png",
      status: "draft",
    })

    setCollection([addedArtwork, ...collection])
    setNewArtwork({ certificate: false, condition: "Excellent", status: "draft" })
    setIsAddDialogOpen(false)
  }

  const totalValue = collection.reduce(
    (acc, art) => acc + (Number.parseInt(art.desiredPrice) || Number.parseInt(art.purchasePrice) || 0),
    0,
  )

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8 text-emerald-600" />
              My Collection
            </h1>
            <p className="text-muted-foreground mt-1">Register and manage artworks you own</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" asChild>
                <Link href="/artwork/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Artwork
                </Link>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Artwork</DialogTitle>
                <DialogDescription>
                  Register an artwork from your collection. All fields help with accurate valuation.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Artwork Image</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Artwork title"
                      value={newArtwork.title || ""}
                      onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artist">Artist *</Label>
                    <Input
                      id="artist"
                      placeholder="Artist name"
                      value={newArtwork.artist || ""}
                      onChange={(e) => setNewArtwork({ ...newArtwork, artist: e.target.value })}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year Created</Label>
                    <Input
                      id="year"
                      placeholder="e.g., 2023"
                      value={newArtwork.year || ""}
                      onChange={(e) => setNewArtwork({ ...newArtwork, year: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medium">Medium</Label>
                    <Input
                      id="medium"
                      placeholder="e.g., Oil on Canvas"
                      value={newArtwork.medium || ""}
                      onChange={(e) => setNewArtwork({ ...newArtwork, medium: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input
                      id="dimensions"
                      placeholder="e.g., 48 × 36 in"
                      value={newArtwork.dimensions || ""}
                      onChange={(e) => setNewArtwork({ ...newArtwork, dimensions: e.target.value })}
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="purchasePrice"
                        placeholder="0"
                        className="pl-9"
                        value={newArtwork.purchasePrice || ""}
                        onChange={(e) => setNewArtwork({ ...newArtwork, purchasePrice: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchaseYear">Purchase Year</Label>
                    <Input
                      id="purchaseYear"
                      placeholder="e.g., 2022"
                      value={newArtwork.purchaseYear || ""}
                      onChange={(e) => setNewArtwork({ ...newArtwork, purchaseYear: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desiredPrice">Desired Sale Price</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="desiredPrice"
                        placeholder="0"
                        className="pl-9"
                        value={newArtwork.desiredPrice || ""}
                        onChange={(e) => setNewArtwork({ ...newArtwork, desiredPrice: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Provenance & Condition */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="provenance">Provenance</Label>
                    <Textarea
                      id="provenance"
                      placeholder="Ownership history and acquisition details..."
                      value={newArtwork.provenance || ""}
                      onChange={(e) => setNewArtwork({ ...newArtwork, provenance: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select
                        value={newArtwork.condition}
                        onValueChange={(value) => setNewArtwork({ ...newArtwork, condition: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Excellent">Excellent</SelectItem>
                          <SelectItem value="Very Good">Very Good</SelectItem>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="certificate"
                        checked={newArtwork.certificate}
                        onChange={(e) => setNewArtwork({ ...newArtwork, certificate: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="certificate" className="text-sm font-normal">
                        Has Certificate of Authenticity
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional details about the artwork..."
                    value={newArtwork.description || ""}
                    onChange={(e) => setNewArtwork({ ...newArtwork, description: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddArtwork} disabled={!newArtwork.title || !newArtwork.artist}>
                    Add to Collection
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Artworks</p>
                  <p className="text-3xl font-bold">{collection.length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <ImageIcon className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Value</p>
                  <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">With Certificates</p>
                  <p className="text-3xl font-bold">{collection.filter((a) => a.certificate).length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <Award className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collection Grid */}
        {collection.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No artworks yet</h3>
              <p className="text-muted-foreground mb-4">Start building your collection by adding your first artwork.</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Artwork
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {collection.map((artwork, index) => {
                const status = statusConfig[artwork.status]
                const StatusIcon = status.icon

                return (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-48 shrink-0">
                          <img
                            src={artwork.imageUrl || "/placeholder.svg"}
                            alt={artwork.title}
                            className="h-48 sm:h-full w-full object-cover"
                          />
                        </div>
                        <CardContent className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate">{artwork.title}</h3>
                                <Badge variant="secondary" className={status.color}>
                                  <StatusIcon className="mr-1 h-3 w-3" />
                                  {status.label}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground">
                                {artwork.artist}, {artwork.year}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {artwork.medium} · {artwork.dimensions}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {artwork.certificate && (
                                  <Badge variant="outline" className="text-xs">
                                    <FileText className="h-3 w-3 mr-1" />
                                    Certificate
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {artwork.condition}
                                </Badge>
                              </div>
                              {artwork.provenance && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                                  Provenance: {artwork.provenance}
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              {artwork.desiredPrice && (
                                <p className="text-lg font-bold">
                                  ${Number.parseInt(artwork.desiredPrice).toLocaleString()}
                                </p>
                              )}
                              {artwork.purchasePrice && (
                                <p className="text-sm text-muted-foreground">
                                  Purchased: ${Number.parseInt(artwork.purchasePrice).toLocaleString()}
                                </p>
                              )}
                              <div className="flex gap-2 mt-3">
                                <Button variant="outline" size="sm" className="mt-2 bg-transparent" asChild>
                                  <Link href={`/artwork/${artwork.id}/edit`}>Manage</Link>
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* AI Advisor CTA */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Ask the AI Art Advisor</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized advice on selling timing, pricing, and market trends for your collection.
                </p>
              </div>
              <Button asChild>
                <Link href="/chat?q=Is now a good time to sell my artwork?">
                  Get Advice
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
