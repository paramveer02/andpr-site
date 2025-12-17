import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/luxury-cursor.css";

type CursorMode = "default" | "link" | "menu" | "play" | "drag" | "off";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function LuxuryCursor() {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const isCoarsePointer = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return true;
    return window.matchMedia("(pointer: coarse)").matches;
  }, []);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);

  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentDotRef = useRef({ x: 0, y: 0 });
  const currentRingRef = useRef({ x: 0, y: 0 });

  const [mode, setMode] = useState<CursorMode>("default");
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    if (prefersReducedMotion || isCoarsePointer) return;
    document.documentElement.classList.add("luxury-cursor-enabled");
    return () => document.documentElement.classList.remove("luxury-cursor-enabled");
  }, [prefersReducedMotion, isCoarsePointer]);

  useEffect(() => {
    if (prefersReducedMotion || isCoarsePointer) return;
    const root = rootRef.current;
    if (!root) return;

    const onPointerMove = (e: PointerEvent) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
    };

    const onPointerOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.("[data-cursor]") as HTMLElement | null;
      if (!el) return;

      const value = (el.getAttribute("data-cursor") || "default") as CursorMode;
      setMode(value);
      setLabel(el.getAttribute("data-cursor-label") || "");
    };

    const onPointerOut = (e: PointerEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      const stillOnTarget = related?.closest?.("[data-cursor]");
      if (stillOnTarget) return;
      setMode("default");
      setLabel("");
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerover", onPointerOver, { passive: true });
    window.addEventListener("pointerout", onPointerOut, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerover", onPointerOver);
      window.removeEventListener("pointerout", onPointerOut);
    };
  }, [prefersReducedMotion, isCoarsePointer]);

  useEffect(() => {
    if (prefersReducedMotion || isCoarsePointer) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const animate = () => {
      const { x: tx, y: ty } = targetRef.current;

      currentDotRef.current.x = lerp(currentDotRef.current.x, tx, 0.22);
      currentDotRef.current.y = lerp(currentDotRef.current.y, ty, 0.22);

      currentRingRef.current.x = lerp(currentRingRef.current.x, tx, 0.14);
      currentRingRef.current.y = lerp(currentRingRef.current.y, ty, 0.14);

      dot.style.transform = `translate3d(${currentDotRef.current.x}px, ${currentDotRef.current.y}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${currentRingRef.current.x}px, ${currentRingRef.current.y}px, 0) translate(-50%, -50%)`;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [prefersReducedMotion, isCoarsePointer]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.classList.toggle("is-link", mode === "link");
    root.classList.toggle("is-menu", mode === "menu");
    root.classList.toggle("is-play", mode === "play");
    root.classList.toggle("is-drag", mode === "drag");
    root.classList.toggle("is-off", mode === "off");

  }, [mode]);

  if (prefersReducedMotion || isCoarsePointer) return null;

  return (
    <div ref={rootRef} className="luxuryCursor" aria-hidden="true">
      <div ref={ringRef} className="luxuryCursor-ring" />
      <div ref={dotRef} className="luxuryCursor-dot" />
      <div
        ref={labelRef}
        className={["luxuryCursor-label", label ? "is-visible" : ""].join(" ")}
      >
        {label}
      </div>
    </div>
  );
}
