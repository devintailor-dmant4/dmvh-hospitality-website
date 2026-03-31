// Resend email integration — uses Replit Connectors for authentication
import { Resend } from "resend";
import type { Inquiry } from "@shared/schema";

async function getCredentials(): Promise<{ apiKey: string; fromEmail: string } | null> {
  // 1. Try direct env secret first (most reliable)
  if (process.env.RESEND_API_KEY) {
    return {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: "DMVH Hospitality <no-reply@dmvhhospitality.com>",
    };
  }

  // 2. Fall back to Replit Connectors
  try {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY
      ? "repl " + process.env.REPL_IDENTITY
      : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

    if (!hostname || !xReplitToken) return null;

    const data = await fetch(
      "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=resend",
      {
        headers: { Accept: "application/json", "X-Replit-Token": xReplitToken },
      }
    ).then(r => r.json());

    const connectionSettings = data.items?.[0];
    if (!connectionSettings?.settings?.api_key) return null;

    return {
      apiKey: connectionSettings.settings.api_key,
      fromEmail: "DMVH Hospitality <no-reply@dmvhhospitality.com>",
    };
  } catch {
    return null;
  }
}

// WARNING: Never cache this client — tokens expire.
async function getUncachableResendClient() {
  const creds = await getCredentials();
  if (!creds) {
    console.log("[email] No Resend credentials found — add RESEND_API_KEY secret");
    return null;
  }
  return {
    client: new Resend(creds.apiKey),
    fromEmail: creds.fromEmail || "DMVH Hospitality <no-reply@dmvhhospitality.com>",
  };
}

const NOTIFY_EMAIL = "sales@dmvhhospitality.com";

function formatDetails(details: any): string {
  if (!details || typeof details !== "object") return "";
  const lines: string[] = [];
  for (const [key, val] of Object.entries(details)) {
    if (val === null || val === undefined || val === "" || val === false) continue;
    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
    if (Array.isArray(val)) {
      if (val.length > 0) lines.push(`<b>${label}:</b> ${(val as string[]).join(", ")}`);
    } else {
      lines.push(`<b>${label}:</b> ${String(val)}`);
    }
  }
  return lines.join("<br/>");
}

export async function sendInquiryNotification(inquiry: Inquiry): Promise<void> {
  const ctx = await getUncachableResendClient();
  if (!ctx) {
    console.log("[email] Resend not connected — skipping notification email");
    return;
  }

  const isChat = inquiry.details && (inquiry.details as any).source === "chat-widget";
  const detailsHtml = formatDetails(inquiry.details);
  const attachmentsNote =
    Array.isArray(inquiry.attachments) && inquiry.attachments.length > 0
      ? `<p style="font-size:13px;color:#555;"><b>Attachments:</b> ${inquiry.attachments.length} file(s) uploaded</p>`
      : "";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;color:#333;">
      <div style="background:${isChat ? "#1a6b3c" : "#7a4a1e"};padding:20px 24px;border-radius:8px 8px 0 0;">
        <h1 style="color:white;margin:0;font-size:20px;">${isChat ? "💬 New Chat Message" : "New Inquiry Received"}</h1>
        <p style="color:rgba(255,255,255,0.75);margin:4px 0 0;font-size:14px;">
          DMVH Hospitality — ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#666;width:140px;">Name</td><td style="padding:6px 0;font-weight:600;">${inquiry.name}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;"><a href="mailto:${inquiry.email}" style="color:#7a4a1e;">${inquiry.email}</a></td></tr>
          ${inquiry.phone ? `<tr><td style="padding:6px 0;color:#666;">Phone</td><td style="padding:6px 0;"><a href="tel:${inquiry.phone}" style="color:#7a4a1e;">${inquiry.phone}</a></td></tr>` : ""}
          ${inquiry.company ? `<tr><td style="padding:6px 0;color:#666;">Company</td><td style="padding:6px 0;">${inquiry.company}</td></tr>` : ""}
          ${inquiry.projectLocation ? `<tr><td style="padding:6px 0;color:#666;">Location</td><td style="padding:6px 0;">${inquiry.projectLocation}</td></tr>` : ""}
        </table>
        ${inquiry.message ? `<div style="margin:16px 0;padding:12px 16px;background:#f9fafb;border-left:3px solid #7a4a1e;border-radius:4px;font-size:14px;line-height:1.6;">${inquiry.message}</div>` : ""}
        ${detailsHtml ? `<div style="margin-top:16px;font-size:13px;line-height:1.8;color:#555;">${detailsHtml}</div>` : ""}
        ${attachmentsNote}
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;">
          <a href="mailto:${inquiry.email}" style="display:inline-block;background:#7a4a1e;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
            Reply to ${inquiry.name}
          </a>
        </div>
      </div>
    </div>
  `;

  try {
    const result = await ctx.client.emails.send({
      from: ctx.fromEmail,
      to: [NOTIFY_EMAIL],
      subject: isChat
        ? `💬 Chat: ${inquiry.name}${inquiry.company ? ` — ${inquiry.company}` : ""}`
        : `New Inquiry: ${inquiry.name}${inquiry.company ? ` — ${inquiry.company}` : ""}`,
      html,
    });
    console.log(`[email] Notification sent for inquiry #${inquiry.id} — Resend ID: ${(result as any)?.data?.id || JSON.stringify(result)}`);
  } catch (err) {
    console.error("[email] Failed to send notification:", err);
  }
}

