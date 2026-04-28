"use client";

import { Mic, Volume2 } from "lucide-react";
import { useSessions } from "@/hooks/useSessions";
import CreateSession from "@/components/sessions/CreateSession";
import SessionList from "@/components/sessions/SessionList";
import { Loader2 } from "lucide-react";
import { ShoppingBag } from "lucide-react";
import Link from 'next/link';


export default function Home() {
  const { sessions, loading, createSession, deleteSession } = useSessions();

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <div className="flex justify-center gap-3 mb-4">
          <Mic className="text-blue-400 w-8 h-8" />
          <Volume2 className="text-purple-400 w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Web Speech API Tester
        </h1>
        <p className="text-gray-400 mt-2">
          Create a session to start testing STT & TTS
        </p>
        <div className="flex justify-center mt-4">
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2 rounded-lg transition"
          >
            <ShoppingBag className="w-4 h-4 text-blue-400" />
            Browse Product Store
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <CreateSession onCreate={createSession} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <SessionList sessions={sessions} onDelete={deleteSession} />
      )}
    </main>
  );
}
