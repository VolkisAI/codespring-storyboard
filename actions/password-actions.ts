"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "sbpw";

/**
 * verifyPassword
 * Server action that compares the provided password with the STORYBOARD_PASSWORD
 * environment variable. On success it writes a secure, httpOnly cookie so the
 * user does not have to re-enter the password on subsequent page loads.
 */
export async function verifyPassword(password: string): Promise<boolean> {
  const storyboardPassword = process.env.STORYBOARD_PASSWORD;

  if (password && storyboardPassword && password === storyboardPassword) {
    cookies().set(COOKIE_NAME, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });
    return true;
  }

  return false;
} 