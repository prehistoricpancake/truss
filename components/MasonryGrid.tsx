import { ClipTile } from "./ClipTile";

interface GridClip {
  id: string;
  viralityScore: number;
  thumbnailUrl?: string;
  videoSrc?: string;
  span?: 1 | 2;
}

interface MasonryGridProps {
  clips: GridClip[];
  columns?: number;
  showScores?: boolean;
}

export function MasonryGrid({ clips, columns = 5, showScores = true }: MasonryGridProps) {
  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridAutoRows: "160px",
      }}
    >
      {clips.map((clip) => (
        <ClipTile
          key={clip.id}
          viralityScore={clip.viralityScore}
          thumbnailUrl={clip.thumbnailUrl}
          videoSrc={clip.videoSrc}
          span={clip.span}
          showScore={showScores}
        />
      ))}
    </div>
  );
}
