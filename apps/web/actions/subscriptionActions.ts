"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { writeClient } from "@repo/sanity";

/**
 * Is the SIGNED-IN user's own address subscribed? This is a public Server Action,
 * so it only ever answers for an email that belongs to the caller (it used to
 * report the status of any email it was given, an enumeration oracle).
 */
export async function checkSubscriptionStatus(
  email: string
): Promise<{ subscribed: boolean; status?: string }> {
  try {
    const { userId } = await auth();
    if (!userId || typeof email !== "string") return { subscribed: false };

    const user = await currentUser();
    const mine = (user?.emailAddresses ?? []).map((e) => e.emailAddress.toLowerCase().trim());
    const wanted = email.toLowerCase().trim();
    if (!mine.includes(wanted)) return { subscribed: false };

    const subscription = await writeClient.fetch<{ status?: string } | null>(
      `*[_type == "subscription" && email == $email][0]{ status }`,
      { email: wanted }
    );
    if (!subscription) return { subscribed: false };
    return { subscribed: subscription.status === "active", status: subscription.status };
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return { subscribed: false };
  }
}
