const mongoose = require("mongoose");

const RegisterSchema = new mongoose.Schema(
    {
        wymaNumber: { type: Number, required: true },
        name: { type: String, required: true },
        age: { type: Number, required: true },
        phone: { type: Number, default: null },
        sex: { type: String, enum: ["male", "female", "other"], required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Register", RegisterSchema);
