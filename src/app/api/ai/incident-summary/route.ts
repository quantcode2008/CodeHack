import { NextResponse, type NextRequest } from "next/server";
import { summarizeIncidentWithAi } from "@/lib/ai/gemini";
import { type IncidentRecord, type IncidentTimelineEvent } from "@/lib/incidents/types";

export async function POST(request: NextRequest) {
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

