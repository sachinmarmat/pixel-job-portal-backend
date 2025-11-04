const Brevo = require("@getbrevo/brevo");

const sendMail = async (to, subject, html) => {
  try {
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

    const sendSmtpEmail = {
      sender: { name: "Pixel Genix", email: process.env.ADMIN_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent successfully:", response);
  } catch (error) {
    console.error("❌ Error sending email:", error.message || error);
  }
};

module.exports = sendMail;
