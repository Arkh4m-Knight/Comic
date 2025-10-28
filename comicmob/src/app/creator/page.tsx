export default function CreatorDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Creator Dashboard</h1>
      <div className="rounded-xl border border-neutral-800 p-4">
        <h2 className="font-semibold">Upload New Episode</h2>
        <p className="text-sm text-neutral-400">(Mock) Drag images here or click to browse.</p>
        <div className="mt-3 h-32 rounded-md border border-dashed border-neutral-700 bg-neutral-900" />
      </div>
      <div className="rounded-xl border border-neutral-800 p-4">
        <h2 className="font-semibold">Series</h2>
        <ul className="mt-2 list-disc pl-5 text-neutral-300">
          <li>Sample Series A - 3 episodes</li>
          <li>Sample Series B - 1 episode</li>
        </ul>
      </div>
      <div className="rounded-xl border border-neutral-800 p-4">
        <h2 className="font-semibold">Analytics</h2>
        <p className="text-sm text-neutral-400">Views: 1,245 · Likes: 312 · Followers: 98</p>
      </div>
    </div>
  );
}




