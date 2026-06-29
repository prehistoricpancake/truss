import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStreams } from "@/lib/db";
import Link from "next/link";
import { IconBroadcast, IconPlugConnected } from "@tabler/icons-react";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

function duration(startedAt: string, endedAt?: string) {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  const mins = Math.round((end - start) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default async function StreamsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const streams = await getStreams(session.user.id);
  const sorted = [...streams].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <IconBroadcast size={20} stroke={1.5} className="text-zinc-400" />
          <h1 className="text-xl font-medium text-white">Streams</h1>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-800 rounded-xl">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 flex items-center justify-center mb-4">
            <IconBroadcast size={26} stroke={1.5} className="text-zinc-600" />
          </div>
          <p className="text-sm font-medium text-zinc-400 mb-1">No streams yet</p>
          <p className="text-xs text-zinc-600 mb-6 max-w-xs">
            Connect Twitch or YouTube Live to start ingesting live streams and detecting engagement spikes.
          </p>
          <Link
            href="/connect"
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <IconPlugConnected size={15} stroke={1.5} />
            Connect a platform
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((stream) => (
            <div key={stream.streamId} className="bg-panel border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {stream.status === "live" && (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-danger/10 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                      <span className="text-[10px] font-medium text-danger uppercase">Live</span>
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white capitalize">{stream.platform} stream</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Started {formatDate(stream.startedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-zinc-400">
                  <div className="text-center">
                    <p className="text-white font-medium">{duration(stream.startedAt, stream.endedAt)}</p>
                    <p className="text-[10px] text-zinc-600">duration</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      stream.status === "live"
                        ? "bg-danger/10 text-danger"
                        : stream.status === "processing"
                        ? "bg-warning/10 text-warning"
                        : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {stream.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
