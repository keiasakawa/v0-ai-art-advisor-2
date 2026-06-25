"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Heart,
  Share2,
  Eye,
  Shield,
  Bell,
  Check,
  MessageSquare,
  Truck,
  Lock,
  Twitter,
  Facebook,
  Link2,
  ChevronLeft,
  Gavel,
  Tag,
  Clock,
  Trophy,
  DollarSign,
  Loader2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useTransition } from "react";
import { EstimatedMarketValue } from "@/components/estimated-market-value";
import { PriceHistory } from "@/components/price-history";
import { placeBid } from "@/app/actions/bids";

interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: string | null;
  medium: string | null;
  dimensions: string | null;
  depth: string | null;
  desired_price: number | null;
  purchase_price: number | null;
  provenance: string | null;
  certificate: boolean | null;
  condition: string | null;
  description: string | null;
  image_url: string | null;
  status: string | null;
  signed: boolean | null;
  edition: boolean | null;
  edition_number: string | null;
  edition_size: string | null;
  additional_notes: string | null;
}

interface Listing {
  id: number;
  artwork_id: string;
  seller_id: string;
  price: number | null;
  listing_type: string | null;
  status: string | null;
  auction_starting_bid: number | null;
  auction_end_date: string | null;
  created_at: string;
}

interface Props {
  artwork: Artwork;
  listing: Listing | null;
  highestBid: { amount: number; bidder_id: string } | null;
  bidCount: number;
  isAuctionEnded: boolean;
  currentUserId: string | null;
  currentUserIsWinner: boolean;
}

