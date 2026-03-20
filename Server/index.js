const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
require('dotenv').config();

const app = express();
const {syncDb}=require('./models/index');


// Middleware
app.use(cors());
app.use(express.json()); // Allows the app to read JSON from requests

// Test Database Connection
sequelize.authenticate()
  .then(() => console.log('✅ Banking Database Connected...'))
  .catch(err => console.log('❌ Error: ' + err));

syncDb();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
