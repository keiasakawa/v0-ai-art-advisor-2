"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Users, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useMemo } from "react"

// Mock curator data
const allCurators = [
  {
    id: "1",
    name: "Dr. Helena Vasquez",
    portrait: "/female-art-curator-portrait-professional.jpg",
    title: "Senior Curator, Contemporary Art",
    location: "New York, USA",
    bio: "Former curator at Guggenheim specializing in post-war and contemporary art with focus on materiality and process-based practices.",
    tags: ["Contemporary Art", "Post-War", "Minimalism", "Process Art", "Sculpture"],
    followers: 12400,
    collectionsCount: 8,
  },
  {
    id: "2",
    name: "Kenji Tanaka",
    portrait: "/asian-male-curator-professional-portrait.jpg",
    title: "Independent Curator & Writer",
    location: "Tokyo, Japan",
    bio: "Former Mori Art Museum curatorial fellow specializing in emerging Asian contemporary artists and new media practices.",
    tags: ["New Media", "Asian Contemporary", "Digital Art", "Video Art", "Installation"],
    followers: 8900,
    collectionsCount: 5,
  },
  {
    id: "3",
    name: "Amara Okonkwo",
    portrait: "/african-female-curator-professional-portrait.jpg",
    title: "Curator of African Art",
    location: "Lagos, Nigeria",
    bio: "Leading voice in contemporary African art, championing artists who explore identity, diaspora, and post-colonial narratives.",
    tags: ["African Art", "Identity", "Diaspora", "Textiles", "Photography"],
    followers: 15200,
    collectionsCount: 12,
  },
  {
    id: "4",
    name: "Dr. Marcus Weber",
    portrait: "/german-male-curator-glasses-professional-portrait.jpg",
    title: "Former Director, Kunsthalle Berlin",
    location: "Berlin, Germany",
    bio: "Expert in German Expressionism and contemporary European painting with over 25 years of museum experience.",
    tags: ["European Art", "Expressionism", "Painting", "Modern Art", "Figurative"],
    followers: 21000,
    collectionsCount: 15,
  },
  {
    id: "5",
    name: "Sofia Ramirez",
    portrait: "/latina-female-curator-young-professional-portrait.jpg",
    title: "Emerging Art Specialist",
    location: "Mexico City, Mexico",
    bio: "Focused on Latin American emerging artists working at the intersection of craft traditions and conceptual practice.",
    tags: ["Latin American Art", "Emerging Artists", "Craft", "Conceptual", "Feminist Art"],
    followers: 6700,
    collectionsCount: 4,
  },
  {
    id: "6",
    name: "Dr. Elizabeth Chen",
    portrait: "/asian-american-female-curator-elegant-professional.jpg",
    title: "Photography Curator",
    location: "San Francisco, USA",
    bio: "Specialist in contemporary photography and lens-based media, former curator at SFMOMA with focus on documentary practices.",
    tags: ["Photography", "Documentary", "Lens-Based Media", "Contemporary", "Social Practice"],
    followers: 11300,
    collectionsCount: 9,
  },
]

const allTags = Array.from(new Set(allCurators.flatMap((c) => c.tags))).sort()
const allLocations = Array.from(new Set(allCurators.map((c) => c.location.split(", ")[1]))).sort()

export default function CuratorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [selectedLocation, setSelectedLocation] = useState<string>("all")

  const filteredCurators = useMemo(() => {
    return allCurators.filter((curator) => {
      const matchesSearch =
        searchQuery === "" ||
        curator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        curator.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        curator.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesTag = selectedTag === "all" || curator.tags.includes(selectedTag)

      const matchesLocation = selectedLocation === "all" || curator.location.includes(selectedLocation)

      return matchesSearch && matchesTag && matchesLocation
    })
  }, [searchQuery, selectedTag, selectedLocation])

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">
              Expert Curators
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Meet the Curators</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-balance">
              Explore perspectives from leading curators around the world. Choose a curator whose vision matches your
              collecting journey.
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-10 max-w-4xl"
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, expertise, or style..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Expertise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Expertise</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {allLocations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Curator Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {filteredCurators.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">No curators found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4 bg-transparent"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedTag("all")
                  setSelectedLocation("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCurators.map((curator, index) => (
                <motion.div
                  key={curator.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
                    <CardContent className="p-0">
                      {/* Portrait */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={curator.portrait || "/placeholder.svg"}
                          alt={curator.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* Info */}
                      <div className="p-6">
                        {/* Name & Title */}
                        <h3 className="text-xl font-semibold">{curator.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{curator.title}</p>

                        {/* Location */}
                        <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {curator.location}
                        </div>

                        {/* Tags */}
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {curator.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {curator.tags.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{curator.tags.length - 4}
                            </Badge>
                          )}
                        </div>

                        {/* Bio */}
                        <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{curator.bio}</p>

                        {/* Stats */}
                        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {curator.followers.toLocaleString()} followers
                          </span>
                          <span>{curator.collectionsCount} collections</span>
                        </div>

                        {/* CTA Buttons */}
                        <div className="mt-6 flex flex-col gap-2">
                          <Button asChild className="w-full">
                            <Link href={`/curator/${curator.id}`}>View Profile</Link>
                          </Button>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                              Follow
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                              <Link href="/chat">
                                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                Ask AI
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
