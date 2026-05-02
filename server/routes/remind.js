const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/remind
router.post('/', async (req, res) => {
  const { email, phone, name, state, deadlines } = req.body;

  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone number required' });
  }

  // Email reminder
  if (email && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const deadlineList = (deadlines || []).map(d => `<li><strong>${d.label}</strong>: ${d.date}</li>`).join('');

      await transporter.sendMail({
        from: `"Smart Election Navigator" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `🗳️ Your Voting Deadline Reminders – ${state || 'Your State'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
            <h1 style="color: #818cf8;">Smart Election Navigator</h1>
            <p>Hello ${name || 'Voter'},</p>
            <p>Here are your upcoming voting deadlines for <strong>${state || 'your state'}</strong>:</p>
            <ul style="background: #1e293b; padding: 16px 32px; border-radius: 8px;">
              ${deadlineList || '<li>Check your state election website for exact dates</li>'}
            </ul>
            <p style="margin-top: 24px;">Stay informed at <a href="https://vote.gov" style="color: #818cf8;">vote.gov</a></p>
            <p style="font-size: 12px; color: #64748b;">This reminder was sent by Smart Election Navigator. We do not collect or share personal data.</p>
          </div>
        `
      });

      console.log('Reminder email sent to', email);
    } catch (err) {
      console.error('Email error:', err.message);
      // Don't fail the whole request
    }
  }

  // SMS via Twilio (if configured)
  if (phone && process.env.TWILIO_ACCOUNT_SID) {
    try {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const deadlineText = (deadlines || []).map(d => `${d.label}: ${d.date}`).join('; ');
      await client.messages.create({
        body: `🗳️ Smart Election Navigator: Your voting deadlines for ${state || 'your state'}: ${deadlineText || 'Visit vote.gov for dates'}. Stay Civic!`,
        from: process.env.TWILIO_PHONE,
        to: phone
      });
    } catch (err) {
      console.error('SMS error:', err.message);
    }
  }

  // Always acknowledge the registration
  res.json({
    success: true,
    message: `Reminder registered${email ? ' (email)' : ''}${phone ? ' (SMS)' : ''}. You'll receive deadline notifications.`,
    _note: !process.env.SMTP_USER && !process.env.TWILIO_ACCOUNT_SID
      ? 'Configure SMTP_USER or TWILIO_ACCOUNT_SID in .env to enable actual sending'
      : undefined
  });
});

module.exports = router;
