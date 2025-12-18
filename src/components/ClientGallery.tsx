import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LuxuryImage from "./LuxuryImage";
import "../styles/client-gallery.css";

gsap.registerPlugin(ScrollTrigger);

type ClientCard = {
  name: string;
  category: string;
  image: string;
  aspect: "portrait" | "landscape";
};

const clients: ClientCard[] = [
  {
    name: "Maison Aurelia",
    category: "Couture",
    aspect: "portrait",
    image:
      "https://images.unsplash.com/photo-1699459607096-6a88c4e1f15a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8aGlnaCUyMGZhc2hpb24lMjBlZGl0b3JpYWx8ZW58MHx8fHwxNzY1OTg3OTA5fDA&ixlib=rb-4.1.0&q=80&w=1400",
  },
  {
    name: "Noir Atelier",
    category: "Runway",
    aspect: "landscape",
    image:
      "https://images.unsplash.com/photo-1543728069-a3f97c5a2f32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8M3x8ZmFzaGlvbiUyMHJ1bndheXxlbnwwfHx8fDE3NjU5ODc4ODJ8MA&ixlib=rb-4.1.0&q=80&w=1600",
  },
  {
    name: "Elysian",
    category: "Editorial",
    aspect: "portrait",
    image:
      "https://images.unsplash.com/photo-1699459867169-515c14378f79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8M3x8aGlnaCUyMGZhc2hpb24lMjBlZGl0b3JpYWx8ZW58MHx8fHwxNzY1OTg3OTA5fDA&ixlib=rb-4.1.0&q=80&w=1400",
  },
  {
    name: "Vellum",
    category: "Beauty",
    aspect: "landscape",
    image:
      "https://images.unsplash.com/photo-1571924849183-a68a3879348d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8NHx8ZmFzaGlvbiUyMHJ1bndheXxlbnwwfHx8fDE3NjU5ODc4ODJ8MA&ixlib=rb-4.1.0&q=80&w=1600",
  },
  {
    name: "Aurum",
    category: "Timepieces",
    aspect: "portrait",
    image:
      "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8M3x8bHV4dXJ5JTIwd2F0Y2h8ZW58MHx8fHwxNzY1OTg3OTEwfDA&ixlib=rb-4.1.0&q=80&w=1400",
  },
];

