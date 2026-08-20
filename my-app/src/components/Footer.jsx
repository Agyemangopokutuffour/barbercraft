import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-ink pb-10 pt-14 text-towel">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-10 px-6">
        <div className="min-w-[200px] flex-1">
          <a href="/" className="inline-flex items-center gap-2 font-display text-2xl font-semibold uppercase tracking-tight no-underline">
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-leather font-mono text-sm" aria-hidden="true">
              ✂
            </span>
            BarberCraft
          </a>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-silver">
            Master barbers, master crafts. The house of the fade, the cut, and the straight razor.
          </p>
        </div>

        <div className="min-w-[160px]">
          <h3 className="mb-3 font-mono text-[0.72rem] font-bold uppercase tracking-[0.25em] text-amber">
            Contact Us
          </h3>
          <p className="text-sm text-silver">info@barbercraft.com</p>
          <p className="mt-1 text-sm text-silver">+233 55 123 4567</p>
          <p className="mt-1 text-sm text-silver">123 Barber Lane, Accra, Ghana</p>
        </div>

        <div className="min-w-[160px]">
          <h3 className="mb-3 font-mono text-[0.72rem] font-bold uppercase tracking-[0.25em] text-amber">
            Quick Links
          </h3>
          {[
            { href: '/', label: 'Home' },
            { href: '/barbers', label: 'Barbers' },
            { href: '/services', label: 'Services' },
            { href: '/book', label: 'Book Now' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="mb-1.5 block text-sm text-silver no-underline transition-colors hover:text-amber"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="min-w-[160px]">
          <h3 className="mb-3 font-mono text-[0.72rem] font-bold uppercase tracking-[0.25em] text-amber">
            Follow Us
          </h3>
          <div className="flex gap-3">
            {[
              { href: 'https://facebook.com', label: 'Facebook', icon: 'fb' },
              { href: 'https://twitter.com', label: 'Twitter', icon: 'tw' },
              { href: 'https://instagram.com', label: 'Instagram', icon: 'ig' },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-white/15 font-mono text-xs text-silver no-underline transition-colors hover:border-amber hover:text-amber"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-10 px-6 text-center font-mono text-xs text-silver/70">
        © {year} BarberCraft. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;