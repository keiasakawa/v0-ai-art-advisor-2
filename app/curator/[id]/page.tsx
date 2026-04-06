"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Heart,
  Share2,
  Bell,
  Quote,
  ArrowRight,
  BookOpen,
  Eye,
  MapPin,
  GraduationCap,
  Award,
  Users,
  Twitter,
  Linkedin,
  Instagram,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { useParams } from "next/navigation"

// Mock curator data with extended profile information
const curators = {
  "1": {
    id: "1",
    name: "Dr. Helena Vasquez",
    portrait: "/female-art-curator-portrait-professional.jpg",
    title: "Senior Curator, Contemporary Art",
    location: "New York, USA",
    bio: "Dr. Helena Vasquez has spent over 20 years studying the intersection of materiality and meaning in contemporary art. She holds a Ph.D. in Art History from Columbia University and has curated exhibitions at the Guggenheim, MoMA PS1, and the Venice Biennale. Her research focuses on how artists use unconventional materials to challenge traditional narratives.",
    extendedBio: {
      experience: [
        "Senior Curator at Solomon R. Guggenheim Museum (2015-present)",
        "Associate Curator at MoMA PS1 (2008-2015)",
        "Curatorial Fellow at Whitney Museum (2005-2008)",
      ],
      education: [
        "Ph.D. in Art History, Columbia University",
        "M.A. in Curatorial Studies, Bard College",
        "B.A. in Fine Arts, Yale University",
      ],
      awards: [
        "AICA Award for Best Monographic Exhibition (2021)",
        "Curatorial Excellence Award, CCS Bard (2018)",
        "Emily Hall Tremaine Exhibition Award (2016)",
      ],
    },
    statement:
      "I believe in art's power to transform how we see and understand the world. My curatorial practice centers on artists who challenge material hierarchies and expand our definitions of what art can be. I'm particularly drawn to works that bridge craft traditions and conceptual rigor, creating new vocabularies for our contemporary moment.",
    highlightedQuote:
      "The most revolutionary art doesn't just hang on walls—it changes how we see the world outside the gallery.",
    tags: ["Contemporary Art", "Post-War", "Minimalism", "Process Art", "Sculpture", "Installation"],
    followers: 12400,
    socialLinks: {
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
      instagram: "https://instagram.com",
    },
  },
}

// Mock curated collections
const curatedCollections = [
  {
    id: "1",
    title: "Material Revolutions: Art Beyond the Canvas",
    description: "An exploration of contemporary artists who challenge traditional materials",
    artworkCount: 12,
    image: "/abstract-latex-sculpture-hanging-organic-forms.jpg",
  },
  {
    id: "2",
    title: "The Weight of Light",
    description: "Examining how artists manipulate light as sculptural material",
    artworkCount: 8,
    image: "/digital-art-flowing-data-visualization-abstract-co.jpg",
  },
  {
    id: "3",
    title: "Body as Archive",
    description: "Performance and documentation in contemporary practice",
    artworkCount: 15,
    image: "/earth-body-art-silhouette-nature-land-art.jpg",
  },
]

// Mock recommended artists
const recommendedArtists = [
  {
    id: "a1",
    name: "Eva Hesse",
    image: "/abstract-latex-sculpture-hanging-organic-forms.jpg",
    specialty: "Known for pioneering post-minimalist sculpture using latex, fiberglass, and unconventional materials.",
    nationality: "German-American",
    period: "1936-1970",
  },
  {
    id: "a2",
    name: "El Anatsui",
    image: "/metallic-tapestry-gold-silver-bottle-caps-woven-ar.jpg",
    specialty:
      "Creates monumental tapestries from recycled bottle caps, addressing themes of consumption and transformation.",
    nationality: "Ghanaian",
    period: "b. 1944",
  },
  {
    id: "a3",
    name: "Sheila Hicks",
    image: "/textile-art-colorful-fiber-sculpture-contemporary.jpg",
    specialty:
      "Merging textile traditions with conceptual minimalism, her fiber sculptures challenge boundaries between art and craft.",
    nationality: "American",
    period: "b. 1934",
  },
  {
    id: "a4",
    name: "Simone Leigh",
    image: "/bronze-sculpture-female-figure-african-art-contemp.jpg",
    specialty:
      "Celebrates Black female identity through ceramics and bronze, drawing on African and American craft traditions.",
    nationality: "American",
    period: "b. 1967",
  },
  {
    id: "a5",
    name: "Richard Serra",
    image: "/lead-steel-sculpture-industrial-abstract-heavy.jpg",
    specialty: "Monumental steel sculptures that transform space and challenge viewers' bodily awareness.",
    nationality: "American",
    period: "b. 1938",
  },
]

