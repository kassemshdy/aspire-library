import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkoutBook, returnBook } from "@/lib/services/loanService";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const payload = await request.json();
  const action = payload.action as "checkout" | "return" | undefined;

  try {
    if (action === "checkout") {
      const loan = await checkoutBook(id, (session.user as any).id);
      return NextResponse.json(loan);
    }

    if (action === "return") {
      const loan = await returnBook(id, (session.user as any).id);
      return NextResponse.json(loan);
    }

    return new NextResponse("Unsupported action", { status: 400 });
  } catch (error) {
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Unknown error", { status: 500 });
  }
}

