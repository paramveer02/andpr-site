type HeaderProps = {
  menuOpen?: boolean;
  onToggleMenu?: () => void;
};

export default function Header({ menuOpen = false, onToggleMenu }: HeaderProps) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-12">
        <div
          className="heroBrand pointer-events-auto select-none text-brand-white/95"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          <span className="text-lg tracking-[0.32em]">AND PR</span>
        </div>

        <button
          type="button"
          onClick={onToggleMenu}
          data-cursor="menu"
          className="pointer-events-auto text-xs uppercase tracking-[0.28em] text-brand-white/80 transition-colors duration-500 hover:text-brand-white/95"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>
    </header>
  );
}
