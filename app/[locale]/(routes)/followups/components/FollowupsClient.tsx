"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createFollowup, completeFollowup } from "@/actions/followups/actions";
import { CalendarDays, Clock, CheckCircle2, AlertCircle, Plus, Calendar, Mail, Phone, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface ClientFollowup {
  id: string;
  leadId: string;
  assignedUser: string;
  followupDate: Date;
  note: string;
  status: string;
  createdAt: Date;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
}

interface ClientLead {
  id: string;
  name: string;
}

interface FollowupsClientProps {
  initialFollowups: ClientFollowup[];
  leads: ClientLead[];
}

export function FollowupsClient({ initialFollowups, leads }: FollowupsClientProps) {
  const [followups, setFollowups] = useState<ClientFollowup[]>(initialFollowups);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [followupDate, setFollowupDate] = useState("");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !followupDate) {
      toast.error("Please select a lead and date");
      return;
    }

    startTransition(async () => {
      const res = await createFollowup(selectedLeadId, new Date(followupDate), note);
      if (res.success && res.followup) {
        toast.success("Follow-up scheduled successfully");
        const leadObj = leads.find((l) => l.id === selectedLeadId);
        
        const newFollowup: ClientFollowup = {
          id: res.followup.id,
          leadId: res.followup.leadId,
          assignedUser: res.followup.assignedUser,
          followupDate: res.followup.followupDate,
          note: res.followup.note ?? "",
          status: res.followup.status,
          createdAt: res.followup.createdAt,
          leadName: leadObj ? leadObj.name : "Unknown Lead",
          leadEmail: "",
          leadPhone: "",
        };

        setFollowups((prev) => [newFollowup, ...prev]);
        setSelectedLeadId("");
        setFollowupDate("");
        setNote("");
      } else {
        toast.error(res.error || "Failed to schedule follow-up");
      }
    });
  };

  const handleComplete = async (id: string) => {
    const res = await completeFollowup(id);
    if (res.success) {
      toast.success("Follow-up marked as completed");
      setFollowups((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "completed" } : f))
      );
    } else {
      toast.error(res.error || "Failed to complete follow-up");
    }
  };

  // Helper to categorize follow-ups
  const now = new Date();
  const isOverdue = (f: ClientFollowup) => new Date(f.followupDate) < now && f.status === "pending";
  const isToday = (f: ClientFollowup) => {
    const d = new Date(f.followupDate);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear() &&
      f.status === "pending"
    );
  };
  const isUpcoming = (f: ClientFollowup) => new Date(f.followupDate) > now && !isToday(f) && f.status === "pending";

  const overdueList = followups.filter(isOverdue);
  const todayList = followups.filter(isToday);
  const upcomingList = followups.filter(isUpcoming);
  const completedList = followups.filter((f) => f.status === "completed");

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-4 mt-6">
      {/* Sidebar Scheduler */}
      <div className="lg:col-span-1">
        <Card className="shadow-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Schedule Follow-up
            </CardTitle>
            <CardDescription>Set follow-up date and agenda for a lead</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Select Lead
                </label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full text-sm border rounded-md p-2 bg-background border-input"
                  required
                >
                  <option value="">-- Choose Lead --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Date and Time
                </label>
                <input
                  type="datetime-local"
                  value={followupDate}
                  onChange={(e) => setFormDateSafe(e.target.value)}
                  className="w-full text-sm border rounded-md p-2 bg-background border-input"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Note / Agenda
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="E.g., Call to discuss subscription pricing proposal..."
                  rows={3}
                  className="text-sm"
                />
              </div>

              <Button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" />
                {isPending ? "Scheduling..." : "Schedule"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Main Workspace */}
      <div className="lg:col-span-3">
        <Tabs defaultValue="pending" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid grid-cols-2 w-[220px]">
              <TabsTrigger value="pending" className="text-xs">Active</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
            </TabsList>
            <Badge variant="outline" className="text-xs">
              {overdueList.length + todayList.length + upcomingList.length} Active / {completedList.length} Completed
            </Badge>
          </div>

          <TabsContent value="pending" className="space-y-4">
            {/* Overdue Section */}
            {overdueList.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  Overdue ({overdueList.length})
                </h3>
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                  {overdueList.map((f) => (
                    <FollowupCard key={f.id} followup={f} onComplete={handleComplete} formatDate={formatDate} isOverdue />
                  ))}
                </div>
              </div>
            )}

            {/* Today Section */}
            {todayList.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Due Today ({todayList.length})
                </h3>
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                  {todayList.map((f) => (
                    <FollowupCard key={f.id} followup={f} onComplete={handleComplete} formatDate={formatDate} isToday />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Section */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                Upcoming ({upcomingList.length})
              </h3>
              {upcomingList.length === 0 && overdueList.length === 0 && todayList.length === 0 ? (
                <div className="text-center py-10 border rounded-lg border-dashed">
                  <p className="text-sm text-muted-foreground">No pending follow-ups scheduled.</p>
                </div>
              ) : (
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                  {upcomingList.map((f) => (
                    <FollowupCard key={f.id} followup={f} onComplete={handleComplete} formatDate={formatDate} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            {completedList.length === 0 ? (
              <div className="text-center py-10 border rounded-lg border-dashed">
                <p className="text-sm text-muted-foreground">No completed follow-ups yet.</p>
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                {completedList.map((f) => (
                  <FollowupCard key={f.id} followup={f} formatDate={formatDate} isCompleted />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  function setFormDateSafe(val: string) {
    setFollowupDate(val);
  }
}

function FollowupCard({
  followup,
  onComplete,
  formatDate,
  isOverdue = false,
  isToday = false,
  isCompleted = false,
}: {
  followup: ClientFollowup;
  onComplete?: (id: string) => void;
  formatDate: (d: Date) => string;
  isOverdue?: boolean;
  isToday?: boolean;
  isCompleted?: boolean;
}) {
  return (
    <Card className={`shadow-sm border transition-all duration-200 hover:shadow-md ${
      isOverdue ? "border-red-500/20 bg-red-500/[0.02]" :
      isToday ? "border-amber-500/20 bg-amber-500/[0.02]" :
      "border-primary/5"
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-bold truncate max-w-[150px]">
                {followup.leadName}
              </CardTitle>
              <Link href={`/crm/leads/${followup.leadId}`} target="_blank">
                <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
              </Link>
            </div>
            <CardDescription className="text-xs mt-0.5">
              {formatDate(followup.followupDate)}
            </CardDescription>
          </div>
          <div>
            {isOverdue && <Badge variant="destructive" className="text-[10px] py-0">Overdue</Badge>}
            {isToday && <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] py-0">Today</Badge>}
            {isCompleted && <Badge variant="secondary" className="text-[10px] py-0 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10">Completed</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {followup.note && (
          <p className="text-xs text-muted-foreground bg-secondary/30 p-2 rounded leading-relaxed">
            {followup.note}
          </p>
        )}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-secondary/50">
          <div className="flex items-center gap-1.5">
            {followup.leadPhone && (
              <a href={`tel:${followup.leadPhone}`} className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-3.5 w-3.5" />
              </a>
            )}
            {followup.leadEmail && (
              <a href={`mailto:${followup.leadEmail}`} className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          {!isCompleted && onComplete && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onComplete(followup.id)}
              className="h-7 text-[11px] font-semibold border-emerald-500/25 hover:border-emerald-500 text-emerald-500 hover:bg-emerald-500/5 gap-1"
            >
              <CheckCircle2 className="h-3 w-3" />
              Mark Done
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
