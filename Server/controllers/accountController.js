const { Account, Transaction, sequelize } = require('../models');

// 1. Get User Accounts & Balance
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.findAll({ where: { userId: req.user.id } });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. The Transfer Logic (The "Heart" of the app)
exports.transferMoney = async (req, res) => {
  const { recipientAccountNumber, amount } = req.body;
  const senderUserId = req.user.id;

  // Start a Managed Transaction
  const t = await sequelize.transaction();

  try {
    // A. Find Sender's Account
    const senderAccount = await Account.findOne({ where: { userId: senderUserId } }, { transaction: t });
    if (senderAccount.balance < amount) {
      throw new Error('Insufficient funds');
    }

    // B. Find Receiver's Account
    const receiverAccount = await Account.findOne({ where: { accountNumber: recipientAccountNumber } }, { transaction: t });
    if (!receiverAccount) {
      throw new Error('Recipient account not found');
    }

    // C. Perform the math
    senderAccount.balance = parseFloat(senderAccount.balance) - parseFloat(amount);
    receiverAccount.balance = parseFloat(receiverAccount.balance) + parseFloat(amount);

    // D. Save both
    await senderAccount.save({ transaction: t });
    await receiverAccount.save({ transaction: t });

    // E. Record the Transaction History
    await Transaction.create({
      senderId: senderAccount.id,
      receiverId: receiverAccount.id,
      amount,
      type: 'transfer',
      status: 'completed'
    }, { transaction: t });

    // If we reached here, everything is perfect. Commit!
    await t.commit();
    res.json({ message: "Transfer successful", newBalance: senderAccount.balance });

  } catch (error) {
    // If ANY step above failed, undo everything
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
};