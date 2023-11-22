const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const CouponSchema = new Schema({
    Code: { type: String },
    Min_purchase_amount: { type: Number },
    Max_discount_value: { type: Number },
    Expiration_date: { type: Date },
    Start_date: { type: Date },
    Is_active: { type: Boolean },
    created: { type: Date },
    Max_usage_count: { type: Number },
    Discount_value: { type: Number },
});

const Coupon = mongoose.model('Coupon', CouponSchema);

module.exports = Coupon;

