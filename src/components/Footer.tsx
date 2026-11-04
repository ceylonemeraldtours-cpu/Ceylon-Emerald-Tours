import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { NAV_LINKS, SITE, SOCIALS, whatsappLink } from "@/lib/constants";
import CookieSettingsButton from "./CookieSettingsButton";
import { FacebookIcon, InstagramIcon, TripAdvisorIcon } from "./SocialIcons";
import Image from 'next/image';

const SOCIAL_LINKS = [
  { label: "TripAdvisor", href: SOCIALS.tripadvisor, Icon: TripAdvisorIcon },
  { label: "Facebook", href: SOCIALS.facebook, Icon: FacebookIcon },
  { label: "Instagram", href: SOCIALS.instagram, Icon: InstagramIcon },
];

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-white/10 bg-ceylon-night">
      <div className="container-x grid gap-12 py-16 sm:py-20 md:grid-cols-2 lg:grid-cols-12">
        {/* Brand */}
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3">
            <Image 
              src="/images/logo.jpg" 
              alt={SITE.name} 
              width={48} 
              height={48} 
              className="h-12 w-12 rounded-full object-cover border border-white/20 shadow-md"
            />
            <p className="font-display text-2xl font-semibold">{SITE.name}</p>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            Private tours, airport transfers and custom journeys across Sri Lanka, planned from
            Bandarawela.
          </p>
          <ul className="mt-6 flex gap-3">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${SITE.name} on ${label}`}
                  className="glass glow-hover flex h-11 w-11 items-center justify-center rounded-full text-white/85 hover:text-ceylon-glow"
                >
                  <Icon className="h-5 w-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Links */}
        <nav aria-label="Footer" className="lg:col-span-3">
          <h2 className="font-display text-lg font-semibold">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-white/70 transition hover:text-ceylon-glow"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div className="lg:col-span-4">
          <h2 className="font-display text-lg font-semibold">Contact</h2>
          <ul className="mt-4 space-y-4 text-sm text-white/75">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ceylon-glow" />
              <address className="not-italic">{SITE.address}</address>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-ceylon-glow" />
              <a href={`tel:${SITE.phoneTel}`} className="transition hover:text-ceylon-glow">
                {SITE.phoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-ceylon-glow" />
              <a
                href={`mailto:${SITE.email}`}
                className="break-all transition hover:text-ceylon-glow"
              >
                {SITE.email}
              </a>
            </li>
          </ul>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold mt-6"
          >
            <MessageCircle className="h-4 w-4" />
            Message us on WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <CookieSettingsButton className="self-start text-white/60 underline-offset-4 transition hover:text-ceylon-glow hover:underline" />
        </div>
      </div>
    </footer>
  );
}