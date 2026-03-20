const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Account = sequelize.define('Account', {
  accountNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  accountType: {
    type: DataTypes.ENUM('savings', 'checking'),
    defaultValue: 'checking'
  }
});

module.exports = Account;

