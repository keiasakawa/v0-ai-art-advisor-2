"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, MessageSquare, Heart, Eye, Send, TrendingUp, Award, Clock } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { useRouter } from "next/navigation"

// Featured artworks data for marketplace section
const featuredArtworks = [
  {
    id: 1,
    title: "Ethereal Horizons",
    artist: "Maya Chen",
    price: 4200,
    image: "/ethereal-landscape-painting.jpg",
    category: "Contemporary",
    size: "36 x 48 in",
    bids: 8,
    timeLeft: "2d 14h",
  },
  {
    id: 2,
    title: "Urban Pulse",
    artist: "Marcus Rivera",
    price: 3800,
    image: "/abstract-urban-painting.png",
    category: "Abstract",
    size: "40 x 30 in",
    bids: 12,
    timeLeft: "1d 6h",
  },
  {
    id: 3,
    title: "Digital Dreams",
    artist: "Yuki Tanaka",
    price: 2900,
    image: "/digital-art-colorful.jpg",
    category: "Digital Art",
    size: "24 x 24 in",
    bids: 5,
    timeLeft: "3d 8h",
  },
  {
    id: 4,
    title: "Geometric Harmony",
    artist: "Sofia Laurent",
    price: 5500,
    image: "/geometric-abstract.png",
    category: "Geometric",
    size: "48 x 36 in",
    bids: 15,
    timeLeft: "18h",
  },
  {
    id: 5,
    title: "Cosmic Flow",
    artist: "Alex Storm",
    price: 3200,
    image: "/space-abstract-art.jpg",
    category: "Abstract",
    size: "30 x 40 in",
    bids: 7,
    timeLeft: "4d 2h",
  },
  {
    id: 6,
    title: "Nature's Whisper",
    artist: "Emma Woods",
    price: 4800,
    image: "/contemporary-abstract.jpg",
    category: "Contemporary",
    size: "42 x 32 in",
    bids: 10,
    timeLeft: "1d 20h",
  },
]

export default function Home() {
  const [likedArtworks, setLikedArtworks] = useState<number[]>([])
  const [chatInput, setChatInput] = useState("")
  const router = useRouter()

  const toggleLike = (id: number) => {
    setLikedArtworks((prev) => (prev.includes(id) ? prev.filter((artId) => artId !== id) : [...prev, id]))
  }

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (chatInput.trim()) {
      router.push(`/chat?q=${encodeURIComponent(chatInput.trim())}`)
    }
  }

  const quickPrompts = [
    "What should I know about buying my first artwork?",
    "Show me contemporary artists under $10k",
    "How do art valuations work?",
  ]

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden">
        {/* Background Hero Image */}
        <div className="absolute inset-0">
          <img
            src="/abstract-art-gallery-with-contemporary-paintings-d.jpg"
            alt=""
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Curated Marketplace for Art</span>
            </div>

            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-primary">OFF</span> CANVAS
            </h1>

            <p className="mt-2 text-lg text-muted-foreground">Buy &middot; Sell &middot; Curate</p>

            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl max-w-2xl mx-auto">
              The first curated online marketplace for the secondary art market. We connect collectors with
              investment-worthy artworks, ensuring authenticity, provenance, and long-term value.
            </p>

            <div className="mt-10">
              <form onSubmit={handleChatSubmit} className="relative">
                <div className="flex items-center rounded-full border border-border bg-card shadow-2xl shadow-primary/5 transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about art, artists, or collecting advice..."
                    className="flex-1 bg-transparent py-4 pl-6 pr-4 text-base outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="mr-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Start Conversation</span>
                  </button>
                </div>
              </form>

              {/* Quick prompt suggestions */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setChatInput(prompt)}
                    className="rounded-full border border-border bg-card/50 px-4 py-2 text-sm text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                or{" "}
                <Link href="/browse" className="text-primary underline-offset-4 hover:underline">
                  Explore Collection
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 sm:py-28 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
          >
            <div>
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Featured Artworks</h2>
              <p className="mt-4 text-pretty text-lg text-muted-foreground max-w-2xl">
                Explore exclusive collections curated for historical significance and investment potential
              </p>
            </div>
            <Button
              variant="outline"
              asChild
              className="shrink-0 bg-transparent border-border hover:border-primary hover:text-primary"
            >
              <Link href="/browse">
                View All Artworks
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredArtworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50"
              >
                {/* Artwork Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={artwork.image || "/placeholder.svg"}
                    alt={artwork.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Quick actions */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        toggleLike(artwork.id)
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm transition-colors hover:bg-background border border-border"
                    >
                      <Heart
                        className={`h-5 w-5 transition-colors ${
                          likedArtworks.includes(artwork.id) ? "fill-primary text-primary" : "text-foreground"
                        }`}
                      />
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm transition-colors hover:bg-background border border-border">
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <span className="rounded-full bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-medium border border-border">
                      {artwork.category}
                    </span>
                  </div>

                  {/* Time left badge */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-sm px-3 py-1 text-xs border border-border">
                      <Clock className="h-3 w-3 text-primary" />
                      <span>{artwork.timeLeft}</span>
                    </div>
                    <div className="rounded-full bg-background/90 backdrop-blur-sm px-3 py-1 text-xs border border-border">
                      {artwork.bids} Bids
                    </div>
                  </div>
                </div>

                {/* Artwork Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg truncate">{artwork.title}</h3>
                  <p className="text-muted-foreground text-sm">{artwork.artist}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Bid</p>
                      <span className="text-xl font-bold text-primary">${artwork.price.toLocaleString()}</span>
                    </div>
                    <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Link href={`/artwork/${artwork.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Recommendation CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 rounded-xl border border-primary/30 bg-primary/5 p-8 sm:p-12 text-center"
          >
            <Award className="mx-auto h-10 w-10 text-primary mb-4" />
            <h3 className="text-2xl font-bold">Not sure where to start?</h3>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              Let our AI advisor help you discover artworks that match your taste, style, and budget
            </p>
            <Button size="lg" asChild className="mt-6 group bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/chat">
                Get Personalized Recommendations
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-20 sm:py-28 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">AI-Powered Art Intelligence</h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Experience a new way to discover and collect art with our advanced AI advisor
            </p>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: MessageSquare,
                title: "Expert Guidance",
                description:
                  "Chat with our AI advisor to get personalized recommendations and insights about any artwork or artist.",
              },
              {
                icon: TrendingUp,
                title: "Investment Insights",
                description:
                  "Track market trends, price analysis, and investment potential for each piece in real-time.",
              },
              {
                icon: Shield,
                title: "Authenticity Verified",
                description: "Every artwork comes with verified provenance, ensuring authenticity and long-term value.",
              },
              {
                icon: Zap,
                title: "Smart Curation",
                description:
                  "Discover artworks tailored to your taste, budget, and collecting goals with intelligent filtering.",
              },
              {
                icon: Award,
                title: "Expert Curators",
                description: "Access collections curated by leading art experts with proven track records.",
              },
              {
                icon: Shield,
                title: "Secure Transactions",
                description: "Protected payments and insured shipping for peace of mind with every purchase.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/50 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl px-6 text-center lg:px-8"
        >
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to start your art journey?
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Join collectors worldwide who trust OFF CANVAS to guide their art discoveries
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="group bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/chat">
                Talk to AI Advisor
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="bg-transparent border-border hover:border-primary hover:text-primary"
            >
              <Link href="/browse">Browse Collection</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
