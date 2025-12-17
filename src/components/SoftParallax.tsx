import { useLayoutEffect, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function SoftParallax() {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const isCoarsePointer = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return true;
    return window.matchMedia("(pointer: coarse)").matches;
  }, []);

  useLayoutEffect(() => {
    if (prefersReducedMotion || isCoarsePointer) return;

    const ctx = gsap.context(() => {
      const els = gsap.utils.toArray<HTMLElement>("[data-parallax='soft']");
      els.forEach((el) => {
        const raw = Number(el.getAttribute("data-parallax-amount") || "12");
        const amount = clamp(isFinite(raw) ? raw : 12, 4, 16);
        
        // Reduce parallax amount for calmer effect
        const reducedAmount = amount * 0.7;
        
        // Add willChange for better performance
        gsap.set(el, { willChange: "transform", force3D: true });
        
        gsap.fromTo(
          el,
          { y: reducedAmount },
          {
            y: -reducedAmount,
            ease: "none",
            overwrite: true,
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 1, // Increased from 0.8 for smoother parallax
              invalidateOnRefresh: true,
            },
          },
        );
      });
    });

    return () => ctx.revert();
  }, [prefersReducedMotion, isCoarsePointer]);

  return null;
}

