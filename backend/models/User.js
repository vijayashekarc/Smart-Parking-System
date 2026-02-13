const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  phone_number: String,
  vehicle_no: String,
  vehicle_type: { type: String, enum: ['2-wheeler', '4-wheeler'] },
  user_type: { type: String, enum: ['employee', 'guest'] },
  qr_code_data: String, // We will generate a unique string here
  wallet_balance: { type: Number, default: 500 } // For fake payments
});

module.exports = mongoose.model('User', UserSchema);