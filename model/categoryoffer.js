const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const CategoryofferSchema = new Schema({
    Category_id: { type: Schema.Types.ObjectId },
    Category_name: { type: String },
    Starts_at: { type: Date },
    Ends_at: { type: Date },
    Offer: { type: Number },
    createdAt: { type: Date },
    Status: { type: String, enum: ['active', 'expired'] },
});

const Categoryoffer = mongoose.model('Categoryoffer', CategoryofferSchema);

module.exports = Categoryoffer;

