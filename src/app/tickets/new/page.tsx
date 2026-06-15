import DashboardShell from "@/components/layout/DashboardShell";
import CreateTicketForm from "@/components/tickets/CreateTicketForm";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function NewTicketPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [categories, departments, agents] = await Promise.all([
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
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
          New Ticket
        </p>
        <h1 className="mt-2 text-3xl font-bold">Create Support Ticket</h1>
        <p className="mt-2 text-slate-400">
          Raise a new internal support request and assign it to a support agent.
        </p>
      </div>

      <CreateTicketForm
        categories={categories}
        departments={departments}
        agents={agents}
      />
    </DashboardShell>
  );
}