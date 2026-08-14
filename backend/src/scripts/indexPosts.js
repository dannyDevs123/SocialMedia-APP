const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Post = require('../models/Post');

const syncPostIndexes = async () => {
  try {
    await connectDB();

    console.log('Syncing Post collection indexes...');
    await Post.syncIndexes();
    console.log('Post indexes are up to date.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Failed to sync post indexes: ${error.message}`);

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error(`Failed to close MongoDB connection: ${closeError.message}`);
    }

    process.exit(1);
  }
};

syncPostIndexes();
