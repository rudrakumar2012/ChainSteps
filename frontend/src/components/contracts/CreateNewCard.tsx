interface CreateNewCardProps {
  onClick: () => void;
}

export function CreateNewCard({ onClick }: CreateNewCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className="
        glass-card p-6 cursor-pointer
        border-2 border-dashed border-white/10
        hover:border-primary/30 hover:bg-primary/5
        transition-all duration-300
        flex flex-col items-center justify-center
        min-h-[200px]
      "
    >
      <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-primary text-3xl">add</span>
      </div>
      <p className="text-sm font-bold text-white mb-1">Create New Escrow</p>
      <p className="text-xs text-on-surface-variant text-center max-w-[200px]">
        Set up a milestone-based escrow contract
      </p>
    </div>
  );
}