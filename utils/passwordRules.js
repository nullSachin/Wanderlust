const rules = [
    { test: (p) => p.length >= 8 && p.length <= 64, message: "8 to 64 characters" },
    { test: (p) => /[a-z]/.test(p), message: "a lowercase letter" },
    { test: (p) => /[A-Z]/.test(p), message: "an uppercase letter" },
    { test: (p) => /\d/.test(p), message: "a number" },
    { test: (p) => /[^A-Za-z0-9]/.test(p), message: "a special character (for example ! @ # $ %)" },
];

// Returns the list of rules the password fails (empty list = strong enough)
module.exports.passwordProblems = (password) =>
    rules.filter((r) => !r.test(password)).map((r) => r.message);