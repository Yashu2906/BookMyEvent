const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER?.trim(),
    pass: process.env.SMTP_PASS?.trim(),
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error.message);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

/**
 * Send booking confirmation ticket to user
 */
exports.sendTicketEmail = async (email, bookingDetails) => {
  const { eventTitle, eventDate, venue, city, tickets, totalAmount, seats, bookingId } = bookingDetails;
  
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const mailOptions = {
    from: process.env.SENDER_EMAIL || 'noreply@bookmyevent.com',
    to: email,
    subject: `Ticket Confirmed: ${eventTitle} - BookMyEvent`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background-color: #09090b; color: #fff; padding: 40px; border-radius: 24px; border: 1px solid #27272a;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #ef4444; margin: 0; font-size: 28px; letter-spacing: -1px; text-transform: uppercase;">BookMy<span style="color: white;">Event</span></h1>
          <p style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 8px;">Order Confirmation #${bookingId}</p>
        </div>

        <div style="background: linear-gradient(135deg, #18181b 0%, #09090b 100%); padding: 30px; border-radius: 20px; border: 1px solid #3f3f46; margin-bottom: 30px;">
          <h2 style="margin: 0 0 10px 0; font-size: 24px; color: #fff;">${eventTitle}</h2>
          <div style="color: #ef4444; font-weight: bold; font-size: 14px; margin-bottom: 20px;">${formattedDate}</div>
          
          <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px;">
            <div style="margin-bottom: 15px;">
              <p style="color: #71717a; font-size: 10px; text-transform: uppercase; margin: 0 0 4px 0;">Location</p>
              <p style="margin: 0; font-size: 14px;">${venue}, ${city}</p>
            </div>
            <div>
              <p style="color: #71717a; font-size: 10px; text-transform: uppercase; margin: 0 0 4px 0;">Quantity</p>
              <p style="margin: 0; font-size: 14px;">${tickets} Ticket(s)</p>
            </div>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-t: 1px solid #27272a;">
            <p style="color: #71717a; font-size: 10px; text-transform: uppercase; margin: 0 0 4px 0;">Seats Assigned</p>
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #ef4444;">${seats && seats.length > 0 ? seats.join(', ') : 'General Admission'}</p>
          </div>
        </div>

        <div style="padding: 20px; text-align: center; border: 2px dashed #3f3f46; border-radius: 16px; margin-bottom: 30px;">
          <p style="color: #71717a; font-size: 12px; margin-bottom: 10px;">Show this confirmation at the entry</p>
          <div style="background: white; padding: 10px; display: inline-block; border-radius: 8px;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BME-${bookingId}" alt="QR Code" style="display: block;">
          </div>
        </div>

        <div style="text-align: center; color: #71717a; font-size: 12px;">
          <p>This is a system generated email. Please do not reply.</p>
          <p>&copy; 2024 BookMyEvent. All rights reserved.</p>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send generic OTP email
 */
exports.sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.SENDER_EMAIL || 'noreply@bookmyevent.com',
    to: email,
    subject: 'BookMyEvent - Your Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #E11D48;">BookMyEvent Verification</h2>
        <p>Hello,</p>
        <p>Your one-time password (OTP) is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 15px; background: #f4f4f4; border-radius: 8px; text-align: center; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
};

/**
 * Send password reset email
 */
exports.sendResetEmail = async (email, token) => {
  const mailOptions = {
    from: process.env.SENDER_EMAIL || 'noreply@bookmyevent.com',
    to: email,
    subject: 'Reset Your Password - BookMyEvent',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee;">
        <h2 style="color: #E11D48; text-align: center;">Reset Your Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Use the code below to proceed:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 20px; background: #f9f9f9; border-radius: 12px; text-align: center; margin: 30px 0; color: #000;">
          ${token}
        </div>
        <p>This code is valid for 1 hour. If you didn't ask for this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888; text-align: center;">BookMyEvent - Simplifing your event experiences.</p>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
};