// Mock artworks by this curator's selections
const selectedArtworks = [
  {
    id: 101,
    title: "Suspended Weight",
    artist: "Eva Hesse",
    year: 1968,
    price: 85000,
    image: "/abstract-latex-sculpture-hanging-organic-forms.jpg",
  },
  {
    id: 201,
    title: "Ancestral Memory",
    artist: "Simone Leigh",
    year: 2019,
    price: 180000,
    image: "/bronze-sculpture-female-figure-african-art-contemp.jpg",
  },
  {
    id: 202,
    title: "Woven Histories",
    artist: "El Anatsui",
    year: 2018,
    price: 320000,
    image: "/metallic-tapestry-gold-silver-bottle-caps-woven-ar.jpg",
  },
  {
    id: 305,
    title: "Compressed Textiles",
    artist: "Sheila Hicks",
    year: 2018,
    price: 135000,
    image: "/textile-art-colorful-fiber-sculpture-contemporary.jpg",
  },
]

export default function CuratorProfilePage() {
  const params = useParams()
  const id = params.id as string

  const [following, setFollowing] = useState(false)
  const [alertEnabled, setAlertEnabled] = useState(false)

  const curator = curators[id as keyof typeof curators] || curators["1"]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid gap-12 lg:grid-cols-3"
          >
            {/* Portrait */}
            <div className="lg:col-span-1">
              <div className="relative">
                <img
                  src={curator.portrait || "/placeholder.svg"}
                  alt={curator.name}
                  className="aspect-[3/4] w-full rounded-xl object-cover shadow-lg"
                />
              </div>
              {/* Social Links */}
              <div className="mt-6 flex justify-center gap-3">
                {curator.socialLinks.twitter && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={curator.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {curator.socialLinks.linkedin && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={curator.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {curator.socialLinks.instagram && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={curator.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-2">
              <Badge variant="secondary" className="mb-4">
                Expert Curator
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">{curator.name}</h1>
              <p className="mt-2 text-xl text-muted-foreground">{curator.title}</p>
              <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {curator.location}
              </div>

              {/* Tags */}
              <div className="mt-6 flex flex-wrap gap-2">
                {curator.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Stats & Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{curator.followers.toLocaleString()}</span>
                  <span className="text-muted-foreground">followers</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <Button variant={following ? "secondary" : "default"} onClick={() => setFollowing(!following)}>
                  <Heart className={`mr-2 h-4 w-4 ${following ? "fill-current" : ""}`} />
                  {following ? "Following" : "Follow Curator"}
                </Button>
                <Button variant="outline" onClick={() => setAlertEnabled(!alertEnabled)}>
                  <Bell className={`mr-2 h-4 w-4 ${alertEnabled ? "fill-current" : ""}`} />
                  {alertEnabled ? "Alerts On" : "Get Alerts"}
                </Button>
              </div>

              {/* Quote */}
              <div className="mt-10 border-l-4 border-primary bg-primary/5 p-6 rounded-r-lg">
                <Quote className="mb-3 h-8 w-8 text-primary/60" />
                <blockquote className="text-xl font-medium italic">"{curator.highlightedQuote}"</blockquote>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Biography & Background */}
      <section className="border-b py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Biography & Background
            </h2>

            <div className="grid gap-10 lg:grid-cols-3">
              {/* Bio */}
              <div className="lg:col-span-2">
                <p className="text-lg leading-relaxed text-foreground/90">{curator.bio}</p>
              </div>

              {/* Credentials */}
              <div className="space-y-8">
                {/* Experience */}
                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    <Award className="h-4 w-4" />
                    Experience
                  </div>
                  <ul className="space-y-2">
                    {curator.extendedBio.experience.map((exp, i) => (
                      <li key={i} className="text-sm text-foreground/80">
                        {exp}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Education */}
                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    Education
                  </div>
                  <ul className="space-y-2">
                    {curator.extendedBio.education.map((edu, i) => (
                      <li key={i} className="text-sm text-foreground/80">
                        {edu}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Awards */}
                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    <Award className="h-4 w-4" />
                    Awards
                  </div>
                  <ul className="space-y-2">
                    {curator.extendedBio.awards.map((award, i) => (
                      <li key={i} className="text-sm text-foreground/80">
                        {award}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Curatorial Statement */}
      <section className="border-b bg-muted/30 py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mb-6 flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Curatorial Statement
              </h2>
            </div>
            <p className="text-xl leading-relaxed text-foreground/90">{curator.statement}</p>
          </motion.div>
        </div>
      </section>

      {/* Featured Curated Collections */}
      <section className="border-b py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Curated Collections
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/collections">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {curatedCollections.map((collection, index) => (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <Link href={`/collection/${collection.id}`}>
                    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                      <CardContent className="p-0">
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img
                            src={collection.image || "/placeholder.svg"}
                            alt={collection.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-lg font-semibold text-white">{collection.title}</h3>
                            <p className="mt-1 text-sm text-white/80">{collection.artworkCount} artworks</p>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-muted-foreground line-clamp-2">{collection.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recommended Artists */}
      <section className="border-b py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Recommended Artists
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {recommendedArtists.map((artist, index) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                >
                  <Card className="group overflow-hidden transition-shadow hover:shadow-md">
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={artist.image || "/placeholder.svg"}
                          alt={artist.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold">{artist.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {artist.nationality} · {artist.period}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{artist.specialty}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Selected Artworks */}
      <section className="border-b py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Artworks Selected by {curator.name.split(" ").pop()}
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  Browse All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {selectedArtworks.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/artwork/${artwork.id}`}>
                    <Card className="group overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={artwork.image || "/placeholder.svg"}
                            alt={artwork.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button size="sm" variant="secondary">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold">{artwork.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {artwork.artist}, {artwork.year}
                          </p>
                          <p className="mt-2 font-semibold">${artwork.price.toLocaleString()}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="rounded-2xl border bg-card p-8 lg:p-12"
          >
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold">Work with {curator.name.split(" ")[0]}</h2>
                <p className="mt-2 text-muted-foreground">
                  Get personalized recommendations based on {curator.name.split(" ")[0]}'s expertise and curatorial
                  vision.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Button variant={following ? "secondary" : "default"} onClick={() => setFollowing(!following)}>
                    <Heart className={`mr-2 h-4 w-4 ${following ? "fill-current" : ""}`} />
                    {following ? "Following" : "Follow Curator"}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/chat">
                      Ask for Recommendations
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="lg:border-l lg:pl-8">
                <h3 className="text-lg font-semibold">Quick Links</h3>
                <div className="mt-4 space-y-3">
                  <Link
                    href={`/collection/1`}
                    className="flex items-center justify-between rounded-lg border bg-background p-4 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">Latest Collection</p>
                      <p className="text-sm text-muted-foreground">Material Revolutions</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/curators"
                    className="flex items-center justify-between rounded-lg border bg-background p-4 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">Browse All Curators</p>
                      <p className="text-sm text-muted-foreground">Discover more perspectives</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            </div>

            <Separator className="my-8" />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">Share this curator's profile</p>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share Profile
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
