// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const links = [
    { href: "/barbers", label: "Find Barbers" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/join", label: "Join as Barber" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <a href="/" className="inline-flex items-center gap-2 font-display text-2xl font-semibold uppercase tracking-tight text-towel">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-leather font-mono text-sm" aria-hidden="true">
            ✂
          </span>
          BarberCraft
        </a>

        {!isMobile && (
          <ul className="flex list-none items-center gap-8">
            {links.map((l, i) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className={`font-mono text-[0.78rem] font-medium uppercase tracking-[0.18em] no-underline transition-colors ${
                    hoverIndex === i ? "text-amber" : "text-towel/80"
                  }`}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href="/book" className="btn-primary px-4 py-2.5">
                Book Now
              </a>
            </li>
          </ul>
        )}

        {isMobile && (
          <button
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((s) => !s)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-sm border border-white/15 bg-ink-raised text-xl text-towel transition-colors hover:border-amber hover:text-amber"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </div>

      {isMobile && menuOpen && (
        <div className="absolute right-4 top-16 min-w-[180px] rounded-sm border border-white/10 bg-ink-raised p-2 shadow-2xl">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-sm px-4 py-2.5 font-mono text-sm uppercase tracking-[0.15em] text-towel/85 no-underline transition-colors hover:bg-amber/10 hover:text-amber"
            >
              {l.label}
            </a>
          ))}
          <a href="/book" onClick={() => setMenuOpen(false)} className="btn-primary mt-2 w-full px-4 py-2.5">
            Book Now
          </a>
        </div>
      )}
    </nav>
  );
}