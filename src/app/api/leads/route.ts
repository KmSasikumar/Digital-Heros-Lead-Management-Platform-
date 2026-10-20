import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    // Validate pagination: non-numeric or out-of-range values fall back to
    // safe defaults instead of producing NaN/negative Prisma arguments.
    const rawPage = parseInt(searchParams.get("page") || "1", 10);
    const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
    const rawLimit = parseInt(searchParams.get("limit") || "10", 10);
    const limit =
      Number.isFinite(rawLimit) && rawLimit >= 1 ? Math.min(rawLimit, 100) : 10;
    const skip = (page - 1) * limit;

    const status = searchParams.get("status");
    const search = searchParams.get("search");
    // Whitelist sortable fields: an arbitrary sortBy used to reach Prisma
    // unchecked and crash the endpoint with a 500.
    const SORTABLE_FIELDS = ["createdAt", "updatedAt", "name", "email", "status", "value"] as const;
    const requestedSort = searchParams.get("sortBy") || "createdAt";
    const sortBy = (SORTABLE_FIELDS as readonly string[]).includes(requestedSort)
      ? requestedSort
      : "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // Build the where clause
    const where: Prisma.LeadWhereInput = {};

    // Role-based filtering
    if (session.user.role === "MEMBER") {
      where.assignedToId = session.user.id;
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
      ];
    }

    // Fetch leads and total count
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
