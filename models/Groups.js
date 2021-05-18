const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
    GroupName: {
        type: String,
        trim: true,
        unique: true,
        required: [true, "نام الزامی می باشد"],
        minlength: 3,
    },
    GroupNameEnglish: {
        type: String,
        unique: true,
        minlength: 3,
    },
    IndustryID: {
        type: Number,
        required: true,
    },
    IndustryName: {
        type: String,
    },
    IndustryNameEnglish: {
        type: String,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model("Group", groupSchema);