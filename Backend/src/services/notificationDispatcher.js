const { NotificationLog } = require("../models");
const { buildHotspotAlert } = require("../notifications/hotspotAlert");
const mailer = require("./mailer");

async function send(user, hotspot) {
  const alreadySent = await NotificationLog.findOne({
    where: {
      user_id: user.id,
      hotspot_id: hotspot.id,
      channel: NotificationLog.CHANNEL_EMAIL,
    },
  });

  if (alreadySent) return;

  await sendEmail(user, hotspot);
}

async function sendEmail(user, hotspot) {
  const alert = buildHotspotAlert(user, hotspot);

  try {
    await mailer.sendMail({
      to: user.email,
      subject: alert.subject,
      text: alert.text,
      html: alert.html,
    });

    await NotificationLog.create({
      user_id: user.id,
      hotspot_id: hotspot.id,
      channel: NotificationLog.CHANNEL_EMAIL,
      status: NotificationLog.STATUS_SENT,
      message: alert.plainText,
      sent_at: new Date(),
    });
  } catch (e) {
    console.error(
      `[NotificationDispatcher] Gagal kirim email ke user #${user.id}: ${e.message}`,
    );

    await NotificationLog.create({
      user_id: user.id,
      hotspot_id: hotspot.id,
      channel: NotificationLog.CHANNEL_EMAIL,
      status: NotificationLog.STATUS_FAILED,
      message: alert.plainText,
      error_message: e.message,
    });
  }
}

module.exports = { send };
