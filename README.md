💳 IBM Bank - MERN Stack Capstone
A secure, full-stack digital banking application built with the MERN (MongoDB, Express, React, Node.js) stack. This platform allows users to manage a virtual ledger, perform real-time transfers, and monitor financial health through an interactive dashboard.
MERN stack architecture diagram, AI generated
Getty Images

🚀 Features
User Authentication: Secure Sign-up and Login using JWT (JSON Web Tokens).

Initial Endowment: New users are automatically credited with $1,000 upon registration.

Dynamic Dashboard: Real-time calculation of Total Balance, Income, and Expenses.

Smart Transfers: Send money via 10-digit account numbers with instant balance updates.

Transaction Ledger: Categorized history showing incoming (Emerald) and outgoing (Red) payments.

Responsive Design: Fully functional on Desktop and Mobile viewports.

Automated Testing: Comprehensive E2E and API test suite powered by Playwright.

🛠️ Tech Stack
Frontend: React.js, Tailwind CSS, Lucide Icons, Vite.

Backend: Node.js, Express.js.

Database: MongoDB (with Mongoose ODM).

Testing: Playwright (UI & API Testing), Allure Reporting.

State Management: React Hooks (useState, useEffect).

📦 Installation & Setup
1. Clone the Repository
Bash
git clone https://github.com/your-username/IBM-Bank-Capstone.git
cd IBM-Bank-Capstone
2. Backend Setup
Bash
cd backend
npm install
# Create a .env file and add:
# PORT=3000
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
npm start
3. Frontend Setup
Bash
cd frontend
npm install
npm run dev
🧪 Testing Suite
We use Playwright to ensure financial data integrity and UI stability.
automated testing pyramid, AI generated
Getty Images

Run all tests:
Bash
npx playwright test
Run API-specific tests:
Bash
npx playwright test tests/api.spec.js --project=chromium --workers=1
View Test Report:
Bash
npx playwright show-report
📋 Milestone Documentation
This project follows a structured STLC (Software Testing Life Cycle). Detailed documentation for Milestone 1 (Analysis & Planning), including the Requirements Traceability Matrix (RTM) and Test Strategy, can be found in the /docs folder.

🛡️ Security Features
Password Hashing: Uses bcryptjs for storing passwords securely.

Protected Routes: Middleware ensures only authenticated users can access the transaction engine.

Input Validation: Strict server-side checks to prevent negative transfers or overdrafts.

Developed as part of the IBM Full-Stack Capstone Program. 🚀
