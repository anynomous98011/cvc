import nodemailer from 'nodemailer';

// Configure email transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendErrorNotification(error: Error, context: any = {}) {
  if (!process.env.ADMIN_EMAIL) return; // Skip if no admin email configured

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `[CVC] Scraper Error: ${error.message}`,
      html: `
        <h2>Scraper Error</h2>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Error:</strong> ${error.message}</p>
        <pre><code>${error.stack}</code></pre>
        ${context ? `<h3>Context:</h3><pre>${JSON.stringify(context, null, 2)}</pre>` : ''}
      `
    });
  } catch (err) {
    console.error('Failed to send error notification:', err);
  }
}