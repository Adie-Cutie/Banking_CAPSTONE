// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db');

// const User = sequelize.define('User', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true
//   },
//   fullName: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   email: {
//     type: DataTypes.STRING,
//     unique: true,
//     allowNull: false,
//     validate: { isEmail: true }
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false
//   }
// });

// module.exports = User;

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accountNumber: { 
    type: String, 
    unique: true, 
    // Generates a random 10-digit string
    default: () => Math.floor(1000000000 + Math.random() * 9000000000).toString() 
  },
  balance: { type: Number, default: 1000 } // Giving them $1000 starting bonus!
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);