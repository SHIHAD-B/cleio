const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const ProductSchema = new Schema({
   isdeleted: { type: Boolean },
   Name: { type: String, required: true, },
   Description: { type: String, required: true },
   variant: [{
      size: { type: String, required: true },
      quantity: { type: Number, required: true }
   }],
   Image: [{
      Child_four: { type: String },
      Child_one: { type: String },
      Child_three: { type: String },
      Child_two: { type: String },
      Main: { type: String },
   }],
   Status: { type: String, enum: ['draft', 'published', 'out_of_stock', 'low_quantity'] },
   Product_added: { type: Date },
   Specification: [{

      color: { type: String },
      gender: { type: String },
      brand: { type: String },
      Category: { type: String },
   }],
   Price: { type: Number, required: true },
   Rating: { type: Number },
   Product_details: {
      Closure_type: { type: String },
      Country_of_origin: { type: String },
      Heel_type: { type: String },
      Material_type: { type: String },
      Sole_material: { type: String },
      Style: { type: String },
      Water_resistance: { type: String },
   },
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;

