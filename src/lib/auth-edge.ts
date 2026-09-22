import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Edge-safe NextAuth instance (no Prisma/bcrypt) — used only by proxy.ts.
export const { auth } = NextAuth(authConfig);
