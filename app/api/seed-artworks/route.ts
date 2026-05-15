import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const mockArtworks = [
  {
    title: "Cosmic Drift",
    artist: "Elena Vasquez",
    year: "2023",
    medium: "Oil on Canvas",
    dimensions: "48 × 36 in",
    purchase_price: 12000,
    desired_price: 15000,
    provenance: "Acquired directly from artist studio, New York",
    certificate: true,
    condition: "Excellent",
    description:
      "A mesmerizing abstract piece featuring swirling cosmic colors and dynamic brushwork that evokes the vastness of space.",
    image_url: "/space-abstract-art.jpg",
    status: "listed",
    signed: true,
  },
  {
    title: "Urban Fragments",
    artist: "Marcus Chen",
    year: "2022",
    medium: "Mixed Media on Panel",
    dimensions: "36 × 48 in",
    purchase_price: 8500,
    desired_price: 11000,
    provenance: "Gallery acquisition, San Francisco",
    certificate: true,
    condition: "Excellent",
    description:
      "Bold geometric forms intersect with organic shapes in this striking commentary on city life and human connection.",
    image_url: "/abstract-urban-painting.png",
    status: "listed",
    signed: true,
  },
  {
    title: "Ethereal Landscape No. 7",
    artist: "Sofia Andersson",
    year: "2021",
    medium: "Acrylic on Canvas",
    dimensions: "60 × 40 in",
    purchase_price: 18000,
    desired_price: 22000,
    provenance: "Private collection, Stockholm",
    certificate: true,
    condition: "Excellent",
    description:
      "Part of the acclaimed Ethereal series, this piece captures the ephemeral beauty of Nordic light through layers of translucent color.",
    image_url: "/ethereal-landscape-painting.jpg",
    status: "listed",
    signed: true,
  },
  {
    title: "Digital Dreams",
    artist: "Kai Nakamura",
    year: "2024",
    medium: "Digital Print on Aluminum",
    dimensions: "40 × 40 in",
    purchase_price: 6500,
    desired_price: 8500,
    provenance: "Artist studio, Tokyo",
    certificate: true,
    condition: "Mint",
    description:
      "A stunning fusion of traditional Japanese aesthetics with contemporary digital art techniques.",
    image_url: "/digital-art-colorful.jpg",
    status: "listed",
    signed: false,
  },
  {
    title: "Geometric Harmony",
    artist: "Priya Sharma",
    year: "2023",
    medium: "Acrylic and Gold Leaf",
    dimensions: "30 × 30 in",
    purchase_price: 9500,
    desired_price: 12500,
    provenance: "Gallery acquisition, Mumbai",
    certificate: true,
    condition: "Excellent",
    description:
      "Intricate geometric patterns inspired by traditional Indian architecture, enhanced with 24k gold leaf accents.",
    image_url: "/geometric-abstract.png",
    status: "listed",
    signed: true,
  },
  {
    title: "Contemporary Flow",
    artist: "James Morrison",
    year: "2022",
    medium: "Oil on Linen",
    dimensions: "54 × 42 in",
    purchase_price: 14000,
    desired_price: 17500,
    provenance: "Estate sale, London",
    certificate: false,
    condition: "Very Good",
    description:
      "Bold color fields and fluid forms create a sense of movement and emotional depth in this contemporary masterwork.",
    image_url: "/contemporary-abstract.jpg",
    status: "listed",
    signed: true,
  },
  {
    title: "Organic Forms Study",
    artist: "Ana Lucia Ferreira",
    year: "2024",
    medium: "Latex and Mixed Media",
    dimensions: "Variable",
    purchase_price: 22000,
    desired_price: 28000,
    provenance: "Acquired from Biennale exhibition",
    certificate: true,
    condition: "Excellent",
    description:
      "Sculptural wall piece exploring the boundaries between organic and synthetic materials.",
    image_url: "/abstract-latex-sculpture-hanging-organic-forms.jpg",
    status: "listed",
    signed: false,
  },
  {
    title: "Industrial Memory",
    artist: "Heinrich Weber",
    year: "2021",
    medium: "Industrial Felt on Steel",
    dimensions: "72 × 48 in",
    purchase_price: 32000,
    desired_price: 40000,
    provenance: "Museum deaccession, Berlin",
    certificate: true,
    condition: "Good",
    description:
      "A powerful piece from Weber's acclaimed Industrial Memory series, combining raw materials with minimalist aesthetics.",
    image_url: "/industrial-felt-art-installation-gray-minimalist.jpg",
    status: "listed",
    signed: true,
  },
  {
    title: "Ancestral Bronze",
    artist: "Amara Okonkwo",
    year: "2023",
    medium: "Cast Bronze",
    dimensions: "24 × 18 × 12 in",
    purchase_price: 45000,
    desired_price: 55000,
    provenance: "Direct from artist, Lagos",
    certificate: true,
    condition: "Mint",
    description:
      "A stunning bronze sculpture celebrating African heritage and feminine strength.",
    image_url: "/bronze-sculpture-female-figure-african-art-contemp.jpg",
    status: "listed",
    signed: true,
  },
  {
    title: "Woven Narratives",
    artist: "Carmen Delgado",
    year: "2022",
    medium: "Recycled Bottle Caps on Canvas",
    dimensions: "48 × 72 in",
    purchase_price: 18000,
    desired_price: 24000,
    provenance: "Gallery acquisition, Mexico City",
    certificate: true,
    condition: "Excellent",
    description:
      "An extraordinary tapestry created from thousands of recycled bottle caps, telling stories of community and sustainability.",
    image_url: "/metallic-tapestry-gold-silver-bottle-caps-woven-ar.jpg",
    status: "listed",
    signed: true,
  },
];

export async function POST() {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to seed artworks" },
        { status: 401 },
      );
    }

    // Insert artworks with the current user's ID
    const artworksWithUserId = mockArtworks.map((artwork) => ({
      ...artwork,
      user_id: user.id,
    }));

    const { data, error } = await supabase
      .from("artworks")
      .insert(artworksWithUserId)
      .select();

    if (error) {
      console.error("[v0] Error seeding artworks:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(
      `[v0] Successfully seeded ${data.length} artworks for user ${user.id}`,
    );

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${data.length} artworks`,
      artworks: data,
    });
  } catch (error) {
    console.error("[v0] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
