import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Simple security: require a secret key
const MIGRATION_SECRET = process.env.MIGRATION_SECRET || "change-me-in-production";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.secret !== MIGRATION_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run migrations
    const { stdout, stderr } = await execAsync("npx prisma migrate deploy");

    return NextResponse.json({
      success: true,
      stdout,
      stderr,
      message: "Migrations completed successfully",
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        error: "Migration failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
