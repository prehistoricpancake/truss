"use client";

import { useState, useRef } from "react";
import { IconUpload, IconFile, IconCheck } from "@tabler/icons-react";
import { SimulatedBadge } from "@/components/SimulatedBadge";

type UploadState = "idle" | "uploading" | "analyzing" | "complete";

interface AnalysisResult {
  highlights: Array<{
    start_offset: number;
    end_offset: number;
    title: string;
    viralityScore: number;
  }>;
}

// SIMULATED: Sample transcript for the demo simulator
const SAMPLE_TRANSCRIPT = `
[00:00] Welcome back everyone to another stream!
[00:15] Today we're going to attempt a speedrun.
[00:45] Chat is already going wild, I love it.
[01:30] OH WAIT — did you see that? That was insane!
[02:00] Let me try that again, I think we can do it faster.
[02:45] YES! New personal best! Let's go!
[03:15] Thanks for the donation storm, you guys are amazing.
[03:45] Alright let's keep the momentum going.
[04:30] This next section is the hardest part...
[05:00] WE DID IT! That's a world record pace!
`;

const SAMPLE_ENERGY_MARKERS = [
  { timestamp: 90, energy: 0.92, type: "reaction" },
  { timestamp: 165, energy: 0.88, type: "achievement" },
  { timestamp: 195, energy: 0.95, type: "donation_storm" },
  { timestamp: 300, energy: 0.97, type: "milestone" },
];

export default function UploadPage() {
  const [state, setState] = useState<UploadState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setState("idle");
      setAnalysis(null);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setState("uploading");
    setProgress(0);

    try {
      // Request presigned URL
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedFile.name,
          contentType: selectedFile.type || "video/mp4",
          userId: "demo-creator-001",
        }),
      });

      if (!res.ok) throw new Error("Failed to get upload URL");

      const { presignedUrl } = await res.json();

      // Upload to S3 via presigned URL
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => (xhr.status < 400 ? resolve() : reject(new Error("Upload failed")));
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", selectedFile.type || "video/mp4");
        xhr.send(selectedFile);
      });

      setState("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setState("idle");
    }
  };

  const handleDemoSimulator = async () => {
    setState("analyzing");
    setError("");

    try {
      // Real LLM call with mocked transcript input
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: SAMPLE_TRANSCRIPT,
          energyMarkers: SAMPLE_ENERGY_MARKERS,
        }),
      });

      if (!res.ok) throw new Error("Analysis failed");
      const data: AnalysisResult = await res.json();
      setAnalysis(data);
      setState("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setState("idle");
    }
  };

  return (
    <div className="min-h-screen bg-bg-product p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-medium text-white mb-6">Upload & Analyze</h1>

        {/* Upload area */}
        <div
          className="border-2 border-dashed border-border rounded-2xl p-12 text-center cursor-pointer hover:border-accent/30 transition-colors mb-6"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <IconUpload size={40} stroke={1.5} className="text-zinc-600 mx-auto mb-4" />
          <p className="text-sm text-zinc-400 mb-1">
            Drop a video file or click to browse
          </p>
          <p className="text-xs text-zinc-600">MP4, MOV, WebM up to 10 GB</p>
        </div>

        {/* Selected file */}
        {selectedFile && (
          <div className="bg-panel border border-border rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <IconFile size={20} stroke={1.5} className="text-zinc-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{selectedFile.name}</p>
                <p className="text-xs text-zinc-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              {state === "uploading" && (
                <span className="text-xs text-accent">{progress}%</span>
              )}
              {state === "complete" && (
                <IconCheck size={18} className="text-success" />
              )}
            </div>
            {state === "uploading" && (
              <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Upload button */}
        {selectedFile && state === "idle" && (
          <button
            onClick={handleUpload}
            className="w-full py-3 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors mb-4"
          >
            Upload to S3
          </button>
        )}

        {/* Demo Simulator button */}
        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-sm font-medium text-white">Demo Simulator</h2>
            <SimulatedBadge label="Mocked transcript input, real analysis" />
          </div>
          <p className="text-xs text-zinc-500 mb-4">
            Runs a real analysis on a sample transcript. The transcript input is simulated,
            but the clip extraction is real.
          </p>
          <button
            onClick={handleDemoSimulator}
            disabled={state === "analyzing"}
            className="px-4 py-2 border border-accent/30 text-accent text-sm rounded-lg hover:bg-accent/10 disabled:opacity-50 transition-colors"
          >
            {state === "analyzing" ? "Analyzing..." : "Run AI Analysis Demo"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 px-4 py-3 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger">
            {error}
          </div>
        )}

        {/* Analysis results */}
        {analysis && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-white mb-3">AI Analysis Results</h3>
            <div className="space-y-3">
              {analysis.highlights.map((h, i) => (
                <div key={i} className="bg-panel border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">{h.title}</h4>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      h.viralityScore >= 80 ? "bg-success/20 text-success" :
                      h.viralityScore >= 50 ? "bg-warning/20 text-warning" :
                      "bg-zinc-700/40 text-zinc-400"
                    }`}>
                      {h.viralityScore}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {h.start_offset}s — {h.end_offset}s
                  </p>

                  {/* SIMULATED: 9:16 clip preview */}
                  <div className="mt-3 relative aspect-[9/16] max-h-[160px] bg-zinc-900 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-white/60 ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <SimulatedBadge label="Simulated for demo" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
