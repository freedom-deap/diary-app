"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, createAuthToken, credentialsMatch } from "@/lib/auth-token";

export type LoginState = { error?: string };

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!(await credentialsMatch(username, password))) return { error: "ユーザー名またはパスワードが正しくありません。" };
  const secret = process.env.AUTH_SECRET;
  if (!secret) return { error: "認証設定が未完了です。管理者へ確認してください。" };
  (await cookies()).set(AUTH_COOKIE, await createAuthToken(username, secret), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7,
  });
  const next = String(formData.get("next") ?? "/");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout() {
  (await cookies()).delete(AUTH_COOKIE);
  redirect("/login");
}
