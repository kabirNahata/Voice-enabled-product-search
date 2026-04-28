"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Session } from "@/types";

interface Props {
  onCreate: (name: string) => Promise<Session>;
}

export default function CreateSession({ onCreate }: Props) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await onCreate(name.trim());
      setName("");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        placeholder="Session name..."
        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
      />
      <button
        onClick={handleCreate}
        disabled={creating || !name.trim()}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition"
      >
        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Create
      </button>
    </div>
  );
}