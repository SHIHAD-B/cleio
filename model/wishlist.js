const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const WishlistSchema = new Schema({
    User_id: { type: Schema.Types.ObjectId, ref: 'User' },
    Product: [{
        Product_id: { type: Schema.Types.ObjectId, ref: 'Product' },

    }],
});

const Wishlist = mongoose.model('Wishlist', WishlistSchema);

module.exports = Wishlist;
