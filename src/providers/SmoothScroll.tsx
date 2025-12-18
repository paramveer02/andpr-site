import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function getPrefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

type SmoothScrollProviderProps = PropsWithChildren<{
  enabled?: boolean;
  respectReducedMotion?: boolean;
}>;

export default function SmoothScrollProvider({
  enabled = true,
  respectReducedMotion = true,
  children,
}: SmoothScrollProviderProps) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const tickerFnRef = useRef<((time: number) => void) | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    getPrefersReducedMotion,
  );

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPrefersReducedMotion(mql.matches);

    onChange();

    if ("addEventListener" in mql) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);

    return () => {
      if ("removeEventListener" in mql) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    const shouldEnableLenis =
      enabled && (!respectReducedMotion || !prefersReducedMotion);

    // Respect OS-level reduced motion to avoid forcing smooth scrolling (opt-out
    // via `respectReducedMotion={false}` for specific pages).
    if (!shouldEnableLenis) return;
    if (lenisRef.current) return;

    const lenis = new Lenis({
      lerp: 0.1, // Increased from 0.075 for more responsive feel
      smoothWheel: true,
      syncTouch: false, // Changed from smoothTouch to syncTouch
      wheelMultiplier: 1, // Changed from 0.85 to 1 for more natural scroll speed
      touchMultiplier: 1, // Changed from 0.9 to 1 for consistency
      infinite: false,
    });

    lenisRef.current = lenis;
    window.__lenis = lenis;
    setLenisInstance(lenis);

    const root = document.documentElement;
    root.classList.add("lenis");

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", onRefresh);

    gsap.ticker.lagSmoothing(0);
    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    tickerFnRef.current = tickerFn;
    gsap.ticker.add(tickerFn);

    ScrollTrigger.refresh();

    const onResize = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      ScrollTrigger.removeEventListener("refresh", onRefresh);

      if (tickerFnRef.current) gsap.ticker.remove(tickerFnRef.current);
      tickerFnRef.current = null;

      lenis.off("scroll", onScroll);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);

      if (window.__lenis === lenis) delete window.__lenis;
      root.classList.remove("lenis");
    };
  }, [enabled, prefersReducedMotion, respectReducedMotion]);

  return (
    <LenisContext.Provider value={lenisInstance}>{children}</LenisContext.Provider>
  );
}
