import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const noteSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const lead = await prisma.lead.findUnique({ where: { id } });

    if (!lead) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    if (session.user.role === "MEMBER" && lead.assignedToId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsedData = noteSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { message: "Validation error", errors: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const note = await prisma.leadNote.create({
      data: {
        content: parsedData.data.content,
        leadId: lead.id,
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        leadId: lead.id,
        actorId: session.user.id,
        action: "NOTE_ADDED",
        details: "Added a note",
      },
    });

    return NextResponse.json({ message: "Note added successfully", note }, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
