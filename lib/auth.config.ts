import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Role } from "@prisma/client";

import { prisma } from "./prisma";

const adminEmails =
  process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ?? [];

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On first JWT callback after sign-in, persist role & id on token
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role ?? "MEMBER";
      }

      // Ensure token has a role
      if (!token.role) {
        token.role = "MEMBER";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = (token.role as Role) ?? "MEMBER";
      }
      return session;
    },
    async signIn({ user }) {
      // Auto-elevate admins based on ADMIN_EMAILS env
      if (user?.email) {
        const email = user.email.toLowerCase();
        if (adminEmails.includes(email)) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          });
        }
      }
      return true;
    },
  },
};

