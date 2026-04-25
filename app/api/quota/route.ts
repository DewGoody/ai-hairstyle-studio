import { NextResponse } from "next/server";
import { ratelimit, DAILY_LIMIT } from "@/lib/ratelimit";
import { ipFromRequest } from "@/lib/ipFromRequest";

export async function GET(req: Request) {
  const ip = ipFromRequest(req);
  // Probe limiter without consuming the user's real counter: separate "peek:" key namespace.
  const peek = await ratelimit.limit(`peek:${ip}`);
  return NextResponse.json({
    remaining: peek.remaining + 1,
    resetAt: peek.reset,
    limit: DAILY_LIMIT,
  });
}
