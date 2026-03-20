const sequelize = require('../config/db');
const User = require('./User');
const Account = require('./Account');
const Transaction = require('./Transaction');

// Define Relationships
User.hasMany(Account, { foreignKey: 'userId' });
Account.belongsTo(User, { foreignKey: 'userId' });

// A transaction has a sender and a receiver
Transaction.belongsTo(Account, { as: 'sender', foreignKey: 'senderId' });
Transaction.belongsTo(Account, { as: 'receiver', foreignKey: 'receiverId' });

const syncDb = async () => {
  try {
    // { alter: true } updates tables if you change the code later
    await sequelize.sync({ alter: true });
    console.log("✅ Database Models & Relations Synchronized");
  } catch (error) {
    console.error("❌ Database Sync Error:", error);
  }
};

module.exports = { User, Account, Transaction, syncDb };