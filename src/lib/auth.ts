import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, verifyAuthToken } from "./auth-token";

export async function getAuthenticatedUser() {
  return verifyAuthToken((await cookies()).get(AUTH_COOKIE)?.value, process.env.AUTH_SECRET);
}

export async function requireAuthenticatedUser() {
  const username = await getAuthenticatedUser();
  if (!username) redirect("/login");
  return username;
}

export async function requireOwnerId() {
  await requireAuthenticatedUser();
  return process.env.AUTH_OWNER_ID ?? "owner";
}
