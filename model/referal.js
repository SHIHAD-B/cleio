const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const ReferalSchema = new Schema({
    Inviter: { type: Number },
    Inviter_status: { type: String, enum: ['active', 'blocked'] },
    Referred_user: { type: Number },
    Inviter_lastedit: { type: Date },
    Referred_user_lastedit: { type: Date },
    Referred_user_status: { type: String, enum: ['active', 'blocked'] },
    Activities: [{
        Date: { type: Date },
        Inviter: { type: String },
        Referred_user: { type: String },
    }],
});

const Referal = mongoose.model('Referal', ReferalSchema);
module.exports = Referal;
