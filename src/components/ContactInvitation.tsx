import { useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/contact-invitation.css";

gsap.registerPlugin(ScrollTrigger);

type ContactInvitationProps = {
  eyebrow?: string;
  heading?: string;
  signature?: string;
  subtext?: string;
  contactLabel?: string;
  email?: string;
  addressLines?: string[];
  mapLabel?: string;
  mapHref?: string;
  whatsappLabel?: string;
  whatsappHref?: string;
};

export default function ContactInvitation({
  eyebrow = "Contact",
  heading = "Let’s create impact",
  signature = "AND PR AGENCY | FASHION PR AGENCY",
  subtext = "NEW DELHI • MUMBAI • GLOBAL",
  contactLabel = "Start a conversation",
  email = "hello@andpr.com",
  addressLines = ["First Floor, H6, Sultanpur, New Delhi 110030", "By appointment only"],
  mapLabel = "Directions",
  mapHref = "https://www.google.com/maps/search/?api=1&query=First%20Floor%2C%20H6%2C%20Sultanpur%2C%20New%20Delhi%20110030",
  whatsappLabel = "WhatsApp",
  whatsappHref,
}: ContactInvitationProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);

      const items = q("[data-contact-reveal]");
      gsap.set(items, { opacity: 0, y: 10, willChange: "transform,opacity" });

      ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 1.15,
            ease: "power3.out",
            stagger: 0.08,
            clearProps: "willChange",
          });
        },
      });
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="contactSection bg-brand-white text-brand-navy"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* Soft top/bottom fade (luxury “air”) */}
      <div className="contactFade contactFade--top" aria-hidden="true" />
      <div className="contactFade contactFade--bottom" aria-hidden="true" />

      <div className="mx-auto flex min-h-[92svh] max-w-7xl flex-col justify-center px-6 py-20 text-center lg:min-h-[100svh] lg:px-12">
        <p
          data-contact-reveal
          className="contactEyebrow text-[0.72rem] uppercase tracking-[0.5em] text-brand-navy/45"
        >
          {eyebrow}
        </p>

        <div data-contact-reveal className="mx-auto mt-8 w-full max-w-3xl">
          <h2
            className="
              contactHeading
              text-[3.0rem]
              leading-[0.92]
              sm:text-[4.2rem]
              lg:text-[6.1rem]
              whitespace-normal
              lg:whitespace-nowrap
            "
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {heading}
          </h2>


          {/* Quiet signature divider */}
          <div className="contactSignatureWrap mt-8">
            <p className="contactSignature text-[0.72rem] uppercase tracking-[0.44em] text-brand-navy/60">
              {signature}
            </p>
            <span className="contactRule" aria-hidden="true" />
          </div>

          {/* One single “where” line – no repetition */}
          <p className="mt-7 text-[0.75rem] uppercase tracking-[0.45em] text-brand-navy/50">
            {subtext}
          </p>
        </div>

        {/* CTA */}
        <div data-contact-reveal className="mt-14">
          <a
            href={`mailto:${email}`}
            data-cursor="link"
            data-cursor-label="OPEN"
            className="contactCtaInline"
          >
            <span className="contactCtaLabel text-xs uppercase tracking-[0.36em]">
              {contactLabel}
            </span>
            <span className="contactCtaMeta">{email}</span>
          </a>
        </div>

        {/* Details row (feels “curated”, not stacked) */}
        <div data-contact-reveal className="contactDetails mx-auto mt-14 w-full max-w-3xl">
          <div className="contactDetailsCard">
            <div className="contactDetailsGrid">
              <div className="contactDetailsCol">
                <div className="contactDetailsKicker">Office</div>
                <div className="contactDetailsValue">{addressLines?.[0] ?? "—"}</div>
              </div>

              <div className="contactDetailsCol">
                <div className="contactDetailsKicker">Availability</div>
                <div className="contactDetailsValue">{addressLines?.[1] ?? "—"}</div>
              </div>
            </div>

            <div className="contactDetailsFooter">
              <div className="contactFooterLinks">
                <a
                  className="contactMiniLink"
                  href={mapHref}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="link"
                  data-cursor-label="OPEN"
                >
                  {mapLabel}
                  <span aria-hidden="true"> ↗</span>
                </a>
                {whatsappHref ? (
                  <a
                    className="contactMiniLink"
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="link"
                    data-cursor-label="OPEN"
                  >
                    {whatsappLabel}
                    <span aria-hidden="true"> ↗</span>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
