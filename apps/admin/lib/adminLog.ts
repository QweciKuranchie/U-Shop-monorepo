import { writeClient } from "@repo/sanity";

export type AdminLogLevel = "info" | "warn" | "error" | "debug";

/**
 * Append an entry to the admin activity log (Sanity `adminLog` documents).
 * Never throws: logging must not break the action being logged.
 */
export async function logAdminAction(
  level: AdminLogLevel,
  message: string,
  context: Record<string, unknown> = {},
  actorClerkId?: string | null
): Promise<void> {
  try {
    await writeClient.create({
      _type: "adminLog",
      level,
      message,
      actorClerkId: actorClerkId ?? undefined,
      context: JSON.stringify(context),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to write admin log:", error);
  }
}
