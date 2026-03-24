// 

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Import the function
const authRoutes = require('./routes/authRoutes');
const transactionRoutes=require('./routes/transactionRoutes');
require('dotenv').config();

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// TEMPORARY DEBUG ROUTE
app.post('/test', (req, res) => {
    console.log("Body received:", req.body);
    res.json({ message: "Server is receiving POST requests!" });
});

//routes
console.log("Loading Auth Routes...");
app.use('/api/auth', authRoutes);
app.use('/api/transactions',transactionRoutes);


app.get('/', (req, res) => {
  res.send('Banking API is running...');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));