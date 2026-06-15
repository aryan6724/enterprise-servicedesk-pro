"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartItem = {
  name: string;
  value: number;
};

type AgentPerformance = {
  name: string;
  assigned: number;
  resolved: number;
};

type ReportsChartsProps = {
  statusData: ChartItem[];
  priorityData: ChartItem[];
  categoryData: ChartItem[];
  agentPerformance: AgentPerformance[];
};

type TooltipPayload = {
  name?: string;
  value?: number | string;
  color?: string;
};

type CustomTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: TooltipPayload[];
};

const chartColors = [
  "#60a5fa",
  "#a78bfa",
  "#34d399",
  "#fb923c",
  "#f87171",
  "#22d3ee",
];

export default function ReportsCharts({
  statusData,
  priorityData,
  categoryData,
  agentPerformance,
}: ReportsChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartCard
        title="Tickets by Status"
        description="Current distribution of tickets across workflow stages."
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={statusData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={54}>
              {statusData.map((_, index) => (
                <Cell
                  key={index}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Tickets by Priority"
        description="Priority-wise split of all service requests."
      >
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={priorityData}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={4}
              cornerRadius={10}
            >
              {priorityData.map((_, index) => (
                <Cell
                  key={index}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{
                color: "#cbd5e1",
                fontSize: "12px",
                paddingTop: "16px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Tickets by Category"
        description="Category-wise volume of submitted tickets."
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={categoryData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={46}>
              {categoryData.map((_, index) => (
                <Cell
                  key={index}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Agent Performance"
        description="Assigned versus resolved tickets for support agents."
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={agentPerformance}
            margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{
                color: "#cbd5e1",
                fontSize: "12px",
                paddingBottom: "12px",
              }}
            />
            <Bar
              dataKey="assigned"
              name="Assigned"
              fill="#60a5fa"
              radius={[10, 10, 0, 0]}
              barSize={42}
            />
            <Bar
              dataKey="resolved"
              name="Resolved"
              fill="#34d399"
              radius={[10, 10, 0, 0]}
              barSize={42}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-6 shadow-2xl shadow-black/20">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>

        <div className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
          Live Data
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
        {children}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 shadow-xl">
      {label && <p className="mb-2 text-sm font-semibold text-white">{label}</p>}

      <div className="space-y-1">
        {payload.map((item, index) => (
          <p key={index} className="text-sm text-slate-300">
            <span
              className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color || chartColors[index] }}
            />
            {item.name || "Tickets"}:{" "}
            <span className="font-semibold text-white">{item.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}