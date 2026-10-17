import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@repo/sanity";
import { getAuthUser } from "@/lib/getAuthUser";

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await getAuthUser(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    // Identity is the verified session, NEVER a `clerkUserId` from the body: that
    // let any signed-in user overwrite another customer's name, phone and DOB.
    const text = (v: unknown, max: number) =>
      typeof v === "string" ? v.trim().slice(0, max) : undefined;
    const firstName = text(body.firstName, 80);
    const lastName = text(body.lastName, 80);
    const phone = text(body.phone, 30);
    const dateOfBirth = text(body.dateOfBirth, 10);

    // Update or create user in Sanity
    const sanityUser = {
      _type: "user",
      clerkUserId: userId,
      email: "", // We'll get this from Clerk
      firstName,
      lastName,
      phone,
      dateOfBirth,
      updatedAt: new Date().toISOString(),
    };

    // Check if user exists in Sanity
    const existingUser = await backendClient.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId: userId }
    );

    let result;
    if (existingUser) {
      // Update existing user
      result = await backendClient
        .patch(existingUser._id)
        .set({
          firstName,
          lastName,
          phone,
          dateOfBirth,
          updatedAt: new Date().toISOString(),
        })
        .commit();
    } else {
      // Create new user
      result = await backendClient.create({
        ...sanityUser,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: result,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
