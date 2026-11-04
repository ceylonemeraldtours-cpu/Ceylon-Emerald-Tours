import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ServicesGrid from "@/components/ServicesGrid";
import WhyChooseUs from "@/components/WhyChooseUs";
import GalleryPreview from "@/components/GalleryPreview";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Private Sri Lanka Tours, Airport Transfers & Custom Journeys",
  description:
    "Book private tours, airport transfers and custom itineraries across Sri Lanka. A local team in Bandarawela plans your hill country, cultural triangle, safari and beach days.",
  path: "/",
  ogKey: "home",
  keywords: ["Sri Lanka tour packages", "Ella tours", "Nuwara Eliya tours", "Kandy Sigiriya tour"],
});

// Static page: built once and served from the CDN.
export const dynamic = "force-static";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ServicesGrid />
        <WhyChooseUs />
        <GalleryPreview />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
