export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly T[];
  active: T;
  onChange: (tab: T) => void;
}) {
  return (
    <div role="tablist" className="flex flex-wrap gap-x-6 border-b border-rule">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={tab === active}
          onClick={() => onChange(tab)}
          className={`-mb-px border-b-2 pb-1.5 text-[11px] uppercase tracking-[0.2em] ${
            tab === active
              ? "border-foreground font-bold text-foreground"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
