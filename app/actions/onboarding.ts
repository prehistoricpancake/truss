"use server";

import { auth } from "@/lib/auth";
import { createCreator, getCreator, updateCreator } from "@/lib/db";

export async function completeOnboarding(displayName: string, platforms: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const userId = session.user.id;
  const email = session.user.email ?? userId;

  const existing = await getCreator(userId);
  if (existing) {
    await updateCreator(userId, { name: displayName, connectedPlatforms: platforms });
  } else {
    await createCreator(userId, email, displayName);
    if (platforms.length) {
      await updateCreator(userId, { connectedPlatforms: platforms });
    }
  }

  return { success: true };
}
