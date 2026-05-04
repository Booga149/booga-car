/**
 * Centralized Email Sender — Gmail SMTP via Nodemailer
 * 
 * Free: 500 emails/day. No custom domain needed.
 * Uses Google App Password for authentication.
 */

import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  senderName?: string;
}

interface SendEmailResult {
  sent: boolean;
  messageId?: string;
  error?: string;
}

// Create reusable transporter
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const SENDER_EMAIL = process.env.SENDER_EMAIL || SMTP_USER;
  const senderName = params.senderName || 'بوجا كار';

  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('[Email] SMTP credentials not configured');
    return { sent: false, error: 'SMTP credentials not configured' };
  }

  try {
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: `"${senderName}" <${SENDER_EMAIL}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    console.log('[Email] Sent successfully to', params.to, 'MessageID:', info.messageId);
    return { sent: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('[Email] Send failed:', error);
    return { sent: false, error: error.message };
  }
}
