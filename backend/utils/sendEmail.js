const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, template, data, html, text }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const templates = {
    emailVerification: (d) => `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fdf8f5; padding: 40px; border-radius: 12px;">
        <h1 style="color: #8b1a4a; font-size: 28px; text-align: center; margin-bottom: 8px;">SareeSaanvi</h1>
        <p style="color: #666; text-align: center; margin-bottom: 32px;">Premium Sarees & Ethnic Wear</p>
        <h2 style="color: #2d1b3d;">Welcome, ${d.name}! 🌸</h2>
        <p style="color: #444; line-height: 1.8;">Thank you for joining SareeSaanvi. Please verify your email to get started.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${d.url}" style="background: linear-gradient(135deg, #8b1a4a, #c2185b); color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px;">Verify Email</a>
        </div>
        <p style="color: #888; font-size: 13px;">Link expires in 24 hours. If you didn't sign up, ignore this email.</p>
      </div>
    `,
    passwordReset: (d) => `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fdf8f5; padding: 40px; border-radius: 12px;">
        <h1 style="color: #8b1a4a; font-size: 28px; text-align: center;">SareeSaanvi</h1>
        <h2 style="color: #2d1b3d;">Password Reset Request</h2>
        <p style="color: #444; line-height: 1.8;">Hi ${d.name}, you requested a password reset.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${d.url}" style="background: linear-gradient(135deg, #8b1a4a, #c2185b); color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px;">Reset Password</a>
        </div>
        <p style="color: #888; font-size: 13px;">Link expires in 15 minutes. If you didn't request this, your account is safe.</p>
      </div>
    `,
    orderConfirmation: (d) => `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fdf8f5; padding: 40px; border-radius: 12px;">
        <h1 style="color: #8b1a4a; font-size: 28px; text-align: center;">SareeSaanvi</h1>
        <h2 style="color: #2d1b3d;">Order Confirmed! 🎉</h2>
        <p style="color: #444;">Order #${d.orderNumber} has been placed successfully.</p>
        <p style="color: #444;">Total: ₹${d.totalPrice}</p>
        <p style="color: #888; font-size: 13px;">Estimated delivery: ${d.estimatedDelivery}</p>
      </div>
    `,
  };

  const htmlContent = template && templates[template]
    ? templates[template](data || {})
    : html || `<p>${text}</p>`;

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'SareeSaanvi'}" <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html: htmlContent,
    text: text || htmlContent.replace(/<[^>]*>/g, ''),
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent: ${info.messageId}`);
  return info;
};

module.exports = { sendEmail };
