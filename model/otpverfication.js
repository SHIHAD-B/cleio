const mongoose = require('mongoose');
const dbURI = 'mongodb://localhost:27017/clieo';
const { Schema, ObjectId } = mongoose;

const otpVerificationSchema = new Schema({
    user:{ type: String},
    otp: { type: String },
    createdAt: { type: Date },
    expiresdAt: { type: Date },
});

const usersotpverifications = mongoose.model('usersotpverifications', otpVerificationSchema);

module.exports = usersotpverifications;
