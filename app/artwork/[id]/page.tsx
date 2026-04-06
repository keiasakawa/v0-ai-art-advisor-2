"use client"

import { Button } from "@/components/ui/button"
import {
  Heart,
  Share2,
  Eye,
  ChevronLeft,
  Shield,
  Bell,
  Check,
  MessageSquare,
  Truck,
  Lock,
  Twitter,
  Facebook,
  Link2,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { useParams } from "next/navigation"

import { EstimatedMarketValue } from "@/components/estimated-market-value"
import { PriceHistory } from "@/components/price-history"

// Artwork database (would come from backend/API)
const artworksData: Record<
  string,
  {
    id: number
    title: string
    artist: string
    artistBio: string
    artistNationality: string
    artistBorn: string
    artistImage: string
    price: number
    image: string
    additionalImages: string[]
    category: string
    size: string
    medium: string
    year: number
    rarity: string
    signature: string
    certificate: boolean
    frame: string
    description: string
    galleryName: string
    shippingInfo: string
    marketValue: {
      estimated: number
      low: number
      high: number
      lastSalePrice?: number
      lastSaleDate?: string
      priceChange?: number
      pricePerSquareInch?: number
    }
    priceHistory: {
      date: string
      event: string
      price: number
      changePercent?: number
      pricePerUnit?: number
      unitLabel?: string
      source?: string
      sourceUrl?: string
    }[]
  }
> = {
  "1": {
    id: 1,
    title: "Ethereal Horizons",
    artist: "Maya Chen",
    artistBio:
      "Maya Chen is a contemporary landscape artist known for her ethereal depictions of natural scenes. Her work explores the intersection of memory and place, using soft brushwork and muted palettes to evoke emotional responses. Chen's paintings have been exhibited internationally and are held in private collections across North America and Europe.",
    artistNationality: "American",
    artistBorn: "1985",
    artistImage: "/female-artist-portrait.png",
    price: 4200,
    image: "/ethereal-landscape-painting.jpg",
    additionalImages: ["/ethereal-landscape-painting.jpg"],
    category: "Contemporary",
    size: "36 × 48 in | 91.4 × 121.9 cm",
    medium: "Oil on Canvas",
    year: 2023,
    rarity: "Unique",
    signature: "Hand-signed by artist, signed on back",
    certificate: true,
    frame: "Not included",
    description:
      "With masterful brushstrokes and an intuitive understanding of color theory, Chen's landscapes transport viewers to liminal spaces between reality and dream. This piece exemplifies her signature style of atmospheric depth and emotional resonance.",
    galleryName: "Horizon Fine Arts",
    shippingInfo: "Ships from New York, NY",
    marketValue: {
      estimated: 4500,
      low: 3800,
      high: 5200,
      lastSalePrice: 3200,
      lastSaleDate: "March 2022",
      priceChange: 40.6,
      pricePerSquareInch: 2.6,
    },
    priceHistory: [
      { date: "Nov 2024", event: "Listed", price: 4200, pricePerUnit: 2.43, unitLabel: "sq in", source: "OFFA" },
      {
        date: "Mar 2022",
        event: "Sold",
        price: 3200,
        changePercent: 28.0,
        pricePerUnit: 1.85,
        unitLabel: "sq in",
        source: "Christie's",
        sourceUrl: "#",
      },
      {
        date: "Sep 2020",
        event: "Auction",
        price: 2500,
        changePercent: 66.7,
        pricePerUnit: 1.45,
        unitLabel: "sq in",
        source: "Sotheby's",
        sourceUrl: "#",
      },
      { date: "Jun 2019", event: "Sold", price: 1500, pricePerUnit: 0.87, unitLabel: "sq in", source: "Gallery Sale" },
    ],
  },
  "2": {
    id: 2,
    title: "Urban Pulse",
    artist: "Marcus Rivera",
    artistBio:
      "Marcus Rivera captures the energy and rhythm of city life through bold abstract compositions. His work draws from his experiences growing up in urban environments, translating the chaos and beauty of metropolitan landscapes into dynamic visual narratives.",
    artistNationality: "Mexican-American",
    artistBorn: "1978",
    artistImage: "/male-artist-portrait.png",
    price: 3800,
    image: "/abstract-urban-painting.png",
    additionalImages: ["/abstract-urban-painting.png"],
    category: "Abstract",
    size: "40 × 30 in | 101.6 × 76.2 cm",
    medium: "Acrylic on Canvas",
    year: 2024,
    rarity: "Unique",
    signature: "Hand-signed by artist",
    certificate: true,
    frame: "Included",
    description:
      "Urban Pulse captures the frenetic energy of city life through layered textures and bold color choices. Rivera's gestural marks suggest movement and momentum, inviting viewers to feel the heartbeat of the metropolis.",
    galleryName: "Metropolitan Gallery",
    shippingInfo: "Ships from Los Angeles, CA",
    marketValue: {
      estimated: 4100,
      low: 3400,
      high: 4800,
      lastSalePrice: 2900,
      lastSaleDate: "January 2023",
      priceChange: 41.4,
      pricePerSquareInch: 3.42,
    },
    priceHistory: [
      { date: "Dec 2024", event: "Listed", price: 3800, pricePerUnit: 3.17, unitLabel: "sq in", source: "OFFA" },
      {
        date: "Jan 2023",
        event: "Sold",
        price: 2900,
        changePercent: 31.8,
        pricePerUnit: 2.42,
        unitLabel: "sq in",
        source: "Phillips",
        sourceUrl: "#",
      },
      {
        date: "May 2021",
        event: "Auction",
        price: 2200,
        changePercent: 57.1,
        pricePerUnit: 1.83,
        unitLabel: "sq in",
        source: "Bonhams",
        sourceUrl: "#",
      },
      { date: "Oct 2019", event: "Sold", price: 1400, pricePerUnit: 1.17, unitLabel: "sq in", source: "Gallery Sale" },
    ],
  },
  "3": {
    id: 3,
    title: "Digital Dreams",
    artist: "Yuki Tanaka",
    artistBio:
      "Yuki Tanaka is a pioneer in digital art, blending traditional Japanese aesthetics with cutting-edge technology. Her work explores themes of identity, technology, and nature in the digital age, creating immersive visual experiences.",
    artistNationality: "Japanese",
    artistBorn: "1990",
    artistImage: "/asian-female-artist.jpg",
    price: 2900,
    image: "/digital-art-colorful.jpg",
    additionalImages: ["/digital-art-colorful.jpg"],
    category: "Digital Art",
    size: "24 × 24 in | 61 × 61 cm",
    medium: "Digital Print on Aluminum",
    year: 2024,
    rarity: "Limited Edition of 10",
    signature: "Signed and numbered",
    certificate: true,
    frame: "Not included",
    description:
      "Digital Dreams represents Tanaka's exploration of consciousness in a hyperconnected world. Vibrant colors cascade through digital space, suggesting the flow of data and dreams intertwined.",
    galleryName: "Neo Tokyo Arts",
    shippingInfo: "Ships from Tokyo, Japan",
    marketValue: {
      estimated: 3200,
      low: 2600,
      high: 3800,
      lastSalePrice: 2100,
      lastSaleDate: "August 2023",
      priceChange: 52.4,
      pricePerSquareInch: 5.56,
    },
    priceHistory: [
      { date: "Nov 2024", event: "Listed", price: 2900, pricePerUnit: 5.03, unitLabel: "sq in", source: "OFFA" },
      {
        date: "Aug 2023",
        event: "Sold",
        price: 2100,
        changePercent: 50.0,
        pricePerUnit: 3.65,
        unitLabel: "sq in",
        source: "Art Basel",
        sourceUrl: "#",
      },
      { date: "Feb 2022", event: "Sold", price: 1400, pricePerUnit: 2.43, unitLabel: "sq in", source: "Tokyo Gallery" },
    ],
  },
  "4": {
    id: 4,
    title: "Geometric Harmony",
    artist: "Sofia Laurent",
    artistBio:
      "Sofia Laurent's geometric abstractions explore mathematical beauty and visual harmony. Her precisely constructed compositions draw from both Bauhaus traditions and contemporary minimalism, creating works that balance complexity with clarity.",
    artistNationality: "French",
    artistBorn: "1982",
    artistImage: "/european-female-artist.jpg",
    price: 5500,
    image: "/geometric-abstract.png",
    additionalImages: ["/geometric-abstract.png"],
    category: "Geometric",
    size: "48 × 36 in | 121.9 × 91.4 cm",
    medium: "Acrylic on Linen",
    year: 2023,
    rarity: "Unique",
    signature: "Hand-signed by artist, signed on back",
    certificate: true,
    frame: "Gallery frame included",
    description:
      "Geometric Harmony demonstrates Laurent's mastery of form and color. Each shape interlocks with mathematical precision while maintaining organic flow, creating a meditative visual experience.",
    galleryName: "Galerie Moderne Paris",
    shippingInfo: "Ships from Paris, France",
    marketValue: {
      estimated: 6200,
      low: 5000,
      high: 7500,
      lastSalePrice: 2200,
      lastSaleDate: "April 2020",
      priceChange: 181.8,
      pricePerSquareInch: 3.59,
    },
    priceHistory: [
      { date: "Oct 2024", event: "Listed", price: 5500, pricePerUnit: 3.18, unitLabel: "sq in", source: "OFFA" },
      {
        date: "Apr 2020",
        event: "Auction",
        price: 2200,
        changePercent: 69.2,
        pricePerUnit: 1.27,
        unitLabel: "sq in",
        source: "Christie's Paris",
        sourceUrl: "#",
      },
      {
        date: "Nov 2018",
        event: "Sold",
        price: 1300,
        changePercent: 44.4,
        pricePerUnit: 0.75,
        unitLabel: "sq in",
        source: "Galerie Moderne",
      },
      { date: "Mar 2017", event: "Sold", price: 900, pricePerUnit: 0.52, unitLabel: "sq in", source: "Studio Sale" },
      {
        date: "Sep 2015",
        event: "Listed",
        price: 650,
        pricePerUnit: 0.38,
        unitLabel: "sq in",
        source: "First Gallery Show",
      },
    ],
  },
  "5": {
    id: 5,
    title: "Cosmic Flow",
    artist: "Alex Storm",
    artistBio:
      "Alex Storm creates cosmic abstractions that explore the vastness of space and human consciousness. Using fluid techniques and luminous colors, Storm's work invites contemplation of our place in the universe.",
    artistNationality: "British",
    artistBorn: "1988",
    artistImage: "/male-artist-with-beard.jpg",
    price: 3200,
    image: "/space-abstract-art.jpg",
    additionalImages: ["/space-abstract-art.jpg"],
    category: "Abstract",
    size: "30 × 40 in | 76.2 × 101.6 cm",
    medium: "Mixed Media on Canvas",
    year: 2024,
    rarity: "Unique",
    signature: "Hand-signed by artist",
    certificate: true,
    frame: "Not included",
    description:
      "Cosmic Flow captures the dynamic energy of celestial phenomena. Swirling nebulae and stardust seem to dance across the canvas, evoking both scientific wonder and spiritual transcendence.",
    galleryName: "Stellar Arts London",
    shippingInfo: "Ships from London, UK",
    marketValue: {
      estimated: 3600,
      low: 2800,
      high: 4400,
      lastSalePrice: 2400,
      lastSaleDate: "June 2023",
      priceChange: 50.0,
      pricePerSquareInch: 3.0,
    },
    priceHistory: [
      { date: "Dec 2024", event: "Listed", price: 3200, pricePerUnit: 2.67, unitLabel: "sq in", source: "OFFA" },
      {
        date: "Jun 2023",
        event: "Sold",
        price: 2400,
        changePercent: 33.3,
        pricePerUnit: 2.0,
        unitLabel: "sq in",
        source: "Frieze London",
        sourceUrl: "#",
      },
      { date: "Jan 2022", event: "Sold", price: 1800, pricePerUnit: 1.5, unitLabel: "sq in", source: "Stellar Arts" },
    ],
  },
  "6": {
    id: 6,
    title: "Nature's Whisper",
    artist: "Emma Woods",
    artistBio:
      "Emma Woods is an environmental artist whose work celebrates the quiet beauty of the natural world. Her contemplative pieces encourage viewers to slow down and reconnect with nature's subtle rhythms.",
    artistNationality: "Canadian",
    artistBorn: "1975",
    artistImage: "/mature-female-artist.jpg",
    price: 4800,
    image: "/contemporary-abstract.jpg",
    additionalImages: ["/contemporary-abstract.jpg"],
    category: "Contemporary",
    size: "42 × 32 in | 106.7 × 81.3 cm",
    medium: "Oil on Wood Panel",
    year: 2023,
    rarity: "Unique",
    signature: "Hand-signed by artist, signed on back",
    certificate: true,
    frame: "Natural wood frame included",
    description:
      "Nature's Whisper invites quiet contemplation. Woods' sensitive handling of light and texture creates a meditative space where viewers can reconnect with the gentle rhythms of the natural world.",
    galleryName: "Northern Light Gallery",
    shippingInfo: "Ships from Toronto, Canada",
    marketValue: {
      estimated: 5400,
      low: 4200,
      high: 6600,
      lastSalePrice: 1900,
      lastSaleDate: "February 2019",
      priceChange: 184.2,
      pricePerSquareInch: 4.02,
    },
    priceHistory: [
      { date: "Nov 2024", event: "Listed", price: 4800, pricePerUnit: 3.57, unitLabel: "sq in", source: "OFFA" },
      {
        date: "Feb 2019",
        event: "Auction",
        price: 1900,
        changePercent: 58.3,
        pricePerUnit: 1.41,
        unitLabel: "sq in",
        source: "Heffel",
        sourceUrl: "#",
      },
      {
        date: "Aug 2016",
        event: "Sold",
        price: 1200,
        changePercent: 71.4,
        pricePerUnit: 0.89,
        unitLabel: "sq in",
        source: "Northern Light Gallery",
      },
      { date: "Mar 2014", event: "Sold", price: 700, pricePerUnit: 0.52, unitLabel: "sq in", source: "Studio Sale" },
    ],
  },
}

const getRelatedArtworks = (currentId: string) => {
  return Object.values(artworksData)
    .filter((art) => art.id.toString() !== currentId)
    .slice(0, 4)
}

export default function ArtworkPage() {
  const params = useParams()
  const id = params.id as string
  const artwork = artworksData[id] || artworksData["1"]
  const [isLiked, setIsLiked] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showShipping, setShowShipping] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [alertCreated, setAlertCreated] = useState(false)

  const relatedArtworks = getRelatedArtworks(id)

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left Column - Artwork Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Main Image with lazy loading */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border bg-muted">
              <img
                src={artwork.additionalImages[selectedImage] || artwork.image}
                alt={artwork.title}
                className="h-full w-full object-contain"
                loading="lazy"
              />
              {/* Image loading skeleton */}
              <div className="absolute inset-0 bg-muted animate-pulse -z-10" />
            </div>

            <div className="flex items-center justify-center gap-6 py-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
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
              <Link href="#" className="text-2xl font-semibold hover:underline underline-offset-4">
                {artwork.artist}
              </Link>
              <p className="text-xl text-muted-foreground italic">
                {artwork.title}, {artwork.year}
              </p>
            </div>

            {/* Medium, Size, Edition */}
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{artwork.medium}</p>
              <p>{artwork.size}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm">
                <Shield className="h-4 w-4" />
                <span>{artwork.rarity}</span>
              </div>
              {artwork.certificate && (
                <div className="inline-flex items-center gap-1.5 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="underline underline-offset-2">Certificate of Authenticity</span>
                </div>
              )}
              {artwork.signature && (
                <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span>Signed</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="text-2xl font-semibold">US${artwork.price.toLocaleString()}</div>

            {/* Purchase / Contact Controls */}
            <div className="space-y-3">
              <Button size="lg" className="w-full">
                Purchase
              </Button>
              <Button size="lg" variant="outline" className="w-full bg-transparent">
                Make an Offer
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              <Lock className="h-4 w-4 flex-shrink-0" />
              <span>Buyer Protection Guarantee. Secure checkout with encrypted payment processing.</span>
            </div>

            {/* Shipping & Taxes */}
            <div className="border-t pt-4">
              <button
                onClick={() => setShowShipping(!showShipping)}
                className="flex w-full items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Truck className="h-4 w-4" />
                  Shipping and taxes
                </span>
                <ChevronLeft className={`h-4 w-4 transition-transform ${showShipping ? "rotate-90" : "-rotate-90"}`} />
              </button>
              {showShipping && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 space-y-2 text-sm text-muted-foreground"
                >
                  <p>{artwork.shippingInfo}</p>
                  <p>Taxes may apply at checkout based on your location.</p>
                  <p>Estimated delivery: 7-14 business days</p>
                  <button className="underline underline-offset-2 hover:text-foreground">
                    Calculate shipping to your address
                  </button>
                </motion.div>
              )}
            </div>

            {/* Gallery / Seller Information */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm">
                <Link href="#" className="font-medium hover:underline underline-offset-2">
                  {artwork.galleryName}
                </Link>
                <p className="text-muted-foreground">{artwork.shippingInfo.replace("Ships from ", "")}</p>
              </div>
              <Button variant="outline" size="sm">
                Contact Gallery
              </Button>
            </div>

            {/* Social / Sharing / Save / Alert Features */}
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-sm text-muted-foreground">Get notified about similar works</span>
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 ${alertCreated ? "bg-green-50 border-green-200 text-green-700" : ""}`}
                onClick={() => setAlertCreated(!alertCreated)}
              >
                <Bell className={`h-4 w-4 ${alertCreated ? "fill-green-600" : ""}`} />
                {alertCreated ? "Alert Created" : "Create Alert"}
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <EstimatedMarketValue
            estimatedValue={artwork.marketValue.estimated}
            lowEstimate={artwork.marketValue.low}
            highEstimate={artwork.marketValue.high}
            lastSalePrice={artwork.marketValue.lastSalePrice}
            lastSaleDate={artwork.marketValue.lastSaleDate}
            priceChange={artwork.marketValue.priceChange}
            pricePerSquareInch={artwork.marketValue.pricePerSquareInch}
          />
          <PriceHistory entries={artwork.priceHistory} initialVisibleCount={3} />
        </div>

        {/* Description / About the Work */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 border-t pt-8"
        >
          <h2 className="text-lg font-semibold border-b pb-4 mb-6">About the Work</h2>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Description and Details */}
            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">{artwork.description}</p>

              <div className="space-y-0 text-sm">
                <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b">
                  <span className="text-muted-foreground">Materials</span>
                  <span>{artwork.medium}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b">
                  <span className="text-muted-foreground">Size</span>
                  <span>{artwork.size}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b">
                  <span className="text-muted-foreground">Rarity</span>
                  <span>{artwork.rarity}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b">
                  <span className="text-muted-foreground">Category</span>
                  <span className="underline underline-offset-2 cursor-pointer hover:text-foreground">
                    {artwork.category}
                  </span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b">
                  <span className="text-muted-foreground">Signature</span>
                  <span>{artwork.signature}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b">
                  <span className="text-muted-foreground">Certificate</span>
                  <span>{artwork.certificate ? "Included (issued by gallery)" : "Not included"}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b">
                  <span className="text-muted-foreground">Frame</span>
                  <span>{artwork.frame}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b">
                  <span className="text-muted-foreground">Provenance</span>
                  <span>Directly from the artist via {artwork.galleryName}</span>
                </div>
              </div>
            </div>

            {/* Artist Info */}
            <div className="space-y-6">
              {/* Artist Card */}
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <img
                  src={artwork.artistImage || "/placeholder.svg"}
                  alt={artwork.artist}
                  className="h-16 w-16 rounded-full object-cover bg-muted"
                  loading="lazy"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Link href="#" className="font-semibold hover:underline underline-offset-2">
                      {artwork.artist}
                    </Link>
                    <Button variant="outline" size="sm">
                      Follow
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {artwork.artistNationality}, b. {artwork.artistBorn}
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">{artwork.artistBio}</p>

              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <MessageSquare className="h-4 w-4" />
                  Ask OFFA about this artist
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Related Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 border-t pt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Related Works</h2>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {relatedArtworks.map((art) => (
              <Link key={art.id} href={`/artwork/${art.id}`} className="group">
                <div className="aspect-square overflow-hidden rounded-lg border bg-muted mb-3">
                  <img
                    src={art.image || "/placeholder.svg"}
                    alt={art.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <p className="font-medium group-hover:underline underline-offset-2">{art.artist}</p>
                <p className="text-sm text-muted-foreground italic truncate">{art.title}</p>
                <p className="text-sm font-medium mt-1">US${art.price.toLocaleString()}</p>
              </Link>
            ))}
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
          <h3 className="text-lg font-semibold">Have questions about this artwork?</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
            Ask our AI Art Advisor for insights on style, investment potential, or similar works
          </p>
          <Button asChild className="mt-4">
            <Link href="/chat">Chat with AI Advisor</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
