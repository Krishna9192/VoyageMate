const nodemailer = require("nodemailer");
const dns = require("dns");

// Force IPv4 DNS resolution for Render and other cloud hosts
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

const sendEmail = async ({
  to,
  subject,
  html,
  text,
}) => {
  try {
    if (!process.env.EMAIL_USER) {
      throw new Error(
        "EMAIL_USER environment variable is missing"
      );
    }

    if (!process.env.EMAIL_APP_PASSWORD) {
      throw new Error(
        "EMAIL_APP_PASSWORD environment variable is missing"
      );
    }

    const mailOptions = {
      from: `"Voyage Mate" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(
      mailOptions
    );

    console.log(
      "Email sent successfully:",
      info.messageId
    );

    return info;
  } catch (error) {
    console.error(
      "Email sending failed:",
      error.message
    );

    throw new Error(
      `Unable to send email: ${error.message}`
    );
  }
};

module.exports = sendEmail;