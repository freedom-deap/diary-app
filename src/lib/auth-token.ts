export const AUTH_COOKIE = "outing_diary_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

export async function createAuthToken(username: string, secret: string, now = Date.now()) {
  const expiresAt = Math.floor(now / 1000) + SESSION_SECONDS;
  const payload = `${encodeURIComponent(username)}.${expiresAt}`;
  return `${payload}.${await sign(payload, secret)}`;
}

export async function verifyAuthToken(token: string | undefined, secret: string | undefined, now = Date.now()) {
  if (!token || !secret) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [encodedUsername, expires, signature] = parts;
  const expiresAt = Number(expires);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(now / 1000)) return null;
  const expected = await sign(`${encodedUsername}.${expires}`, secret);
  if (!constantTimeEqual(signature, expected)) return null;
  try { return decodeURIComponent(encodedUsername); } catch { return null; }
}

export async function credentialsMatch(username: string, password: string) {
  const expectedUsername = process.env.AUTH_USERNAME;
  const expectedPassword = process.env.AUTH_PASSWORD;
  if (!expectedUsername || !expectedPassword) return false;
  const [actual, expected] = await Promise.all([digest(`${username}\0${password}`), digest(`${expectedUsername}\0${expectedPassword}`)]);
  return constantTimeEqual(actual, expected);
}

async function sign(payload: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))));
}

async function digest(value: string) {
  return toBase64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function constantTimeEqual(a: string, b: string) {
  const length = Math.max(a.length, b.length);
  let difference = a.length ^ b.length;
  for (let index = 0; index < length; index++) difference |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  return difference === 0;
}
