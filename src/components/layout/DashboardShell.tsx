import LogoutButton from "./LogoutButton";
import SidebarNav from "./SidebarNav";
import { CurrentUser } from "@/lib/auth";

type DashboardShellProps = {
  user: CurrentUser;
  children: React.ReactNode;
};

export default function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-white/10 bg-slate-900/70 p-5 md:block">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">
              Enterprise
            </p>
            <h1 className="mt-2 text-xl font-bold">ServiceDesk Pro</h1>
          </div>

          <SidebarNav />
        </aside>

        <section className="flex-1">
          <header className="flex items-center justify-between border-b border-white/10 bg-slate-900/60 px-6 py-4">
            <div>
              <p className="text-sm text-slate-400">Logged in as</p>
              <h2 className="font-semibold">
                {user.name}{" "}
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                  {user.role}
                </span>
              </h2>
            </div>

            <LogoutButton />
          </header>

          <div className="p-6">{children}</div>
        </section>
      </div>
    </main>
  );
}