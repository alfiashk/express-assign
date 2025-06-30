const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: String,
    lastName: String,
    password: { type: String, required: true }, // hashed
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {timestamps: true});




module.exports = mongoose.model('User', userSchema);