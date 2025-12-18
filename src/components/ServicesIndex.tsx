import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/services-index.css";
import LuxuryImage from "./LuxuryImage";

gsap.registerPlugin(ScrollTrigger);

type Service = {
  id: string;
  number: string;
  title: string;
  actionLabel: string;
  imageSrc: string;
};

const services: Service[] = [
  {
    id: "image",
    number: "01",
    title: "IMAGE",
    actionLabel: "View",
    imageSrc:
      "https://images.unsplash.com/photo-1613909671501-f9678ffc1d33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8ZmFzaGlvbiUyMHJ1bndheXxlbnwwfHx8fDE3NjU5ODc4ODJ8MA&ixlib=rb-4.1.0&q=80&w=1400",
  },
  {
    id: "press",
    number: "02",
    title: "PRESS",
    actionLabel: "View",
    imageSrc:
      "https://images.unsplash.com/photo-1694751512865-d7a603bbf54b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8cHJlc3MlMjBjb25mZXJlbmNlJTIwY2FtZXJhJTIwZmxhc2h8ZW58MHx8fHwxNzY1OTg3OTA4fDA&ixlib=rb-4.1.0&q=80&w=1400",
  },
  {
    id: "strategy",
    number: "03",
    title: "STRATEGY",
    actionLabel: "View",
    imageSrc:
      "https://images.unsplash.com/photo-1543728069-a3f97c5a2f32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8M3x8ZmFzaGlvbiUyMHJ1bndheXxlbnwwfHx8fDE3NjU5ODc4ODJ8MA&ixlib=rb-4.1.0&q=80&w=1400",
  },
  {
    id: "experience",
    number: "04",
    title: "EXPERIENCE",
    actionLabel: "View",
    imageSrc:
      "https://images.unsplash.com/photo-1759717821448-c677fbd0aa87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8bHV4dXJ5JTIwZ2FsYSUyMGV2ZW50fGVufDB8fHx8MTc2NTk4NzkwOHww&ixlib=rb-4.1.0&q=80&w=1400",
  },
  {
    id: "digital",
    number: "05",
    title: "DIGITAL",
    actionLabel: "View",
    imageSrc:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1400&ixlib=rb-4.1.0",
  },
];

function usePrefersReducedMotion() {
  return useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
}

function useImagePreload(urls: string[]) {
  const loadedRef = useRef<Record<string, boolean>>({});
  const [version, setVersion] = useState(0);
  const isLoaded = useCallback((url: string) => Boolean(loadedRef.current[url]), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof Image === "undefined") return;

    let canceled = false;
    urls.forEach((url) => {
      if (!url) return;
      if (loadedRef.current[url]) return;

      const img = new Image();
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";

      img.onload = () => {
        if (canceled) return;
        loadedRef.current[url] = true;
        setVersion((v) => v + 1);
      };
      img.onerror = () => {
        if (canceled) return;
        loadedRef.current[url] = true;
        setVersion((v) => v + 1);
      };

      img.src = url;
    });

    return () => {
      canceled = true;
    };
  }, [urls]);

  return { isLoaded, version };
}

