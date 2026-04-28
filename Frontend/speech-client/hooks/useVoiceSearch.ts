import { useCallback, useState } from "react";
import { ProductSearchRequest, VoiceSearchResponse } from "@/types";
import { productService } from "@/services/productService";
import { useSpeechRecognition, STTResult } from "@/hooks/useSpeechRecognition";

interface UseVoiceSearchOptions {
  onResult: (response: VoiceSearchResponse) => void;
  onError?: (error: string) => void;
}

// Named alias avoids JSX ambiguity with generic syntax in .tsx files
type ParsedFilter = ProductSearchRequest | null;

export function useVoiceSearch({ onResult, onError }: UseVoiceSearchOptions) {
  const [searching, setSearching]       = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [parsedFilter, setParsedFilter] = useState<ParsedFilter>(null);

  const handleFinalResult = useCallback(
    async (result: STTResult): Promise<void> => {
      const transcript = result.transcript.trim();
      if (!transcript) return;

      setLastTranscript(transcript);
      setSearching(true);

      try {
        const response = await productService.voiceSearch({ transcript });
        setParsedFilter(response.parsedFilter);
        onResult(response);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Voice search failed. Please try again.";
        onError?.(message);
      } finally {
        setSearching(false);
        stop();
      }
    },
    [onResult, onError]
  );

  const { isListening, interimText, isSupported, start, stop } =
    useSpeechRecognition({
      continuous: false,
      onFinalResult: handleFinalResult,
    });

  const clearSearch = useCallback((): void => {
    setLastTranscript("");
    setParsedFilter(null);
  }, []);

  return {
    isListening,
    searching,
    interimText,
    isSupported,
    lastTranscript,
    parsedFilter,
    start,
    stop,
    clearSearch,
  };
}