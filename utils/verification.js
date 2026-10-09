const crypto = require("crypto");
const { sendEmail } = require("./email.js");

module.exports.hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

module.exports.sendVerificationEmail = async (user) => {
    const token = crypto.randomBytes(32).toString("hex");

    // Only the hash is stored, so a leaked database cannot be used to verify accounts
    user.verificationTokenHash = module.exports.hashToken(token);
    user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    user.verificationSentAt = Date.now();
    await user.save();

    const baseUrl = (process.env.BASE_URL || "http://localhost:8080").replace(/\/$/, "");
    const link = `${baseUrl}/verify-email/${token}`;

    await sendEmail({
        to: user.email,
        subject: "Verify your WanderLust email",
        html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#222">
            <h2 style="color:#fe424d">WanderLust</h2>
            <p>Hi ${user.username},</p>
            <p>Thanks for signing up. Please confirm your email address to activate your account.</p>
            <p><a href="${link}" style="display:inline-block;background:#e0313c;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Verify my email</a></p>
            <p style="font-size:13px;color:#717171">This link expires in 24 hours. If the button does not work, copy this link into your browser:<br>${link}</p>
            <p style="font-size:13px;color:#717171">If you did not create this account, you can ignore this email.</p>
        </div>`,
    });
};