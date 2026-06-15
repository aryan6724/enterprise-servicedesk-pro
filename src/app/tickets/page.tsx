import DashboardShell from "@/components/layout/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

type TicketsPageProps = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    priority?: string;
    categoryId?: string;
    departmentId?: string;
    assignedToId?: string;
  }>;
};

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;

  const search = params.search || "";
  const status = params.status || "";
  const priority = params.priority || "";
  const categoryId = params.categoryId || "";
  const departmentId = params.departmentId || "";
  const assignedToId = params.assignedToId || "";

  const filters: Prisma.TicketWhereInput[] = [];

  if (search) {
    filters.push({
      OR: [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (status) {
    filters.push({
      status: status as Prisma.EnumTicketStatusFilter["equals"],
    });
  }

  if (priority) {
    filters.push({
      priority: priority as Prisma.EnumTicketPriorityFilter["equals"],
    });
  }

  if (categoryId) {
    filters.push({
      categoryId,
    });
  }

  if (departmentId) {
    filters.push({
      departmentId,
    });
  }

  if (assignedToId) {
    filters.push({
      assignedToId,
    });
  }

  const where: Prisma.TicketWhereInput =
    filters.length > 0
      ? {
          AND: filters,
        }
      : {};

  const [tickets, categories, departments, agents] = await Promise.all([
    prisma.ticket.findMany({
      where,
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
        department: true,
      },
    }),

    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    }),

    prisma.department.findMany({
      orderBy: {
        name: "asc",
      },
    }),

    prisma.user.findMany({
      where: {
        role: "AGENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <DashboardShell user={user}>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
            Tickets
          </p>
          <h1 className="mt-2 text-3xl font-bold">Ticket Management</h1>
          <p className="mt-2 text-slate-400">
            View, track, assign, filter, and manage all support tickets.
          </p>
        </div>

        <Link
          href="/tickets/new"
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Create Ticket
        </Link>
      </div>

      <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-5 text-xl font-bold">Search & Filters</h2>

        <form className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-slate-300">Search</label>
            <input
              name="search"
              defaultValue={search}
              placeholder="Search title or description"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Status</label>
            <select
              name="status"
              defaultValue={status}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="">All</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="REOPENED">Reopened</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Priority</label>
            <select
              name="priority"
              defaultValue={priority}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="">All</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Category</label>
            <select
              name="categoryId"
              defaultValue={categoryId}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="">All</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Department
            </label>
            <select
              name="departmentId"
              defaultValue={departmentId}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="">All</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Assigned Agent
            </label>
            <select
              name="assignedToId"
              defaultValue={assignedToId}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="">All</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-3 md:col-span-3 xl:col-span-6">
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Apply Filters
            </button>

            <Link
              href="/tickets"
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10"
            >
              Reset
            </Link>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold">All Tickets</h2>
          <p className="mt-1 text-sm text-slate-400">
            Total {tickets.length} ticket(s) found.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created By</th>
                <th className="px-4 py-3">Assigned To</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="bg-slate-950/40">
                  <td className="px-4 py-4">
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="font-medium text-white hover:text-blue-400"
                    >
                      {ticket.title}
                    </Link>
                    <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                      {ticket.description}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-slate-300">
                    {ticket.category.name}
                  </td>

                  <td className="px-4 py-4 text-slate-300">
                    {ticket.department?.name || "Not assigned"}
                  </td>

                  <td className="px-4 py-4">
                    <PriorityBadge priority={ticket.priority} />
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge status={ticket.status} />
                  </td>

                  <td className="px-4 py-4 text-slate-300">
                    {ticket.createdBy.name}
                  </td>

                  <td className="px-4 py-4 text-slate-300">
                    {ticket.assignedTo?.name || "Unassigned"}
                  </td>

                  <td className="px-4 py-4 text-slate-400">
                    {formatDate(ticket.createdAt)}
                  </td>
                </tr>
              ))}

              {tickets.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    No tickets found for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const className =
    priority === "URGENT"
      ? "bg-red-500/10 text-red-300"
      : priority === "HIGH"
        ? "bg-orange-500/10 text-orange-300"
        : priority === "MEDIUM"
          ? "bg-yellow-500/10 text-yellow-300"
          : "bg-green-500/10 text-green-300";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "OPEN"
      ? "bg-blue-500/10 text-blue-300"
      : status === "IN_PROGRESS"
        ? "bg-purple-500/10 text-purple-300"
        : status === "RESOLVED"
          ? "bg-green-500/10 text-green-300"
          : status === "CLOSED"
            ? "bg-slate-500/10 text-slate-300"
            : "bg-orange-500/10 text-orange-300";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {status}
    </span>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}