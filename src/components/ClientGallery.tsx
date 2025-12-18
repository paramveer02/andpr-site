"use client";

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
  const [imagesReady, setImagesReady] = useState(false);
  const [showPrevButton, setShowPrevButton] = useState(false);
  const [showNextButton, setShowNextButton] = useState(true);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const curated = useMemo(() => clients.slice(0, 5), []);

  // --- Preload images
  useEffect(() => {
    if (typeof window === "undefined" || typeof Image === "undefined") return;
    const preload = (urls: string[]) => {
      const tasks: Array<Promise<void>> = [];
      urls.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
      return Promise.allSettled(tasks).then(() => undefined);
    };
    preload(curated.slice(0, 2).map((c) => c.image));
    setImagesReady(true);
  }, [curated]);

  // --- Track scroll position (Mobile Only)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleScroll = () => {
      if (window.innerWidth >= 1024) return; // Don't run logic on desktop
      const { scrollLeft, scrollWidth, clientWidth } = track;
      const maxScroll = scrollWidth - clientWidth - 5;
      setShowPrevButton(scrollLeft > 5);
      setShowNextButton(scrollLeft < maxScroll);
    };

    track.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      track.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // --- Horizontal pinned scroll (Desktop Only)
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop: Pinned Scroll (Min Width 1024px)
      mm.add("(min-width: 1024px)", () => {
        
        // FIX 1: Robust Distance Calculation
        // We calculate the total width of the track minus the viewport width.
        // We add a small buffer (+100px) to ensure the last item clears the edge.
        const getDistance = () => {
          return -(track.scrollWidth - window.innerWidth + 100);
        };

        gsap.set(track, { x: 0, willChange: "transform", force3D: true });

        const tl = gsap.timeline({ defaults: { ease: "none" } });
        
        tl.to(track, { 
            x: getDistance, 
            duration: 1 
        });

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          // FIX 2: Increased Scroll Distance (500%)
          // This makes the scroll feel "Calm" and "Heavy"
          end: "+=500%", 
          pin: true,
          pinSpacing: true,
          scrub: 1.5, // FIX 3: Increased Scrub for "Inertia" feel
          anticipatePin: 1,
          invalidateOnRefresh: true,
          animation: tl,
        });
      });

      return () => mm.revert();
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion, imagesReady]);

  // --- Button Handlers (Mobile Only)
  const handleScroll = (direction: "left" | "right") => {
    if (trackRef.current) {
      const panel = trackRef.current.querySelector('.clientGallery-panel');
      const panelWidth = panel ? panel.clientWidth : window.innerWidth * 0.85;
      const gap = 16; 
      const scrollAmount = panelWidth + gap;

      trackRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section ref={sectionRef} id="clients" className="bg-brand-navy text-brand-white relative">
      <div className="mx-auto flex h-[100svh] max-w-7xl flex-col px-6 py-10 lg:px-12">
        <div className="pt-2">
          <p className="text-[0.7rem] uppercase tracking-[0.55em] text-brand-gold/70">
            Selected Clients
          </p>
        </div>

        {prefersReducedMotion ? (
          <div className="mt-10 space-y-10 pb-12">
            {curated.map((client) => (
              <article key={`${client.name}-${client.category}`} className="clientGallery-stackPanel">
                <div className={["relative", client.aspect === "portrait" ? "aspect-[3/4]" : "aspect-[4/3]"].join(" ")}>
                  <LuxuryImage
                    src={client.image}
                    alt={`${client.name} — ${client.category}`}
                    className="clientGallery-image"
                  />
                </div>
                <div className="clientGallery-caption p-7 lg:p-10">
                  <h3 className="text-3xl leading-none text-brand-white lg:text-4xl" style={{ fontFamily: "var(--font-serif)" }}>
                    {client.name}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="relative mt-8 flex-1 overflow-hidden">
            
            {/* --- NAVIGATION CONTROLS (Mobile Only) --- */}
            <div className="clientGallery-controls">
              <button 
                type="button" 
                className={`clientGallery-navButton ${!showPrevButton ? 'opacity-0 pointer-events-none' : ''}`}
                aria-label="Previous client"
                onClick={(e) => {
                  e.stopPropagation();
                  handleScroll("left");
                }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>

              <button 
                type="button" 
                className={`clientGallery-navButton ${!showNextButton ? 'opacity-0 pointer-events-none' : ''}`}
                aria-label="Next client"
                onClick={(e) => {
                  e.stopPropagation();
                  handleScroll("right");
                }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            {/* Track */}
            <div
              ref={trackRef}
              className="clientGallery-track"
              data-cursor="drag"
              data-cursor-label="DRAG"
            >
              {curated.map((client, idx) => (
                <article 
                  key={`${client.name}-${client.category}`} 
                  className="clientGallery-panel"
                  onMouseEnter={(e) => {
                    const image = e.currentTarget.querySelector('.clientGallery-image');
                    if (image) gsap.to(image, { scale: 1.05, duration: 0.45, ease: "power2.out" });
                  }}
                  onMouseLeave={(e) => {
                    const image = e.currentTarget.querySelector('.clientGallery-image');
                    if (image) gsap.to(image, { scale: 1, duration: 0.35, ease: "power2.out" });
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