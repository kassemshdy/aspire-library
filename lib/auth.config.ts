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
        token.email = user.email;
      }

      // Always fetch latest role from database (to handle role switches)
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
        });

        if (dbUser) {
          // On first sign-in, check if this is the first user (auto-elevate to admin)
          if (user) {
            const totalUsers = await prisma.user.count();
            const isFirstUser = totalUsers === 1;

            // Check if user should be admin
            const email = token.email as string;
            const isInAdminList = email && adminEmails.includes(email.toLowerCase());

            // Auto-elevate if: in admin list OR is the first user
            if ((isInAdminList || isFirstUser) && dbUser.role !== "ADMIN") {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { role: "ADMIN" },
              });
              token.role = "ADMIN";
            } else {
              token.role = dbUser.role;
            }
          } else {
            // On subsequent requests, just get the current role
            token.role = dbUser.role;
          }
        } else {
          token.role = user?.role ?? "MEMBER";
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

