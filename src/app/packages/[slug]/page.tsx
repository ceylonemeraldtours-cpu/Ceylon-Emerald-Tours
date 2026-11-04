import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Clock, ExternalLink, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IconByName from "@/components/IconByName";
import RichText from "@/components/RichText";
import Accordion from "@/components/tour/Accordion";
import PhotoCollage from "@/components/tour/PhotoCollage";
import TourBooking from "@/components/tour/TourBooking";
import TourTabs from "@/components/tour/TourTabs";
import JsonLd from "@/components/JsonLd";
import { getTourBySlug, getTourSummary, tours } from "@/data/toursData";
import { SITE } from "@/lib/constants";
import { absoluteUrl, buildMetadata, ogImageUrl } from "@/lib/seo";

type Props = { params: { slug: string } };

// Every tour page is generated at build time. Unknown slugs return 404 without rendering.
export const dynamicParams = false;

export function generateStaticParams() {
  return tours.map((t) => ({ slug: t.id }));
}

export function generateMetadata({ params }: Props): Metadata {
  const tour = getTourBySlug(params.slug);
  if (!tour) return { title: "Tour not found", robots: { index: false, follow: false } };
  return buildMetadata({
    title: tour.title,
    description: getTourSummary(tour, 160),
    path: `/packages/${tour.id}`,
    ogKey: tour.id,
    keywords: [tour.title, `${tour.duration} Sri Lanka tour`, tour.tourInfo.tourType],
  });
}

const sectionClass = "scroll-mt-36 border-b border-ceylon-deep/10 py-10 first:pt-0 last:border-b-0";
const headingClass = "font-display text-2xl font-semibold text-ceylon-deep sm:text-3xl";

export default function TourDetailPage({ params }: Props) {
  const tour = getTourBySlug(params.slug);
  if (!tour) notFound();

  // Day tours have an empty itinerary: their page shows the highlight grid only.
  const hasItinerary = tour.itinerary.length > 0;
  const info = tour.tourInfo;
  const mapQuery = encodeURIComponent(tour.mapQuery);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "highlights", label: "Highlights" },
    ...(hasItinerary ? [{ id: "itinerary", label: "Itinerary" }] : []),
    { id: "included", label: "Included & Excluded" },
    { id: "faqs", label: "FAQs" },
    { id: "map", label: "Map" },
  ];

  const glance = [
    { label: "Tour type", value: info.tourType },
    { label: "Best season", value: info.bestSeason },
    ...(info.accommodation ? [{ label: "Accommodation", value: info.accommodation }] : []),
    ...(info.maxAltitude ? [{ label: "Max altitude", value: info.maxAltitude }] : []),
  ];

  return (
    <>
      <Navbar />
      <main className="pb-24 lg:pb-0">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name: tour.title,
            description: getTourSummary(tour, 300),
            url: absoluteUrl(`/packages/${tour.id}`),
            image: absoluteUrl(ogImageUrl(tour.id)),
            touristType: info.tourType,
            provider: { "@type": "TravelAgency", name: SITE.name, url: absoluteUrl("/") },
            offers: {
              "@type": "Offer",
              price: tour.price,
              priceCurrency: "USD",
              url: absoluteUrl(`/packages/${tour.id}`),
              availability: "https://schema.org/InStock",
            },
          }}
        />
        {/* Banner */}
        <section className="bg-gradient-to-br from-ceylon-deep via-ceylon-night to-ceylon-night pb-10 pt-28 sm:pt-32">
          <div className="container-x">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-ceylon-glow"
            >
              <ArrowLeft className="h-4 w-4" />
              All packages
            </Link>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold">
                <Clock className="h-3.5 w-3.5 text-ceylon-glow" />
                {tour.duration}
              </span>
              <span className="rounded-full bg-gradient-to-r from-ceylon-glow to-ceylon-gold px-3 py-1.5 text-xs font-bold text-ceylon-night">
                {tour.discountBadge}
              </span>
            </div>
            <h1 className="mt-4 max-w-4xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
              {tour.title}
            </h1>
            <div className="mt-8">
              <PhotoCollage photos={tour.gallery} title={tour.title} />
            </div>
          </div>
        </section>

        <TourTabs tabs={tabs} />

        {/* Body */}
        <div className="bg-ceylon-mist text-ceylon-ink">
          <div className="container-x grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <div>
              {/* Overview */}
              <section id="overview" className={sectionClass}>
                <h2 className={headingClass}>Overview</h2>
                <RichText text={tour.overview} className="mt-5 max-w-3xl" />
                <dl className="mt-8 grid gap-3 sm:grid-cols-2">
                  {glance.map((g) => (
                    <div key={g.label} className="rounded-2xl border border-ceylon-deep/10 bg-white px-5 py-4">
                      <dt className="text-xs text-ceylon-ink/55">{g.label}</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-ceylon-deep">{g.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* Highlights */}
              <section id="highlights" className={sectionClass}>
                <h2 className={headingClass}>Highlights</h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {tour.highlights.map((h) => (
                    <li
                      key={h.title}
                      className="glow-hover rounded-2xl border border-ceylon-deep/10 bg-white p-5 hover:-translate-y-1"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ceylon-deep via-ceylon-night to-ceylon-deep text-ceylon-glow ring-1 ring-ceylon-glow/40">
                        <IconByName name={h.iconName} className="h-6 w-6" />
                      </span>
                      <h3 className="mt-4 font-display text-lg font-semibold text-ceylon-deep">{h.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ceylon-ink/70">{h.description}</p>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Itinerary (multi-day tours only) */}
              {hasItinerary && (
                <section id="itinerary" className={sectionClass}>
                  <h2 className={headingClass}>Itinerary</h2>
                  <div className="mt-6">
                    <Accordion
                      items={tour.itinerary.map((d) => ({
                        marker: `Day ${String(d.day).padStart(2, "0")}`,
                        title: d.title,
                        content: d.description,
                      }))}
                      defaultOpen={[0]}
                    />
                  </div>
                </section>
              )}

              {/* Included / excluded */}
              <section id="included" className={sectionClass}>
                <h2 className={headingClass}>Included &amp; excluded</h2>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-200 bg-white p-6">
                    <h3 className="font-display text-lg font-semibold text-ceylon-deep">What&rsquo;s included</h3>
                    <ul className="mt-4 space-y-3">
                      {tour.included.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm text-ceylon-ink/80">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-red-200 bg-white p-6">
                    <h3 className="font-display text-lg font-semibold text-ceylon-deep">What&rsquo;s not included</h3>
                    <ul className="mt-4 space-y-3">
                      {tour.excluded.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm text-ceylon-ink/80">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                            <X className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* FAQs */}
              <section id="faqs" className={sectionClass}>
                <h2 className={headingClass}>Frequently asked questions</h2>
                <div className="mt-6">
                  <Accordion
                    items={tour.faqs.map((f) => ({ title: f.question, content: f.answer }))}
                    defaultOpen={[]}
                  />
                </div>
              </section>

              {/* Map */}
              <section id="map" className={sectionClass}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <h2 className={headingClass}>Map</h2>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-ceylon-deep transition hover:text-ceylon-gold"
                  >
                    Open in Google Maps
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <div className="mt-6 overflow-hidden rounded-2xl border border-ceylon-deep/15">
                  <iframe
                    title={`Map for ${tour.title}`}
                    src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-72 w-full sm:h-96"
                  />
                </div>
              </section>
            </div>

            <aside className="lg:sticky lg:top-40 lg:max-h-[calc(100svh-11rem)] lg:self-start lg:overflow-y-auto lg:pb-2 no-scrollbar">
              <TourBooking tour={tour} />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
