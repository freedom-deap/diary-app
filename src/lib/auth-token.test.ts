import { describe, expect, it } from "vitest";
import { createAuthToken, verifyAuthToken } from "./auth-token";

describe("signed authentication token", () => {
  it("round trips a valid token", async () => {
    const token = await createAuthToken("diary-owner", "test-secret", 1_000_000);
    await expect(verifyAuthToken(token, "test-secret", 1_000_000)).resolves.toBe("diary-owner");
  });
  it("rejects tampering and expiration", async () => {
    const token = await createAuthToken("diary-owner", "test-secret", 1_000_000);
    await expect(verifyAuthToken(`${token}x`, "test-secret", 1_000_000)).resolves.toBeNull();
    await expect(verifyAuthToken(token, "test-secret", 1_000_000 + 8 * 24 * 60 * 60 * 1000)).resolves.toBeNull();
  });
});
