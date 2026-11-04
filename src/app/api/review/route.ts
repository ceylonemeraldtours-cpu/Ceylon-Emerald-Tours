import { sendReviewEmail } from "@/lib/mail";
import { handleFormPost } from "@/lib/formApi";
import { createRateLimiter } from "@/lib/rateLimit";
import { validateReview } from "@/lib/review";

export const runtime = "nodejs"; // Nodemailer needs Node APIs
export const dynamic = "force-dynamic";

// Reviews: 3 per 30 minutes per IP.
const isLimited = createRateLimiter({ windowMs: 30 * 60 * 1000, max: 3 });

/**
 * POST /api/review
 * Reference: CET-RV-XXXX
 * Emails the review to the team for approval. Nothing is published automatically.
 */
export async function POST(req: Request) {
  return handleFormPost({
    req,
    isLimited,
    kind: "review", // reference prefix CET-RV-
    label: "api/review",
    parse: (body) => {
      const result = validateReview(body);
      return result.ok ? result : { ok: false, errors: result.errors as Record<string, string> };
    },
    send: (review, reference) => sendReviewEmail({ reference, review, submittedAt: new Date() }),
  });
}
