require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user.js");

(async () => {
    await mongoose.connect(process.env.ATLASDB_URL);

    // Existing accounts are treated as already verified
    const verified = await User.updateMany(
        { isVerified: { $exists: false } },
        { $set: { isVerified: true } }
    );
    console.log("Marked as verified:", verified.modifiedCount);

    // Make old emails lowercase so login by email works for them too
    for (const u of await User.find({})) {
        const lower = (u.email || "").trim().toLowerCase();
        if (lower && lower !== u.email) {
            await User.updateOne({ _id: u._id }, { $set: { email: lower } });
        }
    }

    await mongoose.disconnect();
    console.log("Done");
})();