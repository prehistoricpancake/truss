import { WarpedHero } from "@/components/WarpedHero";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-cinematic flex">
      {/* Form side panel */}
      <div className="w-[380px] shrink-0 bg-panel-auth flex flex-col justify-center px-10 py-12 border-r border-border-auth z-10">
        {children}
      </div>

      {/* Warped hero background */}
      <div className="flex-1 relative overflow-hidden">
        <WarpedHero />
      </div>
    </div>
  );
}
