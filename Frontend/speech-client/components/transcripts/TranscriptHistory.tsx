"use client";

import { useState } from "react";
import { Transcript } from "@/types";
import { Mic, Volume2, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface Props {
  transcripts: Transcript[];
  onDelete: (id: string) => Promise<void>;
}

export default function TranscriptHistory({ transcripts, onDelete }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "stt" | "tts">("all");

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = transcripts.filter(
    (t) => filter === "all" || t.type === filter
  );

  const sttCount = transcripts.filter((t) => t.type === "stt").length;
  const ttsCount = transcripts.filter((t) => t.type === "tts").length;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer"
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-lg">History</h2>
          <div className="flex gap-2">
            <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">
              {sttCount} STT
            </span>
            <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded-full">
              {ttsCount} TTS
            </span>
          </div>
        </div>
        {collapsed
          ? <ChevronDown className="w-4 h-4 text-gray-400" />
          : <ChevronUp className="w-4 h-4 text-gray-400" />}
      </div>

      {!collapsed && (
        <div className="px-6 pb-6 space-y-4">
          <div className="flex gap-1 bg-gray-900 p-1 rounded-lg w-fit">
            {(["all", "stt", "tts"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  filter === f ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">
              No {filter === "all" ? "" : filter.toUpperCase() + " "}entries yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {[...filtered].reverse().map((t) => (
                <li key={t.id} className="flex items-start gap-3 bg-gray-900 rounded-lg px-4 py-3">
                  <div className="mt-0.5 shrink-0">
                    {t.type === "stt"
                      ? <Mic className="w-4 h-4 text-blue-400" />
                      : <Volume2 className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed break-words">{t.text}</p>
                    <div className="flex gap-3 mt-1.5 text-xs text-gray-500">
                      <span>{new Date(t.createdAt).toLocaleTimeString()}</span>
                      {t.language && <span>{t.language}</span>}
                      {t.confidence != null && (
                        <span>{(t.confidence * 100).toFixed(0)}% confidence</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deletingId === t.id}
                    className="text-gray-600 hover:text-red-400 transition shrink-0 mt-0.5 disabled:opacity-40"
                  >
                    {deletingId === t.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}