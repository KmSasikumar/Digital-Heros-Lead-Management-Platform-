"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";

export default function LeadDetailsClient({ 
  initialLead,
  users,
  userRole
}: { 
  initialLead: any;
  users: any[];
  userRole: string;
}) {
  const [lead, setLead] = useState(initialLead);
  const [noteContent, setNoteContent] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(initialLead.status);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusSaved, setStatusSaved] = useState(false);
  const router = useRouter();

  const handleStatusSave = async () => {
    if (selectedStatus === lead.status) return;
    
    setIsUpdatingStatus(true);
    setStatusSaved(false);
    
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });
      
      if (res.ok) {
        setLead({ ...lead, status: selectedStatus });
        setStatusSaved(true);
        setTimeout(() => setStatusSaved(false), 3000);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setIsSubmittingNote(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent }),
      });
      
      if (res.ok) {
        setNoteContent("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold leading-none tracking-tight font-heading">Lead Profile</h3>
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border-primary/20">
              {lead.status}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/40 p-6 rounded-xl border border-white/50">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Name</p>
              <p className="text-base font-semibold">{lead.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Email</p>
              <p className="text-base font-medium">{lead.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Company</p>
              <p className="text-base">{lead.company || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Phone</p>
              <p className="text-base">{lead.phone || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Source</p>
              <p className="text-base">{lead.source || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Value</p>
              <p className="text-base font-bold text-green-600">{lead.value ? `$${lead.value.toLocaleString()}` : "-"}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col space-y-1.5 mb-6">
            <h3 className="text-2xl font-bold leading-none tracking-tight font-heading">Notes</h3>
          </div>
          <form onSubmit={handleAddNote} className="mb-8 space-y-4">
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder=""
              className="flex min-h-[100px] w-full rounded-xl border border-input bg-white/60 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:bg-white transition-all resize-y"
            />
            <button
              type="submit"
              disabled={isSubmittingNote}
              className="btn-primary"
            >
              Add Note
            </button>
          </form>
          <div className="space-y-4">
            {lead.notes.map((note: any) => (
              <div key={note.id} className="rounded-xl border bg-white/50 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary mr-3">
                      {note.author.name ? note.author.name.charAt(0) : "?"}
                    </div>
                    <span className="font-semibold text-sm">{note.author.name || note.author.email}</span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    {new Date(note.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90 pl-11">{note.content}</p>
              </div>
            ))}
            {lead.notes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No notes yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col space-y-1.5 mb-6">
            <h3 className="text-xl font-bold leading-none tracking-tight font-heading">Status & Assignment</h3>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">Current Status</label>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={isUpdatingStatus}
                  className="input-field"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="PROPOSAL_SENT">Proposal Sent</option>
                  <option value="WON">Won</option>
                  <option value="LOST">Lost</option>
                </select>
                <button
                  onClick={handleStatusSave}
                  disabled={isUpdatingStatus || selectedStatus === lead.status}
                  className="btn-primary flex items-center px-4"
                >
                  {isUpdatingStatus ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  ) : statusSaved ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">Assigned To</label>
              <div className="flex items-center p-3 rounded-lg bg-white/50 border">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary mr-3">
                  {lead.assignedTo ? (lead.assignedTo.name ? lead.assignedTo.name.charAt(0) : "U") : "?"}
                </div>
                <div>
                  <p className="text-sm font-medium">{lead.assignedTo ? lead.assignedTo.name || lead.assignedTo.email : "Unassigned"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col space-y-1.5 mb-6">
            <h3 className="text-xl font-bold leading-none tracking-tight font-heading">Activity Log</h3>
          </div>
          <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {lead.activities.map((activity: any, index: number) => (
              <div key={activity.id} className="relative pl-6 pb-2">
                {/* Vertical line connecting timeline dots */}
                {index !== lead.activities.length - 1 && (
                  <div className="absolute left-[7px] top-2 bottom-[-1rem] w-[2px] bg-border" />
                )}
                {/* Timeline dot */}
                <div className="absolute left-0 top-1 h-[16px] w-[16px] rounded-full bg-primary/20 border-4 border-white shadow-sm ring-1 ring-primary/30" />
                
                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                  {new Date(activity.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
                <p className="text-sm font-semibold text-foreground">{activity.action.replace(/_/g, ' ')}</p>
                {activity.details && <p className="text-sm text-foreground/70 mt-1">{activity.details}</p>}
                {activity.actor && (
                  <p className="text-xs mt-2 text-muted-foreground flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mr-1.5"></span>
                    By {activity.actor.name || activity.actor.email}
                  </p>
                )}
              </div>
            ))}
            {lead.activities.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">No activity yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
