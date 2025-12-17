import { useMemo, useState } from "react";

type LuxuryImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "onError"
> & {
  src: string;
  fallbackLabel?: string;
};

function makeLuxuryFallbackDataUri(label: string) {
  const safe = (label || "AND PR").toUpperCase().slice(0, 36);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1750" viewBox="0 0 1400 1750">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0F172A"/>
      <stop offset="0.58" stop-color="#111D33"/>
      <stop offset="1" stop-color="#0B1223"/>
    </linearGradient>
    <radialGradient id="r" cx="35%" cy="25%" r="85%">
      <stop offset="0" stop-color="#D4AF37" stop-opacity="0.18"/>
      <stop offset="0.55" stop-color="#D4AF37" stop-opacity="0.03"/>
      <stop offset="1" stop-color="#D4AF37" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1400" height="1750" fill="url(#g)"/>
  <rect width="1400" height="1750" fill="url(#r)"/>
  <rect x="110" y="140" width="1180" height="1470" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
  <text x="140" y="1540" fill="rgba(255,255,255,0.86)" font-family="Playfair Display, serif" font-size="58" letter-spacing="10">
    ${safe}
  </text>
  <text x="140" y="1620" fill="rgba(255,255,255,0.45)" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="20" letter-spacing="12">
    AND PR
  </text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function LuxuryImage({
  src,
  fallbackLabel = "AND PR",
  alt,
  fetchPriority,
  ...rest
}: LuxuryImageProps) {
  const [didError, setDidError] = useState(false);
  const fallbackSrc = useMemo(
    () => makeLuxuryFallbackDataUri(fallbackLabel),
    [fallbackLabel],
  );

  return (
    <img
      src={didError ? fallbackSrc : src}
      alt={alt}
      {...rest}
      // React may warn on `fetchPriority` depending on version; use lowercase attribute.
      fetchPriority={fetchPriority}
      onError={() => setDidError(true)}
    />
  );
}
