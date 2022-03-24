const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
    walletAddress: {
        type: String,
        required: true
    },
    tokenAddress: {
        type: String,
    },
    tokenAmount: {
        type: Number,
    },
    status: {
        type: Boolean,
    }
});

module.exports = mongoose.model("users", UserSchema);