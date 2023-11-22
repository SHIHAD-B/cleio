const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const AddressSchema = new Schema({

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

});

const Address = mongoose.model('Address', AddressSchema);

module.exports = Address;

