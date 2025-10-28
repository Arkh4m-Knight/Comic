"use client";
import { useEffect, useState } from "react";
import LightNovelForm from "@/src/components/LightNovelForm";

interface LightNovel {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  synopsis?: string;
  createdAt: string;
}

export default function LightNovelsPage() {
  const [items, setItems] = useState<LightNovel[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/light-novels", { cache: "no-store" });
    const data: LightNovel[] = await res.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Light Novels</h1>
      <LightNovelForm onCreated={load} />
      {loading ? (
        <p className="text-neutral-400">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((ln) => (
            <div key={ln.id} className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
              {ln.coverUrl ? (
                <img src={ln.coverUrl} alt={ln.title} className="aspect-[3/4] w-full object-cover" />
              ) : (
                <div className="aspect-[3/4] bg-neutral-800" />
              )}
              <div className="p-3">
                <p className="font-semibold">{ln.title}</p>
                <p className="text-xs text-neutral-400">by {ln.author}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




