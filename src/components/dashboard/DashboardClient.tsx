"use client";

import { useState } from "react";
import Link from "next/link";

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: string;
  createdAt: string | Date;
  // User.name is nullable in the Prisma schema — rendering must tolerate it.
  assignedTo: { id: string; name: string | null; email: string } | null;
};

export default function DashboardClient({ 
  initialLeads, 
  userRole 
}: { 
  initialLeads: Lead[];
  userRole: string;
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-800 border-blue-200";
      case "CONTACTED": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "QUALIFIED": return "bg-purple-100 text-purple-800 border-purple-200";
      case "PROPOSAL_SENT": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "WON": return "bg-green-100 text-green-800 border-green-200";
      case "LOST": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-muted/30">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground">Lead</th>
              <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground">Company</th>
              <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground">Status</th>
              <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground">Assigned To</th>
              <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground">Added On</th>
              <th className="h-12 px-6 text-right align-middle font-semibold text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0 bg-white/40">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-24 text-center">
                  No leads found.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b transition-colors hover:bg-white/80 group">
                  <td className="p-6 align-middle">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{lead.name}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">{lead.email}</span>
                    </div>
                  </td>
                  <td className="p-6 align-middle text-muted-foreground">{lead.company || "-"}</td>
                  <td className="p-6 align-middle">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-6 align-middle">
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary mr-2">
                        {lead.assignedTo ? (lead.assignedTo.name?.charAt(0) ?? lead.assignedTo.email.charAt(0)) : "?"}
                      </div>
                      <span className="text-sm font-medium">
                        {lead.assignedTo ? lead.assignedTo.name || lead.assignedTo.email : "Unassigned"}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 align-middle text-muted-foreground text-sm">
                    {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="p-6 align-middle text-right">
                    <Link
                      href={`/dashboard/leads/${lead.id}`}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary h-9 px-4 py-2 group-hover:bg-primary group-hover:text-white"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
