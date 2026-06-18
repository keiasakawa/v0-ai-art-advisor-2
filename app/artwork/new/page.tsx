"use client";

import type React from "react";
import { createArtwork, type ArtworkInsert } from "@/app/actions/artwork";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  ImageIcon,
  AlertCircle,
  ArrowLeft,
  Save,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface ArtworkFormData {
  // Image
  images: File[];
  // Required fields
  title: string;
  artist: string;
  height: string;
  width: string;
  heightUnit: "cm" | "in";
  widthUnit: "cm" | "in";
  // Optional dimensions
  depth: string;
  depthUnit: "cm" | "in";
  // Details
  signed: "yes" | "no" | "";
  edition: "yes" | "no" | "";
  editionNumber: string;
  editionSize: string;
  year: string;
  medium: string;
  // Purchase info
  purchasePrice: string;
  purchaseYear: string;
  invoiceAvailable: "yes" | "no" | "";
  invoiceFile?: File;
  // Additional notes
  provenance: string;
  condition: string;
  additionalNotes: string;
}

interface Artwork {
  id: string;

  title: string;
  artist: string;

  year?: string;
  medium?: string;

  width: number;
  height: number;
  depth?: number;
  unit: "in" | "cm";

  image_url: string;
  additional_images?: string[];

  signed: boolean;

  edition: boolean;
  edition_number?: string;
  edition_size?: string;

  certificate: boolean;

  provenance?: string;
  condition?: string;
  description?: string;

  purchase_price?: number;
  purchase_year?: string;

  status: "draft" | "listed" | "sold";
}

