const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // MongoDB BSON stores strings as UTF-8 by default (full Unicode, including emojis).
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });

    mongoose.set('strictQuery', true);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