export async function sendClientConfirmation(inquiry: Inquiry): Promise<void> {
  const ctx = await getUncachableResendClient();
  if (!ctx) return;

  const firstName = inquiry.name.split(" ")[0];

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;color:#333;">
      <div style="background:#7a4a1e;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h1 style="color:white;margin:0;font-size:20px;">We received your inquiry</h1>
        <p style="color:rgba(255,255,255,0.75);margin:4px 0 0;font-size:14px;">DMVH Hospitality</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
        <p style="font-size:15px;line-height:1.6;">Hi ${firstName},</p>
        <p style="font-size:14px;line-height:1.8;color:#555;">
          Thank you for reaching out to DMVH Hospitality. We've received your inquiry and a member of our team will follow up within <strong>one business day</strong>.
        </p>
        <p style="font-size:14px;line-height:1.8;color:#555;">
          If you need to reach us sooner, call us at
          <a href="tel:6202870248" style="color:#7a4a1e;font-weight:600;">(620) 287-0248</a>
          or reply directly to this email.
        </p>
        <div style="margin:24px 0;padding:16px 20px;background:#fdf8f5;border-radius:8px;font-size:13px;color:#666;line-height:1.6;">
          <p style="margin:0 0 8px;font-weight:600;color:#7a4a1e;">What happens next?</p>
          <p style="margin:0;">Our team will review your project details and reach out with questions or a preliminary quote. If you have additional documents to share — brand standards, floor plans, inspiration photos — simply reply to this email with attachments.</p>
        </div>
        <p style="font-size:14px;color:#555;">We look forward to working with you.</p>
        <p style="font-size:14px;color:#555;margin-top:16px;">
          Best regards,<br/>
          <strong>The DMVH Hospitality Team</strong><br/>
          Chicago · Dallas · Ho Chi Minh City<br/>
          <a href="mailto:sales@dmvhhospitality.com" style="color:#7a4a1e;">sales@dmvhhospitality.com</a> · (620) 287-0248
        </p>
      </div>
    </div>
  `;

  try {
    const result = await ctx.client.emails.send({
      from: ctx.fromEmail,
      to: [inquiry.email],
      subject: "We received your inquiry — DMVH Hospitality",
      html,
    });
    console.log(`[email] Confirmation sent to ${inquiry.email} — Resend ID: ${(result as any)?.data?.id || JSON.stringify(result)}`);
  } catch (err) {
    console.error("[email] Failed to send confirmation:", err);
  }
}

export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string): Promise<void> {
  const ctx = await getUncachableResendClient();
  if (!ctx) {
    console.log("[email] Resend not connected — skipping password reset email");
    return;
  }

  const firstName = name.split(" ")[0];

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;color:#333;">
      <div style="background:#7a4a1e;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h1 style="color:white;margin:0;font-size:20px;">Reset Your Password</h1>
        <p style="color:rgba(255,255,255,0.75);margin:4px 0 0;font-size:14px;">DMVH Hospitality Client Portal</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
        <p style="font-size:15px;line-height:1.6;">Hi ${firstName},</p>
        <p style="font-size:14px;line-height:1.8;color:#555;">
          We received a request to reset your password for your DMVH Hospitality client portal account.
          Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${resetUrl}" style="display:inline-block;background:#7a4a1e;color:white;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:600;">
            Reset My Password
          </a>
        </div>
        <p style="font-size:13px;color:#888;line-height:1.6;">
          If you didn't request this, you can safely ignore this email — your password will not change.
        </p>
        <p style="font-size:13px;color:#aaa;margin-top:16px;">
          Or copy this link: <a href="${resetUrl}" style="color:#7a4a1e;">${resetUrl}</a>
        </p>
      </div>
    </div>
  `;

  try {
    await ctx.client.emails.send({
      from: ctx.fromEmail,
      to: [email],
      subject: "Reset your password — DMVH Hospitality",
      html,
    });
    console.log(`[email] Password reset sent to ${email}`);
  } catch (err) {
    console.error("[email] Failed to send password reset:", err);
  }
}
