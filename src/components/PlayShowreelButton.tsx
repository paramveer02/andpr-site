type PlayShowreelButtonProps = {
  label?: string;
};

export default function PlayShowreelButton({
  label = "Play Showreel",
}: PlayShowreelButtonProps) {
  return (
    <button
      type="button"
      data-cursor="play"
      className="group relative grid h-24 w-24 place-items-center rounded-full bg-brand-white text-brand-navy shadow-[0_24px_50px_rgba(0,0,0,0.28)] ring-1 ring-black/8 transition-transform duration-300 hover:scale-[1.03] active:scale-[0.99] lg:h-28 lg:w-28"
      aria-label={label}
    >
      <span className="absolute inset-0 rounded-full ring-1 ring-brand-gold/18 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  );
}
