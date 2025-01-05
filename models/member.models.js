const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema(
    {
        wymaNumber: { type: String, required: true },
        memberCount: { type: Number, required: true },
        name: { type: String, required: true },
        age: { type: Number, required: true },
        sex: { type: String, enum: ["male", "female", "other"], required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Member", MemberSchema);
