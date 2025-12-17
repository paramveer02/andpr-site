import { useCallback, useState } from "react";
import Hero from "../components/Hero";
import ServicesIndex from "../components/ServicesIndex";
import ClientGallery from "../components/ClientGallery";
import Philosophy from "../components/Philosophy";
import ContactInvitation from "../components/ContactInvitation";
import MenuOverlay from "../components/MenuOverlay";
import LuxuryCursor from "../components/LuxuryCursor";
import SoftParallax from "../components/SoftParallax";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="min-h-dvh bg-brand-navy" style={{ fontFamily: "var(--font-sans)" }}>
      <LuxuryCursor />
      <SoftParallax />
      <Hero menuOpen={menuOpen} onToggleMenu={toggleMenu} />
      <ServicesIndex />
      <ClientGallery />
      <Philosophy />
      <ContactInvitation />
      <MenuOverlay open={menuOpen} onClose={closeMenu} />
    </div>
  );
}
