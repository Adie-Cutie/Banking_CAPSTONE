const mongoose = require('mongoose');

const connectDB = async () => {
 try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {family: 4});
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Detailed Error: ${error.message}`);
    // This will help us see if it's a Timeout or Auth failure
    process.exit(1);
  }
};

module.exports = connectDB;