const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const AdminSchema = new Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true, enum: ['admin', 'superadmin'] },
  password: { type: String, required: true }
});

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;

