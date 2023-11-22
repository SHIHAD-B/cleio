
const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const OrdersSchema = new Schema({
    Billing_address: { type: Schema.Types.ObjectId, ref: 'Address' },
    User_id: { type: Schema.Types.ObjectId },
    Products: [{
        Product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
        Quantity: { type: Number },
        color: { type: String },
        size: { type: Number }
    }],
    Order_status: { type: String, enum: ['ordered', 'shipped', 'delivered', 'out for delivery', 'cancelled', "returned"] },
    Total_amount: { type: Number },
    Shipping_address: { type: Schema.Types.ObjectId, ref: 'Address' },
    Order_date: { type: Date },
    Payment_status: { type: String, enum: ['pending', 'paid', 'cancelled'] },
    Payment_method: { type: String, enum: ['COD', 'razorPay', 'wallet'] },
    Bill_number: { type: String },
    Delivery_date: { type: Date },
    Activity: [{
        Date: { type: Date },
        Status: { type: String },
    }],
    Coupon: { type: String }
});

const Orders = mongoose.model('Orders', OrdersSchema);

module.exports = Orders;




