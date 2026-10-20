import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import LeadDetailsClient from "@/components/dashboard/LeadDetailsClient";

export default async function LeadDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const { id } = await params;
  
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
    notFound();
  }

  if (session.user.role === "MEMBER" && lead.assignedToId !== session.user.id) {
    redirect("/dashboard"); // Unauthorized for this lead
  }

  // The user list (names + emails of every account) is only needed by
  // admins for assignment. Fetching it for MEMBERs shipped the whole
  // directory to any signed-in member in the page payload.
  const users =
    session.user.role === "ADMIN"
      ? await prisma.user.findMany({
          select: { id: true, name: true, email: true, role: true },
        })
      : [];

  return (
    <LeadDetailsClient 
      initialLead={lead} 
      users={users} 
      userRole={session.user.role as string} 
    />
  );
}
