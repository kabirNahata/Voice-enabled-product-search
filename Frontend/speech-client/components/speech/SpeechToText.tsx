"use client";

import { useState, useCallback } from "react";
import { Mic, MicOff, Save, Trash2, Loader2 } from "lucide-react";
import { useSpeechRecognition, STTResult } from "@/hooks/useSpeechRecognition";
import { CreateTranscriptRequest, Transcript } from "@/types";

interface Props {
  sessionId: string;
  onSave: (request: CreateTranscriptRequest) => Promise<Transcript>;
}

interface PendingResult {
  transcript: string;
  confidence: number;
}

export default function SpeechToText({ sessionId, onSave }: Props) {
  const [pendingResults, setPendingResults] = useState<PendingResult[]>([]);
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [savedCount, setSavedCount] = useState(0);

  const handleFinalResult = useCallback((result: STTResult) => {
    setPendingResults((prev) => [
      ...prev,
      {
        transcript: result.transcript,
        confidence: result.confidence,
      },
    ]);
  }, []);

  const { isListening, interimText, error, isSupported, start, stop } =
    useSpeechRecognition({ language, onFinalResult: handleFinalResult });

  const handleSaveAll = async () => {
    if (pendingResults.length === 0 || saving) return; // ← guard
    setSaving(true);
    const snapshot = [...pendingResults]; // ← capture before clearing
    setPendingResults([]); // ← clear immediately (prevents re-click saving same data)
    try {
      for (const result of snapshot) {
        const saved = await onSave({
          sessionId,
          text: result.transcript,
          type: "stt",
          language,
          confidence: result.confidence,
        });
        setSavedCount((c) => c + 1);
      }
    } catch (err) {
      // restore pending results if save failed
      setPendingResults(snapshot);
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 text-yellow-300 text-sm">
        ⚠️ Web Speech API is not supported in this browser. Try Chrome or Edge.
      </div>
    );
  }

  const fullText = pendingResults.map((r) => r.transcript).join(" ");
  const avgConfidence =
    pendingResults.length > 0
      ? pendingResults.reduce((acc, r) => acc + r.confidence, 0) /
        pendingResults.length
      : null;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="text-blue-400 w-5 h-5" />
          <h2 className="font-semibold text-lg">Speech to Text</h2>
        </div>
        {savedCount > 0 && (
          <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
            {savedCount} saved
          </span>
        )}
      </div>

      {/* Language Selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-400 w-20">Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isListening}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
        >
          <option value="en-US">English (US)</option>
          <option value="en-GB">English (UK)</option>
          <option value="es-ES">Spanish</option>
          <option value="fr-FR">French</option>
          <option value="de-DE">German</option>
          <option value="ja-JP">Japanese</option>
          <option value="zh-CN">Chinese (Simplified)</option>
        </select>
      </div>

      {/* Transcript Box */}
      <div className="min-h-32 bg-gray-900 rounded-lg p-4 text-sm leading-relaxed border border-gray-700">
        {fullText ? (
          <span className="text-gray-100">{fullText} </span>
        ) : !isListening ? (
          <span className="text-gray-500">
            Press Start and begin speaking...
          </span>
        ) : null}
        {interimText && (
          <span className="text-gray-400 italic">{interimText}</span>
        )}
        {isListening && !interimText && !fullText && (
          <span className="text-blue-400 animate-pulse">Listening...</span>
        )}
      </div>

      {/* Confidence */}
      {avgConfidence !== null && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Avg confidence:</span>
          <div className="flex-1 bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all"
              style={{ width: `${avgConfidence * 100}%` }}
            />
          </div>
          <span>{(avgConfidence * 100).toFixed(0)}%</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm bg-red-900/20 px-3 py-2 rounded-lg">
          Error: {error}
        </p>
      )}

      {/* Controls */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={isListening ? stop : start}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            isListening
              ? "bg-red-600 hover:bg-red-500"
              : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" /> Stop
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" /> Start
            </>
          )}
        </button>

        <button
          onClick={handleSaveAll}
          disabled={saving || pendingResults.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-700 hover:bg-green-600 disabled:opacity-40 transition"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save ({pendingResults.length})
        </button>

        <button
          onClick={() => setPendingResults([])}
          disabled={pendingResults.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 disabled:opacity-40 transition"
        >
          <Trash2 className="w-4 h-4" /> Clear
        </button>
      </div>
    </div>
  );
}
