import LuxuryImage from "./LuxuryImage";
import { useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/philosophy.css";

gsap.registerPlugin(ScrollTrigger);

type PhilosophyProps = {
  eyebrow?: string;
  heading?: string;
  paragraphs?: string[];
};

export default function Philosophy({
  eyebrow = "Philosophy",
  heading = "Designing influence with intention",
  paragraphs = [
    "We operate with quiet precision—shaping narratives that feel inevitable, never engineered.",
    "Discretion is part of the craft. We protect trust, refine perception, and move without leaving fingerprints.",
    "Our standard is longevity: cultural relevance that endures—beyond moments, beyond noise.",
  ],
}: PhilosophyProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const eyebrowRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const ruleRef = useRef<HTMLDivElement | null>(null);
  const paraRefs = useRef<HTMLParagraphElement[]>([]);
  const imageWrapRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const captionRef = useRef<HTMLParagraphElement | null>(null);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const eyebrowEl = eyebrowRef.current;
    const headingEl = headingRef.current;
    const ruleEl = ruleRef.current;
    const wrapEl = imageWrapRef.current;
    const captionEl = captionRef.current;
    if (!section || !eyebrowEl || !headingEl || !ruleEl || !wrapEl || !captionEl) return;

    imageRef.current = wrapEl.querySelector("img");
    const imgEl = imageRef.current;
    if (!imgEl) return;

    if (prefersReducedMotion) {
      gsap.set(
        [eyebrowEl, headingEl, ruleEl, ...paraRefs.current, wrapEl, imgEl, captionEl],
        { clearProps: "all" },
      );
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set([eyebrowEl, headingEl, captionEl], { opacity: 0, y: 10, willChange: "transform, opacity" });
      gsap.set(ruleEl, { scaleX: 0, transformOrigin: "0% 50%", willChange: "transform" });
      gsap.set(paraRefs.current, { opacity: 0, y: 10, willChange: "transform, opacity" });
      gsap.set(wrapEl, { opacity: 0, y: 12, willChange: "transform, opacity" });
      gsap.set(imgEl, { scale: 1.03, yPercent: 0, willChange: "transform", force3D: true });

      const revealTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      revealTl
        .to(eyebrowEl, { opacity: 1, y: 0, duration: 0.85 }, 0)
        .to(headingEl, { opacity: 1, y: 0, duration: 1.0 }, 0.05)
        .to(ruleEl, { scaleX: 1, duration: 0.95, ease: "power2.out" }, 0.2)
        .to(paraRefs.current, { opacity: 1, y: 0, duration: 0.95, stagger: 0.08 }, 0.28)
        .to(wrapEl, { opacity: 1, y: 0, duration: 1.05 }, 0.28)
        .to(imgEl, { scale: 1, duration: 1.2, ease: "power2.out" }, 0.35)
        .to(captionEl, { opacity: 1, y: 0, duration: 0.9 }, 0.6);

      ScrollTrigger.create({
        trigger: section,
        start: "top 75%",
        once: true,
        animation: revealTl,
      });
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="philosophy"
      className="bg-background text-brand-navy"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-20 lg:grid-cols-5 lg:gap-14 lg:px-12 lg:py-28">
        <div className="lg:col-span-3">
          <div ref={eyebrowRef} className="flex items-center gap-4">
            <span className="h-px w-10 bg-brand-gold/70" aria-hidden="true" />
            <p className="text-[0.7rem] uppercase tracking-[0.55em] text-brand-navy/55">
              {eyebrow}
            </p>
          </div>

          <h2
            ref={headingRef}
            className="mt-8 text-balance text-[2.25rem] leading-[1.05] sm:text-[2.7rem] lg:text-[3.25rem]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {heading}
          </h2>

          <div ref={ruleRef} className="mt-6 h-px w-[72px] bg-brand-gold/70" aria-hidden="true" />

          <div
            data-cursor="off"
            className="mt-9 max-w-[62ch] space-y-6 text-[0.98rem] leading-[1.85] text-brand-navy/70 sm:text-base"
          >
            {paragraphs.slice(0, 3).map((p, idx) => (
              <p
                key={p}
                ref={(el) => {
                  if (!el) return;
                  paraRefs.current[idx] = el;
                }}
              >
                {p}
              </p>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div
            ref={imageWrapRef}
            data-parallax="soft"
            data-parallax-amount="8"
            className="philoImageWrap relative overflow-hidden bg-brand-navy/5"
          >
            <div className="aspect-[4/5] w-full">
              <LuxuryImage
                src="https://images.unsplash.com/photo-1564078516393-cf04bd966897?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8M3x8bHV4dXJ5JTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MHx8fHwxNzY1OTg3OTA5fDA&ixlib=rb-4.1.0&q=80&w=1400"
                alt="Quiet interior texture"
                className="philoImage h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                fallbackLabel="Material"
              />
            </div>
          </div>

          <p
            ref={captionRef}
            className="mt-6 max-w-sm text-sm leading-relaxed text-brand-navy/55"
          >
            A study in restraint—material, light, and intention.
          </p>
        </div>
      </div>
    </section>
  );
}
