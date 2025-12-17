import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "../providers/SmoothScroll";
import "../styles/menu-overlay.css";

gsap.registerPlugin(ScrollTrigger);

export type MenuItem = {
  label: string;
  href: string;
};

type MenuOverlayProps = {
  open: boolean;
  onClose: () => void;
  items?: MenuItem[];
};

const defaultItems: MenuItem[] = [
  { label: "Approach", href: "#philosophy" },
  { label: "Work", href: "#services" },
  { label: "Clients", href: "#clients" },
  { label: "Contact", href: "#contact" },
];

function getFocusable(container: HTMLElement) {
  const selector =
    'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"),
  );
}

export default function MenuOverlay({ open, onClose, items = defaultItems }: MenuOverlayProps) {
  const lenis = useLenis();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const pendingTargetRef = useRef<string | null>(null);
  const bodyOverflowRef = useRef<string>("");
  const [interactive, setInteractive] = useState(false);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    if (prefersReducedMotion) {
      tlRef.current = null;
      gsap.set(overlay, { autoAlpha: 0 });
      gsap.set(panel, { y: 0 });
      gsap.set(panel.querySelectorAll("[data-menu-item]"), { y: 0, opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const menuItems = panel.querySelectorAll("[data-menu-item]");

      gsap.set(overlay, { autoAlpha: 0 });
      gsap.set(panel, { y: 8 });
      gsap.set(menuItems, { y: 10, opacity: 0 });

      const tl = gsap.timeline({ paused: true });
      tl.to(overlay, { autoAlpha: 1, duration: 0.55, ease: "power2.out" }, 0)
        .to(panel, { y: 0, duration: 0.8, ease: "power3.out" }, 0.05)
        .to(
          menuItems,
          { y: 0, opacity: 1, duration: 1.0, ease: "power3.out", stagger: 0.06 },
          0.12,
        );

      tlRef.current = tl;
    }, overlay);

    return () => {
      tlRef.current?.kill();
      tlRef.current = null;
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const lockScroll = () => {
      bodyOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.classList.add("lenis-stopped");
      lenis?.stop();
    };

    const unlockScroll = () => {
      document.body.style.overflow = bodyOverflowRef.current;
      document.documentElement.classList.remove("lenis-stopped");
      lenis?.start();
      ScrollTrigger.refresh();
    };

    if (open) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      setInteractive(true);
      lockScroll();

      if (prefersReducedMotion) {
        gsap.set(overlay, { autoAlpha: 1 });
      } else {
        if (tlRef.current) {
          tlRef.current.eventCallback("onReverseComplete", null);
          tlRef.current.play(0);
        } else {
          gsap.set(overlay, { autoAlpha: 1 });
        }
      }

      requestAnimationFrame(() => {
        const first = overlay.querySelector<HTMLElement>("[data-menu-first]");
        try {
          first?.focus({ preventScroll: true });
        } catch {
          first?.focus();
        }
      });
    } else {
      const finishClose = () => {
        setInteractive(false);
        unlockScroll();

        const restoreEl = restoreFocusRef.current;
        if (restoreEl) {
          try {
            restoreEl.focus({ preventScroll: true });
          } catch {
            restoreEl.focus?.();
          }
        }

        const target = pendingTargetRef.current;
        pendingTargetRef.current = null;
        if (!target) return;

        requestAnimationFrame(() => {
          if (lenis && typeof (lenis as any).scrollTo === "function") {
            (lenis as any).scrollTo(target, {
              duration: 1.15,
              easing: (t: number) => 1 - Math.pow(1 - t, 3),
            });
            return;
          }

          const el =
            target.startsWith("#") ? document.querySelector<HTMLElement>(target) : null;
          el?.scrollIntoView({ block: "start" });
        });
      };

      if (prefersReducedMotion) {
        gsap.set(overlay, { autoAlpha: 0 });
        finishClose();
      } else if (tlRef.current) {
        tlRef.current.eventCallback("onReverseComplete", finishClose);
        tlRef.current.reverse();
      } else {
        finishClose();
      }
    }
  }, [open, lenis, prefersReducedMotion]);

  useEffect(() => {
    if (!open || !interactive) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const focusables = getFocusable(overlay);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, interactive, onClose]);

  return (
    <div
      ref={overlayRef}
      className={[
        "menuOverlay fixed inset-0 z-[80] bg-brand-navy/95 text-brand-white",
        interactive ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <div className="mx-auto flex h-full max-w-7xl flex-col px-6 py-10 lg:px-12 lg:py-14">
        <div className="flex items-center justify-between">
          <div
            className="select-none text-brand-white"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            <span className="text-lg tracking-[0.32em]">AND PR</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs uppercase tracking-[0.28em] text-brand-white/90 hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/60 focus-visible:ring-offset-4 focus-visible:ring-offset-brand-navy"
          >
            Close
          </button>
        </div>

        <div ref={panelRef} className="flex flex-1 items-center">
          <nav aria-label="Site" className="w-full">
            <ul className="space-y-7 lg:space-y-8">
              {items.map((item, idx) => (
                <li key={item.label} data-menu-item>
                  <a
                    data-menu-first={idx === 0 ? true : undefined}
                    href={item.href}
                    className="menuOverlay-link text-[2.4rem] leading-[1.05] text-brand-white lg:text-[3.6rem]"
                    style={{ fontFamily: "var(--font-serif)" }}
                    onClick={(e) => {
                      e.preventDefault();
                      pendingTargetRef.current = item.href;
                      onClose();
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-12 flex items-center justify-start gap-4">
              <span className="h-px w-10 bg-brand-gold/70" aria-hidden="true" />
              <p className="text-[0.7rem] uppercase tracking-[0.55em] text-brand-white/55">
                Table of Contents
              </p>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
