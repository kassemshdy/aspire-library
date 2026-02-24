import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const authUrl = process.env.NEXTAUTH_URL;

  return NextResponse.json({
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    clientIdPrefix: clientId?.substring(0, 20) + "...",
    authUrl,
    message: "If hasClientId and hasClientSecret are both true, credentials are loaded. Check Google Cloud Console for redirect URI configuration."
  });
}
