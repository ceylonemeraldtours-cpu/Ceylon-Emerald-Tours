import nodemailer, { type Transporter } from "nodemailer";
import { SITE } from "@/lib/constants";

export interface Mail {
  subject: string;
  html: string;
  text: string;
}

export interface MailPair {
  owner: Mail;
  guest: Mail;
}

export interface SendResult {
  /** "console" means SMTP is not configured and the emails were only logged (local dev). */
  mode: "smtp" | "console";
  guestEmailSent: boolean;
}

function smtpConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;
  if (!host || !user || !pass) return null;
  return { host, port, user, pass };
}

let cached: { transporter: Transporter; user: string } | null = null;

function getTransport() {
  if (cached) return cached;
  const cfg = smtpConfig();
  if (!cfg) return null;
  cached = {
    user: cfg.user,
    transporter: nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465, // 465 = implicit TLS, 587 = STARTTLS
      auth: { user: cfg.user, pass: cfg.pass },
    }),
  };
  return cached;
}

/**
 * Sends the guest confirmation and the owner notification together.
 * - Owner email failing throws (the lead would otherwise be lost).
 * - Guest email failing does not throw; the result reports guestEmailSent: false.
 * - Without SMTP env vars, emails are logged to the console in development
 *   and an error is thrown in production.
 */
export async function deliver(mails: MailPair, guestAddress: string): Promise<SendResult> {
  const transport = getTransport();

  if (!transport) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured (set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).");
    }
    console.log(
      [
        "",
        "[email:dev] SMTP_* env vars not set. Logging instead of sending.",
        `--- Owner email -> ${SITE.email}`,
        `Subject: ${mails.owner.subject}`,
        mails.owner.text,
        `--- Guest email -> ${guestAddress}`,
        `Subject: ${mails.guest.subject}`,
        mails.guest.text,
        "",
      ].join("\n")
    );
    return { mode: "console", guestEmailSent: true };
  }

  const from = `"${SITE.name}" <${transport.user}>`;
  const [owner, guest] = await Promise.allSettled([
    transport.transporter.sendMail({
      from,
      to: SITE.email,
      replyTo: guestAddress,
      subject: mails.owner.subject,
      text: mails.owner.text,
      html: mails.owner.html,
    }),
    transport.transporter.sendMail({
      from,
      to: guestAddress,
      replyTo: SITE.email,
      subject: mails.guest.subject,
      text: mails.guest.text,
      html: mails.guest.html,
    }),
  ]);

  if (guest.status === "rejected") console.error("[email] Guest confirmation failed:", guest.reason);
  if (owner.status === "rejected") {
    console.error("[email] Owner notification failed:", owner.reason);
    throw new Error("Owner notification email failed.");
  }
  return { mode: "smtp", guestEmailSent: guest.status === "fulfilled" };
}
