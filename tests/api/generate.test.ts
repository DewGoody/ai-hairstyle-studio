import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/gemini", () => ({
  generateHairstyle: vi.fn(async () => "data:image/png;base64,RESULT"),
  NoFaceDetectedError: class extends Error { code = "no_face_detected" as const; },
  GeminiFailureError: class extends Error { code = "ai_failure" as const; },
}));

import { POST } from "@/app/api/generate/route";

function buildReq(body: unknown, ip = "1.2.3.4") {
  return new Request("http://localhost/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

const validBody = {
  image: "data:image/jpeg;base64,/9j/AAA",
  presetId: "female-bob",
  colorId: "blonde",
  locale: "en" as const,
};

describe("POST /api/generate", () => {
  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("returns generated image and remaining quota on happy path", async () => {
    const res = await POST(buildReq(validBody, "10.0.0.1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.generatedImage).toBe("data:image/png;base64,RESULT");
    expect(body.remaining).toBe(4);
  });

  it("rejects invalid body with 400", async () => {
    const res = await POST(buildReq({ image: "not-a-dataurl" }, "10.0.0.2"));
    expect(res.status).toBe(400);
  });

  it("rejects unknown presetId with 400", async () => {
    const res = await POST(buildReq({ ...validBody, presetId: "nope" }, "10.0.0.3"));
    expect(res.status).toBe(400);
  });

  it("rejects oversize image with 400 image_too_large", async () => {
    const huge = "data:image/jpeg;base64," + "A".repeat(15 * 1024 * 1024);
    const res = await POST(buildReq({ ...validBody, image: huge }, "10.0.0.4"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("image_too_large");
  });

  it("returns 429 after 5 requests from the same IP", async () => {
    const ip = "10.0.0.5";
    for (let i = 0; i < 5; i++) {
      const ok = await POST(buildReq(validBody, ip));
      expect(ok.status).toBe(200);
    }
    const blocked = await POST(buildReq(validBody, ip));
    expect(blocked.status).toBe(429);
    const body = await blocked.json();
    expect(body.error).toBe("rate_limited");
    expect(typeof body.retryAfter).toBe("number");
  });
});
