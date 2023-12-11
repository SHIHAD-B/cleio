const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const ProductofferSchema = new Schema({
    Product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
    product_name: { type: String },
    Starts_at: { type: Date },
    Expires_at: { type: Date },
    Offer: { type: Number },
    created_at: { type: Date },
    Status: { type: String, enum: ['active', 'expired'] },
});

const Productoffer = mongoose.model('Productoffer', ProductofferSchema);

module.exports = Productoffer;

