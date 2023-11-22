const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const CartSchema = new Schema({
    Items: [{
        Product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
        Quantity: { type: Number },
        color: { type: String },
        size: { type: Number }
    }],
    Total_quantity: { type: Number },
    User_id: { type: Schema.Types.ObjectId },
});

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;

