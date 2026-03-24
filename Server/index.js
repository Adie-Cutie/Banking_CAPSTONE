const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
require('dotenv').config();
const authRoutes=require('./routes/authRoutes');
const accountRoutes=require('./routes/accountRoutes');
const {syncDb}=require('./models/index');
const app = express();



// Middleware
app.use(cors());
app.use(express.json()); // Allows the app to read JSON from requests
app.use('/api/auth',authRoutes);
app.use('/api/accounts',accountRoutes);

// Test Database Connection
sequelize.authenticate()
  .then(() => console.log('✅ Banking Database Connected...'))
  .catch(err => console.log('❌ Error: ' + err));

syncDb().then(()=>{
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});