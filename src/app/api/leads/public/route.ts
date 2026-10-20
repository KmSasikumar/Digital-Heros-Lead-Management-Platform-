import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadCaptureSchema } from "@/lib/validations/lead";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = leadCaptureSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { message: "Validation error", errors: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsedData.data;

    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        source: "Public Form",
        status: "NEW", // Initial status
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        leadId: lead.id,
        action: "CREATED",
        details: "Lead captured via public form",
      },
    });

    return NextResponse.json({ message: "Lead captured successfully", lead }, { status: 201 });
  } catch (error) {
    console.error("Error creating public lead:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
