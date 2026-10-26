import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AUTH_COOKIE, verifyAuthToken } from "./auth-token";

export async function getAuthenticatedUser() {
  return verifyAuthToken((await cookies()).get(AUTH_COOKIE)?.value, process.env.AUTH_SECRET);
}

export async function requireAuthenticatedUser() {
  const username = await getAuthenticatedUser();
  if (!username) notFound();
  return username;
}

export function getOwnerId() {
  return process.env.AUTH_OWNER_ID ?? "owner";
}

export async function requireOwnerId() {
  await requireAuthenticatedUser();
  return getOwnerId();
}
