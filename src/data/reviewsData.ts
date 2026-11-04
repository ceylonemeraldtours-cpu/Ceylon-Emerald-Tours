// Guest reviews shown on the public site.
//
// HOW IT WORKS
//   1. A visitor submits the "Write a review" form. It is emailed to the team (see /api/review)
//      and is NOT published automatically, so nothing fake or abusive can appear on the site.
//   2. To publish a review, paste it into REVIEWS below (the owner email includes a ready-made
//      snippet to copy).
//   3. The public showcase only ever shows 5-star reviews: FIVE_STAR_REVIEWS filters on rating.
//
// SAMPLE CONTENT: the entries below are placeholders. Replace them with real guest reviews
// (for example from TripAdvisor) before the site goes live.

export interface Review {
  id: string;
  name: string;
  country: string;
  /** 1 to 5. Only 5 is shown publicly. */
  rating: number;
  text: string;
  /** Optional, ISO date (YYYY-MM-DD). */
  date?: string;
}

export const REVIEWS: Review[] = [
  {
    id: "sample-1",
    name: "Guest name",
    country: "Country",
    rating: 5,
    text: "Sample review. Replace this with a real guest review about the driver, the route or a moment from the trip.",
  },
  {
    id: "sample-2",
    name: "Guest name",
    country: "Country",
    rating: 5,
    text: "Sample review. Replace this with a real guest review about planning the trip over WhatsApp.",
  },
  {
    id: "sample-3",
    name: "Guest name",
    country: "Country",
    rating: 5,
    text: "Sample review. Replace this with a real guest review about an airport transfer or a day tour.",
  },
  {
    id: "sample-4",
    name: "Guest name",
    country: "Country",
    rating: 5,
    text: "Sample review. Replace this with a real guest review about the hill-country train ride or the tea estates.",
  },
  {
    id: "sample-5",
    name: "Guest name",
    country: "Country",
    rating: 5,
    text: "Sample review. Replace this with a real guest review about a safari, a cultural site or the south coast.",
  },
  {
    id: "sample-6",
    name: "Guest name",
    country: "Country",
    rating: 5,
    text: "Sample review. Replace this with a real guest review about a multi-day tour and the people who planned it.",
  },
];

/** Everything the public showcase displays: all 5-star reviews, nothing else. */
export const FIVE_STAR_REVIEWS: Review[] = REVIEWS.filter((r) => r.rating === 5);
