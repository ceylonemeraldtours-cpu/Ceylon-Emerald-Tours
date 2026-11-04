import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryExplorer from "@/components/gallery/GalleryExplorer";
import { InstagramIcon } from "@/components/SocialIcons";
import { GALLERY_ITEMS } from "@/data/galleryData";
import { SOCIALS, whatsappLink } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sri Lanka Photo Gallery: Destinations & Happy Guests",
  description:
    "Browse photos of Sri Lanka's tea hills, ancient cities, safaris and beaches, plus real moments from our guests' private tours with Ceylon Emerald Tours.",
  path: "/gallery",
  keywords: ["Sri Lanka photo gallery", "Sri Lanka tourist attractions", "Sri Lanka tour photos", "Ella Sigiriya Yala photos"],
});

// Static page: built once and served from the CDN.
export const dynamic = "force-static";

export default function GalleryPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Banner */}
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-ceylon-deep via-ceylon-night to-ceylon-night pb-14 pt-36 sm:pb-16 sm:pt-44">
          <div aria-hidden="true" className="absolute -right-24 top-10 -z-10 h-80 w-80 rounded-full bg-ceylon-glow/20 blur-3xl" />
          <div aria-hidden="true" className="absolute -left-32 bottom-0 -z-10 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
          <div className="container-x">
            <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Sri Lanka through our guests&rsquo; eyes
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              The places on our routes, and the people who travelled them. Tap any photo to see it larger.
            </p>
          </div>
        </section>

        {/* Gallery */}
        <section className="section-y !pt-12 bg-gradient-to-b from-ceylon-night to-ceylon-deep/60">
          <div className="container-x">
            <GalleryExplorer items={GALLERY_ITEMS} />
          </div>
        </section>

        {/* Call to action */}
        <section className="section-y bg-ceylon-night">
          <div className="container-x">
            <div className="glass rounded-3xl p-8 text-center sm:p-12">
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Want to be in our next photo?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/70">
                Pick a ready-made route or tell us what you love and we will plan it around you.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/packages" className="btn-gold">
                  Explore tour packages
                </Link>
                <a
                  href={whatsappLink("Hello Ceylon Emerald Tours, I saw your gallery and I'd like to plan a trip.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glass"
                >
                  <MessageCircle className="h-4 w-4" />
                  Plan on WhatsApp
                </a>
                <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer" className="btn-glass">
                  <InstagramIcon className="h-4 w-4" />
                  More on Instagram
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
