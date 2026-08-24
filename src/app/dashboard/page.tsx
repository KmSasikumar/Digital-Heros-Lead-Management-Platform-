import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return null; // Handled by layout
  }

  // Fetch initial leads directly for SSR
  const where = session.user.role === "MEMBER" 
    ? { assignedToId: session.user.id } 
    : {};

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });

  return <DashboardClient initialLeads={leads} userRole={session.user.role as string} />;
}
