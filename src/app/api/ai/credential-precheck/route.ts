import { NextResponse, type NextRequest } from "next/server";
import { precheckCredentialWithAi } from "@/lib/ai/gemini";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit: 20 requests per minute per IP
  const rateLimitResponse = checkRateLimit(request, { limit: 20, windowMs: 60_000 });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const {
      fileName = "certificate.pdf",
      requirementLabel = "EHS Workshop Safety Training",
      userProfileName = "Aanya Patel",
      userEmail = "aanya@eastbrook.edu",
      userAffiliation = "Department of Electrical Engineering",
      extractedSnippet = "",
    } = body;

    const result = await precheckCredentialWithAi({
      fileName,
      requirementLabel,
      userProfileName,
      userEmail,
      userAffiliation,
      extractedSnippet,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/ai/credential-precheck error]", error);
    return NextResponse.json(
      { error: "Failed to evaluate credential pre-check" },
      { status: 500 }
    );
  }
}

