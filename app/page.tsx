"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, MessageSquare, Heart, Eye, Send, TrendingUp, Award, Clock } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getListedArtworks } from "@/app/actions/artwork"

export default function Home() {
  const [likedArtworks, setLikedArtworks] = useState<string[]>([])
  const [chatInput, setChatInput] = useState("")
  const [featuredArtworks, setFeaturedArtworks] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    getListedArtworks().then((result) => {
      if (result.success) {
        setFeaturedArtworks(result.data.slice(0, 6))
      }
    })
  }, [])

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
            {featuredArtworks.length === 0 ? (
              // Skeleton placeholders while loading
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-card overflow-hidden animate-pulse"
                >
                  <div className="aspect-[4/5] bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                    <div className="h-8 w-full rounded bg-muted mt-3" />
                  </div>
                </div>
              ))
            ) : (
              featuredArtworks.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full"
                >
                  <Link
                    href={`/artwork/${artwork.id}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50"
                  >
                    {/* Artwork Image */}
                    <div className="relative aspect-[4/5] shrink-0 overflow-hidden">
                      <img
                        src={artwork.image_url || "/placeholder.svg"}
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
                            e.stopPropagation()
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
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm border border-border">
                          <Eye className="h-5 w-5" />
                        </span>
                      </div>

                      {/* Medium / auction badges */}
                      {(artwork.medium || artwork.isAuction) && (
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          {artwork.medium && (
                            <span className="rounded-full bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-medium border border-border">
                              {artwork.medium}
                            </span>
                          )}
                          {artwork.isAuction && (
                            <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                              Auction
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Artwork Info */}
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-semibold text-lg truncate">{artwork.title}</h3>
                      <p className="text-muted-foreground text-sm truncate">{artwork.artist}</p>
                      <div className="mt-auto pt-3">
                        {artwork.price > 0 && (
                          <>
                            <p className="text-xs text-muted-foreground">
                              {artwork.isAuction ? "Current Bid" : "Price"}
                            </p>
                            <span className="text-xl font-bold text-primary">
                              ${Number(artwork.isAuction ? artwork.currentBid : artwork.price).toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
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
