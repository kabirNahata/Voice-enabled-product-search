"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { sessionService } from "@/services/sessionService";
import { useTranscripts } from "@/hooks/useTranscripts";
import SpeechToText from "@/components/speech/SpeechToText";
import TextToSpeech from "@/components/speech/TextToSpeech";
import TranscriptHistory from "@/components/transcripts/TranscriptHistory";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Session } from "@/types";

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const { transcripts, saveTranscript, deleteTranscript } = useTranscripts(
    session?.transcripts ?? []
  );

  useEffect(() => {
    sessionService
      .getById(id)
      .then((s) => setSession(s))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-white transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">{session?.name}</h1>
          <p className="text-xs text-gray-500">
            {new Date(session?.createdAt ?? "").toLocaleString()}
          </p>
        </div>
      </div>

      <SpeechToText sessionId={id} onSave={saveTranscript} />
      <TextToSpeech sessionId={id} onSave={saveTranscript} />
      <TranscriptHistory transcripts={transcripts} onDelete={deleteTranscript} />
    </main>
  );
}