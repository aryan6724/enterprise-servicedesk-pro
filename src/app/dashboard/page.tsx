import DashboardShell from "@/components/layout/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    usersCount,
    recentTickets,
  ] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: "OPEN" } }),
    prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
    prisma.ticket.count({ where: { status: "RESOLVED" } }),
    prisma.user.count(),
    prisma.ticket.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
        category: true,
      },
    }),
  ]);

  return (
    <DashboardShell user={user}>
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold">ServiceDesk Overview</h1>
        <p className="mt-2 text-slate-400">
          Monitor tickets, users, categories, and support workflow performance.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-5">
        <StatCard label="Total Tickets" value={totalTickets} />
        <StatCard label="Open" value={openTickets} />
        <StatCard label="In Progress" value={inProgressTickets} />
        <StatCard label="Resolved" value={resolvedTickets} />
        <StatCard label="Users" value={usersCount} />
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Recent Tickets</h2>
            <p className="mt-1 text-sm text-slate-400">
              Latest support requests in the system.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created By</th>
                <th className="px-4 py-3">Assigned To</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {recentTickets.map((ticket) => (
                <tr key={ticket.id} className="bg-slate-950/40">
                  <td className="px-4 py-4 font-medium text-white">
                    {ticket.title}
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {ticket.category.name}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {ticket.createdBy.name}
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {ticket.assignedTo?.name || "Unassigned"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <h2 className="mt-3 text-3xl font-bold">{value}</h2>
    </div>
  );
}