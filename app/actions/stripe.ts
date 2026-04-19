"use server";

import { stripe } from "@/lib/stripe";

interface ArtworkCheckoutData {
  artworkId: string;
  title: string;
  artist: string;
  priceInCents: number;
  imageUrl?: string;
}

export async function startArtworkCheckoutSession(
  artwork: ArtworkCheckoutData,
) {
  if (!artwork.priceInCents || artwork.priceInCents <= 0) {
    throw new Error("Invalid artwork price");
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded_page",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: artwork.title,
            description: `By ${artwork.artist}`,
          },
          unit_amount: artwork.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      artworkId: artwork.artworkId,
    },
  });

  return session.client_secret;
}

export async function getCheckoutSessionStatus(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  return {
    status: session.status,
    paymentStatus: session.payment_status,
    customerEmail: session.customer_details?.email,
    artworkId: session.metadata?.artworkId,
  };
}
