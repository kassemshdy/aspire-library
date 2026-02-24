import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Role } from "@prisma/client";

import { prisma } from "./prisma";

const adminEmails =
  process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ?? [];

export const authConfig: AuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      httpOptions: {
        timeout: 10000,
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On first JWT callback after sign-in, persist role & id on token
      if (user) {
        token.id = user.id;

        // Check if user should be admin
        const email = user.email?.toLowerCase();
        if (email && adminEmails.includes(email)) {
          // Update user role in database if not already admin
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (dbUser && dbUser.role !== "ADMIN") {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { role: "ADMIN" },
            });
            token.role = "ADMIN";
          } else if (dbUser) {
            token.role = dbUser.role;
          } else {
            token.role = "MEMBER";
          }
        } else {
          token.role = user.role ?? "MEMBER";
        }
      }

      // Ensure token has a role
      if (!token.role) {
        token.role = "MEMBER";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) ?? "MEMBER";
      }
      return session;
    },
    async signIn({ user }) {
      // Allow sign in
      return true;
    },
  },
};

