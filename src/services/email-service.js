import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesDir = path.resolve(__dirname, '../templates');

/**
 * Escapes HTML characters for safe template interpolation.
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Formats date into readable investor relations string (e.g., "Nov 2, 2026, 1:45 PM PT").
 */
function formatSubmissionDate(date = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    }).format(date);
  } catch {
    return new Date().toLocaleString();
  }
}

export class EmailService {
  constructor() {
    this.resendApiKey = process.env.RESEND_API_KEY || '';
    this.senderEmail = process.env.RESEND_FROM || process.env.SENDER_EMAIL || 'Monumental Energy <onboarding@resend.dev>';
    this.notificationEmail = process.env.NOTIFICATION_EMAIL || 'jai.midis1@gmail.com';
    this.siteUrl = process.env.SITE_URL || 'https://monumental.energy';
    this.previewSiteUrl = 'https://monumental-theta.vercel.app';
  }

  /**
   * Helper to load template HTML from the templates folder.
   */
  loadTemplate(filename) {
    const templatePath = path.join(templatesDir, filename);
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf8');
    }
    // Fallback: check workspace root
    const rootPath = path.resolve(__dirname, '../../../', filename);
    if (fs.existsSync(rootPath)) {
      return fs.readFileSync(rootPath, 'utf8');
    }
    throw new Error(`Email template not found: ${filename} at ${templatePath}`);
  }

  /**
   * Core dispatch method: sends via Resend API, SMTP (Nodemailer), or simulates in dev mode.
   */
  async sendEmail({ to, subject, html, replyTo }) {
    const resendKey = process.env.RESEND_API_KEY || this.resendApiKey;

    // 1. Send via Resend API if RESEND_API_KEY is configured
    if (resendKey && resendKey.trim().length > 0) {
      try {
        const fromAddress = process.env.RESEND_FROM || this.senderEmail;
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: Array.isArray(to) ? to : [to],
            reply_to: replyTo,
            subject,
            html,
          }),
        });

        const resData = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error('[EmailService - Resend API Error]', resData);
          throw new Error(resData.message || `Resend API returned HTTP ${res.status}`);
        }

        console.info(`[EmailService] Email successfully sent via Resend to ${to} (ID: ${resData.id})`);
        return { success: true, provider: 'resend', id: resData.id };
      } catch (err) {
        console.error('[EmailService] Resend delivery failed:', err.message);
        throw err;
      }
    }

    // 2. Fallback to SMTP / Nodemailer if SMTP credentials are provided
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const info = await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to,
          replyTo,
          subject,
          html,
        });

        console.info(`[EmailService] Email successfully sent via SMTP to ${to} (MessageId: ${info.messageId})`);
        return { success: true, provider: 'smtp', id: info.messageId };
      } catch (err) {
        console.error('[EmailService] SMTP delivery failed:', err.message);
        throw err;
      }
    }

    // 3. Graceful Development Mode (credentials not yet provided by user)
    console.info(
      `\n======================================================\n` +
      `[EmailService - DEV MODE (Awaiting Resend API Key)]\n` +
      `To: ${to}\n` +
      `Subject: ${subject}\n` +
      `Reply-To: ${replyTo || 'None'}\n` +
      `Status: Simulated (Add RESEND_API_KEY in backend .env to send live emails)\n` +
      `======================================================\n`
    );

    return {
      success: true,
      provider: 'simulated',
      message: 'Email queued in development mode. Set RESEND_API_KEY in .env to deliver real emails.'
    };
  }

  /**
   * Sends the official Welcome Email to a newly subscribed user.
   */
  async sendWelcomeEmail(recipientEmail, data = {}) {
    if (!recipientEmail) throw new Error('Recipient email is required for welcome email');

    let template = this.loadTemplate('monumental-welcome-email.html');

    // Interpolate merge tags
    const viewInBrowserUrl = data.view_in_browser_url || `${this.siteUrl}/news`;
    const managePreferencesUrl = data.manage_preferences_url || `${this.siteUrl}/contact`;
    const unsubscribeUrl = data.unsubscribe_url || `${this.siteUrl}/api/v1/subscribers/unsubscribe?email=${encodeURIComponent(recipientEmail)}`;

    template = template
      .replace(/\{\{view_in_browser_url\}\}/g, viewInBrowserUrl)
      .replace(/\{\{manage_preferences_url\}\}/g, managePreferencesUrl)
      .replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl);

    return await this.sendEmail({
      to: recipientEmail,
      subject: 'Welcome to Monumental Energy (TSX-V: MNRG) news alerts',
      html: template,
      replyTo: this.notificationEmail,
    });
  }

  /**
   * Dispatches the Admin Inquiry Notification to the IR team when someone submits a contact form.
   */
  async sendAdminInquiryNotification(enquiryData = {}) {
    let template = this.loadTemplate('monumental-admin-inquiry-email.html');

    const inquiryCategory = enquiryData.role || enquiryData.inquiry_category || 'Prospective Investor';
    const fullName = enquiryData.name || enquiryData.full_name || 'Valued Visitor';
    const email = enquiryData.email || 'Not provided';
    const phone = enquiryData.phone ? enquiryData.phone.trim() : 'Not provided';
    const message = enquiryData.message || '';
    const submittedAt = enquiryData.submitted_at || formatSubmissionDate(enquiryData.createdAt ? new Date(enquiryData.createdAt) : new Date());
    const pageUrl = enquiryData.source || enquiryData.page_url || `${this.siteUrl}/contact`;

    template = template
      .replace(/\{\{inquiry_category\}\}/g, escapeHtml(inquiryCategory))
      .replace(/\{\{full_name\}\}/g, escapeHtml(fullName))
      .replace(/\{\{email\}\}/g, escapeHtml(email))
      .replace(/\{\{phone\}\}/g, escapeHtml(phone))
      .replace(/\{\{message\}\}/g, escapeHtml(message))
      .replace(/\{\{submitted_at\}\}/g, escapeHtml(submittedAt))
      .replace(/\{\{page_url\}\}/g, escapeHtml(pageUrl));

    const subject = `New investor inquiry: ${inquiryCategory} from ${fullName}`;
    const destination = process.env.NOTIFICATION_EMAIL || this.notificationEmail;

    return await this.sendEmail({
      to: destination,
      subject,
      html: template,
      replyTo: email,
    });
  }

  /**
   * Dispatches the official "Thank You for Connecting" auto-reply email to the person
   * who submitted the website inquiry / contact form.
   */
  async sendThankYouEmail(enquiryData = {}) {
    const recipientEmail = enquiryData.email ? enquiryData.email.trim() : null;
    if (!recipientEmail) {
      throw new Error('Recipient email is required for thank-you auto-reply');
    }

    let template = this.loadTemplate('monumental-thank-you-email.html');

    // Extract first name (e.g. "John Smith" -> "John", fallback to "there")
    const rawName = (enquiryData.name || enquiryData.full_name || '').trim();
    const firstName = rawName ? rawName.split(/\s+/)[0] : 'there';

    // Interpolate merge tags
    template = template
      .replace(/\{\{first_name\}\}/g, escapeHtml(firstName))
      .replace(/\{\{email\}\}/g, escapeHtml(recipientEmail));

    return await this.sendEmail({
      to: recipientEmail,
      subject: 'Thank you for connecting with Monumental Energy',
      html: template,
      replyTo: 'info@monumental.energy',
    });
  }
}

