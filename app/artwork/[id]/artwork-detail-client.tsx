"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ChevronRight,
  Gavel,
  Tag,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { EstimatedMarketValue } from "@/components/estimated-market-value";
import { PriceHistory } from "@/components/price-history";

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

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function ArtworkDetailClient({ artwork, listing }: Props) {
  const [isLiked, setIsLiked] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showShipping, setShowShipping] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [alertCreated, setAlertCreated] = useState(false);

  const isAuction = listing?.listing_type === "auction";
  const displayPrice = isAuction
    ? listing?.auction_starting_bid
    : listing?.price ?? artwork.desired_price;

  const editionLabel =
    artwork.edition && artwork.edition_number && artwork.edition_size
      ? `Edition ${artwork.edition_number} of ${artwork.edition_size}`
      : artwork.edition
        ? "Limited Edition"
        : "Unique";

  const auctionDays = daysUntil(listing?.auction_end_date);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
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
                {isAuction ? "Auction" : "Buy Now"}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1">
            {isAuction ? (
              <>
                <p className="text-sm text-muted-foreground">Starting bid</p>
                <p className="text-2xl font-semibold">
                  {formatPrice(listing?.auction_starting_bid)}
                </p>
                {listing?.auction_end_date && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      Ends {formatDate(listing.auction_end_date)}
                      {auctionDays !== null && (
                        <span className="ml-1 text-amber-600 font-medium">
                          ({auctionDays === 0 ? "today" : `${auctionDays}d left`})
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-2xl font-semibold">
                  {formatPrice(displayPrice)}
                </p>
              </>
            )}
          </div>

          {/* Purchase Controls */}
          <div className="space-y-3">
            {isAuction ? (
              <Button size="lg" className="w-full">
                Place a Bid
              </Button>
            ) : (
              <Button size="lg" className="w-full" asChild>
                <Link href={`/payment/${artwork.id}`}>Buy Now</Link>
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="w-full bg-transparent"
            >
              Make an Offer
            </Button>
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
              className={`gap-2 ${alertCreated ? "bg-green-50 border-green-200 text-green-700" : ""}`}
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
                <span>
                  {artwork.certificate
                    ? "Included"
                    : "Not included"}
                </span>
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
    </div>
  );
}