export default function ClientGallery() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const preloadCacheRef = useRef<Set<string>>(new Set());
  const [imagesReady, setImagesReady] = useState(false);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const curated = useMemo(() => clients.slice(0, 5), []);

  // --- Preload images (progressive, then full when near viewport)
  useEffect(() => {
    if (typeof window === "undefined" || typeof Image === "undefined") return;

    const preload = (urls: string[]) => {
      const tasks: Array<Promise<void>> = [];

      urls.forEach((url) => {
        if (!url) return;
        if (preloadCacheRef.current.has(url)) return;
        preloadCacheRef.current.add(url);

        const img = new Image();
        img.decoding = "async";
        img.referrerPolicy = "no-referrer";

        const task = new Promise<void>((resolve) => {
          const done = () => resolve();
          img.onload = done;
          img.onerror = done;
        }).then(async () => {
          try {
            // decode helps reduce flicker on paint
            if (typeof (img as any).decode === "function") await (img as any).decode();
          } catch {}
        });

        tasks.push(task);
        img.src = url;
      });

      return Promise.allSettled(tasks).then(() => undefined);
    };

    // quick warmup (first two)
    preload(curated.slice(0, 2).map((c) => c.image));

    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") {
      // fallback
      const t = window.setTimeout(() => setImagesReady(true), 2500);
      return () => window.clearTimeout(t);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        preload(curated.map((c) => c.image)).then(() => setImagesReady(true));
        observer.disconnect();
      },
      { root: null, rootMargin: "900px 0px", threshold: 0.01 },
    );

    observer.observe(section);

    // softer fallback (less likely to refresh mid-paint)
    const fallback = window.setTimeout(() => setImagesReady(true), 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [curated]);

  // refresh AFTER images are ready (next frame)
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!imagesReady) return;
    const id = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    return () => window.cancelAnimationFrame(id);
  }, [imagesReady, prefersReducedMotion]);

  // --- Horizontal pinned scroll
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    if (prefersReducedMotion) return;
    if (!imagesReady) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 640px)", () => {
      const getDistance = () => {
        const total = track.scrollWidth;
        const viewport = section.clientWidth;
        // Adding a small buffer to ensure the last item is fully visible
        return Math.max(0, Math.round(total - viewport + 50));
      };

        const distance = getDistance();
        if (distance < 2) return () => {};

        // baseline state
        gsap.set(track, { x: 0, willChange: "transform", force3D: true });
        
        // Set willChange on panels for better performance
        const panels = gsap.utils.toArray<HTMLElement>(track.querySelectorAll(".clientGallery-panel"));
        gsap.set(panels, { willChange: "transform", force3D: true });

        // timeline
        const tl = gsap.timeline({ defaults: { ease: "none" } });

        // Calculate positions for the slowdown effect
      const totalDistance = distance;
      const normalScrollEnd = totalDistance * 0.8; // Normal speed for first 80%
      const slowScrollEnd = totalDistance;

      // Normal speed scroll (first 80%)
      tl.to(track, { 
        x: () => -normalScrollEnd, 
        duration: 0.8 
      }, 0);
      
      // Slower speed scroll (last 20%)
      tl.to(track, { 
        x: () => -slowScrollEnd, 
        duration: 0.2,
        ease: "power1.out" // Gentle easing for the slowdown
      }, 0.8);

        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
          animation: tl,
        });

        return () => {
          trigger.kill();
          tl.kill();
        };
      });
      
      // Mobile-specific handling
      mm.add("(max-width: 639px)", () => {
        // On mobile, disable the complex horizontal scroll and use vertical stacking
        // This ensures better performance and usability on small screens
        return () => {}; // Cleanup function
      });

      return () => mm.revert();
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion, imagesReady]);

  return (
    <section ref={sectionRef} id="clients" className="bg-brand-navy text-brand-white">
      <div className="mx-auto flex h-[100svh] max-w-7xl flex-col px-6 py-10 lg:px-12">
        <div className="pt-2">
          <p className="text-[0.7rem] uppercase tracking-[0.55em] text-brand-gold/70">
            Selected Clients
          </p>
        </div>

        {prefersReducedMotion ? (
          <div className="mt-10 space-y-10 pb-12">
            {curated.map((client, idx) => (
              <article key={`${client.name}-${client.category}`} className="clientGallery-stackPanel">
                <div
                  className={[
                    "relative",
                    client.aspect === "portrait" ? "aspect-[3/4]" : "aspect-[4/3]",
                  ].join(" ")}
                >
                  <LuxuryImage
                    src={client.image}
                    alt={`${client.name} — ${client.category}`}
                    className="clientGallery-image"
                    loading={idx < 2 ? "eager" : "lazy"}
                    fetchPriority={idx === 0 ? "high" : "auto"}
                    decoding="async"
                    referrerPolicy="no-referrer"
                    fallbackLabel={client.name}
                  />
                </div>

                <div className="clientGallery-caption p-7 lg:p-10">
                  <h3
                    className="text-3xl leading-none text-brand-white lg:text-4xl"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {client.name}
                  </h3>
                  <p className="mt-3 text-[0.7rem] uppercase tracking-[0.5em] text-brand-gold">
                    {client.category}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="relative mt-8 flex-1 overflow-hidden">
            {/* Previous Button */}
            <div className="clientGallery-nav clientGallery-nav--prev">
              <button 
                type="button" 
                className="clientGallery-navButton"
                aria-label="Previous client"
                onClick={(e) => {
                  e.stopPropagation();
                  if (trackRef.current) {
                    // Check if we're on mobile (where horizontal scroll is disabled)
                    if (window.innerWidth <= 639) {
                      // On mobile, we could implement a different behavior if needed
                      // For now, we'll just prevent the default action
                      return;
                    }
                    
                    trackRef.current.scrollBy({
                      left: -trackRef.current.clientWidth * 0.8,
                      behavior: "smooth",
                    });
                  }
                }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            
            {/* Next Button */}
            <div className="clientGallery-nav clientGallery-nav--next">
              <button 
                type="button" 
                className="clientGallery-navButton"
                aria-label="Next client"
                onClick={(e) => {
                  e.stopPropagation();
                  if (trackRef.current) {
                    // Check if we're on mobile (where horizontal scroll is disabled)
                    if (window.innerWidth <= 639) {
                      // On mobile, we could implement a different behavior if needed
                      // For now, we'll just prevent the default action
                      return;
                    }
                    
                    trackRef.current.scrollBy({
                      left: trackRef.current.clientWidth * 0.8,
                      behavior: "smooth",
                    });
                  }
                }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div
              ref={trackRef}
              className="clientGallery-track"
              data-cursor="drag"
              data-cursor-label="DRAG"
            >
              {curated.map((client, idx) => (
                <article key={`${client.name}-${client.category}`} className="clientGallery-panel"
                onMouseEnter={(e) => {
                  const image = e.currentTarget.querySelector('.clientGallery-image');
                  if (image) {
                    gsap.to(image, {
                      scale: 1.05,
                      duration: 0.45,
                      ease: "power2.out"
                    });
                  }
                }}
                onMouseLeave={(e) => {
                  const image = e.currentTarget.querySelector('.clientGallery-image');
                  if (image) {
                    gsap.to(image, {
                      scale: 1,
                      duration: 0.35,
                      ease: "power2.out"
                    });
                  }
                }}
                >
                  <LuxuryImage
                    src={client.image}
                    alt={`${client.name} — ${client.category}`}
                    className="clientGallery-image"
                    loading={idx < 2 ? "eager" : "lazy"}
                    fetchPriority={idx === 0 ? "high" : "auto"}
                    decoding="async"
                    referrerPolicy="no-referrer"
                    fallbackLabel={client.name}
                  />

                  <div className="clientGallery-caption p-7 lg:p-10">
                    <h3
                      className="text-3xl leading-none text-brand-white lg:text-4xl"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {client.name}
                    </h3>
                    <p className="mt-3 text-[0.7rem] uppercase tracking-[0.5em] text-brand-gold">
                      {client.category}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
