import Image from "next/image";

interface CinematicSceneProps {
  src?: string;
  alt?: string;
  shotTitle?: string;
}

// SIMULATED: Scene imagery uses a hand-built SVG placeholder (dune-walker.svg).
// Before shipping, replace with real generated stills or short loops
// (image-gen API or licensed footage).
export function CinematicScene({
  src = "/scenes/dune-walker.svg",
  alt = "Cinematic scene",
  shotTitle = "Dune Walker",
}: CinematicSceneProps) {
  return (
    <div className="relative flex-1 min-h-[480px] rounded-2xl overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority
      />

      {/* Shot-title caption pill */}
      <div className="absolute bottom-4 right-4 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-zinc-300 border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          {shotTitle}
        </span>
      </div>

      {/* Warm vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%), linear-gradient(to right, rgba(0,0,0,0.2) 0%, transparent 30%)",
        }}
      />
    </div>
  );
}
