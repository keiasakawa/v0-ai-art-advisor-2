"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, Share2, Bell, Quote, ArrowRight, BookOpen, Eye, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { useParams } from "next/navigation"

// Mock curator data
const curators = {
  "1": {
    id: "1",
    name: "Dr. Helena Vasquez",
    portrait: "/female-art-curator-portrait-professional.jpg",
    title: "Senior Curator, Contemporary Art",
    bio: "Dr. Helena Vasquez has spent over 20 years studying the intersection of materiality and meaning in contemporary art. She holds a Ph.D. in Art History from Columbia University and has curated exhibitions at the Guggenheim, MoMA PS1, and the Venice Biennale. Her research focuses on how artists use unconventional materials to challenge traditional narratives.",
    statement:
      "This collection explores how contemporary artists are redefining the boundaries between art and everyday life. By examining works that transform humble materials into profound statements, we witness a radical democratization of artistic expression. These pieces challenge us to see beauty and meaning in the overlooked, the discarded, and the mundane—ultimately questioning what we value and why.",
    highlightedQuote:
      "The most revolutionary art doesn't just hang on walls—it changes how we see the world outside the gallery.",
    followers: 12400,
  },
}

// Mock collection data with sub-themes
const collections = {
  "1": {
    id: "1",
    title: "Material Revolutions: Art Beyond the Canvas",
    description: "An exploration of contemporary artists who challenge traditional materials and methods",
    curatorId: "1",
    subThemes: [
      {
        id: "post-minimalist",
        title: "Post-Minimalist Expansion",
        description:
          "The Post-Minimalist movement emerged in the late 1960s as artists sought to transcend the rigid geometric forms of Minimalism. These works embrace process, materiality, and the human hand. By incorporating industrial materials, textile techniques, and organic forms, these artists created a bridge between the cold precision of Minimalism and the emotional depth of Abstract Expressionism. Today, their influence resonates in contemporary practices that prioritize tactile experience and material honesty.",
        artworks: [
          {
            id: 101,
            title: "Suspended Weight",
            artist: "Eva Hesse",
            year: 1968,
            medium: "Latex, rope, and wire",
            size: "Variable dimensions",
            price: 85000,
            image: "/abstract-latex-sculpture-hanging-organic-forms.jpg",
            insight:
              "This work exemplifies Hesse's radical departure from geometric abstraction, embracing organic forms that seem to breathe and sag under their own weight.",
          },
          {
            id: 102,
            title: "Process Field",
            artist: "Robert Morris",
            year: 1970,
            medium: "Industrial felt",
            size: "120 x 180 in",
            price: 120000,
            image: "/industrial-felt-art-installation-gray-minimalist.jpg",
            insight:
              "Morris's felt works demonstrate how gravity and material properties can become co-authors in the creative process.",
          },
          {
            id: 103,
            title: "Accumulation Study",
            artist: "Richard Serra",
            year: 1972,
            medium: "Lead and steel",
            size: "48 x 72 x 36 in",
            price: 250000,
            image: "/lead-steel-sculpture-industrial-abstract-heavy.jpg",
            insight:
              "Serra's early accumulation works laid the groundwork for his monumental later pieces, already showing his mastery of weight and presence.",
          },
        ],
      },
      {
        id: "reclaiming-identity",
        title: "Gutai: Radical Materiality and the Body",
        description:
          "The Gutai Art Association (1954-1972) represents one of the most radical movements in postwar art history. Founded in Ashiya, Japan, by Jirō Yoshihara and a group of young artists, Gutai—meaning 'concreteness'—challenged Western artistic conventions through visceral, physical engagement with materials. These artists rejected representation in favor of direct, often violent interaction between the human body and matter: paint, mud, paper, chemicals, and tar. Their performances and paintings anticipated Performance Art, Happenings, and Action Painting in the West, yet emerged from a distinctly Japanese context informed by Zen Buddhism and postwar reconstruction. This section presents key Gutai works that demonstrate how materiality, gesture, and the body became inseparable elements of artistic expression.",
        artworks: [
          {
            id: 201,
            title: "Work (Red)",
            artist: "Kazuo Shiraga",
            year: 1965,
            medium: "Oil on canvas (foot painting)",
            size: "51 x 63 in (130 x 160 cm)",
            price: 850000,
            image: "/abstract-red-swirling-paint-texture-dynamic-energ.jpg",
            insight:
              "Shiraga suspended himself from ropes above large canvases and painted with his feet, creating explosive compositions that record the physical struggle between body and material. His technique merged painting with performance, transforming the canvas into a site of combat.",
          },
          {
            id: 202,
            title: "Challenge to the Mud",
            artist: "Kazuo Shiraga",
            year: 1955,
            medium: "Performance documentation, silver gelatin print",
            size: "16 x 20 in (40 x 50 cm)",
            price: 320000,
            image: "/shiraga-mud-performance-black-white-photo-body-art.jpg",
            insight:
              "In this seminal performance, Shiraga flung himself semi-naked into a massive pile of wet mud, wrestling with the material in a primal act of creation. This work embodies Gutai's philosophy: art as a direct encounter between human consciousness and raw matter.",
          },
          {
            id: 203,
            title: "Holes",
            artist: "Saburo Murakami",
            year: 1955,
            medium: "Torn kraft paper mounted on canvas",
            size: "72 x 96 in (182 x 244 cm)",
            price: 420000,
            image: "/torn-paper-holes-abstract-kraft-brown-texture-dest.jpg",
            insight:
              "Murakami created this work by running and leaping through stretched sheets of kraft paper during Gutai performances. The torn, irregular holes record the violent moment of the body's passage through material—a gesture that destroys and creates simultaneously.",
          },
          {
            id: 204,
            title: "Work (Throwing Colors)",
            artist: "Shozo Shimamoto",
            year: 1961,
            medium: "Enamel paint and glass fragments on canvas",
            size: "64 x 89 in (162 x 226 cm)",
            price: 520000,
            image: "/thrown-paint-glass-shards-dynamic-splatter-abstrac.jpg",
            insight:
              "Shimamoto pioneered the 'bottle crash' technique, hurling glass bottles filled with paint at canvases. The resulting works capture explosive energy, incorporating glass shards and paint splatters in compositions that blur painting, sculpture, and performance.",
          },
          {
            id: 205,
            title: "Work",
            artist: "Atsuko Tanaka",
            year: 1962,
            medium: "Synthetic polymer paint on canvas",
            size: "71 x 51 in (180 x 130 cm)",
            price: 680000,
            image: "/electric-circuit-painting-bright-colors-lines-tech.jpg",
            insight:
              "Tanaka's vibrant canvases evolved from her famous 'Electric Dress' performance (1956), where she wore a garment made of colored light bulbs and electrical cables. Her paintings translate electrical energy into optical dynamism, celebrating technology's material presence.",
          },
          {
            id: 206,
            title: "Work (White)",
            artist: "Sadamasa Motonaga",
            year: 1960,
            medium: "Polyethylene bags filled with colored water, suspended",
            size: "Variable dimensions, approx. 120 x 240 in",
            price: 390000,
            image: "/water-filled-bags-hanging-translucent-color-light-.jpg",
            insight:
              "Motonaga suspended transparent bags filled with colored water between trees and later in gallery spaces. As light passed through, the liquid materials created shifting, ethereal color fields that responded to environmental conditions—a radical departure from static painting.",
          },
        ],
      },
      {
        id: "material-experiments",
        title: "Material Experiments",
        description:
          "The artists in this section push the boundaries of what can be considered artistic media. From biological materials to digital fabrication, from found objects to engineered substances, these works question the very nature of artistic creation. They respond to our era of environmental crisis and technological acceleration by finding new ways to make meaning from matter. Collectors should note that these works often require specialized conservation and represent the cutting edge of contemporary practice.",
        artworks: [
          {
            id: 301,
            title: "Mycelium Architecture",
            artist: "Suzanne Anker",
            year: 2021,
            medium: "Living mycelium and resin",
            size: "36 x 36 x 12 in",
            price: 28000,
            image: "/organic-mycelium-sculpture-bio-art-living-material.jpg",
            insight:
              "Anker's bio-art practice merges laboratory science with aesthetic inquiry, questioning the boundaries between natural and artificial.",
          },
          {
            id: 302,
            title: "Data Materialized",
            artist: "Refik Anadol",
            year: 2022,
            medium: "AI-generated video installation",
            size: "Variable, edition of 5",
            price: 75000,
            image: "/digital-art-flowing-data-visualization-abstract-co.jpg",
            insight:
              "Anadol's machine learning algorithms transform vast datasets into mesmerizing visual experiences that feel simultaneously alien and organic.",
          },
          {
            id: 303,
            title: "Ocean Plastic Study",
            artist: "Aurora Robson",
            year: 2020,
            medium: "Reclaimed ocean plastic",
            size: "72 x 48 x 24 in",
            price: 42000,
            image: "/recycled-plastic-sculpture-colorful-environmental-.jpg",
            insight:
              "Robson's transformation of ocean debris into delicate sculptures serves as both aesthetic achievement and environmental statement.",
          },
          {
            id: 304,
            title: "Ferrofluid Dreams",
            artist: "Sachiko Kodama",
            year: 2019,
            medium: "Ferrofluid, electromagnets, and electronics",
            size: "24 x 24 x 24 in",
            price: 55000,
            image: "/ferrofluid-magnetic-sculpture-spiky-black-liquid-a.jpg",
            insight:
              "Kodama's kinetic sculptures use magnetic fluids to create ever-changing forms that seem to possess their own alien intelligence.",
          },
          {
            id: 305,
            title: "Compressed Textiles",
            artist: "Sheila Hicks",
            year: 2018,
            medium: "Linen, wool, and silk",
            size: "60 x 48 x 18 in",
            price: 135000,
            image: "/textile-art-colorful-fiber-sculpture-contemporary.jpg",
            insight:
              "Hicks's monumental fiber works blur the line between craft and high art, celebrating the sensual pleasure of texture and color.",
          },
        ],
      },
    ],
    essay: {
      title: "Why Material Matters: Understanding This Collection's Place in Art History",
      content: `The works gathered in this collection represent a fundamental shift in how we understand artistic practice. For centuries, Western art privileged certain materials—oil paint, bronze, marble—as the proper vehicles for serious artistic expression. This hierarchy wasn't merely aesthetic; it was deeply intertwined with systems of power, colonialism, and cultural domination.

Beginning in the 1960s, artists began systematically dismantling these hierarchies. The Post-Minimalists we feature here—Eva Hesse, Robert Morris, Richard Serra—rejected the pristine geometric forms of their predecessors in favor of materials that sagged, rusted, and decayed. They embraced process over product, acknowledging that creation is always ongoing.

This material revolution opened doors for artists from marginalized communities to assert their own aesthetic traditions. The works by Simone Leigh, El Anatsui, and Ana Mendieta draw on African, Caribbean, and Indigenous material practices that had long been dismissed as "craft" rather than "art." Their inclusion in major collections and museums represents a long-overdue correction in art history.

The most recent works in this collection extend these concerns into our current moment of environmental crisis and technological transformation. Artists like Aurora Robson transform ocean plastic into delicate beauty, while Refik Anadol demonstrates that data itself can become a material for artistic expression.

For collectors, these works represent more than aesthetic pleasure—they are investments in art history's ongoing evolution. The artists featured here are already canonical figures or rapidly ascending. More importantly, their works embody ideas that will only become more relevant as we grapple with questions of sustainability, cultural equity, and the nature of creativity in an age of artificial intelligence.

We encourage collectors to approach these works not merely as objects to be acquired, but as invitations to deeper engagement with the ideas that shape our world.`,
    },
    createdAt: "2024-01-15",
    artworkCount: 12,
  },
}

