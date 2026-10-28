import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { purpose = "", resourceSlug = "" } = body;

    const lower = purpose.toLowerCase();

    let matchScore = 88;
    let rationale =
      "Your declared academic research purpose aligns with standard usage parameters for this collegiate resource.";
    const recommendations: string[] = [
      "Confirm safety certificate standing prior to arrival.",
      "Arrive 5 minutes before scheduled window for physical condition check.",
    ];
    let safetyAdvice = "Standard lab PPE and clean workspace housekeeping required.";

    if (
      lower.includes("film") ||
      lower.includes("cinema") ||
      lower.includes("video") ||
      lower.includes("camera")
    ) {
      matchScore = 96;
      rationale =
        "Optimal match: Full-frame 4K production package supports broadcast capture and multi-track XLR sound.";
      recommendations.push("Bring high-speed CFexpress Type A or SD V90 cards for 4K 120p capture.");
      safetyAdvice = "Optics must remain mounted in dusty outdoor environments to protect Exmor sensor.";
    } else if (
      lower.includes("laser") ||
      lower.includes("cut") ||
      lower.includes("acrylic") ||
      lower.includes("wood")
    ) {
      matchScore = 94;
      rationale =
        "Optimal match: 60W dual-source laser cutter provides precise kerf tolerance for structural acrylic and plywood.";
      recommendations.push("Export vector paths in 0.001 pt hairline SVG / DXF format.");
      safetyAdvice = "OD5+ laser protective eyewear and active fume exhaust are mandatory.";
    } else if (
      lower.includes("print") ||
      lower.includes("prototype") ||
      lower.includes("3d") ||
      lower.includes("cad")
    ) {
      matchScore = 92;
      rationale =
        "High match: Nextruder precision build plate ensures tight dimensional stability for snap-fit assemblies.";
      recommendations.push("Slice models with 0.15mm layer height for optimal balance of speed and finish.");
      safetyAdvice = "Observe first 3 layers to prevent PEI sheet adhesion failures.";
    } else if (
      lower.includes("audio") ||
      lower.includes("podcast") ||
      lower.includes("voice") ||
      lower.includes("record")
    ) {
      matchScore = 95;
      rationale =
        "Superb match: STC-55 isolated sound booth with Shure SM7B microphones eliminates campus ambient noise.";
      recommendations.push("Bring formatted USB-C drive for multi-track 32-bit float WAV capture.");
      safetyAdvice = "Strictly no beverages or open liquids inside the acoustic booth.";
    }

    return NextResponse.json({
      matchScore,
      confidence: "high",
      rationale,
      recommendations,
      safetyAdvice,
      evaluatedAt: new Date().toISOString(),
      evaluator: "Eastbrook Resource Matching Engine (Stub v1.0)",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid purpose declaration payload" },
      { status: 400 }
    );
  }
}

