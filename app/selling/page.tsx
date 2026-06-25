"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Loader2,
  Gavel,
  Tag,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getUserArtworks, updateArtwork } from "@/app/actions/artwork";
import { createListing } from "@/app/actions/listings";

interface Artwork {
  id: string;
  title: string;
  imageUrl: string;
  status: string;
  createdAt: string;
  desiredPrice: string;
  purchasePrice: string;
}

export interface Listing {
  id: string;

  artwork_id: string;

  seller_id: string;

  price: number;

  listing_type: "fixed" | "auction";

  auction_starting_bid?: number;

  auction_end_date?: string;

  shipping_location?: string;

  status: "active" | "pending_offer" | "sold";

  created_at: string;
}

// Map a Supabase artwork row (snake_case) to the shape used by this page
function mapArtwork(row: any): Artwork {
  return {
    id: row.id,
    title: row.title || "Untitled",
    imageUrl: row.image_url || "/placeholder.svg",
    status: row.status || "draft",
    createdAt: row.created_at || new Date().toISOString(),
    desiredPrice: row.desired_price != null ? String(row.desired_price) : "",
    purchasePrice: row.purchase_price != null ? String(row.purchase_price) : "",
  };
}

const statusConfig = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700",
  },
  pending_offer: {
    label: "Pending Offer",
    icon: Clock,
    color: "bg-amber-100 text-amber-700",
  },
  sold: { label: "Sold", icon: DollarSign, color: "bg-blue-100 text-blue-700" },
  draft: {
    label: "Draft",
    icon: AlertCircle,
    color: "bg-gray-100 text-gray-700",
  },
  listed: {
    label: "Listed",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700",
  },
};