export default function CollectionPage() {
  const params = useParams()
  const id = params.id as string

  const [following, setFollowing] = useState(false)
  const [alertEnabled, setAlertEnabled] = useState(false)
  const [likedArtworks, setLikedArtworks] = useState<number[]>([])
  const [expandedEssay, setExpandedEssay] = useState(false)

  const collection = collections[id as keyof typeof collections] || collections["1"]
  const curator = curators[collection.curatorId as keyof typeof curators]

  const toggleLike = (artworkId: number) => {
    setLikedArtworks((prev) =>
      prev.includes(artworkId) ? prev.filter((id) => id !== artworkId) : [...prev, artworkId],
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Collection Header */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="secondary" className="mb-4">
              Curated Collection
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-balance lg:text-5xl">{collection.title}</h1>
            <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{collection.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="text-sm text-muted-foreground">{collection.artworkCount} artworks</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">Curated by {curator.name}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Curator Introduction Section */}
      <section className="border-b py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              About the Curator
            </h2>

            <div className="grid gap-12 lg:grid-cols-3">
              {/* Curator Portrait & Info */}
              <div className="lg:col-span-1">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <img
                      src={curator.portrait || "/placeholder.svg"}
                      alt={curator.name}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold">{curator.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{curator.title}</p>
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{curator.bio}</p>
                      <div className="mt-6 flex items-center gap-3">
                        <Button
                          variant={following ? "secondary" : "default"}
                          size="sm"
                          onClick={() => setFollowing(!following)}
                        >
                          {following ? "Following" : "Follow Curator"}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {curator.followers.toLocaleString()} followers
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Curatorial Statement */}
              <div className="lg:col-span-2">
                <div className="rounded-lg border bg-card p-8">
                  <h3 className="mb-6 text-lg font-semibold">Curatorial Statement</h3>
                  <p className="text-lg leading-relaxed text-foreground/90">{curator.statement}</p>

                  {/* Highlighted Quote */}
                  <div className="mt-8 border-l-4 border-primary bg-primary/5 p-6">
                    <Quote className="mb-3 h-8 w-8 text-primary/60" />
                    <blockquote className="text-xl font-medium italic text-foreground">
                      "{curator.highlightedQuote}"
                    </blockquote>
                    <cite className="mt-4 block text-sm text-muted-foreground">— {curator.name}</cite>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Narrative-Based Artwork Groupings */}
      {collection.subThemes.map((theme, themeIndex) => (
        <section key={theme.id} className="border-b py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * themeIndex }}
            >
              {/* Sub-theme Header */}
              <div className="mb-10 max-w-3xl">
                <Badge variant="outline" className="mb-4">
                  {themeIndex + 1} of {collection.subThemes.length}
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight">{theme.title}</h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">{theme.description}</p>
              </div>

              {/* Artwork Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {theme.artworks.map((artwork) => (
                  <motion.div key={artwork.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                    <Card className="group overflow-hidden">
                      <CardContent className="p-0">
                        {/* Artwork Image */}
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={artwork.image || "/placeholder.svg"}
                            alt={artwork.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {/* Hover Actions */}
                          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-10 w-10"
                              onClick={() => toggleLike(artwork.id)}
                            >
                              <Heart
                                className={`h-5 w-5 ${
                                  likedArtworks.includes(artwork.id) ? "fill-red-500 text-red-500" : ""
                                }`}
                              />
                            </Button>
                            <Button size="icon" variant="secondary" className="h-10 w-10" asChild>
                              <Link href={`/artwork/${artwork.id}`}>
                                <Eye className="h-5 w-5" />
                              </Link>
                            </Button>
                          </div>
                        </div>

                        {/* Artwork Info */}
                        <div className="p-4">
                          <h3 className="font-semibold">{artwork.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {artwork.artist}, {artwork.year}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{artwork.medium}</p>
                          <p className="text-xs text-muted-foreground">{artwork.size}</p>

                          {/* Curatorial Insight */}
                          <div className="mt-3 rounded-md bg-muted/50 p-3">
                            <p className="text-xs italic text-muted-foreground">
                              <span className="font-medium text-foreground">Curator's Note:</span> {artwork.insight}
                            </p>
                          </div>

                          {/* Price & Action */}
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-lg font-bold">${artwork.price.toLocaleString()}</span>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/artwork/${artwork.id}`}>View Details</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      {/* Contextual Essay Section */}
      <section className="border-b bg-muted/30 py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-8 flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Curator's Essay</h2>
            </div>

            <h3 className="text-3xl font-bold tracking-tight">{collection.essay.title}</h3>

            <div className="relative mt-8">
              <div
                className={`prose prose-lg max-w-none text-foreground/90 ${!expandedEssay ? "line-clamp-[12]" : ""}`}
              >
                {collection.essay.content.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Gradient Overlay for collapsed state */}
              {!expandedEssay && (
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-muted/100 to-transparent" />
              )}
            </div>

            <Button variant="ghost" className="mt-4" onClick={() => setExpandedEssay(!expandedEssay)}>
              {expandedEssay ? (
                <>
                  Show Less <ChevronUp className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Read Full Essay <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border bg-card p-8 lg:p-12"
          >
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Left Column */}
              <div>
                <h2 className="text-2xl font-bold">Interested in this collection?</h2>
                <p className="mt-2 text-muted-foreground">
                  Get personalized recommendations and be the first to know about new additions.
                </p>

                <div className="mt-8 space-y-4">
                  <Button
                    className="w-full justify-start sm:w-auto"
                    variant={following ? "secondary" : "default"}
                    onClick={() => setFollowing(!following)}
                  >
                    <Heart className={`mr-2 h-4 w-4 ${following ? "fill-current" : ""}`} />
                    {following ? "Following Curator" : "Follow this Curator"}
                  </Button>

                  <Button
                    className="w-full justify-start sm:w-auto bg-transparent"
                    variant="outline"
                    onClick={() => setAlertEnabled(!alertEnabled)}
                  >
                    <Bell className={`mr-2 h-4 w-4 ${alertEnabled ? "fill-current" : ""}`} />
                    {alertEnabled ? "Alerts Enabled" : "Create Alert for New Works"}
                  </Button>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:border-l lg:pl-8">
                <h3 className="text-lg font-semibold">Explore More</h3>
                <div className="mt-4 space-y-3">
                  <Link
                    href="/chat"
                    className="flex items-center justify-between rounded-lg border bg-background p-4 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">Inquire About Artworks</p>
                      <p className="text-sm text-muted-foreground">Ask our AI advisor about any piece</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </Link>

                  <Link
                    href="/collections"
                    className="flex items-center justify-between rounded-lg border bg-background p-4 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">View Similar Collections</p>
                      <p className="text-sm text-muted-foreground">Discover more curated selections</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </Link>

                  <Link
                    href="/dashboard"
                    className="flex items-center justify-between rounded-lg border bg-background p-4 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">Your Dashboard</p>
                      <p className="text-sm text-muted-foreground">View saved artworks and recommendations</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Share Section */}
            <Separator className="my-8" />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">Share this collection with fellow art enthusiasts</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Collection
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
