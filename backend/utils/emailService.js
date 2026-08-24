const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  // Force IPv4.
  // Render was failing while trying to connect through IPv6.
  family: 4,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },

  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
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