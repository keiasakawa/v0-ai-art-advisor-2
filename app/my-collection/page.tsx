"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Upload,
  ImageIcon,
  Package,
  DollarSign,
  Eye,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Award,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { artworkStorage } from "@/lib/artwork-storage";

const statusConfig = {
  draft: { label: "Draft", icon: Clock, color: "bg-gray-100 text-gray-700" },
  listed: {
    label: "Listed",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700",
  },
  sold: { label: "Sold", icon: DollarSign, color: "bg-blue-100 text-blue-700" },
};

export default function MyCollectionPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasRole, isLoading } = useAuth();
  const [collection, setCollection] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [newArtwork, setNewArtwork] = useState<any>({
    certificate: false,
    condition: "Excellent",
    status: "draft",
  });

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const response = await fetch("/api/seed-artworks", { method: "POST" });
      const data = await response.json();

      if (data.success) {
        const artworks = await artworkStorage.getAll();
        setCollection(artworks);
      } else {
        console.error("Failed to seed:", data.error);
      }
    } catch (error) {
      console.error("Error seeding data:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    } else if (isAuthenticated) {
      const fetchArtworks = async () => {
        const artworks = await artworkStorage.getAll();
        setCollection(artworks);
      };
      fetchArtworks();
    }
  }, [isLoading, isAuthenticated, router]);

  const handleAddArtwork = async () => {
    if (!newArtwork.title || !newArtwork.artist) return;

    const addedArtwork = await artworkStorage.add({
      title: newArtwork.title || "",
      artist: newArtwork.artist || "",
      year: newArtwork.year || "",
      medium: newArtwork.medium || "",
      dimensions: newArtwork.dimensions || "",
      purchasePrice: newArtwork.purchasePrice || "",
      purchaseYear: newArtwork.purchaseYear || "",
      desiredPrice: newArtwork.desiredPrice || "",
      provenance: newArtwork.provenance || "",
      certificate: newArtwork.certificate || false,
      condition: newArtwork.condition || "Good",
      description: newArtwork.description || "",
      imageUrl: "/abstract-colorful-artwork.png",
      status: "draft",
    });

    if (addedArtwork) {
      setCollection([addedArtwork, ...collection]);
    }
    setNewArtwork({
      certificate: false,
      condition: "Excellent",
      status: "draft",
    });
    setIsAddDialogOpen(false);
  };

  const totalValue = collection.reduce(
    (acc, art) =>
      acc +
      (Number.parseInt(art.desiredPrice) ||
        Number.parseInt(art.purchasePrice) ||
        0),
    0,
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8 text-emerald-600" />
              My Collection
            </h1>
            <p className="text-muted-foreground mt-1">
              Register and manage artworks you own
            </p>
          </div>
          <div className="flex gap-3">
            {collection.length === 0 && (
              <Button
                size="lg"
                variant="outline"
                onClick={handleSeedData}
                disabled={isSeeding}
              >
                {isSeeding ? "Seeding..." : "Load Demo Data"}
              </Button>
            )}
            <Button size="lg" asChild>
              <Link href="/artwork/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Artwork
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Artworks
                  </p>
                  <p className="text-3xl font-bold">{collection.length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <ImageIcon className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Estimated Value
                  </p>
                  <p className="text-3xl font-bold">
                    ${totalValue.toLocaleString()}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    With Certificates
                  </p>
                  <p className="text-3xl font-bold">
                    {collection.filter((a) => a.certificate).length}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <Award className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collection Grid */}
        {collection.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No artworks yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your collection by adding your first artwork.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Artwork
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {collection.map((artwork, index) => {
                const status = statusConfig[artwork.status];
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-48 shrink-0">
                          <img
                            src={artwork.imageUrl || "/placeholder.svg"}
                            alt={artwork.title}
                            className="h-48 sm:h-full w-full object-cover"
                          />
                        </div>
                        <CardContent className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate">
                                  {artwork.title}
                                </h3>
                                <Badge
                                  variant="secondary"
                                  className={status.color}
                                >
                                  <StatusIcon className="mr-1 h-3 w-3" />
                                  {status.label}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground">
                                {artwork.artist}, {artwork.year}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {artwork.medium} · {artwork.dimensions}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {artwork.certificate && (
                                  <Badge variant="outline" className="text-xs">
                                    <FileText className="h-3 w-3 mr-1" />
                                    Certificate
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {artwork.condition}
                                </Badge>
                              </div>
                              {artwork.provenance && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                                  Provenance: {artwork.provenance}
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              {artwork.desiredPrice && (
                                <p className="text-lg font-bold">
                                  $
                                  {Number.parseInt(
                                    artwork.desiredPrice,
                                  ).toLocaleString()}
                                </p>
                              )}
                              {artwork.purchasePrice && (
                                <p className="text-sm text-muted-foreground">
                                  Purchased: $
                                  {Number.parseInt(
                                    artwork.purchasePrice,
                                  ).toLocaleString()}
                                </p>
                              )}
                              <div className="flex gap-2 mt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 bg-transparent"
                                  asChild
                                >
                                  <Link href={`/artwork/${artwork.id}/edit`}>
                                    Manage
                                  </Link>
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* AI Advisor CTA */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Ask the AI Art Advisor</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized advice on selling timing, pricing, and market
                  trends for your collection.
                </p>
              </div>
              <Button asChild>
                <Link href="/chat?q=Is now a good time to sell my artwork?">
                  Get Advice
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
