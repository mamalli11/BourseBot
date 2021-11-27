const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        userID:
            { type: Number, unique: true, required: true },
        first_name:
            { type: String },
        username:
            { type: String },
        phone:
            { type: String },
        is_bot:
            { type: Boolean },
        pelan:
            { type: String, default: "Bronze", enum: ["Golden", "Silver", "Bronze"] },
        isAdmin:
            { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Users", userSchema);