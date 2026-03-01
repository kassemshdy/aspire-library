import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Security: Check for a secret key
    const { secret } = await request.json();

    if (secret !== process.env.SEED_SECRET && secret !== "aspire-library-reset-2024") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("🗑️  Deleting all data from database...");

    // Delete in correct order due to foreign key constraints
    await prisma.auditLog.deleteMany();
    console.log("✅ Deleted audit logs");

    await prisma.loan.deleteMany();
    console.log("✅ Deleted loans");

    await prisma.book.deleteMany();
    console.log("✅ Deleted books");

    await prisma.session.deleteMany();
    console.log("✅ Deleted sessions");

    await prisma.account.deleteMany();
    console.log("✅ Deleted accounts");

    await prisma.user.deleteMany();
    console.log("✅ Deleted users");

    console.log("\n✨ Database cleared successfully!");

    return NextResponse.json({
      success: true,
      message: "Database cleared successfully",
      deleted: {
        auditLogs: "all",
        loans: "all",
        books: "all",
        sessions: "all",
        accounts: "all",
        users: "all",
      },
    });
  } catch (error) {
    console.error("Reset error:", error);
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

  if (secret !== process.env.SEED_SECRET && secret !== "aspire-library-reset-2024") {
    return new NextResponse(
      "Unauthorized - Use: /api/reset-db?secret=aspire-library-reset-2024",
      { status: 401 }
    );
  }

  try {
    console.log("🗑️  Deleting all data from database...");

    // Delete in correct order due to foreign key constraints
    const auditCount = await prisma.auditLog.deleteMany();
    const loanCount = await prisma.loan.deleteMany();
    const bookCount = await prisma.book.deleteMany();
    const sessionCount = await prisma.session.deleteMany();
    const accountCount = await prisma.account.deleteMany();
    const userCount = await prisma.user.deleteMany();

    const message = `Database cleared successfully!

Deleted:
- ${userCount.count} users
- ${accountCount.count} accounts
- ${sessionCount.count} sessions
- ${bookCount.count} books
- ${loanCount.count} loans
- ${auditCount.count} audit logs

Total: ${userCount.count + accountCount.count + sessionCount.count + bookCount.count + loanCount.count + auditCount.count} records deleted`;

    console.log("\n✨ " + message);

    return new NextResponse(message, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Reset error:", error);
    return new NextResponse(
      `Reset failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}
