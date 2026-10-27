import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@repo/sanity";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    // The request is always filed for the SIGNED-IN user. Taking `clerkUserId`
    // from the body let anyone file (or pre-empt, via the duplicate check below)
    // a request in somebody else's name.
    const clerkUserId = userId;
    const text = (v: unknown, max: number) =>
      typeof v === "string" ? v.trim().slice(0, max) : "";
    const email = text(body.email, 254);
    const firstName = text(body.firstName, 80);
    const lastName = text(body.lastName, 80);

    // Check if user request already exists
    const existingRequest = await backendClient.fetch(
      `*[_type == "userAccessRequest" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId }
    );

    if (existingRequest) {
      return NextResponse.json({
        success: false,
        message: "Access request already exists",
      });
    }

    // Create access request in Sanity
    const accessRequest = await backendClient.create({
      _type: "userAccessRequest",
      clerkUserId,
      email,
      firstName,
      lastName,
      status: "pending",
      requestedAt: new Date().toISOString(),
      approvedAt: null,
      approvedBy: null,
      notes: "",
    });

    return NextResponse.json({
      success: true,
      message: "Access request submitted successfully",
      requestId: accessRequest._id,
    });
  } catch (error) {
    console.error("Error creating access request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
