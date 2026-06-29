import Image from "next/image";
import { WarpedHero } from "@/components/WarpedHero";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-cinematic flex">
      {/* Form side panel */}
      <div className="w-1/2 bg-panel-auth flex flex-col justify-center px-12 py-12 border-r border-border-auth z-10">
        <div className="flex items-center gap-2 mb-10">
          <Image src="/logos/2.png" alt="Truss" width={28} height={28} className="rounded" />
          <span className="text-lg font-semibold text-white tracking-tight">truss</span>
        </div>
        {children}
      </div>

      {/* Warped hero background */}
      <div className="w-1/2 relative overflow-hidden">
        <WarpedHero hideCta />
      </div>
    </div>
  );
}
