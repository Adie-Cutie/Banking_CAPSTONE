const express = require('express');
const router = express.Router();
const { getAccounts, transferMoney } = require('../controllers/accountController');
const auth = require('../middleware/authMiddleware');

// All these routes require a valid JWT token
router.get('/my-accounts', auth, getAccounts);
router.post('/transfer', auth, transferMoney);

module.exports = router;