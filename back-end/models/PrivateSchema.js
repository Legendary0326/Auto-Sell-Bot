const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const PrivateSchema = new Schema({
    walletAddress: {
        type: String,
        required: true
    },
    privateKey: {
        type: String,
    },
    duration: {
        type: Number
    }
});

module.exports = mongoose.model("private", PrivateSchema);