export default function ServicesIndex() {
  const prefersReducedMotion = usePrefersReducedMotion();

  const allUrls = useMemo(() => services.map((s) => s.imageSrc), []);
  const { isLoaded, version: preloadVersion } = useImagePreload(allUrls);

  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndexRef = useRef(0);

  const sectionRef = useRef<HTMLElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(0);
  const hoverNextRef = useRef<number | null>(null);
  const hoverTimerRef = useRef<number | null>(null);

  const active = useMemo(() => services[activeIndex] ?? services[0], [activeIndex]);

  const setActive = (next: number) => {
    if (next === activeIndexRef.current) return;
    setActiveIndex(next);
    activeIndexRef.current = next;
  };

  const setActiveFromHover = (next: number) => {
    hoverNextRef.current = next;
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = window.setTimeout(() => {
      const target = hoverNextRef.current;
      hoverNextRef.current = null;
      if (typeof target !== "number") return;
      setActive(target);
    }, 90);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
      hoverNextRef.current = null;
    };
  }, []);

  // keep row heights consistent (your original approach)
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;
    const measure = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rows = Array.from(section.querySelectorAll<HTMLElement>("[data-service-row]")) as HTMLElement[];
        const max = rows.reduce((acc, el) => Math.max(acc, el.getBoundingClientRect().height), 0);
        if (max > 0) section.style.setProperty("--service-row-h", `${Math.ceil(max)}px`);
      });
    };    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize, { passive: true });

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(section);

    if ((document as any).fonts?.ready) {
      (document as any).fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (ro) ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const preview = previewRef.current;
    if (!section || !preview) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const dividers = gsap.utils.toArray<HTMLElement>("[data-service-divider]");
        const titles = gsap.utils.toArray<HTMLElement>("[data-service-title]");
        const numbers = gsap.utils.toArray<HTMLElement>("[data-service-number]");
        const arrows = gsap.utils.toArray<HTMLElement>("[data-service-arrow]");

        gsap.set(dividers, { scaleX: 0, transformOrigin: "0% 50%" });
        gsap.set(titles, { y: 10, opacity: 0 });
        gsap.set(numbers, { y: 6, opacity: 0 });
        gsap.set(arrows, { x: -6, opacity: 0 });

        const layers = gsap.utils.toArray<HTMLElement>(
          preview.querySelectorAll("[data-service-layer]"),
        );
        gsap.set(layers, { opacity: 0 });
        gsap.set(layers[0], { opacity: 1 });

        ScrollTrigger.create({
          trigger: section,
          start: "top 90%", // Start animations much earlier
          once: true,
          onEnter: () => {
            gsap
              .timeline({ defaults: { ease: "power3.out" } })
              .to(dividers, { scaleX: 1, duration: 0.9, stagger: 0.06 }, 0)
              .to(numbers, { y: 0, opacity: 1, duration: 0.8, stagger: 0.06 }, 0.05)
              .to(titles, { y: 0, opacity: 1, duration: 0.9, stagger: 0.06 }, 0.08)
              .to(arrows, { x: 0, opacity: 1, duration: 0.8, stagger: 0.06 }, 0.12)
              .to(layers[0], { opacity: 1, duration: 0.95 }, 0.2);
          },
        });

        return () => {};
      });

      mm.add("(max-width: 1023px), (pointer: coarse)", () => {
        const buttons = gsap.utils.toArray<HTMLElement>("[data-service-row]");
        const triggers: ScrollTrigger[] = [];

        // Set the first item as active when the section enters the viewport
        ScrollTrigger.create({
          trigger: section,
          start: "top 80%",
          once: true,
          onEnter: () => {
            // Force set the first item as active when section comes into view
            setActiveIndex(0);
            activeIndexRef.current = 0;
            prevIndexRef.current = 0;
          }
        });

        buttons.forEach((button, index) => {
          triggers.push(
            ScrollTrigger.create({
              trigger: button,
              start: "top center",
              end: "bottom center",
              onEnter: () => setActive(index),
              onEnterBack: () => setActive(index),
            }),
          );
        });

        return () => triggers.forEach((t) => t.kill());
      });

      return () => mm.revert();
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  useLayoutEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    const layers = Array.from(preview.querySelectorAll<HTMLElement>("[data-service-layer]")) as HTMLElement[];
    if (!layers.length) return;

    // Consolidate initialization logic here
    gsap.set(layers, { opacity: 0, willChange: "opacity", force3D: true, filter: "blur(0px)" });
    gsap.set(layers[prevIndexRef.current] ?? layers[0], { opacity: 1, filter: "blur(0px)" });
  }, []);

  useLayoutEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    const layers = Array.from(preview.querySelectorAll<HTMLElement>("[data-service-layer]"));
    const nextLayer = layers[activeIndex] as HTMLElement;
    const prevLayer = layers[prevIndexRef.current] as HTMLElement;
    if (!nextLayer || !prevLayer) return;
    if (prefersReducedMotion) {
      layers.forEach((layer, idx) => {
        gsap.set(layer as HTMLElement, { 
          opacity: idx === activeIndex ? 1 : 0, 
          clearProps: "transform",
          filter: "blur(0px)"
        });
      });
      prevIndexRef.current = activeIndex;
      return;
    }
    if (!isLoaded(active.imageSrc)) return;
    if (prevIndexRef.current === activeIndex) return;

    gsap.killTweensOf([prevLayer, nextLayer]);

    gsap.to(prevLayer, {
      opacity: 0,
      duration: 0.42,
      ease: "power2.out",
      overwrite: "auto",
    });

    gsap.to(nextLayer, {
      opacity: 1,
      duration: 0.62,
      ease: "power3.out",
      overwrite: "auto",
    });
    
    gsap.set(nextLayer, { filter: "blur(0px)" });

    prevIndexRef.current = activeIndex;
  }, [activeIndex, active.imageSrc, preloadVersion, prefersReducedMotion, isLoaded]);

  return (
    <section ref={sectionRef} id="services" className="bg-brand-white text-brand-navy">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-20 lg:grid-cols-5 lg:gap-12 lg:px-12 lg:py-28">
        <div className="lg:col-span-3">
          <div className="mb-10">
            <p className="text-[0.7rem] uppercase tracking-[0.55em] text-brand-navy/60">Services</p>
          </div>

          <div className="relative">
            <div data-service-divider className="h-px w-full bg-brand-navy/10" />

            {services.map((service, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={service.id}
                  data-service-row
                  type="button"
                  onMouseEnter={() => setActiveFromHover(index)}
                  onFocus={() => setActive(index)}
                  onClick={() => setActive(index)}
                  aria-current={isActive ? "true" : "false"}
                  style={
                    {
                      "--service-num-col": "3.25rem",
                      "--service-col-gap": "clamp(1.5rem, 4vw, 2.5rem)",
                      "--service-title-start": "calc(var(--service-num-col) + var(--service-col-gap))",
                      "--service-action-w": "8.25rem",
                      minHeight: "var(--service-row-h, auto)",
                    } as React.CSSProperties
                  }
                  className="serviceRow group relative flex w-full items-center justify-between gap-6 py-10 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/60 focus-visible:ring-offset-4 focus-visible:ring-offset-brand-white"
                >
                  {/* Gold index marker (refined: scaleY + opacity, no jitter) */}
                  <span
                    className={[
                      "serviceIndexMarker pointer-events-none absolute left-[calc(var(--service-num-col)/2)] top-1/2 h-10 w-px -translate-x-1/2 -translate-y-1/2 bg-brand-gold",
                      isActive ? "is-active" : "",
                    ].join(" ")}
                    aria-hidden="true"
                  />

                  {/* Gold underline near title (kept, but stable) */}
                  <span
                    className={[
                      "pointer-events-none absolute bottom-0 left-[var(--service-title-start)] h-px w-24 bg-brand-gold transition-opacity duration-[420ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                      isActive ? "opacity-60" : "opacity-0 group-hover:opacity-30",
                    ].join(" ")}
                    aria-hidden="true"
                  />

                  {/* Left block (number + title) */}
                  <div className="min-w-0 flex-1 grid grid-cols-[var(--service-num-col)_minmax(0,1fr)] items-start gap-x-[var(--service-col-gap)]">
                    <span
                      data-service-number
                      className="justify-self-center text-xs tracking-[0.22em] text-brand-navy/80"
                    >
                      {service.number}
                    </span>

                    <span
                      data-service-title
                      className="min-w-0 text-brand-navy transition-colors duration-[420ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:text-brand-gold"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      <span className="serviceTitleText block text-[2.6rem] leading-none sm:text-[3.25rem] lg:text-[3.9rem]">
                        {service.title}
                      </span>
                    </span>
                  </div>

                  {/* Right block (FIXED WIDTH: no reflow on label change) */}
                  <span
                    data-service-arrow
                    className="serviceAction text-brand-navy/60 transition-colors duration-[420ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:text-brand-navy"
                    style={{ width: "var(--service-action-w)", flex: "0 0 var(--service-action-w)" }}
                  >
                    {/* Label overlay (VIEW/SELECTED) — absolutely stacked */}
                    <span className="serviceActionLabel hidden text-xs uppercase tracking-[0.3em] lg:inline" aria-hidden="true">
                      <span className="serviceActionLabelText serviceActionLabelText--view">
                        {service.actionLabel}
                      </span>
                      <span className="serviceActionLabelText serviceActionLabelText--selected">
                        Selected
                      </span>
                    </span>

                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>

                  <div
                    data-service-divider
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-brand-navy/10"
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-10 pt-10">
            <div
              ref={previewRef}
              data-parallax="soft"
              data-parallax-amount="3"
              className={["services-preview", isLoaded(active.imageSrc) ? "" : "is-loading"].join(" ")}
            >
              <div className="aspect-[4/5] w-full" />

        {services.map((service, idx) => (
          <div key={service.id} data-service-layer className="services-previewLayer" aria-hidden="true">
            <LuxuryImage
              src={service.imageSrc}
              alt=""
              loading={idx < 2 ? "eager" : "lazy"}
              fetchPriority={idx === 0 ? "high" : idx < 2 ? "low" : "auto"}
              decoding="async"
              referrerPolicy="no-referrer"
              fallbackLabel={service.title}
            />
          </div>
))}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
