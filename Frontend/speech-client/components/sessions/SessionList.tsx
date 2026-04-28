"use client";

import { Session } from "@/types";
import { History, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Props {
  sessions: Session[];
  onDelete: (id: string) => Promise<void>;
}

export default function SessionList({ sessions, onDelete }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try { await onDelete(id); }
    finally { setDeletingId(null); }
  };

  if (sessions.length === 0) {
    return (
      <p className="text-center text-gray-500 py-12">
        No sessions yet. Create one above.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {sessions.map((s) => (
        <li
          key={s.id}
          className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
        >
          <div>
            <p className="font-medium">{s.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(s.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/session/${s.id}`}
              className="flex items-center gap-1 text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition"
            >
              <History className="w-3.5 h-3.5" /> Open
            </Link>
            <button
              onClick={() => handleDelete(s.id)}
              disabled={deletingId === s.id}
              className="text-red-400 hover:text-red-300 hover:bg-gray-700 p-1.5 rounded-lg transition disabled:opacity-40"
            >
              {deletingId === s.id
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}