export default function NewArtworkPage() {
  const router = useRouter();
  const { isAuthenticated, hasRole, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ArtworkFormData>({
    images: [],
    title: "",
    artist: "",
    height: "",
    width: "",
    heightUnit: "in",
    widthUnit: "in",
    depth: "",
    depthUnit: "in",
    signed: "",
    edition: "",
    editionNumber: "",
    editionSize: "",
    year: "",
    medium: "",
    purchasePrice: "",
    purchaseYear: "",
    invoiceAvailable: "",
    provenance: "",
    condition: "",
    additionalNotes: "",
  });

  // Redirect if not authenticated or doesn't have seller role
  if (!isLoading && (!isAuthenticated || !hasRole("collector_seller"))) {
    router.push("/login");
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = formData.images.length + newFiles.length;

    if (totalImages > 10) {
      setErrors({ ...errors, images: "Maximum 10 images allowed" });
      return;
    }

    // Validate file size (10MB max per file)
    const invalidFiles = newFiles.filter(
      (file) => file.size > 10 * 1024 * 1024,
    );
    if (invalidFiles.length > 0) {
      setErrors({ ...errors, images: "Each image must be less than 10MB" });
      return;
    }

    // Create previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
    setFormData({ ...formData, images: [...formData.images, ...newFiles] });
    setErrors({ ...errors, images: "" });
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(newPreviews);
    setFormData({ ...formData, images: newImages });
  };

  const handleInvoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, invoice: "File must be less than 10MB" });
        return;
      }
      setFormData({ ...formData, invoiceFile: file });
      setErrors({ ...errors, invoice: "" });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (formData.images.length === 0) {
      newErrors.images = "At least one image is required";
    }
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.artist.trim()) {
      newErrors.artist = "Artist name is required";
    }
    if (!formData.height || Number.parseFloat(formData.height) <= 0) {
      newErrors.height = "Valid height is required";
    }
    if (!formData.width || Number.parseFloat(formData.width) <= 0) {
      newErrors.width = "Valid width is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('[data-error="true"]');
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);

    try {
      // In production, you would upload images to storage first
      // For now, we'll use a placeholder image URL
      const imageUrl =
        formData.images.length > 0
          ? "/abstract-colorful-artwork.png"
          : "/placeholder.svg";

      const artworkData: ArtworkInsert = {
        title: formData.title,
        artist: formData.artist,
        year: formData.year || undefined,
        medium: formData.medium || undefined,
        dimensions: `${formData.height} × ${formData.width}${formData.depth ? ` × ${formData.depth}` : ""} ${formData.heightUnit}`,
        depth: formData.depth || undefined,
        purchase_price: formData.purchasePrice
          ? parseFloat(formData.purchasePrice)
          : undefined,
        purchase_year: formData.purchaseYear || undefined,
        provenance: formData.provenance || undefined,
        certificate: formData.invoiceAvailable === "yes",
        condition: formData.condition || undefined,
        description: formData.additionalNotes || undefined,
        image_url: imageUrl,
        status: "draft",
        signed: formData.signed === "yes",
        edition: formData.edition === "yes",
        edition_number: formData.editionNumber || undefined,
        edition_size: formData.editionSize || undefined,
        invoice_available: formData.invoiceAvailable === "yes",
        additional_notes: formData.additionalNotes || undefined,
      };

      const result = await createArtwork(artworkData);

      if (!result.success) {
        console.error("[v0] Error saving artwork:", result.error);
        setErrors({ submit: result.error || "Failed to save artwork" });
        setIsSubmitting(false);
        return;
      }

      // Redirect to collection page
      router.push("/my-collection");
    } catch (error) {
      console.error("[v0] Error saving artwork:", error);
      setErrors({ submit: "An unexpected error occurred" });
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof ArtworkFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/my-collection">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Collection
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Add New Artwork</h1>
          <p className="text-muted-foreground mt-1">
            Register an artwork from your collection for portfolio management
            and potential sale
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section: Artwork Image */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Artwork Images
                <Badge variant="secondary">Required</Badge>
              </CardTitle>
              <CardDescription>
                Upload high-quality images of your artwork. First image will be
                the primary.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Upload Area */}
                <div data-error={!!errors.images}>
                  <label
                    htmlFor="image-upload"
                    className={`
                      border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                      transition-all hover:border-primary hover:bg-muted/50
                      ${errors.images ? "border-red-500 bg-red-50/50" : "border-border"}
                    `}
                  >
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG up to 10MB each (max 10 images)
                    </p>
                  </label>
                  {errors.images && (
                    <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                      <AlertCircle className="h-4 w-4" />
                      {errors.images}
                    </p>
                  )}
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group aspect-square rounded-lg overflow-hidden border"
                      >
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && (
                          <Badge className="absolute top-2 left-2 bg-primary">
                            Primary
                          </Badge>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section: Artwork Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Artwork Details</CardTitle>
              <CardDescription>
                Provide accurate information about the artwork
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title & Artist */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2" data-error={!!errors.title}>
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Untitled (Blue Series)"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="space-y-2" data-error={!!errors.artist}>
                  <Label htmlFor="artist">
                    Artist Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="artist"
                    placeholder="e.g., Pablo Picasso"
                    value={formData.artist}
                    onChange={(e) => updateField("artist", e.target.value)}
                    className={errors.artist ? "border-red-500" : ""}
                  />
                  {errors.artist && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.artist}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Dimensions */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Dimensions <span className="text-red-500">*</span>
                </Label>
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Height */}
                  <div className="space-y-2" data-error={!!errors.height}>
                    <Label htmlFor="height">Height</Label>
                    <div className="flex gap-2">
                      <Input
                        id="height"
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={formData.height}
                        onChange={(e) => updateField("height", e.target.value)}
                        className={`flex-1 ${errors.height ? "border-red-500" : ""}`}
                      />
                      <Select
                        value={formData.heightUnit}
                        onValueChange={(value: "cm" | "in") =>
                          updateField("heightUnit", value)
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in">in</SelectItem>
                          <SelectItem value="cm">cm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.height && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.height}
                      </p>
                    )}
                  </div>

                  {/* Width */}
                  <div className="space-y-2" data-error={!!errors.width}>
                    <Label htmlFor="width">Width</Label>
                    <div className="flex gap-2">
                      <Input
                        id="width"
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={formData.width}
                        onChange={(e) => updateField("width", e.target.value)}
                        className={`flex-1 ${errors.width ? "border-red-500" : ""}`}
                      />
                      <Select
                        value={formData.widthUnit}
                        onValueChange={(value: "cm" | "in") =>
                          updateField("widthUnit", value)
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in">in</SelectItem>
                          <SelectItem value="cm">cm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.width && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.width}
                      </p>
                    )}
                  </div>

                  {/* Depth (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="depth">Depth (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="depth"
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={formData.depth}
                        onChange={(e) => updateField("depth", e.target.value)}
                        className="flex-1"
                      />
                      <Select
                        value={formData.depthUnit}
                        onValueChange={(value: "cm" | "in") =>
                          updateField("depthUnit", value)
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in">in</SelectItem>
                          <SelectItem value="cm">cm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Signed? */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Is the artwork signed?
                </Label>
                <RadioGroup
                  value={formData.signed}
                  onValueChange={(value: "yes" | "no") =>
                    updateField("signed", value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="signed-yes" />
                    <Label
                      htmlFor="signed-yes"
                      className="font-normal cursor-pointer"
                    >
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="signed-no" />
                    <Label
                      htmlFor="signed-no"
                      className="font-normal cursor-pointer"
                    >
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Edition? */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Is this an edition?
                </Label>
                <RadioGroup
                  value={formData.edition}
                  onValueChange={(value: "yes" | "no") =>
                    updateField("edition", value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="edition-yes" />
                    <Label
                      htmlFor="edition-yes"
                      className="font-normal cursor-pointer"
                    >
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="edition-no" />
                    <Label
                      htmlFor="edition-no"
                      className="font-normal cursor-pointer"
                    >
                      No
                    </Label>
                  </div>
                </RadioGroup>

                {/* Edition Details */}
                {formData.edition === "yes" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="grid gap-4 sm:grid-cols-2 pt-2"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="editionNumber">Edition Number</Label>
                      <Input
                        id="editionNumber"
                        placeholder="e.g., 3"
                        value={formData.editionNumber}
                        onChange={(e) =>
                          updateField("editionNumber", e.target.value)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Your copy number in the edition
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editionSize">Edition Size</Label>
                      <Input
                        id="editionSize"
                        placeholder="e.g., 15"
                        value={formData.editionSize}
                        onChange={(e) =>
                          updateField("editionSize", e.target.value)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Total copies in the edition
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              <Separator />

              {/* Year & Medium */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="year">Year Created</Label>
                  <Input
                    id="year"
                    placeholder="e.g., 2023"
                    value={formData.year}
                    onChange={(e) => updateField("year", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medium">Material / Medium</Label>
                  <Input
                    id="medium"
                    placeholder="e.g., Oil on canvas"
                    value={formData.medium}
                    onChange={(e) => updateField("medium", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    e.g., "Acrylic on wood panel", "C-print photography"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section: Purchase Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Purchase Information</CardTitle>
              <CardDescription>
                Optional - Used to calculate estimated gains/losses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Purchase Price & Year */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="purchasePrice"
                      type="number"
                      placeholder="0"
                      className="pl-7"
                      value={formData.purchasePrice}
                      onChange={(e) =>
                        updateField("purchasePrice", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseYear">Purchase Year</Label>
                  <Input
                    id="purchaseYear"
                    placeholder="e.g., 2022"
                    value={formData.purchaseYear}
                    onChange={(e) =>
                      updateField("purchaseYear", e.target.value)
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Invoice Available? */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Do you have a purchase invoice?
                </Label>
                <RadioGroup
                  value={formData.invoiceAvailable}
                  onValueChange={(value: "yes" | "no") =>
                    updateField("invoiceAvailable", value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="invoice-yes" />
                    <Label
                      htmlFor="invoice-yes"
                      className="font-normal cursor-pointer"
                    >
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="invoice-no" />
                    <Label
                      htmlFor="invoice-no"
                      className="font-normal cursor-pointer"
                    >
                      No
                    </Label>
                  </div>
                </RadioGroup>

                {/* Invoice Upload */}
                {formData.invoiceAvailable === "yes" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-2"
                  >
                    <Label htmlFor="invoice-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                        <input
                          id="invoice-upload"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleInvoiceUpload}
                          className="hidden"
                        />
                        <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Upload Invoice</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, JPG, PNG up to 10MB
                        </p>
                        {formData.invoiceFile && (
                          <div className="mt-2 flex items-center justify-center gap-2 text-sm text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            {formData.invoiceFile.name}
                          </div>
                        )}
                      </div>
                    </Label>
                    {errors.invoice && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                        <AlertCircle className="h-4 w-4" />
                        {errors.invoice}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section: Additional Notes */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>
                Optional information about provenance, condition, and other
                details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provenance">Provenance Notes</Label>
                <Textarea
                  id="provenance"
                  placeholder="Ownership history, exhibition history, acquisition details..."
                  value={formData.provenance}
                  onChange={(e) => updateField("provenance", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition Notes</Label>
                <Textarea
                  id="condition"
                  placeholder="Current condition, any restoration, damages, or notable features..."
                  value={formData.condition}
                  onChange={(e) => updateField("condition", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Information</Label>
                <Textarea
                  id="additionalNotes"
                  placeholder="Any other relevant details about the artwork..."
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    updateField("additionalNotes", e.target.value)
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Artwork
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
