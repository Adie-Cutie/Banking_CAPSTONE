const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.transferMoney = async (req, res) => {
  try {
    const { receiverAccountNumber, amount } = req.body;
    const senderId = req.user.id; // We'll get this from the JWT later
    const amountToTransfer = Number(amount);
    if (isNaN(amountToTransfer) || amountToTransfer <= 0) {
      return res.status(400).json({ message: "Invalid amount. Must be greater than zero." });
    }
    

    // 1. Find Sender & Receiver
    const sender = await User.findById(senderId);
    const receiver = await User.findOne({ accountNumber: receiverAccountNumber });

    if (!receiver) return res.status(404).json({ message: "Receiver not found" });
    if (sender.balance < amount) return res.status(400).json({ message: "Insufficient funds" });
    if (sender.accountNumber === receiverAccountNumber) return res.status(400).json({ message: "Cannot transfer to self" });

    // 2. Perform the math
    sender.balance -= amountToTransfer;
    receiver.balance += amountToTransfer;

    // 3. Save both and create record
    await sender.save();
    await receiver.save();

    const transaction = new Transaction({
      sender: sender._id,
      receiver: receiver._id,
      amount
    });
    await transaction.save();

    res.json({ message: "Transfer successful", newBalance: sender.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Ledger
exports.getTransactions = async (req, res) => {
  try {
    // Find transactions where the user is either the sender OR the receiver
    const transactions = await Transaction.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
    .populate('sender', 'name accountNumber') // Pulls name/acc from User model
    .populate('receiver', 'name accountNumber')
    .sort({ createdAt: -1 }); // Newest first

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};