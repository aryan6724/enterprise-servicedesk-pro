import DashboardShell from "@/components/layout/DashboardShell";
import TicketActions from "@/components/tickets/TicketActions";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type TicketDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TicketDetailPage({
  params,
}: TicketDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: {
      id,
    },
    include: {
      createdBy: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
      assignedTo: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
      category: true,
      department: true,
      comments: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
      activityLogs: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
      attachments: true,
    },
  });

  if (!ticket) {
    notFound();
  }

  return (
    <DashboardShell user={user}>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
            Ticket Detail
          </p>
          <h1 className="mt-2 text-3xl font-bold">{ticket.title}</h1>
          <p className="mt-2 text-slate-400">
            Track issue details, assignment, comments, and activity timeline.
          </p>
        </div>

        <Link
          href="/tickets"
          className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
        >
          Back to Tickets
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex flex-wrap gap-3">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />

              {ticket.isEscalated && (
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                  ESCALATED
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold">Description</h2>
            <p className="mt-3 whitespace-pre-line leading-7 text-slate-300">
              {ticket.description}
            </p>
          </div>

          <TicketActions
            ticketId={ticket.id}
            currentStatus={ticket.status}
            userRole={user.role}
          />

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">Comments</h2>

            <div className="mt-5 space-y-4">
              {ticket.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        {comment.user.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {comment.user.role} • {comment.user.email}
                      </p>
                    </div>

                    <p className="text-xs text-slate-500">
                      {formatDateTime(comment.createdAt)}
                    </p>
                  </div>

                  <p className="text-sm leading-6 text-slate-300">
                    {comment.message}
                  </p>
                </div>
              ))}

              {ticket.comments.length === 0 && (
                <p className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
                  No comments yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">Activity Timeline</h2>

            <div className="mt-5 space-y-4">
              {ticket.activityLogs.map((log) => (
                <div key={log.id} className="border-l border-blue-500/40 pl-4">
                  <p className="text-sm font-semibold text-white">
                    {log.type.replaceAll("_", " ")}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">{log.message}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDateTime(log.createdAt)}
                    {log.user ? ` • ${log.user.name}` : ""}
                  </p>
                </div>
              ))}

              {ticket.activityLogs.length === 0 && (
                <p className="text-sm text-slate-400">
                  No activity logs found.
                </p>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">Ticket Info</h2>

            <div className="mt-5 space-y-4 text-sm">
              <InfoItem label="Category" value={ticket.category.name} />
              <InfoItem
                label="Department"
                value={ticket.department?.name || "Not assigned"}
              />
              <InfoItem label="Created By" value={ticket.createdBy.name} />
              <InfoItem
                label="Assigned To"
                value={ticket.assignedTo?.name || "Unassigned"}
              />
              <InfoItem
                label="Created At"
                value={formatDateTime(ticket.createdAt)}
              />
              <InfoItem
                label="Updated At"
                value={formatDateTime(ticket.updatedAt)}
              />
              <InfoItem
                label="Due Date"
                value={ticket.dueDate ? formatDate(ticket.dueDate) : "No due date"}
              />
              <InfoItem
                label="Resolved At"
                value={
                  ticket.resolvedAt
                    ? formatDateTime(ticket.resolvedAt)
                    : "Not resolved"
                }
              />
              <InfoItem
                label="Closed At"
                value={
                  ticket.closedAt ? formatDateTime(ticket.closedAt) : "Not closed"
                }
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">Attachments</h2>

            <div className="mt-5">
              {ticket.attachments.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No attachments uploaded.
                </p>
              ) : (
                <div className="space-y-3">
                  {ticket.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.fileUrl}
                      target="_blank"
                      className="block rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm text-blue-300 hover:bg-white/10"
                    >
                      {attachment.fileName}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <p className="text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-200">{value}</p>
    </div>
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
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
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
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
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

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}