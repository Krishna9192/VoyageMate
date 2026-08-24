const nodemailer = require("nodemailer");
const dns = require("dns");

// Force IPv4 DNS resolution
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

let transporter = null;

const getTransporter = () => {
  if (!transporter && process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }
  return transporter;
};

// Send via Resend HTTP API (HTTPS Port 443 - Works on Render Free Tier)
const sendViaResend = async ({ to, subject, html, text }) => {
  const fromEmail = process.env.EMAIL_FROM || "Voyage Mate <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Resend API error (${response.status})`);
  }

  console.log("Email sent successfully via Resend API:", data.id);
  return { messageId: data.id };
};

// Send via Brevo HTTP API (HTTPS Port 443 - Works on Render Free Tier)
const sendViaBrevo = async ({ to, subject, html, text }) => {
  const senderEmail = process.env.EMAIL_USER || "harikrishnab0224@gmail.com";

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Voyage Mate", email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Brevo API error (${response.status})`);
  }

  console.log("Email sent successfully via Brevo API:", data.messageId);
  return { messageId: data.messageId };
};

const sendEmail = async ({ to, subject, html, text }) => {
  // 1. If Resend API Key is set, use Resend HTTP API (HTTPS Port 443 - Never blocked on Render)
  if (process.env.RESEND_API_KEY) {
    return await sendViaResend({ to, subject, html, text });
  }

  // 2. If Brevo API Key is set, use Brevo HTTP API (HTTPS Port 443 - Never blocked on Render)
  if (process.env.BREVO_API_KEY) {
    return await sendViaBrevo({ to, subject, html, text });
  }

  // 3. Nodemailer SMTP (For localhost or unblocked hosts)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error("Email configuration missing. Please set RESEND_API_KEY or EMAIL_USER & EMAIL_APP_PASSWORD.");
  }

  try {
    const smtp = getTransporter();
    const mailOptions = {
      from: `"Voyage Mate" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await smtp.sendMail(mailOptions);
    console.log("Email sent successfully via SMTP:", info.messageId);
    return info;
  } catch (error) {
    console.error("SMTP sending failed:", error.message);
    if (error.message.includes("timeout") || error.code === "ETIMEDOUT") {
      throw new Error("Render Free Tier blocks raw SMTP ports (587/465). Add RESEND_API_KEY in Render environment variables for HTTP email delivery.");
    }
    throw new Error(`Unable to send email: ${error.message}`);
  }
};

module.exports = sendEmail;