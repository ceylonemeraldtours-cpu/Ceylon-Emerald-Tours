# Ceylon Emerald Tours

Next.js 14 (App Router), Tailwind CSS, Framer Motion and Nodemailer.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in the EMAIL_* values
npm run dev                  # http://localhost:3000
npm run typecheck && npm run lint && npm run build
```

Without the `EMAIL_SERVER_*` variables, `npm run dev` prints the emails to the terminal instead of sending them. A
production build refuses to send and shows guests the WhatsApp fallback, so set the variables on your host.

Gmail: turn on 2-step verification, create an App Password and use it as `EMAIL_SERVER_PASSWORD`
(host `smtp.gmail.com`, port 587). Port 465 uses implicit TLS; any other port uses STARTTLS.

## What is where

| Area | Files |
| --- | --- |
| Tour content (from the original HTML files) | `src/data/toursData.ts` |
| Airport transfer page and form | `src/app/transfers/page.tsx`, `src/components/TransferForm.tsx` |
| Custom tour planner | `src/components/CustomTourPlanner.tsx` (shown on `/packages#custom-tour`) |
| Tour booking modal (pickup field on day tours) | `src/components/BookingModal.tsx` |
| API routes | `src/app/api/booking`, `src/app/api/transfer-inquiry`, `src/app/api/custom-inquiry` |
| Validation | `src/lib/transfer.ts`, `src/lib/customTour.ts`, `src/lib/booking.ts` |
| Emails (Nodemailer, templates, dual send) | `src/lib/mail.ts` |
| Gallery page, filters, lightbox | `src/app/gallery/page.tsx`, `src/components/gallery/`, `src/data/galleryData.ts` |
| Guest reviews (showcase + "Write a review" form) | `src/components/Testimonials.tsx`, `src/components/reviews/`, `src/data/reviewsData.ts`, `src/app/api/review/route.ts` |
| Custom tour page | `src/app/custom-tour/page.tsx` (the planner is also still on `/packages#custom-tour`) |
| Branded loading screen | `src/app/loading.tsx` (keyframes in `tailwind.config.ts`) |
| SEO: metadata helper, sitemap, robots, social preview image | `src/lib/seo.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/og/route.tsx` |
| Caching and security headers, image settings | `next.config.mjs` |
| Cookie consent banner | `src/components/CookieConsent.tsx`, `src/lib/cookieConsent.ts` |

## Reference numbers

- Airport transfer: `CET-TR-XXXX`
- Custom tour: `CET-CT-XXXX`
- Tour package booking: `CET-BK-XXXX`
- Guest review: `CET-RV-XXXX`

Each request sends two emails: a confirmation to the guest and a notification to `ceylonemeraldtours@gmail.com`,
both with WhatsApp links to +94 74 191 8325.

## Images

Add photos under `public/images/tours/<tour-id>/` (`cover.jpg`, `1.jpg` to `5.jpg`). See the README in that folder.

## Guest reviews

Visitors submit the "Write a review" form (name, country, 1-5 stars, text). The review is emailed to
`ceylonemeraldtours@gmail.com` and is **not** published automatically. To publish a 5-star review, paste the
snippet from that email into `REVIEWS` in `src/data/reviewsData.ts`. The website only ever shows reviews with
`rating === 5` (`FIVE_STAR_REVIEWS`). The sample reviews in that file are placeholders: replace them.

## SEO

Set `NEXT_PUBLIC_SITE_URL` to the real domain in production. It drives canonical URLs, Open Graph URLs,
`/sitemap.xml` and `/robots.txt`. Each page sets its metadata with `buildMetadata()` from `src/lib/seo.ts`.
After launch, submit `https://<your-domain>/sitemap.xml` in Google Search Console.

## Cookie consent

The banner stores the choice in `localStorage` (key `cet-cookie-consent`) and listens for the footer's
"Cookie settings" link. No analytics or marketing scripts are loaded by the site today. When you add one, only
load it after `readConsent()?.analytics` (or `.marketing`) is true, and re-check on the `cet:cookie-consent`
window event.
