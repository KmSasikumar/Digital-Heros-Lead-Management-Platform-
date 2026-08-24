import { NextRequest } from "next/server";
import { GET } from "@/app/api/leads/route";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

// Mock next-auth
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    lead: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("GET /api/leads", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if unauthenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost/api/leads");
    const response = await GET(req);

    expect(response.status).toBe(401);
  });

  it("returns leads for ADMIN without assignedTo filter", async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce({
      user: { id: "admin-id", role: "ADMIN" },
    });
    
    (prisma.lead.findMany as jest.Mock).mockResolvedValueOnce([]);
    (prisma.lead.count as jest.Mock).mockResolvedValueOnce(0);

    const req = new NextRequest("http://localhost/api/leads?page=1&limit=10");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {}, // No assignedToId constraint
      })
    );
  });

  it("returns leads for MEMBER with assignedTo filter", async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce({
      user: { id: "member-id", role: "MEMBER" },
    });
    
    (prisma.lead.findMany as jest.Mock).mockResolvedValueOnce([]);
    (prisma.lead.count as jest.Mock).mockResolvedValueOnce(0);

    const req = new NextRequest("http://localhost/api/leads");
    const response = await GET(req);

    expect(response.status).toBe(200);
    expect(prisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { assignedToId: "member-id" }, // Restricted to MEMBER's id
      })
    );
  });
});
