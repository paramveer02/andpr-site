import Header from "./Header";
import LuxuryImage from "./LuxuryImage";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/hero.css";
import { useLenis } from "../providers/SmoothScroll";
import heroImage from "../assets/hero.jpg";

gsap.registerPlugin(ScrollTrigger);

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
  const heroRevealTlRef = useRef<gsap.core.Timeline | null>(null);
  const heroRevealPreparedRef = useRef(false);
  const heroRevealPlayedRef = useRef(false);
  const introRef = useRef<HTMLDivElement | null>(null);
  const introTextRef = useRef<HTMLDivElement | null>(null);
  const introTlRef = useRef<gsap.core.Timeline | null>(null);
  const introExitTlRef = useRef<gsap.core.Timeline | null>(null);
  const introExitRequestedRef = useRef(false);
  const introDelayRef = useRef<gsap.core.Tween | null>(null);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);

  const workTarget = "#clients";
  const [hasWorkTarget, setHasWorkTarget] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mql) {
      setPrefersReducedMotion(false);
      return;
    }

    const apply = () => setPrefersReducedMotion(mql.matches);
    apply();
    mql.addEventListener?.("change", apply);
    return () => mql.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    setHasWorkTarget(Boolean(document.querySelector(workTarget)));
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    try {
      const seen = sessionStorage.getItem("andpr_intro_seen");
      setShowIntro(!seen);
    } catch {
      setShowIntro(false);
    }
  }, [prefersReducedMotion]);

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

    // StrictMode/rehydration safety: prepare once, and never re-apply hidden states after content is visible.
    const ctx = gsap.context(() => {
      gsap.killTweensOf([headlineLines, subtitle, headline, image].filter(Boolean));

      gsap.set(hero, { willChange: "transform" });
      gsap.set([left, right, headline, subtitle], { willChange: "transform" });

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
        .to(
          subtitle,
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power2.out",
          },
          0.55,
        );

      if (image) {
        heroRevealTlRef.current.to(image, { scale: 1, duration: 1.7, ease: "expo.out" }, 0.1);
      }

      heroRevealTlRef.current.set([headline, subtitle], { clearProps: "willChange" }, ">");
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

  const playIntroExit = useCallback((variant: "normal" | "fast" = "normal") => {
    const intro = introRef.current;
    const introText = introTextRef.current;
    const content = contentRef.current;
    if (!intro || !introText || !content) return;

    if (introExitRequestedRef.current) return;
    introExitRequestedRef.current = true;

    playHeroReveal();

    introDelayRef.current?.kill();
    introDelayRef.current = null;

    introTlRef.current?.kill();
    introTlRef.current = null;

    introExitTlRef.current?.kill();
    introExitTlRef.current = null;

    const isFast = variant === "fast";
    const exitTextDuration = isFast ? 0.45 : 0.8;
    const exitOverlayDuration = isFast ? 0.45 : 0.7;
    const contentDuration = isFast ? 0.55 : 0.9;

    const tl = gsap.timeline({
      defaults: { overwrite: true },
      onComplete: () => {
        try {
          sessionStorage.setItem("andpr_intro_seen", "1");
        } catch {}
        setShowIntro(false);

        if (lenis && typeof (lenis as any).start === "function") {
          (lenis as any).start();
        }

        ScrollTrigger.refresh();

        gsap.set(intro, { clearProps: "all" });
        gsap.set(introText, { clearProps: "all" });
        gsap.set(content, { clearProps: "all" });

        introExitTlRef.current = null;
      },
    });

    tl.to(
      introText,
      {
        opacity: 0,
        y: -6,
        filter: "blur(6px)",
        duration: exitTextDuration,
        ease: "power3.inOut",
      },
      0,
    )
      .to(
        introText,
        {
          scale: 0.992,
          duration: exitTextDuration,
          ease: "power3.inOut",
        },
        0,
      )
      .to(
        intro,
        { autoAlpha: 0, duration: exitOverlayDuration, ease: "power3.inOut" },
        isFast ? 0.05 : 0.15,
      )
      .to(
        content,
        { autoAlpha: 1, y: 0, duration: contentDuration, ease: "power3.out" },
        isFast ? 0 : 0.1,
      );

    introExitTlRef.current = tl;
  }, [lenis, playHeroReveal]);

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

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const intro = introRef.current;
    const introText = introTextRef.current;
    const content = contentRef.current;
    if (!hero || !content || !intro || !introText) return;

    if (!showIntro || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      introExitRequestedRef.current = false;
      introDelayRef.current?.kill();
      introDelayRef.current = null;

      gsap.set(intro, { autoAlpha: 1 });
      gsap.set(content, { autoAlpha: 0, y: 8, willChange: "transform, opacity" });
      gsap.set(introText, {
        opacity: 0,
        y: 10,
        filter: "blur(10px)",
        willChange: "transform, opacity, filter",
      });

      if (lenis && typeof (lenis as any).stop === "function") {
        (lenis as any).stop();
      }

      const tl = gsap.timeline({ defaults: { overwrite: true } });
      tl.to(
        introText,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.05,
          ease: "power3.out",
        },
        0.2,
      ).add(() => {
        introDelayRef.current?.kill();
        introDelayRef.current = gsap.delayedCall(1.4, playIntroExit);
      });

      introTlRef.current = tl;
    }, intro);

    return () => {
      introTlRef.current?.kill();
      introTlRef.current = null;
      introDelayRef.current?.kill();
      introDelayRef.current = null;
      introExitTlRef.current?.kill();
      introExitTlRef.current = null;
      if (lenis && typeof (lenis as any).start === "function") {
        (lenis as any).start();
      }
      ctx.revert();
    };
  }, [showIntro, prefersReducedMotion, lenis, playIntroExit]);

  useEffect(() => {
    if (!showIntro) return;

    const onWheel = () => playIntroExit("fast");
    const onTouchStart = () => playIntroExit("fast");
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        playIntroExit("fast");
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showIntro, playIntroExit]);

  useLayoutEffect(() => {
    if (prefersReducedMotion) return;
    // Prepare early (even while intro is running) so the hero never becomes visible with "reset" transforms.
    prepareHeroReveal();
    if (!showIntro) playHeroReveal();
  }, [prefersReducedMotion, showIntro, prepareHeroReveal, playHeroReveal]);

  return (
    <section ref={heroRef} className="heroShell relative min-h-[100svh] overflow-hidden bg-brand-navy">
      {showIntro ? (
        <div
          ref={introRef}
          className="heroIntro fixed inset-0 z-[90] grid place-items-center"
          onClick={() => {
            playIntroExit();
          }}
          role="presentation"
        >
          <div ref={introTextRef} className="relative z-10 text-center">
            <div
              style={{ fontFamily: "var(--font-serif)" }}
              className="select-none text-3xl tracking-[0.32em] text-brand-white sm:text-4xl"
            >
              AND PR
            </div>
            <div className="mt-4 text-[0.7rem] uppercase tracking-[0.55em] text-brand-gold/70">
              Luxury Brand Consultancy
            </div>
          </div>
        </div>
      ) : null}

      <div ref={contentRef} className="relative z-10">
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
              <p
                ref={subtitleRef}
                className="text-[0.7rem] uppercase tracking-[0.52em] text-brand-gold/70"
              >
                COUTURE • CULTURE • COMMUNICATIONS
              </p>

            <h1
              ref={headlineRef}
              className="mt-10 text-balance leading-[0.92] tracking-[-0.01em] text-brand-white"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              <span className="hero-reveal block">
                <span
                  data-hero-headline-line
                  className="block text-[3.1rem] sm:text-[4.05rem] lg:text-[5.25rem]"
                >
                  ARCHITECTS OF
                </span>
              </span>
              <span className="hero-reveal block">
                <span
                  data-hero-headline-line
                  className="block text-[3.1rem] sm:text-[4.05rem] lg:text-[5.25rem]"
                >
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
                  data-cursor={hasWorkTarget ? "link" : undefined}
                  aria-disabled={hasWorkTarget ? undefined : "true"}
                  className={[
                    "heroCta text-xs uppercase tracking-[0.35em]",
                    hasWorkTarget ? "" : "heroCta--disabled",
                  ].join(" ")}
                >
                  Selected Work
                </a>

                <a
                  href="mailto:hello@andpr.com"
                  data-cursor="link"
                  data-cursor-label="OPEN"
                  className="heroCta text-xs uppercase tracking-[0.35em]"
                >
                  Start a Conversation
                </a>
              </div>
            </div>
          </div>
        </div>

      {/* <div className="pointer-events-none absolute inset-x-0 bottom-8 z-40 flex justify-center lg:bottom-10">
        <div
          ref={showreelRef}
          className="pointer-events-auto translate-y-0 lg:translate-x-0 lg:translate-y-0 lg:[transform:translateX(-50%)] lg:relative lg:left-1/2"
        >
          <PlayShowreelButton />
        </div>
      </div> */}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 hidden h-24 lg:block">
          <div className="h-full bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}
