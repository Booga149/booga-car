/**
 * Centralized Email Sender — Brevo (free: 300 emails/day)
 * 
 * No custom domain required. Sends from your verified Gmail.
 * Docs: https://developers.brevo.com/reference/sendtransacemail
 */

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

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const SENDER_EMAIL = process.env.SENDER_EMAIL || 'mrmrx2824@gmail.com';
  const senderName = params.senderName || 'بوجا كار';

  if (!BREVO_API_KEY) {
    console.warn('[Email] BREVO_API_KEY not configured');
    return { sent: false, error: 'BREVO_API_KEY not configured' };
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: SENDER_EMAIL },
        to: [{ email: params.to }],
        subject: params.subject,
        htmlContent: params.html,
      }),
    });

    const result = await res.json();

    if (res.ok) {
      console.log('[Email] Sent successfully to', params.to, result);
      return { sent: true, messageId: result.messageId };
    } else {
      console.error('[Email] Brevo error:', result);
      return { sent: false, error: result.message || 'Brevo API error' };
    }
  } catch (error: any) {
    console.error('[Email] Send failed:', error);
    return { sent: false, error: error.message };
  }
}
