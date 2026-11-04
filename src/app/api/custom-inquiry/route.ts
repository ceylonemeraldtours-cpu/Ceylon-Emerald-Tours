import { validateCustomTour } from "@/lib/customTour";
import { sendCustomTourEmails } from "@/lib/mail";
import { handleFormPost } from "@/lib/formApi";
import { createRateLimiter } from "@/lib/rateLimit";

export const runtime = "nodejs"; // Nodemailer needs Node APIs
export const dynamic = "force-dynamic";

// Custom tour requests: 5 per 10 minutes per IP.
const isLimited = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });

/**
 * POST /api/custom-inquiry
 * Reference: CET-CT-XXXX
 */
export async function POST(req: Request) {
  return handleFormPost({
    req,
    isLimited,
    kind: "custom-tour", // reference prefix CET-CT-
    label: "api/custom-inquiry",
    parse: (body) => {
      const result = validateCustomTour(body);
      return result.ok ? result : { ok: false, errors: result.errors as Record<string, string> };
    },
    send: (plan, reference) => sendCustomTourEmails({ reference, plan, submittedAt: new Date() }),
  });
}
