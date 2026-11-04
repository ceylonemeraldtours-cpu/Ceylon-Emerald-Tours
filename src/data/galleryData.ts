// Gallery content for /gallery.
//
// Photos live in /public/images/gallery/ (see public/images/README.md for the full file list).
// Until a file exists, its tile shows an emerald gradient, so nothing breaks.
//
// The "past-customer" photos should be real photos of your guests on tour. Only publish photos
// of guests who have agreed to it, and keep captions general (no full names) unless they asked.

export type GalleryCategory = "past-customer" | "cultural" | "wildlife" | "hill-country" | "beaches";

export interface GalleryItem {
  id: string;
  title: string;
  /** Short line under the title, e.g. the place or the moment. */
  caption: string;
  category: GalleryCategory;
  src: string;
  alt: string;
}

export const GALLERY_FILTERS: { key: "all" | GalleryCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "past-customer", label: "Past Customer Tours" },
  { key: "cultural", label: "Cultural & Heritage" },
  { key: "wildlife", label: "Wildlife & Safaris" },
  { key: "hill-country", label: "Hill Country" },
  { key: "beaches", label: "Beaches" },
];

export const CATEGORY_LABEL: Record<GalleryCategory, string> = {
  "past-customer": "Past Customer Tours",
  cultural: "Cultural & Heritage",
  wildlife: "Wildlife & Safaris",
  "hill-country": "Hill Country",
  beaches: "Beaches",
};

const img = (name: string) => `/images/gallery/${name}.jpg`;

export const GALLERY_ITEMS: GalleryItem[] = [
  /* ---------------- Past customer tours ---------------- */
  {
    id: "guests-nine-arches",
    title: "Guests at Nine Arches Bridge",
    caption: "Waiting for the morning train in Ella",
    category: "past-customer",
    src: img("customers/nine-arches-guests"),
    alt: "Happy guests posing on a Ceylon Emerald Tours trip at Nine Arches Bridge in Ella",
  },
  {
    id: "guests-tea-estate",
    title: "Moments with Guests",
    caption: "Making moments with guests",
    category: "past-customer",
    src: img("customers/moments-guests"),
    alt: "Smiling travellers walking through a tea estate with a Ceylon Emerald Tours guide",
  },
  {
    id: "guests-sigiriya",
    title: "Group pic",
    caption: "Group Photo with guest & Vehicle",
    category: "past-customer",
    src: img("customers/photo-guests"),
    alt: "Happy tour guests celebrating at the top of Sigiriya Rock",
  },
  {
    id: "guests-safari",
    title: "Safari morning",
    caption: "Jeep safari guests spotting elephants",
    category: "past-customer",
    src: img("customers/safari-guests"),
    alt: "Guests in a safari jeep watching elephants in a Sri Lankan national park",
  },
  {
    id: "guests-hill-train",
    title: "On the hill-country train",
    caption: "Kandy to Ella, doors open and cameras out",
    category: "past-customer",
    src: img("customers/train-guests"),
    alt: "Travellers leaning out of the doorway of the blue train through Sri Lanka's hill country",
  },
  {
    id: "guests-beach",
    title: "At Rawana Fall",
    caption: "The last evening of a 9-day tour",
    category: "past-customer",
    src: img("customers/rawana-guests"),
    alt: "Happy guests on a south coast beach at sunset at the end of their tour",
  },

  /* ---------------- Hill Country ---------------- */
  {
    id: "nine-arches",
    title: "Nine Arches Bridge",
    caption: "Ella",
    category: "hill-country",
    src: img("nine-arches"),
    alt: "The stone Nine Arches Bridge curving through green jungle near Ella",
  },
  {
    id: "tea-country",
    title: "Tea country",
    caption: "Nuwara Eliya",
    category: "hill-country",
    src: img("tea-country"),
    alt: "Rows of tea bushes rolling across the hills around Nuwara Eliya",
  },
  {
    id: "worlds-end",
    title: "World's End",
    caption: "Horton Plains National Park",
    category: "hill-country",
    src: img("worlds-end"),
    alt: "The sheer cliff edge at World's End in Horton Plains National Park",
  },
  {
    id: "haputale",
    title: "Haputale ridge",
    caption: "Haputale",
    category: "hill-country",
    src: img("haputale"),
    alt: "Misty ridgeline and valleys seen from Haputale",
  },
  {
    id: "ravana-falls",
    title: "Ravana Falls",
    caption: "Near Ella",
    category: "hill-country",
    src: img("ravana-falls"),
    alt: "Ravana Falls tumbling down a rock face beside the Ella road",
  },
  {
    id: "hill-train",
    title: "The hill-country train",
    caption: "Kandy to Ella line",
    category: "hill-country",
    src: img("hill-train"),
    alt: "A blue train winding through tea hills in Sri Lanka's hill country",
  },

  /* ---------------- Cultural & Heritage ---------------- */
  {
    id: "sigiriya",
    title: "Sigiriya Rock Fortress",
    caption: "Cultural Triangle",
    category: "cultural",
    src: img("sigiriya"),
    alt: "Sigiriya, the ancient rock fortress rising above the jungle",
  },
  {
    id: "temple-of-the-tooth",
    title: "Temple of the Sacred Tooth Relic",
    caption: "Kandy",
    category: "cultural",
    src: img("temple-of-the-tooth"),
    alt: "The golden-roofed Temple of the Sacred Tooth Relic in Kandy",
  },
  {
    id: "polonnaruwa",
    title: "Polonnaruwa ancient city",
    caption: "Cultural Triangle",
    category: "cultural",
    src: img("polonnaruwa"),
    alt: "Ruins and the seated Buddha statues of the ancient city of Polonnaruwa",
  },
  {
    id: "galle-fort",
    title: "Galle Fort",
    caption: "South coast",
    category: "cultural",
    src: img("galle-fort"),
    alt: "The old Dutch ramparts and lighthouse of Galle Fort",
  },

  /* ---------------- Wildlife & Safaris ---------------- */
  {
    id: "yala-leopard",
    title: "Leopard country",
    caption: "Yala National Park",
    category: "wildlife",
    src: img("yala-leopard"),
    alt: "A leopard resting on a rock in Yala National Park",
  },
  {
    id: "udawalawe-elephants",
    title: "Elephants at the waterhole",
    caption: "Udawalawe National Park",
    category: "wildlife",
    src: img("udawalawe-elephants"),
    alt: "A herd of wild elephants drinking at a waterhole in Udawalawe",
  },
  {
    id: "minneriya-gathering",
    title: "The Gathering",
    caption: "Minneriya National Park",
    category: "wildlife",
    src: img("minneriya-gathering"),
    alt: "Wild elephants grazing together on the grassland at Minneriya",
  },

  /* ---------------- Beaches ---------------- */
  {
    id: "mirissa",
    title: "Mirissa Beach",
    caption: "South coast",
    category: "beaches",
    src: img("mirissa"),
    alt: "Palm trees and golden sand on Mirissa Beach",
  },
  {
    id: "unawatuna",
    title: "Unawatuna Bay",
    caption: "Near Galle",
    category: "beaches",
    src: img("unawatuna"),
    alt: "Calm turquoise water and a curved beach at Unawatuna Bay",
  },
  {
    id: "bentota",
    title: "Bentota shoreline",
    caption: "West coast",
    category: "beaches",
    src: img("bentota"),
    alt: "A long stretch of sand and waves at Bentota beach",
  },
];
