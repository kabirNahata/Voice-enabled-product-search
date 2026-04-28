import { useCallback, useEffect, useState } from "react";
import { Session } from "@/types";
import { sessionService } from "@/services/sessionService";

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await sessionService.getAll();
      setSessions(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load sessions.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const createSession = useCallback(async (name: string): Promise<Session> => {
    const session = await sessionService.create({ name });
    setSessions((prev) => [session, ...prev]);
    return session;
  }, []);

  const deleteSession = useCallback(async (id: string): Promise<void> => {
    await sessionService.delete(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    sessions,
    loading,
    error,
    createSession,
    deleteSession,
    refetch: fetchSessions,
  };
}