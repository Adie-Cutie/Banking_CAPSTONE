// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db');

// const Transaction = sequelize.define('Transaction', {
//   amount: {
//     type: DataTypes.DECIMAL(15, 2),
//     allowNull: false
//   },
//   type: {
//     type: DataTypes.ENUM('deposit', 'withdrawal', 'transfer'),
//     allowNull: false
//   },
//   status: {
//     type: DataTypes.ENUM('pending', 'completed', 'failed'),
//     defaultValue: 'completed'
//   }
// });

// module.exports = Transaction;

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['transfer', 'deposit', 'withdrawal'], default: 'transfer' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);