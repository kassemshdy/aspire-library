import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    // Security: Check for a secret key
    const { secret } = await request.json();

    if (secret !== process.env.SEED_SECRET && secret !== "aspire-library-seed-2024") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("Starting database seed...");

    // Run the seed script
    const { stdout, stderr } = await execAsync("npx prisma db seed", {
      cwd: process.cwd(),
      env: process.env,
    });

    console.log("Seed output:", stdout);
    if (stderr) {
      console.error("Seed errors:", stderr);
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      output: stdout,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also allow GET for easy browser testing
export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");

  if (secret !== process.env.SEED_SECRET && secret !== "aspire-library-seed-2024") {
    return new NextResponse("Unauthorized - Use: /api/seed?secret=aspire-library-seed-2024", {
      status: 401
    });
  }

  try {
    console.log("Starting database seed via GET...");

    const { stdout, stderr } = await execAsync("npx prisma db seed", {
      cwd: process.cwd(),
      env: process.env,
    });

    console.log("Seed output:", stdout);
    if (stderr) {
      console.error("Seed errors:", stderr);
    }

    return new NextResponse(
      `Database seeded successfully!\n\n${stdout}`,
      {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return new NextResponse(
      `Seed failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}
