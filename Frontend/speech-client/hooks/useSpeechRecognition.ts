import { useCallback, useEffect, useRef, useState } from "react";

export interface STTResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface UseSpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  onFinalResult?: (result: STTResult) => void;
}

export function useSpeechRecognition({
  language = "en-US",
  continuous = true,
  onFinalResult,
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening]   = useState(false);
  const [interimText, setInterimText]   = useState("");
  const [error, setError]               = useState<string | null>(null);
  const [isSupported, setIsSupported]   = useState(false);
  const recognitionRef                  = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Access via window object — covered by speech.d.ts Window interface extension
    const SpeechRecognitionAPI =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous      = continuous;
    recognition.interimResults  = true;
    recognition.lang            = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setError(e.error);
      setIsListening(false);
    };

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          onFinalResult?.({
            transcript: result[0].transcript.trim(),
            confidence: result[0].confidence,
            isFinal: true,
          });
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimText(interim);
    };

    recognitionRef.current = recognition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, continuous]);

  const start = useCallback(() => {
    recognitionRef.current?.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { isListening, interimText, error, isSupported, start, stop };
}