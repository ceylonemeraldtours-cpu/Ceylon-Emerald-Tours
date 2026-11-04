export const SITE = {
  name: "Ceylon Emerald Tours",
  email: "ceylonemeraldtours@gmail.com",
  phoneDisplay: "+94 74 191 8325",
  phoneTel: "+94741918325",
  whatsappNumber: "94741918325",
  address: "Gedara arawa halpe, hela halpe, bandarawela, Sri Lanka",
} as const;

// TODO: replace with the exact profile URLs for each account.
export const SOCIALS = {
  tripadvisor: "https://www.tripadvisor.com/",
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
} as const;

export function whatsappLink(
  message = "Hello Ceylon Emerald Tours, I'd like to plan a trip."
) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

// Plain "/#id" and "/packages#id" links work from any route and keep smooth scrolling.
export const NAV_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Packages", href: "/packages" },
  { label: "Transfers", href: "/transfers" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/#contact" },
] as const;

export const DESTINATIONS = [
  "Ella",
  "Nuwara Eliya",
  "Horton Plains",
  "Haputale",
  "Kandy",
] as const;

// Draft copy: edit freely.
export const SERVICES = [
  {
    key: "transfers",
    title: "Airport Transfers",
    description:
      "Private rides between Bandaranaike Airport and your hotel, with a driver waiting when you land.",
    href: "/transfers",
    icon: "plane",
  },
  {
    key: "day-tours",
    title: "Day Tours",
    description:
      "Waterfalls, tea estates and viewpoints around Ella, Haputale and Nuwara Eliya, back in time for dinner.",
    href: "/packages#day-tours",
    icon: "sunrise",
  },
  {
    key: "long-tours",
    title: "Long Tours",
    description:
      "Multi-day journeys from the hill country to the cultural triangle and the south coast.",
    href: "/packages#long-tours",
    icon: "mountain",
  },
  {
    key: "custom",
    title: "Custom Tour",
    description:
      "Tell us your dates, interests and pace, and we plan the route around you.",
    href: "/custom-tour",
    icon: "pen",
  },
] as const;

// Draft copy: edit freely.
export const REASONS = [
  {
    title: "We live here",
    text: "We are based in Bandarawela, so we know which road, viewpoint and train seat is worth your morning.",
    icon: "pin",
  },
  {
    title: "Private by default",
    text: "Your vehicle, your driver, your pace. No shared coaches and no fixed stops.",
    icon: "users",
  },
  {
    title: "Planned around you",
    text: "Every itinerary adapts to your dates, interests and energy.",
    icon: "compass",
  },
  {
    title: "Comfortable on the road",
    text: "Clean, comfortable vehicles and experienced drivers for winding hill-country roads.",
    icon: "car",
  },
  {
    title: "One message away",
    text: "Chat on WhatsApp and talk directly to the people planning your trip.",
    icon: "message",
  },
  {
    title: "Clear quotes",
    text: "What is included is spelled out before you confirm anything.",
    icon: "shield",
  },
] as const;

export const GALLERY = [
  { title: "Nine Arches Bridge, Ella", src: "/images/gallery/nine-arches.jpg" },
  { title: "Tea country, Nuwara Eliya", src: "/images/gallery/tea-country.jpg" },
  { title: "Horton Plains", src: "/images/gallery/worlds-end.jpg" },
  { title: "Galle Fort", src: "/images/gallery/galle-fort.jpg" },
  { title: "Ravana Falls", src: "/images/gallery/ravana-falls.jpg" },
  { title: "Unawatuna Bay", src: "/images/gallery/unawatuna.jpg" },
] as const;

// Guest reviews now live in src/data/reviewsData.ts.
