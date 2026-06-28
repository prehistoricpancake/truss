"use server";

import { createCheckoutSession, createPortalSession } from "@/lib/stripe";

export async function createCheckout(priceId: string, userId: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const session = await createCheckoutSession(
    priceId,
    userId,
    `${baseUrl}/billing?success=true`,
    `${baseUrl}/pricing`
  );

  return { url: session.url };
}

export async function createPortal(customerId: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const session = await createPortalSession(
    customerId,
    `${baseUrl}/billing`
  );

  return { url: session.url };
}
