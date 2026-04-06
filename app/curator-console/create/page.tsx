"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Check, X, Palette, Save, Eye } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

// Mock available artworks
const availableArtworks = [
  {
    id: "1",
    title: "Urban Synthesis",
    artist: "Maya Rodriguez",
    imageUrl: "/abstract-urban-painting.png",
  },
  {
    id: "2",
    title: "Digital Dreams",
    artist: "Alex Chen",
    imageUrl: "/digital-art-colorful.jpg",
  },
  {
    id: "3",
    title: "Ethereal Landscape",
    artist: "Sofia Andersson",
    imageUrl: "/ethereal-landscape-painting.jpg",
  },
  {
    id: "4",
    title: "Geometric Harmony",
    artist: "James Park",
    imageUrl: "/geometric-abstract.png",
  },
  {
    id: "5",
    title: "Temporal Shift",
    artist: "Isabella Santos",
    imageUrl: "/contemporary-abstract.jpg",
  },
  {
    id: "6",
    title: "Celestial Bodies",
    artist: "Marcus Wong",
    imageUrl: "/space-abstract-art.jpg",
  },
]

interface SelectedArtwork {
  id: string
  title: string
  artist: string
  imageUrl: string
  insight: string
}

export default function CreateCollectionPage() {
  const router = useRouter()
  const { user, isAuthenticated, hasRole, isLoading } = useAuth()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    statement: "",
  })
  const [selectedArtworks, setSelectedArtworks] = useState<SelectedArtwork[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!hasRole("curator")) {
    router.push("/curator-console")
    return null
  }

  const addArtwork = (artwork: (typeof availableArtworks)[0]) => {
    if (selectedArtworks.find((a) => a.id === artwork.id)) return
    setSelectedArtworks([...selectedArtworks, { ...artwork, insight: "" }])
  }

  const removeArtwork = (id: string) => {
    setSelectedArtworks(selectedArtworks.filter((a) => a.id !== id))
  }

  const updateInsight = (id: string, insight: string) => {
    setSelectedArtworks(selectedArtworks.map((a) => (a.id === id ? { ...a, insight } : a)))
  }

  const handleSave = async (publish: boolean) => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    router.push("/curator-console")
  }

  const canProceed = () => {
    if (step === 1) return formData.title && formData.statement
    if (step === 2) return selectedArtworks.length >= 2
    if (step === 3) return selectedArtworks.every((a) => a.insight)
    return true
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/curator-console">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Console
            </Link>
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Palette className="h-8 w-8 text-amber-600" />
            Create Curated Collection
          </h1>
          <p className="text-muted-foreground mt-1">Build a thematic collection with your curatorial insights</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  step >= s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 3 && <div className={`w-16 h-0.5 ${step > s ? "bg-primary" : "bg-muted-foreground/30"}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-12 mb-8 text-sm">
          <span className={step >= 1 ? "text-foreground font-medium" : "text-muted-foreground"}>Collection Info</span>
          <span className={step >= 2 ? "text-foreground font-medium" : "text-muted-foreground"}>Select Artworks</span>
          <span className={step >= 3 ? "text-foreground font-medium" : "text-muted-foreground"}>Add Insights</span>
        </div>

        {/* Step 1: Collection Info */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Collection Details</CardTitle>
                <CardDescription>Define your collection's theme and curatorial vision</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Collection Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Material Futures: Sculpture Beyond Boundaries"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle / Theme</Label>
                  <Input
                    id="subtitle"
                    placeholder="e.g., Exploring post-minimalist sculpture through unconventional materials"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statement">Curatorial Statement * (3-5 sentences)</Label>
                  <Textarea
                    id="statement"
                    placeholder="Describe your curatorial vision, the theme connecting these works, and why they matter to collectors..."
                    value={formData.statement}
                    onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.statement.split(" ").filter(Boolean).length} words
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Select Artworks */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Select Artworks</CardTitle>
                <CardDescription>Choose at least 2 artworks to include in your collection</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Selected Artworks */}
                {selectedArtworks.length > 0 && (
                  <div className="mb-6">
                    <Label className="mb-3 block">Selected ({selectedArtworks.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedArtworks.map((artwork) => (
                        <Badge key={artwork.id} variant="secondary" className="gap-1 py-1 pl-1">
                          <img
                            src={artwork.imageUrl || "/placeholder.svg"}
                            alt={artwork.title}
                            className="h-6 w-6 rounded object-cover"
                          />
                          <span className="ml-1">{artwork.title}</span>
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                            onClick={() => removeArtwork(artwork.id)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Artworks */}
                <Label className="mb-3 block">Available Artworks</Label>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {availableArtworks.map((artwork) => {
                    const isSelected = selectedArtworks.find((a) => a.id === artwork.id)

                    return (
                      <Card
                        key={artwork.id}
                        className={`cursor-pointer transition-all ${
                          isSelected ? "ring-2 ring-primary" : "hover:shadow-md"
                        }`}
                        onClick={() => (isSelected ? removeArtwork(artwork.id) : addArtwork(artwork))}
                      >
                        <div className="relative aspect-square">
                          <img
                            src={artwork.imageUrl || "/placeholder.svg"}
                            alt={artwork.title}
                            className="h-full w-full object-cover rounded-t-lg"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center rounded-t-lg">
                              <div className="bg-primary text-primary-foreground rounded-full p-2">
                                <Check className="h-6 w-6" />
                              </div>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <p className="font-medium text-sm truncate">{artwork.title}</p>
                          <p className="text-xs text-muted-foreground">{artwork.artist}</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Add Insights */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Add Curatorial Insights</CardTitle>
                <CardDescription>
                  Write 1-2 sentences for each artwork explaining its significance in the collection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedArtworks.map((artwork, index) => (
                  <div key={artwork.id} className="flex gap-4">
                    <div className="w-24 shrink-0">
                      <img
                        src={artwork.imageUrl || "/placeholder.svg"}
                        alt={artwork.title}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="font-medium">{artwork.title}</p>
                        <p className="text-sm text-muted-foreground">{artwork.artist}</p>
                      </div>
                      <Textarea
                        placeholder="Write your curatorial insight for this piece..."
                        value={artwork.insight}
                        onChange={(e) => updateInsight(artwork.id, e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving || !canProceed()}>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button onClick={() => handleSave(true)} disabled={isSaving || !canProceed()}>
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}
                Publish Collection
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
