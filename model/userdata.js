const mongoose = require('mongoose');
const dbURI = 'mongodb://localhost:27017/clieo';
const { Schema, ObjectId } = mongoose;

const UsersSchema = new Schema({
  Firstname: { type: String, required: true },
  Secondname: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Status: { type: String, required: true, enum: ['active', 'blocked'] },
  Role: { type: String, required: true, enum: ['user'] },
  Mobile: { type: Number },
  isdeleted: { type: Boolean, required: true },
  Profile: { type: String },
  Cart: { type: Schema.Types.ObjectId }

});

const Users = mongoose.model('Users', UsersSchema);

module.exports = Users;