export default function SellingDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, hasRole, isLoading } = useAuth();
  const [listings, setListings] = useState<Artwork[]>([]);
  const [isLoadingArtworks, setIsLoadingArtworks] = useState(true);
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [listingPrices, setListingPrices] = useState<Record<string, string>>(
    {},
  );
  const [listingTypes, setListingTypes] = useState<
    Record<string, "fixed" | "auction">
  >({});
  const [auctionStartingBids, setAuctionStartingBids] = useState<
    Record<string, string>
  >({});
  const [auctionEndDates, setAuctionEndDates] = useState<
    Record<string, string>
  >({});
  const [listingId, setListingId] = useState<string | null>(null);

  const loadArtworks = async () => {
    setIsLoadingArtworks(true);
    const result = await getUserArtworks();
    if (result.success) {
      setListings(result.data.map(mapArtwork));
    }
    setIsLoadingArtworks(false);
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    } else if (isAuthenticated) {
      loadArtworks();
    }
  }, [isLoading, isAuthenticated, router]);

  const draftArtworks = listings.filter((a) => a.status === "draft");

  const handleListArtwork = async (artwork: Artwork) => {
    setListingId(artwork.id);
    const type = listingTypes[artwork.id] ?? "fixed";
    const priceInput = listingPrices[artwork.id] ?? artwork.desiredPrice;
    const price = priceInput ? Number.parseFloat(priceInput) : 0;
    const startingBid = auctionStartingBids[artwork.id]
      ? Number.parseFloat(auctionStartingBids[artwork.id])
      : undefined;
    const endDate = auctionEndDates[artwork.id] || undefined;

    // 1. Mark the artwork as listed
    const artworkResult = await updateArtwork({
      id: artwork.id,
      status: "listed",
      ...(price > 0 ? { desired_price: price } : {}),
    });

    if (!artworkResult.success) {
      setListingId(null);
      return;
    }

    // 2. Create a new row in the listings table
    await createListing({
      artwork_id: artwork.id,
      price: type === "fixed" ? price : (startingBid ?? 0),
      listing_type: type,
      ...(type === "auction" && startingBid != null
        ? { auction_starting_bid: startingBid }
        : {}),
      ...(type === "auction" && endDate ? { auction_end_date: endDate } : {}),
    });

    setListingId(null);
    await loadArtworks();

    // Close dialog if no more drafts remain
    const remainingDrafts = listings.filter(
      (a) => a.status === "draft" && a.id !== artwork.id,
    );
    if (remainingDrafts.length === 0) {
      setIsListDialogOpen(false);
    }
  };

  const sellerStats = {
    totalListings: listings.length,
    activeListings: listings.filter((a) => a.status === "listed").length,
    soldArtworks: listings.filter((a) => a.status === "sold").length,
    totalRevenue: listings
      .filter((a) => a.status === "sold")
      .reduce(
        (sum, a) =>
          sum +
          (Number.parseInt(a.desiredPrice) ||
            Number.parseInt(a.purchasePrice) ||
            0),
        0,
      ),
    pendingOffers: 0, // Would come from offers system
    viewsThisMonth: listings.reduce(
      (sum) => sum + Math.floor(Math.random() * 100),
      0,
    ), // Mock views for now
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
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
            <CardDescription>
              You need to add the Seller role to access this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/select-role")}>
              Add Seller Role
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
            <p className="text-muted-foreground mt-1">
              Manage your art listings and sales
            </p>
          </div>
          <Button size="lg" onClick={() => setIsListDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            List New Artwork
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Listings
                    </p>
                    <p className="text-3xl font-bold">
                      {sellerStats.activeListings}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                    <Package className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Revenue
                    </p>
                    <p className="text-3xl font-bold">
                      ${sellerStats.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Views This Month
                    </p>
                    <p className="text-3xl font-bold">
                      {sellerStats.viewsThisMonth}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                    <Eye className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pending Offers
                    </p>
                    <p className="text-3xl font-bold">
                      {sellerStats.pendingOffers}
                    </p>
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
                <CardDescription>
                  Manage and track your artwork listings
                </CardDescription>
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
            {isLoadingArtworks ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground mt-4">
                  Loading your listings...
                </p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding an artwork to your collection, then list it
                  for sale.
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
                  const status =
                    statusConfig[listing.status as keyof typeof statusConfig] ||
                    statusConfig.draft;
                  const StatusIcon = status.icon;
                  const mockViews = Math.floor(Math.random() * 200) + 20;
                  const mockInquiries = Math.floor(Math.random() * 8);

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
                          <h3 className="font-semibold truncate">
                            {listing.title}
                          </h3>
                          <Badge variant="secondary" className={status.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Added on{" "}
                          {new Date(listing.createdAt).toLocaleDateString()}
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 bg-transparent"
                          asChild
                        >
                          <Link href={`/artwork/${listing.id}/edit`}>
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* List New Artwork Dialog */}
      <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>List New Artwork</DialogTitle>
            <DialogDescription>
              Choose a draft from your collection to list for sale, or create a
              brand new artwork.
            </DialogDescription>
          </DialogHeader>

          {draftArtworks.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">
                You don&apos;t have any drafts to list yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {draftArtworks.map((artwork) => {
                const type = listingTypes[artwork.id] ?? "fixed";
                return (
                  <div
                    key={artwork.id}
                    className="rounded-lg border bg-card p-3 space-y-3"
                  >
                    {/* Artwork header row */}
                    <div className="flex items-center gap-3">
                      <img
                        src={artwork.imageUrl || "/placeholder.svg"}
                        alt={artwork.title}
                        className="h-12 w-12 rounded-md object-cover shrink-0"
                      />
                      <p className="font-medium truncate flex-1">
                        {artwork.title}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleListArtwork(artwork)}
                        disabled={listingId === artwork.id}
                      >
                        {listingId === artwork.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "List"
                        )}
                      </Button>
                    </div>

                    {/* Listing type toggle */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setListingTypes((prev) => ({
                            ...prev,
                            [artwork.id]: "fixed",
                          }))
                        }
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-md border py-1.5 text-xs font-medium transition-colors ${
                          type === "fixed"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Tag className="h-3.5 w-3.5" />
                        Buy Now
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setListingTypes((prev) => ({
                            ...prev,
                            [artwork.id]: "auction",
                          }))
                        }
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-md border py-1.5 text-xs font-medium transition-colors ${
                          type === "auction"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Gavel className="h-3.5 w-3.5" />
                        Auction
                      </button>
                    </div>

                    {/* Price fields */}
                    {type === "fixed" ? (
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          placeholder="Buy now price"
                          className="h-8 pl-7 text-sm"
                          value={
                            listingPrices[artwork.id] ?? artwork.desiredPrice
                          }
                          onChange={(e) =>
                            setListingPrices((prev) => ({
                              ...prev,
                              [artwork.id]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            type="number"
                            min="0"
                            placeholder="Starting bid"
                            className="h-8 pl-7 text-sm"
                            value={auctionStartingBids[artwork.id] ?? ""}
                            onChange={(e) =>
                              setAuctionStartingBids((prev) => ({
                                ...prev,
                                [artwork.id]: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <Input
                          type="date"
                          className="h-8 text-sm"
                          min={
                            new Date(Date.now() + 86400000)
                              .toISOString()
                              .split("T")[0]
                          }
                          value={auctionEndDates[artwork.id] ?? ""}
                          onChange={(e) =>
                            setAuctionEndDates((prev) => ({
                              ...prev,
                              [artwork.id]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <DialogFooter className="sm:justify-between gap-2">
            <Button variant="outline" asChild>
              <Link href="/artwork/new">
                <Plus className="mr-2 h-4 w-4" />
                Create New Artwork
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => setIsListDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
