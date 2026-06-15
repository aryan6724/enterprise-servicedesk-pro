import DashboardShell from "@/components/layout/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function CategoriesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    redirect("/dashboard");
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      tickets: true,
    },
  });

  return (
    <DashboardShell user={user}>
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
          Categories
        </p>
        <h1 className="mt-2 text-3xl font-bold">Category Management</h1>
        <p className="mt-2 text-slate-400">
          View support categories and track how many tickets belong to each type.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold">All Categories</h2>
          <p className="mt-1 text-sm text-slate-400">
            Total {categories.length} category(s) found.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-4 py-3">Category Name</th>
                <th className="px-4 py-3">Tickets</th>
                <th className="px-4 py-3">Created At</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {categories.map((category) => (
                <tr key={category.id} className="bg-slate-950/40">
                  <td className="px-4 py-4 font-medium text-white">
                    {category.name}
                  </td>

                  <td className="px-4 py-4 text-slate-300">
                    {category.tickets.length}
                  </td>

                  <td className="px-4 py-4 text-slate-400">
                    {formatDate(category.createdAt)}
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    No categories found.
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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}