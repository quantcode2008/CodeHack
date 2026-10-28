import { NextResponse, type NextRequest } from "next/server";
import { explainAnomalyWithAi } from "@/lib/ai/gemini";
import { type FairUseFlaggedUser } from "@/lib/owner/types";

export async function POST(request: NextRequest) {
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

