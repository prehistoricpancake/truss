interface SimulatedBadgeProps {
  label?: string;
}

// SIMULATED: This badge marks features that are mocked/simulated for demo purposes
export function SimulatedBadge({ label = "Simulated" }: SimulatedBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-warning/15 text-warning border border-warning/20">
      <span className="w-1 h-1 rounded-full bg-warning" />
      {label}
    </span>
  );
}
