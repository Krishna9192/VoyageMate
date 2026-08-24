const nodemailer = require("nodemailer");

// ==========================================
// CREATE EMAIL TRANSPORTER
// ==========================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// ==========================================
// SEND EMAIL
// ==========================================

const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  try {
    const mailOptions = {
      from: `"Voyage Mate" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info =
      await transporter.sendMail(mailOptions);

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
      "Unable to send email"
    );
  }
};

// ==========================================
// VERIFY EMAIL CONFIGURATION
// ==========================================

const verifyEmailConnection = async () => {
  try {
    await transporter.verify();

    console.log(
      "Email service connected successfully ✅"
    );

    return true;
  } catch (error) {
    console.error(
      "Email service connection failed ❌"
    );

    console.error(error.message);

    return false;
  }
};

module.exports = sendEmail;
module.exports.verifyEmailConnection =
  verifyEmailConnection;