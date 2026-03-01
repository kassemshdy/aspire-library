import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { role } = await request.json();

    // Validate role
    if (!["ADMIN", "LIBRARIAN", "MEMBER"].includes(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    // Update user role
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: role as Role },
    });

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error("Role switch error:", error);
    return new NextResponse("Failed to switch role", { status: 500 });
  }
}
