import { NextResponse, type NextRequest } from "next/server";
import { explainAnomalyWithAi } from "@/lib/ai/gemini";
import { type FairUseFlaggedUser } from "@/lib/owner/types";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit: 20 requests per minute per IP
  const rateLimitResponse = checkRateLimit(request, { limit: 20, windowMs: 60_000 });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { flag }: { flag: FairUseFlaggedUser } = body;

    if (!flag || !flag.id) {
      return NextResponse.json(
        { error: "Missing fair-use flag payload" },
        { status: 400 }
      );
    }

    const result = await explainAnomalyWithAi(flag);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/ai/explain-anomaly error]", error);
    return NextResponse.json(
      { error: "Failed to generate anomaly explanation" },
      { status: 500 }
    );
  }
}

