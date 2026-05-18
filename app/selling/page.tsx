"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
  Gavel,
  Check,
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
  const [collectionArtworks, setCollectionArtworks] = useState<Artwork[]>([])
  const [isListDialogOpen, setIsListDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedArtwork, setSelectedArtwork] = useState<string | null>(null)
  const [listingType, setListingType] = useState<"fixed" | "auction">("fixed")
  const [listingPrice, setListingPrice] = useState("")
  const [auctionStartingBid, setAuctionStartingBid] = useState("")
  const [auctionDuration, setAuctionDuration] = useState("7")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    } else if (isAuthenticated) {
      const fetchArtworks = async () => {
        const artworks = await artworkStorage.getAll()
        // Listed artworks go to listings
        setListings(artworks.filter(a => a.status === "listed" || a.status === "sold"))
        // Draft artworks are available for listing
        setCollectionArtworks(artworks.filter(a => a.status === "draft"))
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

  const handleListArtwork = async () => {
    if (!selectedArtwork) return
    if (listingType === "fixed" && !listingPrice) return
    if (listingType === "auction" && !auctionStartingBid) return

    setIsSubmitting(true)
    try {
      const price = listingType === "fixed" ? listingPrice : auctionStartingBid
      
      const result = await artworkStorage.update(selectedArtwork, {
        status: "listed",
        desiredPrice: price,
      })

      if (result) {
        // Move from collection to listings
        const artwork = collectionArtworks.find(a => a.id === selectedArtwork)
        if (artwork) {
          setListings([{ ...artwork, status: "listed", desiredPrice: price }, ...listings])
          setCollectionArtworks(collectionArtworks.filter(a => a.id !== selectedArtwork))
        }
        
        // Reset form
        setSelectedArtwork(null)
        setListingType("fixed")
        setListingPrice("")
        setAuctionStartingBid("")
        setAuctionDuration("7")
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
                <DialogTitle>List Artwork for Sale</DialogTitle>
                <DialogDescription>Select an artwork from your collection to list</DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Artwork Selection */}
                <div className="space-y-3">
                  <Label>Select Artwork from Collection</Label>
                  {collectionArtworks.length === 0 ? (
                    <div className="text-center py-8 border rounded-lg border-dashed">
                      <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground mb-3">No artworks available to list</p>
                      <Button variant="outline" asChild>
                        <Link href="/my-collection">Add to Collection First</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-3 max-h-64 overflow-y-auto pr-2">
                      {collectionArtworks.map((artwork) => (
                        <div
                          key={artwork.id}
                          onClick={() => setSelectedArtwork(artwork.id)}
                          className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedArtwork === artwork.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground/50"
                          }`}
                        >
                          <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={artwork.imageUrl || "/placeholder.svg"}
                              alt={artwork.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{artwork.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{artwork.artist}</p>
                            <p className="text-xs text-muted-foreground">{artwork.medium} {artwork.year && `• ${artwork.year}`}</p>
                          </div>
                          {selectedArtwork === artwork.id && (
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-4 w-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Listing Type */}
                {selectedArtwork && (
                  <>
                    <div className="space-y-3">
                      <Label>Listing Type</Label>
                      <RadioGroup
                        value={listingType}
                        onValueChange={(value) => setListingType(value as "fixed" | "auction")}
                        className="grid grid-cols-2 gap-4"
                      >
                        <Label
                          htmlFor="fixed"
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            listingType === "fixed" ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        >
                          <RadioGroupItem value="fixed" id="fixed" className="sr-only" />
                          <DollarSign className="h-6 w-6" />
                          <span className="font-medium">Fixed Price</span>
                          <span className="text-xs text-muted-foreground text-center">Set a buy-now price</span>
                        </Label>
                        <Label
                          htmlFor="auction"
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            listingType === "auction" ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        >
                          <RadioGroupItem value="auction" id="auction" className="sr-only" />
                          <Gavel className="h-6 w-6" />
                          <span className="font-medium">Auction</span>
                          <span className="text-xs text-muted-foreground text-center">Let buyers bid</span>
                        </Label>
                      </RadioGroup>
                    </div>

                    {/* Price Input */}
                    {listingType === "fixed" ? (
                      <div className="space-y-2">
                        <Label htmlFor="price">Listing Price *</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="price"
                            placeholder="0.00"
                            value={listingPrice}
                            onChange={(e) => setListingPrice(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="startingBid">Starting Bid *</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="startingBid"
                              placeholder="0.00"
                              value={auctionStartingBid}
                              onChange={(e) => setAuctionStartingBid(e.target.value)}
                              className="pl-9"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="duration">Auction Duration</Label>
                          <RadioGroup
                            value={auctionDuration}
                            onValueChange={setAuctionDuration}
                            className="flex gap-3"
                          >
                            {["3", "7", "14"].map((days) => (
                              <Label
                                key={days}
                                htmlFor={`duration-${days}`}
                                className={`flex-1 text-center py-2 px-4 rounded-lg border cursor-pointer transition-colors ${
                                  auctionDuration === days ? "border-primary bg-primary/5" : "border-border"
                                }`}
                              >
                                <RadioGroupItem value={days} id={`duration-${days}`} className="sr-only" />
                                <span className="font-medium">{days}</span>
                                <span className="text-muted-foreground ml-1">days</span>
                              </Label>
                            ))}
                          </RadioGroup>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsListDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleListArtwork} 
                  disabled={
                    isSubmitting || 
                    !selectedArtwork || 
                    (listingType === "fixed" && !listingPrice) ||
                    (listingType === "auction" && !auctionStartingBid)
                  }
                >
                  {isSubmitting ? "Listing..." : listingType === "auction" ? "Start Auction" : "List for Sale"}
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
