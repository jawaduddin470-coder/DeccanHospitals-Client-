import { Resend } from 'resend';
import { HOSPITAL_CONFIG } from '../config.js';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

// Resend client instantiated lazily using server-side secret
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * Server-side transactional email sender
 * Delivers via Resend API or logs simulation when unconfigured.
 * Guaranteed never to crash the calling Cloud Function or transaction.
 */
export async function sendTransactionalEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const client = getResendClient();

  if (!client) {
    console.warn(
      `[EmailService: SIMULATED] No RESEND_API_KEY configured. Simulated dispatch to: ${JSON.stringify(
        options.to
      )} | Subject: "${options.subject}"`
    );
    return {
      success: true,
      simulated: true,
      messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    };
  }

  try {
    const fromAddress = HOSPITAL_CONFIG.senderEmail;
    const toRecipients = Array.isArray(options.to) ? options.to : [options.to];

    const { data, error } = await client.emails.send({
      from: fromAddress,
      to: toRecipients,
      replyTo: options.replyTo || HOSPITAL_CONFIG.notificationEmail,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('[EmailService: Resend API Error]', error.name, error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (err: any) {
    const errorMessage = err?.message || 'Unknown email dispatch failure';
    console.error('[EmailService: Unexpected Failure]', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
