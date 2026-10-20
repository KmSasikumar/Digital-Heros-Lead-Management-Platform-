import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "WON", "LOST"] as const;

const updateLeadSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  status: z.enum(LEAD_STATUSES).optional(),
  value: z.number().nonnegative("Value cannot be negative").optional().nullable(),
  assignedToId: z.string().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        notes: {
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        activities: {
          include: {
            actor: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    // Role-based access control
    if (session.user.role === "MEMBER" && lead.assignedToId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
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

    // Role-based access control
    if (session.user.role === "MEMBER" && lead.assignedToId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsedData = updateLeadSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { message: "Validation error", errors: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsedData.data;

    // Assignment is an admin action (see README RBAC): a MEMBER who owns the
    // lead may edit it, but may not move it to a different assignee.
    if (
      session.user.role === "MEMBER" &&
      data.assignedToId !== undefined &&
      data.assignedToId !== lead.assignedToId
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // A non-null assignee must reference a real user, otherwise Prisma
    // throws a foreign-key error and the endpoint 500s.
    if (data.assignedToId) {
      const assignee = await prisma.user.findUnique({
        where: { id: data.assignedToId },
        select: { id: true },
      });
      if (!assignee) {
        return NextResponse.json(
          { message: "Validation error", errors: { assignedToId: ["Assignee not found"] } },
          { status: 400 }
        );
      }
    }

    // Determine what changed for activity log
    const changes: string[] = [];
    if (data.status && data.status !== lead.status) changes.push(`Status changed from ${lead.status} to ${data.status}`);
    if (data.assignedToId !== undefined && data.assignedToId !== lead.assignedToId) changes.push("Assignment updated");

    const updatedLead = await prisma.lead.update({
      where: { id },
      data,
    });

    if (changes.length > 0) {
      await prisma.activityLog.create({
        data: {
          leadId: lead.id,
          actorId: session.user.id,
          action: "UPDATE",
          details: changes.join(", "),
        },
      });
    }

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const lead = await prisma.lead.findUnique({ where: { id }, select: { id: true } });
    if (!lead) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }
    await prisma.lead.delete({ where: { id } });

    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
