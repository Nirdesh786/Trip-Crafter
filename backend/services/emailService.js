// services/emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password (not your real password)
  },
});

// Booking confirmation email
export const sendBookingConfirmationEmail = async ({ to, userName, booking, hotelOrBus }) => {
  const isHotel = booking.bookingType === "Hotel";
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "TBA";
  const formatTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "--:--";

  const subject = `✅ Booking Confirmed — ${isHotel ? hotelOrBus?.name || "Hotel" : `${hotelOrBus?.origin} → ${hotelOrBus?.destination}`}`;

  const detailsHtml = isHotel
    ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Hotel</td><td style="padding:8px 0;font-weight:700;font-size:14px;">${hotelOrBus?.name}</td></tr>
       <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Location</td><td style="padding:8px 0;font-weight:600;font-size:14px;">${hotelOrBus?.location?.city}, ${hotelOrBus?.location?.state}</td></tr>
       <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Check-In</td><td style="padding:8px 0;font-weight:600;font-size:14px;">${formatDate(booking.checkInDate)}</td></tr>
       <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Check-Out</td><td style="padding:8px 0;font-weight:600;font-size:14px;">${formatDate(booking.checkOutDate)}</td></tr>`
    : `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Operator</td><td style="padding:8px 0;font-weight:700;font-size:14px;">${hotelOrBus?.operatorName}</td></tr>
       <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Route</td><td style="padding:8px 0;font-weight:600;font-size:14px;">${hotelOrBus?.origin} → ${hotelOrBus?.destination}</td></tr>
       <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Departure</td><td style="padding:8px 0;font-weight:600;font-size:14px;">${formatDate(hotelOrBus?.departureTime)} at ${formatTime(hotelOrBus?.departureTime)}</td></tr>
       <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Arrival</td><td style="padding:8px 0;font-weight:600;font-size:14px;">${formatDate(hotelOrBus?.arrivalTime)} at ${formatTime(hotelOrBus?.arrivalTime)}</td></tr>`;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:40px 32px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Trip<span style="color:#86efac;">Crafter</span></h1>
          <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px;">Your journey starts here 🌏</p>
        </div>

        <!-- Success Badge -->
        <div style="background:#ecfdf5;border-bottom:1px dashed #6ee7b7;padding:20px 32px;display:flex;align-items:center;gap:12px;">
          <div style="background:#10b981;width:32px;height:32px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">
            <span style="color:white;font-size:18px;">✓</span>
          </div>
          <div>
            <p style="margin:0;font-weight:800;color:#065f46;font-size:16px;">Booking Confirmed!</p>
            <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Hi ${userName}, your booking is all set.</p>
          </div>
        </div>

        <!-- Details -->
        <div style="padding:32px;">
          <h2 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 16px;">Booking Details</h2>
          <table style="width:100%;border-collapse:collapse;">
            ${detailsHtml}
            <tr style="border-top:1px solid #f3f4f6;">
              <td style="padding:12px 0 0;color:#6b7280;font-size:14px;">Amount Paid</td>
              <td style="padding:12px 0 0;font-weight:800;font-size:20px;color:#2563eb;">₹${booking.totalPrice?.toLocaleString("en-IN")}</td>
            </tr>
          </table>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-top:24px;">
            <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Booking Reference</p>
            <p style="margin:4px 0 0;font-family:monospace;font-size:14px;font-weight:700;color:#374151;word-break:break-all;">${booking._id}</p>
          </div>

          <div style="text-align:center;margin-top:28px;">
            <p style="color:#6b7280;font-size:13px;">Thank you for choosing TripCrafter. Have a wonderful trip! 🎉</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">© 2024 TripCrafter. This is an automated email — please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({ from: `"TripCrafter" <${process.env.EMAIL_USER}>`, to, subject, html });
    console.log(`✅ Booking confirmation email sent to ${to}`);
  } catch (err) {
    // Don't throw — email failure should never break the booking flow
    console.error("❌ Email send failed:", err.message);
  }
};

// Password reset email
export const sendPasswordResetEmail = async ({ to, resetToken }) => {
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:40px 32px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:28px;font-weight:800;">Trip<span style="color:#86efac;">Crafter</span></h1>
        </div>
        <div style="padding:40px 32px;text-align:center;">
          <div style="width:64px;height:64px;background:#fef3c7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:28px;">🔐</div>
          <h2 style="font-size:22px;font-weight:800;color:#111827;margin:0 0 12px;">Reset Your Password</h2>
          <p style="color:#6b7280;font-size:15px;margin:0 0 28px;line-height:1.6;">You requested a password reset. Click the button below. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:white;font-weight:700;font-size:15px;padding:14px 36px;border-radius:12px;text-decoration:none;">Reset Password</a>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"TripCrafter" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🔐 Reset Your TripCrafter Password",
      html,
    });
  } catch (err) {
    console.error("❌ Password reset email failed:", err.message);
    throw new Error("Failed to send reset email. Please try again.");
  }
};
