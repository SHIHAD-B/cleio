
const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const OrdersSchema = new Schema({
    Billing_address: {
        address: { type: String },
        alternative_phone: { type: Number },
        city: { type: String },
        delivery_on: { type: String, enum: ['home', 'work'] },
        landmark: { type: String },
        locality: { type: String },
        name: { type: String },
        phone_number: { type: Number },
        pincode: { type: Number },
        state: { type: String },
        type: { type: String, enum: ['shipping', 'billing'] },
        User: { type: Schema.Types.ObjectId },
    },
    User_id: { type: Schema.Types.ObjectId },
    Products: [{
        Product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
        price: { type: Number },
        Quantity: { type: Number },
        color: { type: String },
        size: { type: Number }
    }],
    Order_status: { type: String, enum: ['ordered', 'shipped', 'delivered', 'out for delivery', 'cancelled', "returned"] },
    Total_amount: { type: Number },
    Shipping_address: {
        address: { type: String },
        alternative_phone: { type: Number },
        city: { type: String },
        delivery_on: { type: String, enum: ['home', 'work'] },
        landmark: { type: String },
        locality: { type: String },
        name: { type: String },
        phone_number: { type: Number },
        pincode: { type: Number },
        state: { type: String },
        type: { type: String, enum: ['shipping', 'billing'] },
        User: { type: Schema.Types.ObjectId },
    },
    Order_date: { type: Date },
    Payment_status: { type: String, enum: ['pending', 'paid', 'cancelled'] },
    Payment_method: { type: String, enum: ['COD', 'razorPay', 'wallet'] },
    Bill_number: { type: String },
    Delivery_date: { type: Date },
    Activity: [{
        Date: { type: Date },
        Status: { type: String },
    }],
    Coupon: { type: String },
    delivery_amount: { type: Number }
});

const Orders = mongoose.model('Orders', OrdersSchema);

module.exports = Orders;




