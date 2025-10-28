import { Episode } from "@/src/types";

interface EpisodeListProps {
  episodes: Episode[];
}

export default function EpisodeList({ episodes }: EpisodeListProps) {
  return (
    <ul className="divide-y divide-neutral-800 rounded-lg border border-neutral-800">
      {episodes.map((e) => (
        <li key={e.id} className="flex items-center justify-between p-3">
          <div>
            <p className="font-medium">{e.number}. {e.title}</p>
            <p className="text-xs text-neutral-400">{new Date(e.createdAt).toLocaleDateString()}</p>
          </div>
          <a className="rounded-md border border-neutral-700 px-3 py-1 text-sm" href={`?episode=${e.id}`}>Read</a>
        </li>
      ))}
    </ul>
  );
}




