"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "./prisma";
import { signIn, signOut } from "./auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Legacy data (habits/points/profile) created before accounts existed has a
// null userId. The very first account ever created claims it automatically —
// there is only ever one real owner of that pre-auth data.
async function claimLegacyDataIfFirstUser(userId: string) {
  const userCount = await prisma.user.count();
  if (userCount !== 1) return;

  await prisma.$transaction([
    prisma.habit.updateMany({ where: { userId: null }, data: { userId } }),
    prisma.pointsEntry.updateMany({ where: { userId: null }, data: { userId } }),
    prisma.profile.updateMany({ where: { userId: null }, data: { userId } }),
  ]);
}

export async function signUpAction(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const name = (formData.get("name") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !EMAIL_RE.test(email)) return "Enter a valid email address.";
  if (!password || password.length < 8) return "Password must be at least 8 characters.";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return "An account with that email already exists.";

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, passwordHash, name } });
  await claimLegacyDataIfFirstUser(user.id);

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) return "Account created, but sign-in failed. Try logging in.";
    throw error;
  }
}

export async function signInAction(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Incorrect email or password.";
        default:
          return "Something went wrong signing in.";
      }
    }
    throw error;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
