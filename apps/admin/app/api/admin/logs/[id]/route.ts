import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { requireAdminApi } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  try {
    const log = await writeClient.fetch(
      `*[_type == "adminLog" && _id == $id][0]{ _id, level, message, actorClerkId, context, createdAt }`,
      { id }
    );
    if (!log) return NextResponse.json({ error: "Log not found" }, { status: 404 });
    return NextResponse.json({ log });
  } catch (error) {
    console.error("Error fetching log:", error);
    return NextResponse.json({ error: "Failed to fetch log" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  try {
    const existing = await writeClient.fetch<string | null>(
      `*[_type == "adminLog" && _id == $id][0]._id`,
      { id }
    );
    if (!existing) return NextResponse.json({ error: "Log not found" }, { status: 404 });
    await writeClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting log:", error);
    return NextResponse.json({ error: "Failed to delete log" }, { status: 500 });
  }
}
