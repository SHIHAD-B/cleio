const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const WalletSchema = new Schema({
    User_id: { type: Schema.Types.ObjectId },
    Account_balance: { type: Number },
    Transactions: [{
        Amount: { type: Number },
        Date: { type: Date },
        Description: { type: String },
        Transaction_id: { type: String },
        Transaction_type: { type: String },
    }],
});

const Wallet = mongoose.model('Wallet', WalletSchema);

module.exports = Wallet;

