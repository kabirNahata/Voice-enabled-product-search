import { useCallback, useState } from "react";
import { Transcript, CreateTranscriptRequest } from "@/types";
import { transcriptService } from "@/services/transcriptService";

export function useTranscripts(initialTranscripts: Transcript[] = []) {
  const [transcripts, setTranscripts] = useState<Transcript[]>(initialTranscripts);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveTranscript = useCallback(
    async (request: CreateTranscriptRequest): Promise<Transcript> => {
      setSaving(true);
      setError(null);
      try {
        const saved = await transcriptService.create(request);
        setTranscripts((prev) => [...prev, saved]);
        return saved;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to save transcript.";
        setError(message);
        throw new Error(message);       // ← throw typed Error, not raw variable
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const deleteTranscript = useCallback(async (id: string): Promise<void> => {
    try {
      await transcriptService.delete(id);
      setTranscripts((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete transcript.";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const addTranscript = useCallback((transcript: Transcript): void => {
    setTranscripts((prev) => [...prev, transcript]);
  }, []);

  return { transcripts, saving, error, saveTranscript, deleteTranscript, addTranscript };
}