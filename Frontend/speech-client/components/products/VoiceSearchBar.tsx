"use client";

import { Mic, MicOff, Loader2, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { VoiceSearchResponse } from "@/types";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";

interface Props {
  onResult: (response: VoiceSearchResponse) => void;
  onClear: () => void;
}

export default function VoiceSearchBar({ onResult, onClear }: Props) {
  const [showParsed, setShowParsed] = useState(false);

  const {
    isListening,
    searching,
    interimText,
    isSupported,
    lastTranscript,
    parsedFilter,
    start,
    stop,
    clearSearch,
  } = useVoiceSearch({ onResult });

  const handleClear = () => {
    clearSearch();
    onClear();
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 text-yellow-300 text-sm">
        ⚠️ Voice search requires Chrome or Edge.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main bar */}
      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
        isListening
          ? "border-blue-500 bg-blue-950/30"
          : "border-gray-700 bg-gray-800"
      }`}>
        {/* Mic button */}
        <button
          onClick={isListening ? stop : start}
          disabled={searching}
          className={`shrink-0 p-2 rounded-full transition ${
            isListening
              ? "bg-red-600 hover:bg-red-500 animate-pulse"
              : "bg-blue-600 hover:bg-blue-500"
          } disabled:opacity-40`}
        >
          {searching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Status text */}
        <div className="flex-1 min-w-0">
          {isListening && !interimText && (
            <p className="text-blue-400 text-sm animate-pulse">Listening... speak now</p>
          )}
          {isListening && interimText && (
            <p className="text-gray-300 text-sm italic truncate">{interimText}</p>
          )}
          {searching && (
            <p className="text-gray-400 text-sm">Searching for &quot;{lastTranscript}&quot;...</p>
          )}
          {!isListening && !searching && lastTranscript && (
            <p className="text-gray-300 text-sm truncate">
              🔍 &quot;{lastTranscript}&quot;
            </p>
          )}
          {!isListening && !searching && !lastTranscript && (
            <p className="text-gray-500 text-sm">
              Press mic and say something like &quot;show me electronics under 500&quot;
            </p>
          )}
        </div>

        {/* Clear */}
        {lastTranscript && !isListening && (
          <button
            onClick={handleClear}
            className="shrink-0 text-gray-500 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Parsed filter debug panel */}
      {parsedFilter && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowParsed((s) => !s)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-400 hover:text-white transition"
          >
            <span>🧠 How your search was understood</span>
            {showParsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showParsed && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {parsedFilter.query && (
                <FilterBadge label="Query" value={parsedFilter.query} color="blue" />
              )}
              {parsedFilter.category && (
                <FilterBadge label="Category" value={parsedFilter.category} color="purple" />
              )}
              {parsedFilter.brand && (
                <FilterBadge label="Brand" value={parsedFilter.brand} color="orange" />
              )}
              {parsedFilter.minPrice !== undefined && (
                <FilterBadge label="Min $" value={`$${parsedFilter.minPrice}`} color="green" />
              )}
              {parsedFilter.maxPrice !== undefined && (
                <FilterBadge label="Max $" value={`$${parsedFilter.maxPrice}`} color="green" />
              )}
              {parsedFilter.minRating !== undefined && (
                <FilterBadge label="Rating" value={`${parsedFilter.minRating}★+`} color="yellow" />
              )}
              {parsedFilter.inStockOnly && (
                <FilterBadge label="Stock" value="In stock only" color="teal" />
              )}
              {parsedFilter.sortBy && (
                <FilterBadge label="Sort" value={parsedFilter.sortBy} color="gray" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Example queries */}
      {!lastTranscript && !isListening && (
        <div className="flex flex-wrap gap-2">
          {[
            "show me electronics under 500",
            "find Nike shoes in stock",
            "best rated laptops",
            "furniture between 100 and 300",
          ].map((example) => (
            <span
              key={example}
              className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-3 py-1 rounded-full"
            >
              &quot;{example}&quot;
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue:   "bg-blue-900/50 text-blue-300 border-blue-800",
    purple: "bg-purple-900/50 text-purple-300 border-purple-800",
    orange: "bg-orange-900/50 text-orange-300 border-orange-800",
    green:  "bg-green-900/50 text-green-300 border-green-800",
    yellow: "bg-yellow-900/50 text-yellow-300 border-yellow-800",
    teal:   "bg-teal-900/50 text-teal-300 border-teal-800",
    gray:   "bg-gray-800 text-gray-300 border-gray-700",
  };

  return (
    <span className={`text-xs border px-2 py-1 rounded-full ${colors[color]}`}>
      <span className="opacity-60">{label}: </span>{value}
    </span>
  );
}