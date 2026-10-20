/**
 * @jest-environment node
 */
// Regression tests for the cycle-2 hardening fixes: real prisma, mocked session.
import { NextRequest } from "next/server";
import React from "react";
import { renderToString } from "react-dom/server";
import { GET as getLeads } from "@/app/api/leads/route";
import { PATCH as patchLead, DELETE as deleteLead } from "@/app/api/leads/[id]/route";
import { POST as postPublic } from "@/app/api/leads/public/route";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/dashboard/DashboardClient";

jest.mock("next-auth/next", () => ({ getServerSession: jest.fn() }));

type TestSession = { user: { id: string; role: string } };
const sess = (s: TestSession | null) => (getServerSession as jest.Mock).mockResolvedValue(s);
const ADMIN: TestSession = { user: { id: "", role: "ADMIN" } };
const MEMBER: TestSession = { user: { id: "", role: "MEMBER" } };
const ids: Record<string, string> = {};

beforeAll(async () => {
  const users = await prisma.user.findMany();
  const leads = await prisma.lead.findMany();
  ids.admin = users.find((u) => u.email === "admin@test.dev")!.id;
  ids.member = users.find((u) => u.email === "member@test.dev")!.id;
  ids.leadMember = leads.find((l) => l.email === "one@x.dev")!.id;
  ids.leadNoname = leads.find((l) => l.email === "two@x.dev")!.id;
  ADMIN.user.id = ids.admin;
  MEMBER.user.id = ids.member;
});
afterAll(async () => {
  await prisma.$disconnect();
});

const patchReq = (body: Record<string, unknown>) =>
  new NextRequest("http://localhost/api/leads/x", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe("GET /api/leads hardening", () => {
  it("ignores an unknown sortBy instead of 500ing", async () => {
    sess(ADMIN);
    const res = await getLeads(new NextRequest("http://localhost/api/leads?sortBy=bogus"));
    expect(res.status).toBe(200);
  });
  it("treats page=0 and page=abc as page 1", async () => {
    sess(ADMIN);
    expect((await getLeads(new NextRequest("http://localhost/api/leads?page=0"))).status).toBe(200);
    sess(ADMIN);
    expect((await getLeads(new NextRequest("http://localhost/api/leads?page=abc"))).status).toBe(200);
  });
  it("caps limit at 100", async () => {
    sess(ADMIN);
    const res = await getLeads(new NextRequest("http://localhost/api/leads?limit=999999"));
    const data = await res.json();
    expect(data.pagination.limit).toBeLessThanOrEqual(100);
  });
});

describe("PATCH /api/leads/[id] hardening", () => {
  it("rejects an invalid status", async () => {
    sess(ADMIN);
    expect((await patchLead(patchReq({ status: "GARBAGE" }), ctx(ids.leadMember))).status).toBe(400);
  });
  it("rejects a negative value", async () => {
    sess(ADMIN);
    expect((await patchLead(patchReq({ value: -5 }), ctx(ids.leadMember))).status).toBe(400);
  });
  it("rejects an empty name", async () => {
    sess(ADMIN);
    expect((await patchLead(patchReq({ name: "" }), ctx(ids.leadMember))).status).toBe(400);
  });
  it("forbids a MEMBER from reassigning a lead", async () => {
    sess(MEMBER);
    expect((await patchLead(patchReq({ assignedToId: ids.admin }), ctx(ids.leadMember))).status).toBe(403);
  });
  it("rejects a nonexistent assignee with 400, not 500", async () => {
    sess(ADMIN);
    expect((await patchLead(patchReq({ assignedToId: "does-not-exist" }), ctx(ids.leadMember))).status).toBe(400);
  });
});

describe("DELETE /api/leads/[id] hardening", () => {
  it("returns 404 for a missing lead", async () => {
    sess(ADMIN);
    const res = await deleteLead(new NextRequest("http://localhost/api/leads/x", { method: "DELETE" }), ctx("nope-not-real"));
    expect(res.status).toBe(404);
  });
});

describe("POST /api/leads/public hardening", () => {
  it("rejects a whitespace-only name", async () => {
    const req = new NextRequest("http://localhost/api/leads/public", {
      method: "POST",
      body: JSON.stringify({ name: "   ", email: "ws@x.dev" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await postPublic(req)).status).toBe(400);
  });
  it("logs a CREATED activity for a captured lead", async () => {
    const req = new NextRequest("http://localhost/api/leads/public", {
      method: "POST",
      body: JSON.stringify({ name: "Pub Lead", email: "pub@x.dev" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await postPublic(req)).status).toBe(201);
    const lead = await prisma.lead.findFirst({ where: { email: "pub@x.dev" }, include: { activities: true } });
    expect(lead?.activities[0]?.action).toBe("CREATED");
  });
});

describe("DashboardClient", () => {
  it("renders a lead whose assignee has no name", () => {
    const lead = {
      id: ids.leadNoname,
      name: "Lead Two",
      email: "two@x.dev",
      company: null,
      status: "NEW",
      createdAt: new Date(),
      assignedTo: { id: "x", name: null, email: "noname@test.dev" },
    };
    const html = renderToString(React.createElement(DashboardClient, { initialLeads: [lead], userRole: "ADMIN" }));
    expect(html).toContain("Lead Two");
    expect(html).toContain("noname@test.dev");
  });
});
