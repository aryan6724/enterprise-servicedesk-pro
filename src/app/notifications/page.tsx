import DashboardShell from "@/components/layout/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const notifications =
    user.role === "ADMIN" || user.role === "MANAGER"
      ? await prisma.notification.findMany({
          orderBy: {
            createdAt: "desc",
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
        })
      : await prisma.notification.findMany({
          where: {
            userId: user.id,
          },
          orderBy: {
            createdAt: "desc",
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
        });

  return (
    <DashboardShell user={user}>
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
          Notifications
        </p>
        <h1 className="mt-2 text-3xl font-bold">Notification Center</h1>
        <p className="mt-2 text-slate-400">
          View ticket assignment alerts and service desk updates.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold">All Notifications</h2>
          <p className="mt-1 text-sm text-slate-400">
            Total {notifications.length} notification(s) found.
          </p>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-2xl border border-white/10 bg-slate-950/40 p-5"
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="font-semibold text-white">
                      {notification.title}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        notification.isRead
                          ? "bg-slate-500/10 text-slate-300"
                          : "bg-blue-500/10 text-blue-300"
                      }`}
                    >
                      {notification.isRead ? "READ" : "UNREAD"}
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-slate-300">
                    {notification.message}
                  </p>

                  <p className="mt-3 text-xs text-slate-500">
                    For: {notification.user.name} • {notification.user.email} •{" "}
                    {notification.user.role}
                  </p>
                </div>

                <p className="text-sm text-slate-400">
                  {formatDateTime(notification.createdAt)}
                </p>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-8 text-center">
              <p className="text-sm text-slate-400">No notifications found.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
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