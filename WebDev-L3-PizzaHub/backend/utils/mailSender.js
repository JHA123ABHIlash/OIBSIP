const mailSender = async (email, title, body) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Pizza Delivery";

  if (!apiKey || !senderEmail) {
    throw new Error("Brevo email configuration is missing");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [{ email }],
      subject: title,
      htmlContent: body,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Brevo email error:", result);
    throw new Error(result.message || "Unable to send email");
  }

  console.log("Email queued by Brevo:", result.messageId);
  return result;
};

module.exports = mailSender;