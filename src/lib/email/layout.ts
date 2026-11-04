import { SITE, whatsappLink } from "@/lib/constants";

// Emerald green and gold, built with inline styles and tables so it holds up in Gmail, Outlook
// and Apple Mail.
export const C = {
  night: "#022c22",
  deep: "#064e3b",
  gold: "#d97706",
  glow: "#fbbf24",
  ink: "#0f172a",
  mist: "#f1f5f9",
  mint: "#a7f3d0",
  body: "#334155",
  muted: "#64748b",
  rule: "#e2e8f0",
};

export const esc = (v: string): string =>
  v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const multiline = (v: string): string => esc(v).replace(/\r?\n/g, "<br>");

export const money = (n: number): string => `$${n.toLocaleString("en-US")}`;

/** Digits-only WhatsApp number for a guest, tolerating "+", spaces and a leading "00". */
export function whatsappDigits(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  return digits;
}

export function guestWhatsappLink(phone: string, message: string): string {
  return `https://wa.me/${whatsappDigits(phone)}?text=${encodeURIComponent(message)}`;
}

export function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${C.rule};color:${C.muted};font-size:14px;width:38%;vertical-align:top;">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid ${C.rule};color:${C.ink};font-size:14px;font-weight:600;vertical-align:top;">${value}</td>
  </tr>`;
}

export function table(rows: string[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.filter(Boolean).join("")}</table>`;
}

export function heading(text: string, topGap = 24): string {
  return `<h2 style="margin:${topGap}px 0 4px;font-size:16px;color:${C.deep};">${esc(text)}</h2>`;
}

export function paragraph(html: string, bottom = 20): string {
  return `<p style="margin:0 0 ${bottom}px;font-size:15px;line-height:1.7;color:${C.body};">${html}</p>`;
}

export function button(href: string, label: string, kind: "gold" | "green"): string {
  const bg = kind === "gold" ? C.glow : C.deep;
  const color = kind === "gold" ? C.night : "#ffffff";
  return `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 22px;border-radius:999px;background:${bg};color:${color};font-size:14px;font-weight:700;text-decoration:none;">${label}</a>`;
}

/** Interest or tag chips. */
export function chips(items: readonly string[]): string {
  return items
    .map(
      (i) =>
        `<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 12px;border-radius:999px;border:1px solid ${C.gold};background:#fffbeb;color:${C.deep};font-size:13px;font-weight:600;">${esc(i)}</span>`
    )
    .join("");
}

/** Big gold reference number on a deep-green panel. */
export function referenceBanner(reference: string, caption: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="background:${C.night};border-radius:12px;border-top:3px solid ${C.glow};padding:20px;text-align:center;">
    <div style="font-size:12px;color:${C.mint};">${esc(caption)}</div>
    <div style="margin-top:6px;font-size:28px;font-weight:700;letter-spacing:3px;color:${C.glow};">${esc(reference)}</div>
  </td></tr></table>`;
}

/** Compact reference line for the owner's inbox. */
export function referenceStrip(reference: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;"><tr><td style="background:${C.night};border-radius:12px;border-left:4px solid ${C.glow};padding:16px 20px;">
    <span style="font-size:12px;color:${C.mint};">Reference</span>
    <span style="margin-left:10px;font-size:20px;font-weight:700;letter-spacing:2px;color:${C.glow};">${esc(reference)}</span>
  </td></tr></table>`;
}

/** Contact block used in guest emails: WhatsApp first, because it is the fastest way to reach us. */
export function contactBlock(reference: string): string {
  const wa = whatsappLink(`Hello ${SITE.name}, my reference is ${reference}.`);
  return `${heading("Need to talk to us?", 28)}
  ${paragraph(
    `Quote your reference when you get in touch. We reply fastest on WhatsApp at <a href="${esc(wa)}" style="color:${C.deep};font-weight:700;">${SITE.phoneDisplay}</a>.`,
    14
  )}
  ${button(wa, "Chat on WhatsApp", "gold")}${button(
    `mailto:${SITE.email}?subject=${encodeURIComponent(`Reference ${reference}`)}`,
    "Email us",
    "green"
  )}`;
}

export function layout(preheader: string, title: string, inner: string): string {
  const wa = whatsappLink();
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${C.mist};font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.mist};padding:24px 12px;">
<tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">
    <tr><td style="background:${C.night};padding:28px 32px;border-bottom:4px solid ${C.glow};">
      <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.2px;"><span style="color:${C.glow};">&#9670;</span>&nbsp; Ceylon <span style="color:${C.glow};">Emerald</span> Tours</div>
      <div style="margin-top:4px;font-size:13px;color:${C.mint};">Private tours and transfers across Sri Lanka</div>
    </td></tr>
    <tr><td style="padding:32px;">
      <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${C.deep};">${esc(title)}</h1>
      ${inner}
    </td></tr>
    <tr><td style="background:${C.night};padding:22px 32px;color:${C.mint};font-size:12px;line-height:1.8;">
      ${esc(SITE.name)}<br>${esc(SITE.address)}<br>
      WhatsApp: <a href="${esc(wa)}" style="color:${C.glow};text-decoration:none;font-weight:600;">${SITE.phoneDisplay}</a> &nbsp;|&nbsp;
      <a href="tel:${SITE.phoneTel}" style="color:${C.glow};text-decoration:none;">Call</a> &nbsp;|&nbsp;
      <a href="mailto:${SITE.email}" style="color:${C.glow};text-decoration:none;">${SITE.email}</a>
    </td></tr>
  </table>
</td></tr>
</table></body></html>`;
}
