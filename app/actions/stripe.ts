"use server";

import { headers } from "next/headers";

import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { resolveCheckoutPrice } from "@/lib/checkout-price";
import { getArtworkWithListing } from "@/app/actions/artwork";
import { markListingAsSold } from "@/app/actions/listings";

async function getOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

/**
 * Creates an embedded Checkout Session for an artwork. The price is looked up
 * on the server from the listing/auction so it cannot be tampered with.
 */
export async function startArtworkCheckoutSession(artworkId: string) {
  const result = await getArtworkWithListing(artworkId);
  if (!result.success || !result.data) {
    throw new Error("Artwork not found");
  }

  const { artwork, currentUserId } = result.data;
  if (!currentUserId) {
    throw new Error("You must be signed in to purchase artwork");
  }

  const price = resolveCheckoutPrice(result.data);
  if (!price.ok) {
    throw new Error(price.error);
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded_page",
    return_url: `${await getOrigin()}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    client_reference_id: currentUserId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: artwork.title,
            description: `By ${artwork.artist}`,
            ...(artwork.image_url?.startsWith("http")
              ? { images: [artwork.image_url] }
              : {}),
          },
          unit_amount: Math.round(price.amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      artworkId: artwork.id,
      buyerId: currentUserId,
      purchaseType: price.purchaseType,
    },
  });

  if (!session.client_secret) {
    throw new Error("Stripe did not return a client secret");
  }
  return session.client_secret;
}

/**
 * Verifies a Checkout Session with Stripe and, if it was paid by the current
 * user, marks the artwork as sold. Safe to call more than once per session.
 */
export async function confirmArtworkPurchase(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const artworkId = session.metadata?.artworkId;
  const customerEmail = session.customer_details?.email ?? null;

  if (session.payment_status !== "paid" || !artworkId) {
    return { success: false as const, status: session.status, customerEmail, artworkId };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== session.client_reference_id) {
    return {
      success: false as const,
      status: session.status,
      customerEmail,
      artworkId,
      error: "Sign in with the account that made this purchase to confirm it.",
    };
  }

  const { data: existing } = await supabase
    .from("purchases")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (!existing) {
    const sold = await markListingAsSold(artworkId, {
      stripeSessionId: session.id,
      amountPaid: (session.amount_total ?? 0) / 100,
      purchaseType: session.metadata?.purchaseType,
    });
    if (!sold.success) {
      return {
        success: false as const,
        status: session.status,
        customerEmail,
        artworkId,
        error: "Payment received, but we could not record your purchase. Please contact support.",
      };
    }
  }

  return { success: true as const, status: session.status, customerEmail, artworkId };
}
