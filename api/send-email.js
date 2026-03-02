import { Resend } from 'resend';

// IMPORTANT: set RESEND_API_KEY in your environment.
// Example (do this yourself, do NOT commit a real key):
// RESEND_API_KEY=re_xxxxxxxxx
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html } = req.body || {};

    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: to || 'sapphiresgfx@gmail.com',
      subject: subject || 'Hello World',
      html: html || '<p>Congrats on sending your <strong>first email</strong>!</p>',
    });

    return res.status(200).json({ ok: true, response });
  } catch (error) {
    console.error('Resend error', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}

