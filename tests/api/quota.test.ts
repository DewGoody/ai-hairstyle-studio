import { describe, it, expect, beforeEach } from "vitest";
import { GET } from "@/app/api/quota/route";

function reqWithIp(ip: string): Request {
  return new Request("http://localhost/api/quota", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("GET /api/quota", () => {
  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("returns full quota for a fresh IP", async () => {
    const res = await GET(reqWithIp("9.9.9.9"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.remaining).toBe(5);
    expect(typeof body.resetAt).toBe("number");
  });
});
