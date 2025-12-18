import Header from "./Header";
import LuxuryImage from "./LuxuryImage";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/hero.css";
import { useLenis } from "../providers/SmoothScroll";
import heroImage from "../assets/hero.jpg";

gsap.registerPlugin(ScrollTrigger);

function getPrefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getShouldShowIntro() {
  if (typeof window === "undefined") return false;
  if (getPrefersReducedMotion()) return false;
  try {
    return !sessionStorage.getItem("andpr_intro_seen");
  } catch {
    return false;
  }
}

type HeroProps = {
  menuOpen?: boolean;
  onToggleMenu?: () => void;
};

export default function Hero({ menuOpen = false, onToggleMenu }: HeroProps) {
  const lenis = useLenis();

  const heroRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);

  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);

  const introRef = useRef<HTMLDivElement | null>(null);
  const introTextRef = useRef<HTMLDivElement | null>(null);

  const heroRevealTlRef = useRef<gsap.core.Timeline | null>(null);
  const heroRevealPreparedRef = useRef(false);
  const heroRevealPlayedRef = useRef(false);

  const introTlRef = useRef<gsap.core.Timeline | null>(null);
  const introExitTlRef = useRef<gsap.core.Timeline | null>(null);
  const introDelayRef = useRef<gsap.core.Tween | null>(null);
  const introExitRequestedRef = useRef(false);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getPrefersReducedMotion);
  const [introMounted, setIntroMounted] = useState(getShouldShowIntro);

  const workTarget = "#clients";
  const [hasWorkTarget, setHasWorkTarget] = useState(false);

  // --- Reduced motion watcher
  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mql) return;

    const apply = () => setPrefersReducedMotion(mql.matches);
    apply();
    mql.addEventListener?.("change", apply);
    return () => mql.removeEventListener?.("change", apply);
  }, []);

  // --- Work target presence
  useEffect(() => {
    setHasWorkTarget(Boolean(document.querySelector(workTarget)));
  }, []);

  // --- If reduced motion is enabled, kill intro
  useEffect(() => {
    if (!prefersReducedMotion) return;
    setIntroMounted(false);
  }, [prefersReducedMotion]);

  // =========================
  // HERO REVEAL (headline lines)
  // =========================
  const prepareHeroReveal = useCallback(() => {
    const hero = heroRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    const headline = headlineRef.current;
    const subtitle = subtitleRef.current;

    if (!hero || !left || !right || !headline || !subtitle) return;
    if (prefersReducedMotion) return;
    if (heroRevealPreparedRef.current) return;

    heroRevealPreparedRef.current = true;

    const image = left.querySelector("img");
    const headlineLines = headline.querySelectorAll("[data-hero-headline-line]");

    const ctx = gsap.context(() => {
      gsap.killTweensOf([headlineLines, subtitle, headline, image].filter(Boolean));

      if (image) gsap.set(image, { willChange: "transform", scale: 1.035 });

      gsap.set(headlineLines, { yPercent: 110 });
      gsap.set(subtitle, { y: 10, opacity: 0 });

      heroRevealTlRef.current?.kill();
      heroRevealTlRef.current = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out", duration: 1.1 },
      });

      heroRevealTlRef.current
        .to(headlineLines, { yPercent: 0, stagger: 0.09, duration: 1.2 }, 0.18)
        .to(subtitle, { y: 0, opacity: 1, duration: 0.9, ease: "power2.out" }, 0.55);

      if (image) {
        heroRevealTlRef.current.to(image, { scale: 1, duration: 1.7, ease: "expo.out" }, 0.1);
      }
    }, hero);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const playHeroReveal = useCallback(() => {
    if (prefersReducedMotion) return;
    if (heroRevealPlayedRef.current) return;

    if (!heroRevealPreparedRef.current) prepareHeroReveal();
    if (!heroRevealTlRef.current) return;

    heroRevealPlayedRef.current = true;
    heroRevealTlRef.current.play(0);
  }, [prefersReducedMotion, prepareHeroReveal]);

  // =========================
  // INTRO (simple + elegant)
  // =========================
  const playIntroExit = useCallback(
    (variant: "normal" | "fast" = "normal") => {
      const intro = introRef.current;
      const introText = introTextRef.current;
      if (!intro || !introText) return;

      if (introExitRequestedRef.current) return;
      introExitRequestedRef.current = true;

      introDelayRef.current?.kill();
      introDelayRef.current = null;

      introTlRef.current?.kill();
      introTlRef.current = null;

      // reveal hero as soon as intro begins exiting
      playHeroReveal();

      const isFast = variant === "fast";
      const dText = isFast ? 0.35 : 0.75;
      const dOverlay = isFast ? 0.35 : 0.65;

      introExitTlRef.current?.kill();
      introExitTlRef.current = gsap.timeline({
        defaults: { overwrite: true },
        onComplete: () => {
          try {
            sessionStorage.setItem("andpr_intro_seen", "1");
          } catch {}

          setIntroMounted(false);

          if (lenis && typeof (lenis as any).start === "function") (lenis as any).start();

          introExitRequestedRef.current = false;
          introExitTlRef.current = null;
        },
      });

      introExitTlRef.current
        .to(introText, {
          opacity: 0,
          y: -6,
          filter: "blur(8px)",
          duration: dText,
          ease: "power3.inOut",
        })
        .to(
          intro,
          {
            autoAlpha: 0,
            duration: dOverlay,
            ease: "power2.inOut",
          },
          isFast ? 0.06 : 0.12,
        );
    },
    [lenis, playHeroReveal, playHeroReveal],
  );

  // Intro enter animation (only intro text)
  useLayoutEffect(() => {
    if (!introMounted || prefersReducedMotion) return;

    const intro = introRef.current;
    const introText = introTextRef.current;
    if (!intro || !introText) return;

    if (lenis && typeof (lenis as any).stop === "function") (lenis as any).stop();

    introExitRequestedRef.current = false;

    introTlRef.current?.kill();
    introExitTlRef.current?.kill();
    introDelayRef.current?.kill();

    gsap.set(intro, { autoAlpha: 1 });
    gsap.set(introText, {
      opacity: 0,
      y: 10,
      filter: "blur(10px)",
      willChange: "transform, opacity, filter",
    });

    const tl = gsap.timeline({ defaults: { overwrite: true } });
    tl.to(introText, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.05,
      ease: "power3.out",
    });

    // auto-exit after a moment (optional)
    introDelayRef.current = gsap.delayedCall(1.7, () => playIntroExit("normal"));

    introTlRef.current = tl;

    return () => {
      tl.kill();
      introDelayRef.current?.kill();
    };
  }, [introMounted, prefersReducedMotion, lenis, playIntroExit]);

  // Exit intro on scroll/touch/keys
  useEffect(() => {
    if (!introMounted) return;

    const onWheel = () => playIntroExit("fast");
    const onTouchStart = () => playIntroExit("fast");
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") playIntroExit("fast");
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [introMounted, playIntroExit]);

  // Prepare reveal early; play only when intro is gone
  useLayoutEffect(() => {
    if (prefersReducedMotion) return;
    prepareHeroReveal();
    if (!introMounted) playHeroReveal();
  }, [prefersReducedMotion, introMounted, prepareHeroReveal, playHeroReveal]);

  const handleWorkClick = useMemo(() => {
    return (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (!hasWorkTarget) return;

      if (lenis && typeof (lenis as any).scrollTo === "function") {
        (lenis as any).scrollTo(workTarget, {
          duration: 1.15,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
        });
        return;
      }

      const el = document.querySelector<HTMLElement>(workTarget);
      el?.scrollIntoView({ block: "start" });
    };
  }, [hasWorkTarget, lenis]);

  return (
    <section ref={heroRef} className="heroShell relative min-h-[100svh] overflow-hidden bg-brand-navy">
      {introMounted ? (
        <div
          ref={introRef}
          className="heroIntro fixed inset-0 z-[90] grid place-items-center"
          onClick={() => playIntroExit("fast")}
          role="presentation"
        >
          <div ref={introTextRef} className="introSimple text-center">

            <div className="introBrand" style={{ fontFamily: "var(--font-serif)" }}>
              AND PR
            </div>

            <div className="introSub">Luxury Brand Consultancy</div>

          </div>
        </div>
      ) : null}

      <div
        ref={contentRef}
        className={[
          "relative z-10 transition-opacity duration-300",
          introMounted ? "opacity-0 pointer-events-none" : "opacity-100",
        ].join(" ")}
      >
        <Header menuOpen={menuOpen} onToggleMenu={onToggleMenu} />

        <div className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-2">
          <div
            ref={leftRef}
            data-parallax="soft"
            data-parallax-amount="10"
            className="relative min-h-[52svh] lg:min-h-[100svh]"
          >
            <LuxuryImage
              src={heroImage}
              alt="High fashion editorial"
              className="heroImage absolute inset-0 h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 50vw, 100vw"
              decoding="async"
              referrerPolicy="no-referrer"
              fallbackLabel="AND PR — HERO"
            />
            <div className="heroMediaOverlay absolute inset-0" aria-hidden="true" />
          </div>

          <div ref={rightRef} className="heroPanel relative flex items-center bg-brand-navy">
            <div className="mx-auto w-full max-w-[44rem] px-6 pb-28 pt-16 lg:px-12 lg:pb-16 lg:pt-24">
              <p ref={subtitleRef} className="text-[0.7rem] uppercase tracking-[0.52em] text-brand-gold/70">
                COUTURE • CULTURE • COMMUNICATIONS
              </p>

              <h1
                ref={headlineRef}
                className="mt-10 text-balance leading-[0.92] tracking-[-0.01em] text-brand-white"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                <span className="hero-reveal block">
                  <span data-hero-headline-line className="block text-[3.1rem] sm:text-[4.05rem] lg:text-[5.25rem]">
                    ARCHITECTS OF
                  </span>
                </span>
                <span className="hero-reveal block">
                  <span data-hero-headline-line className="block text-[3.1rem] sm:text-[4.05rem] lg:text-[5.25rem]">
                    INFLUENCE
                  </span>
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-pretty text-base leading-relaxed text-white/65 sm:text-lg">
                Shaping relevance, presence, and cultural authority.
              </p>

              <div className="mt-12 flex flex-wrap items-center gap-7">
                <a
                  href={hasWorkTarget ? workTarget : "#"}
                  onClick={
                    hasWorkTarget
                      ? handleWorkClick
                      : (e) => {
                          e.preventDefault();
                        }
                  }
                  aria-disabled={hasWorkTarget ? undefined : "true"}
                  className={["heroCta text-xs uppercase tracking-[0.35em]", hasWorkTarget ? "" : "heroCta--disabled"].join(
                    " ",
                  )}
                >
                  Selected Work
                </a>

                <a href="mailto:hello@andpr.com" className="heroCta text-xs uppercase tracking-[0.35em]">
                  Start a Conversation
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 hidden h-24 lg:block">
          <div className="h-full bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}
