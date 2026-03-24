// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { User, Account } = require('../models');

// exports.register = async (req, res) => {
//   try {
//     const { fullName, email, password } = req.body;

//     // 1. Check if user exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) return res.status(400).json({ message: "User already exists" });

//     // 2. Hash Password (Never store plain text!)
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 3. Create User
//     const newUser = await User.create({
//       fullName,
//       email,
//       password: hashedPassword
//     });

//     // 4. Automatically create a default Checking Account for the new user
//     const accountNumber = "ACC" + Math.floor(Math.random() * 1000000000);
//     await Account.create({
//       userId: newUser.id,
//       accountNumber,
//       balance: 1000.00, // Giving them $1000 "test" money
//       accountType: 'checking'
//     });

//     res.status(201).json({ message: "User registered and account created!" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ where: { email } });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Compare passwords
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//     // Generate JWT Token
//     const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email } });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create User
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully", accountNumber: user.accountNumber });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

    // 3. Create JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: { id: user._id, name: user.name, accountNumber: user.accountNumber, balance: user.balance }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
