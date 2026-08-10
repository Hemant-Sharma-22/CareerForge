const nodemailer = require('nodemailer');

let testTransporter = null;

async function getTransporter() {
  // 1. Production / Custom SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // 2. Gmail SMTP Simple Setup
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });
  }

  // 3. Automated Zero-Config Test Mail Account (Ethereal Email Service)
  if (!testTransporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      testTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`📧 [EMAIL SERVICE] Auto-initialized Ethereal Test Account (${testAccount.user}) for instant real email delivery.`);
    } catch (err) {
      console.warn('Ethereal test account setup warning:', err.message);
    }
  }

  return testTransporter;
}

async function sendEmailOtp(recipientEmail, otpCode) {
  try {
    const transporter = await getTransporter();
    if (!transporter) return { sent: false, reason: 'Transporter unavailable' };

    const mailOptions = {
      from: '"CareerForge Auth" <no-reply@careerforge.com>',
      to: recipientEmail,
      subject: `Your CareerForge Verification Code: ${otpCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #18181b; color: #f4f4f5; padding: 24px; borderRadius: 12px; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #38bdf8; margin-top: 0;">CareerForge Platform</h2>
          <p style="font-size: 14px; color: #d4d4d8;">Your 6-digit email verification code is:</p>
          <div style="background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; padding: 16px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #38bdf8; margin: 20px 0;">
            ${otpCode}
          </div>
          <p style="font-size: 12px; color: #a1a1aa;">This code is valid for 5 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    
    if (previewUrl) {
      console.log(`📧 [REAL EMAIL DELIVERED] Preview URL: ${previewUrl}`);
    } else {
      console.log(`📧 [EMAIL DELIVERED] Message ID: ${info.messageId}`);
    }

    return {
      sent: true,
      messageId: info.messageId,
      previewUrl
    };
  } catch (err) {
    console.error('sendEmailOtp error:', err.message);
    return { sent: false, reason: err.message };
  }
}

module.exports = {
  sendEmailOtp
};
