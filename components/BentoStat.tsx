import { type ReactNode } from "react";

interface BentoStatProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; direction: "up" | "down" };
}

export function BentoStat({ label, value, icon, trend }: BentoStatProps) {
  return (
    <div className="bg-panel border border-border rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-zinc-500 text-sm font-normal">{label}</span>
        <span className="text-zinc-600">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-medium text-white">{value}</span>
        {trend && (
          <span
            className={`text-xs font-medium mb-1 ${
              trend.direction === "up" ? "text-success" : "text-danger"
            }`}
          >
            {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}
