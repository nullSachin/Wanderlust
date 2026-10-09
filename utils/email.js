// Sends email through Brevo's HTTPS API (Render's free plan blocks SMTP ports)
module.exports.sendEmail = async ({ to, subject, html }) => {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
            sender: { name: "WanderLust", email: process.env.BREVO_SENDER_EMAIL },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Brevo error ${response.status}: ${body}`);
    }
};