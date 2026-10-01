const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const driver = (process.env.MAIL_DRIVER || "log").toLowerCase();

  if (driver === "smtp") {
    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT || 587),
      secure: process.env.MAIL_SECURE === "true",
      auth: process.env.MAIL_USERNAME
        ? {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD || process.env.MAIL_PASS,
          }
        : undefined,
    });
  } else {
    transporter = {
      sendMail: async (mail) => {
        console.log(
          "[mailer:log] Email tidak benar-benar dikirim (MAIL_DRIVER=log).",
        );
        console.log(`  To: ${mail.to}`);
        console.log(`  Subject: ${mail.subject}`);
        console.log(`  Body: ${mail.text}`);
        return { messageId: "log-mode" };
      },
    };
  }

  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();
  const from = `"${process.env.MAIL_FROM_NAME || "Karhutla"}" <${
    process.env.MAIL_FROM_ADDRESS || "hello@example.com"
  }>`;

  return t.sendMail({ from, to, subject, text, html });
}

module.exports = { sendMail };
