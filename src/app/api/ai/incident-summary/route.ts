import { NextResponse, type NextRequest } from "next/server";
import { summarizeIncidentWithAi } from "@/lib/ai/gemini";
import { type IncidentRecord, type IncidentTimelineEvent } from "@/lib/incidents/types";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit: 20 requests per minute per IP
  const rateLimitResponse = checkRateLimit(request, { limit: 20, windowMs: 60_000 });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { incident, timeline = [] }: { incident: IncidentRecord; timeline: IncidentTimelineEvent[] } = body;

    if (!incident || !incident.id) {
      return NextResponse.json(
        { error: "Missing incident payload" },
        { status: 400 }
      );
    }

    const summaryResult = await summarizeIncidentWithAi(incident, timeline);

    return NextResponse.json(summaryResult);
  } catch (error) {
    console.error("[/api/ai/incident-summary error]", error);
    return NextResponse.json(
      { error: "Failed to generate incident summary" },
      { status: 500 }
    );
  }
}

