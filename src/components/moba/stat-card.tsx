'use client';

/**
 * StatCard — Compact stat display with icon, value, and subtitle.
 * Used in Meta Overview section of TierListTab.
 */

export function StatCard({ label, value, sub, color, icon }: {
  label: string;
  value: string;
  sub: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg px-3 py-2.5 flex flex-col gap-0.5"
      style={{
        background: `linear-gradient(135deg, ${color}08, transparent)`,
        border: `1px solid ${color}18`,
      }}
    >
      <div className="flex items-center gap-1.5">
        <div style={{ color }} className="opacity-60">{icon}</div>
        <span className="lol-label text-[10px] text-lol-dim">{label}</span>
      </div>
      <span className="text-base font-bold font-mono" style={{ color }}>{value}</span>
      <span className="text-[10px] text-lol-muted truncate">{sub}</span>
    </div>
  );
}
