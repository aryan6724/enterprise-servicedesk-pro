import DashboardShell from "@/components/layout/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      department: true,
      createdTickets: true,
      assignedTickets: true,
    },
  });

  return (
    <DashboardShell user={user}>
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
          Users
        </p>
        <h1 className="mt-2 text-3xl font-bold">User Management</h1>
        <p className="mt-2 text-slate-400">
          View employees, agents, managers, and admins in the service desk.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold">All Users</h2>
          <p className="mt-1 text-sm text-slate-400">
            Total {users.length} user(s) found.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Created Tickets</th>
                <th className="px-4 py-3">Assigned Tickets</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {users.map((appUser) => (
                <tr key={appUser.id} className="bg-slate-950/40">
                  <td className="px-4 py-4 font-medium text-white">
                    {appUser.name}
                  </td>

                  <td className="px-4 py-4 text-slate-300">
                    {appUser.email}
                  </td>

                  <td className="px-4 py-4">
                    <RoleBadge role={appUser.role} />
                  </td>

                  <td className="px-4 py-4 text-slate-300">
                    {appUser.department?.name || "Not assigned"}
                  </td>

                  <td className="px-4 py-4 text-slate-300">
                    {appUser.createdTickets.length}
                  </td>

                  <td className="px-4 py-4 text-slate-300">
                    {appUser.assignedTickets.length}
                  </td>

                  <td className="px-4 py-4 text-slate-400">
                    {formatDate(appUser.createdAt)}
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

function RoleBadge({ role }: { role: string }) {
  const className =
    role === "ADMIN"
      ? "bg-blue-500/10 text-blue-300"
      : role === "MANAGER"
        ? "bg-purple-500/10 text-purple-300"
        : role === "AGENT"
          ? "bg-green-500/10 text-green-300"
          : "bg-slate-500/10 text-slate-300";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {role}
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