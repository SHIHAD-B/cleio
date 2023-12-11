const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const CategorySchema = new Schema({
  date: { type: Date },
  Category: { type: String, },
  isdeleted: { type: Boolean },
  offer: { type: Schema.Types.ObjectId }
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;



