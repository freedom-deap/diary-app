import { describe, expect, it } from "vitest";

import { describeEnvironment } from "./phase-zero";

describe("describeEnvironment", () => {
  it("reports a configured database", () => {
    expect(describeEnvironment("postgresql://example")).toEqual({
      application: "ready",
      database: "configured",
    });
  });

  it("reports a missing database URL", () => {
    expect(describeEnvironment(undefined).database).toBe("missing");
  });
});
