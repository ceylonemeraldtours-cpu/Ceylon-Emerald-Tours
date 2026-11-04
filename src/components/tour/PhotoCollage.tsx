import SafeImage from "../SafeImage";

const FALLBACKS = [
  "linear-gradient(135deg,#0f766e,#064e3b)",
  "linear-gradient(135deg,#064e3b,#022c22)",
  "linear-gradient(135deg,#065f46,#0f172a)",
  "linear-gradient(135deg,#134e4a,#022c22)",
  "linear-gradient(135deg,#064e3b,#78350f)",
];

/** One large photo plus four smaller ones. Gradients show until photos are added. */
export default function PhotoCollage({ photos, title }: { photos: string[]; title: string }) {
  const tiles = photos.slice(0, 5);
  return (
    <div className="grid h-[17rem] grid-cols-2 gap-2 sm:h-[24rem] md:h-[28rem] md:grid-cols-4 md:grid-rows-2">
      {tiles.map((src, i) => (
        <div
          key={src}
          className={`relative overflow-hidden rounded-2xl ${
            i === 0 ? "col-span-2 row-span-2" : i > 2 ? "hidden md:block" : ""
          }`}
        >
          <SafeImage
            src={src}
            alt={`${title}, photo ${i + 1}`}
            sizes={i === 0 ? "(min-width: 1280px) 640px, (min-width: 768px) 50vw, 100vw" : "(min-width: 1280px) 320px, (min-width: 768px) 25vw, 50vw"}
            fallback={FALLBACKS[i % FALLBACKS.length]}
            // The first photo is the biggest thing above the fold on a tour page.
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  );
}
