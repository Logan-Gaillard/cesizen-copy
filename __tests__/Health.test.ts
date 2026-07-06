import { describe, it, expect } from "vitest";
import packageJson from "../package.json";

describe("GET /api/health", () => {
  it("unit-01 — repond avec le statut HTTP 200", async () => {
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();

    expect(res.status).toBe(200);
  });

  it("unit-02 — retourne status: ok", async () => {
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    const body = await res.json();

    expect(body.status).toBe("ok");
  });

  it("unit-03 — retourne la version depuis package.json", async () => {
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    const body = await res.json();

    expect(body.version).toBe(packageJson.version);
  });

  it("unit-04 — retourne un uptime numerique positif ou nul", async () => {
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    const body = await res.json();

    expect(typeof body.uptime).toBe("number");
    expect(body.uptime).toBeGreaterThanOrEqual(0);
  });

  it("unit-05 — retourne un timestamp ISO 8601 valide", async () => {
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    const body = await res.json();

    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  it("unit-06 — regression : ne plante pas en production sans GIT_COMMIT_SHA", async () => {
    const original = process.env.NODE_ENV;
    // @ts-expect-error NODE_ENV est en lecture seule dans les types, mais modifiable a l'execution
    process.env.NODE_ENV = "production";
    delete process.env.GIT_COMMIT_SHA;

    try {
      const { GET } = await import("@/app/api/health/route");
      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.commitSha).toBe("unknown");
    } finally {
      // @ts-expect-error idem
      process.env.NODE_ENV = original;
    }
  });
});
