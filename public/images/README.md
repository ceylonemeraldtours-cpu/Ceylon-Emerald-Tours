# Images to drop in

The site renders gradient fallbacks until these exist, so nothing breaks without them.
Use photos you own or have licensed. JPEG is fine: Next.js converts them to AVIF/WebP and
resizes them per device automatically, so upload the best quality you have (about 2000px wide
is plenty, under 1 MB each is ideal).

## Home page

- `hero-hill-country.jpg`  (wide, about 2400px, tea hills / misty ridge)

## Gallery (`/gallery` and the home page preview)

Destination photos, in `public/images/gallery/`:

- `gallery/nine-arches.jpg`
- `gallery/tea-country.jpg`
- `gallery/worlds-end.jpg`
- `gallery/haputale.jpg`
- `gallery/ravana-falls.jpg`
- `gallery/hill-train.jpg`
- `gallery/sigiriya.jpg`
- `gallery/temple-of-the-tooth.jpg`
- `gallery/polonnaruwa.jpg`
- `gallery/galle-fort.jpg`
- `gallery/yala-leopard.jpg`
- `gallery/udawalawe-elephants.jpg`
- `gallery/minneriya-gathering.jpg`
- `gallery/mirissa.jpg`
- `gallery/unawatuna.jpg`
- `gallery/bentota.jpg`

Photos of past guests on tour, in `public/images/gallery/customers/`:

- `gallery/customers/nine-arches-guests.jpg`
- `gallery/customers/tea-estate-guests.jpg`
- `gallery/customers/sigiriya-guests.jpg`
- `gallery/customers/safari-guests.jpg`
- `gallery/customers/train-guests.jpg`
- `gallery/customers/beach-guests.jpg`

Only publish photos of guests who have agreed to it. The captions and alt text for each photo
are in `src/data/galleryData.ts`: edit them to match the photo you actually add. To add more
photos, add an entry to `GALLERY_ITEMS` in that file.

Tour photos are described in `tours/README.md`.

## Social previews

Link previews (WhatsApp, Facebook, Instagram, X) use a branded 1200x630 image that the site
generates itself at `/og?page=...`, so there is nothing to upload.
