const User = require("../models/user");
const { signupSchema } = require("../schema.js");
const { passwordProblems } = require("../utils/passwordRules.js");
const { sendVerificationEmail, hashToken } = require("../utils/verification.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
        req.flash("error", error.details[0].message);
        return res.redirect("/signup");
    }
    const { username, email, password } = value;

    const problems = passwordProblems(password);
    if (problems.length) {
        req.flash("error", "Password must include: " + problems.join(", ") + ".");
        return res.redirect("/signup");
    }

    if (await User.findOne({ email })) {
        req.flash("error", "An account with this email already exists. Try logging in.");
        return res.redirect("/signup");
    }

    let user;
    try {
        user = await User.register(new User({ username, email }), password);
    } catch (e) {
        let message = e.message;
        if (e.name === "UserExistsError") message = "That username is already taken.";
        if (e.code === 11000) message = "An account with this email already exists.";
        req.flash("error", message);
        return res.redirect("/signup");
    }

    try {
        await sendVerificationEmail(user);
    } catch (e) {
        console.error("Verification email failed:", e.message);
        req.flash("error", "Your account was created, but we could not send the verification email. Please request a new link.");
        return res.redirect("/resend-verification");
    }

    req.flash("success", "Account created! Check your email to verify it.");
    res.redirect("/verify-notice");
};

module.exports.renderVerifyNotice = (req, res) => {
    res.render("users/verify-notice.ejs");
};

module.exports.verifyEmail = async (req, res) => {
    const user = await User.findOne({
        verificationTokenHash: hashToken(req.params.token),
        verificationExpires: { $gt: Date.now() },
    });

    if (!user) {
        req.flash("error", "This verification link is invalid or has expired. If you already verified, just log in. Otherwise, request a new link.");
        return res.redirect("/resend-verification");
    }

    user.isVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationExpires = undefined;
    await user.save();

    req.flash("success", "Email verified! You can now log in.");
    res.redirect("/login");
};

module.exports.renderResendForm = (req, res) => {
    res.render("users/resend.ejs");
};

module.exports.resendVerification = async (req, res) => {
    const email = (req.body.email || "").trim().toLowerCase();
    const user = email ? await User.findOne({ email }) : null;

    // Only send if the account exists, is unverified, and 60 seconds have passed
    if (user && !user.isVerified) {
        const waited = Date.now() - (user.verificationSentAt || 0);
        if (waited > 60 * 1000) {
            try {
                await sendVerificationEmail(user);
            } catch (e) {
                console.error("Resend failed:", e.message);
            }
        }
    }

    // Same message every time, so nobody can use this form to find out which emails are registered
    req.flash("success", "If that email belongs to an unverified account, we have sent a new link. Check your inbox and spam folder.");
    res.redirect("/verify-notice");
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    });
};