function formatPrice(value: number | null | undefined): string {
  if (!value) return "—";
  return `$${value.toLocaleString()}`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function timeUntil(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export default function ArtworkDetailClient({
  artwork,
  listing,
  highestBid,
  bidCount,
  isAuctionEnded,
  currentUserId,
  currentUserIsWinner,
}: Props) {
  const [isLiked, setIsLiked] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [alertCreated, setAlertCreated] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isAuction = listing?.listing_type === "auction";
  const isSeller = listing?.seller_id === currentUserId;
  const displayPrice = isAuction
    ? (highestBid?.amount ?? listing?.auction_starting_bid)
    : (listing?.price ?? artwork.desired_price);

  const minimumBid = highestBid
    ? Number(highestBid.amount) + 1
    : Number(listing?.auction_starting_bid ?? 0);

  const editionLabel =
    artwork.edition && artwork.edition_number && artwork.edition_size
      ? `Edition ${artwork.edition_number} of ${artwork.edition_size}`
      : artwork.edition
        ? "Limited Edition"
        : "Unique";

  const auctionTimeLeft = timeUntil(listing?.auction_end_date);

  function handleBidOpen() {
    setBidAmount(minimumBid.toString());
    setBidError(null);
    setBidSuccess(false);
    setBidDialogOpen(true);
  }

  function handlePlaceBid() {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setBidError("Please enter a valid bid amount.");
      return;
    }
    if (amount < minimumBid) {
      setBidError(`Minimum bid is ${formatPrice(minimumBid)}.`);
      return;
    }
    if (!listing) return;

    startTransition(async () => {
      const result = await placeBid({
        listing_id: listing.id,
        amount,
        artwork_id: artwork.id,
      });
      if (result.success) {
        setBidSuccess(true);
        setBidError(null);
      } else {
        setBidError(result.error ?? "Failed to place bid.");
      }
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      {/* Winner banner */}
      {currentUserIsWinner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between gap-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 px-6 py-4"
        >
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                Congratulations — you won this auction!
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Your winning bid was{" "}
                <span className="font-medium">
                  {formatPrice(highestBid?.amount)}
                </span>
                . Complete your purchase below.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white">
            <Link href={`/payment/${artwork.id}`}>Purchase Now</Link>
          </Button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left Column - Artwork Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg border bg-muted">
            <img
              src={artwork.image_url || "/placeholder.svg"}
              alt={artwork.title}
              className="h-full w-full object-contain"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-muted animate-pulse -z-10" />
          </div>

          <div className="flex items-center justify-center gap-6 py-4">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center gap-2 text-sm transition-colors ${
                isLiked
                  ? "text-red-500"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500" : ""}`} />
              {isLiked ? "Saved" : "Save"}
            </button>
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Eye className="h-5 w-5" />
              View in Room
            </button>
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Share2 className="h-5 w-5" />
                Share
              </button>
              {showShareMenu && (
                <div className="absolute top-full mt-2 right-0 bg-background border rounded-lg shadow-lg p-2 min-w-[160px] z-10">
                  <button className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors">
                    <Twitter className="h-4 w-4" /> Twitter
                  </button>
                  <button className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors">
                    <Facebook className="h-4 w-4" /> Facebook
                  </button>
                  <button className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors">
                    <Link2 className="h-4 w-4" /> Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Artwork Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Artist and Title */}
          <div>
            <p className="text-2xl font-semibold">{artwork.artist}</p>
            <p className="text-xl text-muted-foreground italic">
              {artwork.title}
              {artwork.year ? `, ${artwork.year}` : ""}
            </p>
          </div>

          {/* Medium & Dimensions */}
          <div className="space-y-1 text-sm text-muted-foreground">
            {artwork.medium && <p>{artwork.medium}</p>}
            {artwork.dimensions && <p>{artwork.dimensions}</p>}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm">
              <Shield className="h-4 w-4" />
              <span>{editionLabel}</span>
            </div>
            {artwork.certificate && (
              <div className="inline-flex items-center gap-1.5 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                <span className="underline underline-offset-2">
                  Certificate of Authenticity
                </span>
              </div>
            )}
            {artwork.signed && (
              <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Check className="h-4 w-4" />
                <span>Signed</span>
              </div>
            )}
            {listing && (
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                  isAuction
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                }`}
              >
                {isAuction ? (
                  <Gavel className="h-3.5 w-3.5" />
                ) : (
                  <Tag className="h-3.5 w-3.5" />
                )}
                {isAuction ? (isAuctionEnded ? "Auction Ended" : "Live Auction") : "Buy Now"}
              </div>
            )}
          </div>

          {/* Price / Bid info */}
          <div className="space-y-2">
            {isAuction ? (
              <>
                <div className="flex items-baseline gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {highestBid ? "Current bid" : "Starting bid"}
                    </p>
                    <p className="text-3xl font-semibold">
                      {formatPrice(displayPrice)}
                    </p>
                  </div>
                  {bidCount > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {bidCount} {bidCount === 1 ? "bid" : "bids"}
                    </div>
                  )}
                </div>
                {!isAuctionEnded && listing?.auction_end_date && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      {auctionTimeLeft}
                    </span>
                    <span className="text-muted-foreground">
                      · ends {formatDate(listing.auction_end_date)}
                    </span>
                  </div>
                )}
                {isAuctionEnded && (
                  <p className="text-sm text-muted-foreground">
                    This auction has ended.
                    {highestBid
                      ? ` Final price: ${formatPrice(highestBid.amount)}`
                      : " No bids were placed."}
                  </p>
                )}
              </>
            ) : (
              <p className="text-3xl font-semibold">
                {formatPrice(displayPrice)}
              </p>
            )}
          </div>

          {/* Purchase Controls */}
          <div className="space-y-3">
            {isAuction ? (
              isAuctionEnded ? (
                currentUserIsWinner ? (
                  <Button size="lg" className="w-full bg-amber-600 hover:bg-amber-700 text-white" asChild>
                    <Link href={`/payment/${artwork.id}`}>
                      <Trophy className="h-4 w-4 mr-2" />
                      Purchase Your Winning Artwork
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" className="w-full" disabled>
                    Auction Ended
                  </Button>
                )
              ) : isSeller ? (
                <Button size="lg" className="w-full" disabled>
                  Your listing
                </Button>
              ) : !currentUserId ? (
                <Button size="lg" className="w-full" asChild>
                  <Link href="/login">Sign in to Bid</Link>
                </Button>
              ) : (
                <Button size="lg" className="w-full" onClick={handleBidOpen}>
                  <Gavel className="h-4 w-4 mr-2" />
                  Place a Bid
                </Button>
              )
            ) : (
              <Button size="lg" className="w-full" asChild>
                <Link href={`/payment/${artwork.id}`}>Buy Now</Link>
              </Button>
            )}
            {!isAuction && (
              <Button
                size="lg"
                variant="outline"
                className="w-full bg-transparent"
              >
                Make an Offer
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <Lock className="h-4 w-4 flex-shrink-0" />
            <span>
              Buyer Protection Guarantee. Secure checkout with encrypted payment
              processing.
            </span>
          </div>

          {/* Shipping */}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowShipping(!showShipping)}
              className="flex w-full items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2 font-medium">
                <Truck className="h-4 w-4" />
                Shipping and taxes
              </span>
              <ChevronLeft
                className={`h-4 w-4 transition-transform ${showShipping ? "rotate-90" : "-rotate-90"}`}
              />
            </button>
            {showShipping && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 space-y-2 text-sm text-muted-foreground"
              >
                <p>Taxes may apply at checkout based on your location.</p>
                <p>Estimated delivery: 7–14 business days</p>
                <button className="underline underline-offset-2 hover:text-foreground">
                  Calculate shipping to your address
                </button>
              </motion.div>
            )}
          </div>

          {/* Alert */}
          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-sm text-muted-foreground">
              Get notified about similar works
            </span>
            <Button
              variant="outline"
              size="sm"
              className={`gap-2 ${alertCreated ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400" : ""}`}
              onClick={() => setAlertCreated(!alertCreated)}
            >
              <Bell
                className={`h-4 w-4 ${alertCreated ? "fill-green-600" : ""}`}
              />
              {alertCreated ? "Alert Created" : "Create Alert"}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Market Value + Price History */}
      <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <EstimatedMarketValue
          estimatedValue={artwork.desired_price ?? 0}
          lowEstimate={Math.round((artwork.desired_price ?? 0) * 0.85)}
          highEstimate={Math.round((artwork.desired_price ?? 0) * 1.15)}
          lastSalePrice={artwork.purchase_price ?? undefined}
          pricePerSquareInch={undefined}
        />
        <PriceHistory
          entries={
            artwork.purchase_price
              ? [
                  {
                    date: artwork.year ?? "—",
                    event: "Acquired",
                    price: artwork.purchase_price,
                  },
                  ...(listing
                    ? [
                        {
                          date: new Date(listing.created_at).toLocaleDateString(
                            "en-US",
                            { month: "short", year: "numeric" },
                          ),
                          event: isAuction ? "Auction Listed" : "Listed",
                          price:
                            (isAuction
                              ? listing.auction_starting_bid
                              : listing.price) ?? 0,
                        },
                      ]
                    : []),
                ]
              : listing
                ? [
                    {
                      date: new Date(listing.created_at).toLocaleDateString(
                        "en-US",
                        { month: "short", year: "numeric" },
                      ),
                      event: isAuction ? "Auction Listed" : "Listed",
                      price:
                        (isAuction
                          ? listing.auction_starting_bid
                          : listing.price) ?? 0,
                    },
                  ]
                : []
          }
          initialVisibleCount={3}
        />
      </div>

      {/* About the Work */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-16 border-t pt-8"
      >
        <h2 className="text-lg font-semibold border-b pb-4 mb-6">
          About the Work
        </h2>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            {artwork.description && (
              <p className="text-muted-foreground leading-relaxed">
                {artwork.description}
              </p>
            )}

            <div className="space-y-0 text-sm">
              {artwork.medium && (
                <div className="grid grid-cols-[160px_1fr] gap-4 py-3 border-b">
                  <span className="text-muted-foreground">Materials</span>
                  <span>{artwork.medium}</span>
                </div>
              )}
              {artwork.dimensions && (
                <div className="grid grid-cols-[160px_1fr] gap-4 py-3 border-b">
                  <span className="text-muted-foreground">Size</span>
                  <span>{artwork.dimensions}</span>
                </div>
              )}
              <div className="grid grid-cols-[160px_1fr] gap-4 py-3 border-b">
                <span className="text-muted-foreground">Rarity</span>
                <span>{editionLabel}</span>
              </div>
              {artwork.condition && (
                <div className="grid grid-cols-[160px_1fr] gap-4 py-3 border-b">
                  <span className="text-muted-foreground">Condition</span>
                  <span>{artwork.condition}</span>
                </div>
              )}
              <div className="grid grid-cols-[160px_1fr] gap-4 py-3 border-b">
                <span className="text-muted-foreground">Signature</span>
                <span>{artwork.signed ? "Hand-signed by artist" : "Not signed"}</span>
              </div>
              <div className="grid grid-cols-[160px_1fr] gap-4 py-3 border-b">
                <span className="text-muted-foreground">Certificate</span>
                <span>{artwork.certificate ? "Included" : "Not included"}</span>
              </div>
              {artwork.provenance && (
                <div className="grid grid-cols-[160px_1fr] gap-4 py-3 border-b">
                  <span className="text-muted-foreground">Provenance</span>
                  <span>{artwork.provenance}</span>
                </div>
              )}
              {listing && (
                <div className="grid grid-cols-[160px_1fr] gap-4 py-3 border-b">
                  <span className="text-muted-foreground">Listing type</span>
                  <span className="flex items-center gap-1.5">
                    {isAuction ? (
                      <><Gavel className="h-3.5 w-3.5" /> Auction</>
                    ) : (
                      <><Tag className="h-3.5 w-3.5" /> Buy Now (Fixed Price)</>
                    )}
                  </span>
                </div>
              )}
              {isAuction && listing?.auction_end_date && (
                <div className="grid grid-cols-[160px_1fr] gap-4 py-3 border-b">
                  <span className="text-muted-foreground">Auction ends</span>
                  <span>{formatDate(listing.auction_end_date)}</span>
                </div>
              )}
              {artwork.additional_notes && (
                <div className="grid grid-cols-[160px_1fr] gap-4 py-3 border-b">
                  <span className="text-muted-foreground">Notes</span>
                  <span>{artwork.additional_notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Artist info placeholder */}
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center shrink-0">
                <span className="text-2xl font-semibold text-muted-foreground">
                  {artwork.artist?.charAt(0) ?? "?"}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{artwork.artist}</p>
                  <Button variant="outline" size="sm">
                    Follow
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                asChild
              >
                <Link href="/chat">
                  <MessageSquare className="h-4 w-4" />
                  Ask OFFA about this artist
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Advisor CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-16 rounded-xl border bg-muted/30 p-8 text-center"
      >
        <MessageSquare className="mx-auto h-8 w-8 text-primary mb-3" />
        <h3 className="text-lg font-semibold">
          Have questions about this artwork?
        </h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          Ask our AI Art Advisor for insights on style, investment potential, or
          similar works
        </p>
        <Button asChild className="mt-4">
          <Link href="/chat">Chat with AI Advisor</Link>
        </Button>
      </motion.div>

      {/* Place a Bid Dialog */}
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Place a Bid
            </DialogTitle>
            <DialogDescription>
              {artwork.title} by {artwork.artist}
            </DialogDescription>
          </DialogHeader>

          {bidSuccess ? (
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold">Bid placed successfully!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your bid of{" "}
                    <span className="font-medium text-foreground">
                      ${parseFloat(bidAmount).toLocaleString()}
                    </span>{" "}
                    has been recorded. If you win, you will be notified and can
                    complete your purchase here.
                  </p>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => setBidDialogOpen(false)}
              >
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Current bid info */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {highestBid ? "Current highest bid" : "Starting bid"}
                  </span>
                  <span className="font-medium">
                    {formatPrice(highestBid?.amount ?? listing?.auction_starting_bid)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Minimum bid</span>
                  <span className="font-medium text-primary">
                    {formatPrice(minimumBid)}
                  </span>
                </div>
                {listing?.auction_end_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time remaining</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      {auctionTimeLeft}
                    </span>
                  </div>
                )}
              </div>

              {/* Bid input */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Your bid amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min={minimumBid}
                    step="1"
                    className="pl-8"
                    value={bidAmount}
                    onChange={(e) => {
                      setBidAmount(e.target.value);
                      setBidError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handlePlaceBid()}
                    placeholder={`${minimumBid}`}
                  />
                </div>
                {bidError && (
                  <p className="text-sm text-destructive">{bidError}</p>
                )}
              </div>

              <Button
                className="w-full"
                onClick={handlePlaceBid}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Gavel className="h-4 w-4 mr-2" />
                )}
                {isPending ? "Placing bid…" : `Bid ${bidAmount ? `$${parseFloat(bidAmount).toLocaleString()}` : ""}`}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By placing a bid you agree to purchase this artwork if you win.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
