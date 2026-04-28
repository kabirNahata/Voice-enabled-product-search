"use client";

import { useState, useEffect } from "react";
import {
  Volume2, VolumeX, Play, Pause, Square, Save, Loader2,
} from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { CreateTranscriptRequest, Transcript } from "@/types";

interface Props {
  sessionId: string;
  onSave: (request: CreateTranscriptRequest) => Promise<Transcript>;
}

export default function TextToSpeech({ sessionId, onSave }: Props) {
  const { voices, isSpeaking, isPaused, isSupported, speak, pause, resume, cancel } =
    useSpeechSynthesis();

  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | undefined>();
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [lastSpoken, setLastSpoken] = useState("");

  useEffect(() => {
    if (voices.length > 0 && !selectedVoice) {
      setSelectedVoice(voices[0]);
    }
  }, [voices, selectedVoice]);

  const handleSpeak = () => {
    if (!text.trim()) return;
    setLastSpoken(text);
    speak({ text, voice: selectedVoice, rate, pitch, volume });
  };

  const handleSave = async () => {
    if (!lastSpoken.trim() || saving) return;
    setSaving(true);
    const snapshot = lastSpoken;
    try {
      await onSave({
        sessionId,
        text: snapshot,
        type: "tts",
        language: selectedVoice?.lang ?? "en-US",
        confidence: undefined,
      });
      setSavedCount((c) => c + 1);
      setLastSpoken("");
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 text-yellow-300 text-sm">
        ⚠️ Speech Synthesis is not supported in this browser.
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="text-purple-400 w-5 h-5" />
          <h2 className="font-semibold text-lg">Text to Speech</h2>
        </div>
        {savedCount > 0 && (
          <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
            {savedCount} saved
          </span>
        )}
      </div>

      {/* Text Input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something to speak..."
        rows={4}
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:border-purple-500"
      />

      {/* Voice Selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-400 w-20 shrink-0">Voice</label>
        <select
          value={selectedVoice?.name ?? ""}
          onChange={(e) =>
            setSelectedVoice(voices.find((v) => v.name === e.target.value))
          }
          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500"
        >
          {voices.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </div>

      {/* Sliders */}
      {(
        [
          { label: "Rate", value: rate, setter: setRate, min: 0.5, max: 2, step: 0.1 },
          { label: "Pitch", value: pitch, setter: setPitch, min: 0, max: 2, step: 0.1 },
          { label: "Volume", value: volume, setter: setVolume, min: 0, max: 1, step: 0.1 },
        ] as const
      ).map(({ label, value, setter, min, max, step }) => (
        <div key={label} className="flex items-center gap-3">
          <label className="text-sm text-gray-400 w-20 shrink-0">{label}</label>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => setter(Number(e.target.value))}
            className="flex-1 accent-purple-500"
          />
          <span className="text-xs text-gray-400 w-8 text-right">{value.toFixed(1)}</span>
        </div>
      ))}

      {/* Controls */}
      <div className="flex gap-2 pt-1 flex-wrap">
        {!isSpeaking ? (
          <button
            onClick={handleSpeak}
            disabled={!text.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-500 disabled:opacity-40 transition"
          >
            <Play className="w-4 h-4" /> Speak
          </button>
        ) : (
          <>
            <button
              onClick={isPaused ? resume : pause}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-yellow-600 hover:bg-yellow-500 transition"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={cancel}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 transition"
            >
              <Square className="w-4 h-4" /> Stop
            </button>
          </>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !lastSpoken.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-700 hover:bg-green-600 disabled:opacity-40 transition"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>

        <button
          onClick={() => { cancel(); setText(""); setLastSpoken(""); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 transition"
        >
          <VolumeX className="w-4 h-4" /> Clear
        </button>
      </div>

      {lastSpoken && !isSpeaking && (
        <p className="text-xs text-gray-500 bg-gray-900 px-3 py-2 rounded-lg">
          💾 Ready to save: &quot;{lastSpoken.slice(0, 80)}{lastSpoken.length > 80 ? "…" : ""}&quot;
        </p>
      )}
    </div>
  );
}