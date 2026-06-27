interface SectionHeaderProps {
  eyebrow: string;
  title: string;
}

export default function SectionHeader({ eyebrow, title }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-baseline justify-between border-b border-line pb-4">
      <div>
        <p className="mb-1 text-[11px] font-medium uppercase tracking-widest2 text-foil">
          {eyebrow}
        </p>
        <h2 className="font-display text-2xl italic text-paper">{title}</h2>
      </div>
    </div>
  );
}
