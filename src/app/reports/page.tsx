import DashboardShell from "@/components/layout/DashboardShell";
import ReportsCharts from "@/components/reports/ReportsCharts";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    redirect("/dashboard");
  }

  const [
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    urgentTickets,
    statusGroups,
    priorityGroups,
    categories,
    agents,
  ] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: "OPEN" } }),
    prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
    prisma.ticket.count({ where: { status: "RESOLVED" } }),
    prisma.ticket.count({ where: { status: "CLOSED" } }),
    prisma.ticket.count({ where: { priority: "URGENT" } }),

    prisma.ticket.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    }),

    prisma.ticket.groupBy({
      by: ["priority"],
      _count: {
        id: true,
      },
    }),

    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        tickets: true,
      },
    }),

    prisma.user.findMany({
      where: {
        role: "AGENT",
      },
      select: {
        id: true,
        name: true,
        assignedTickets: {
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const statusData = statusGroups.map((item) => ({
    name: item.status.replaceAll("_", " "),
    value: item._count.id,
  }));

  const priorityData = priorityGroups.map((item) => ({
    name: item.priority,
    value: item._count.id,
  }));

  const categoryData = categories.map((category) => ({
    name: category.name,
    value: category.tickets.length,
  }));

  const agentPerformance = agents.map((agent) => ({
    name: agent.name,
    assigned: agent.assignedTickets.length,
    resolved: agent.assignedTickets.filter(
      (ticket) => ticket.status === "RESOLVED"
    ).length,
  }));

  return (
    <DashboardShell user={user}>
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
          Reports
        </p>
        <h1 className="mt-2 text-3xl font-bold">Analytics & Reports</h1>
        <p className="mt-2 text-slate-400">
          Analyze ticket workload, priority distribution, category trends, and
          support agent performance.
        </p>
      </div>

      <div className="mb-8 grid gap-5 md:grid-cols-3 xl:grid-cols-6">
        <ReportCard label="Total Tickets" value={totalTickets} />
        <ReportCard label="Open" value={openTickets} />
        <ReportCard label="In Progress" value={inProgressTickets} />
        <ReportCard label="Resolved" value={resolvedTickets} />
        <ReportCard label="Closed" value={closedTickets} />
        <ReportCard label="Urgent" value={urgentTickets} />
      </div>

      <ReportsCharts
        statusData={statusData}
        priorityData={priorityData}
        categoryData={categoryData}
        agentPerformance={agentPerformance}
      />
    </DashboardShell>
  );
}

function ReportCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <h2 className="mt-3 text-3xl font-bold">{value}</h2>
    </div>
  );
}