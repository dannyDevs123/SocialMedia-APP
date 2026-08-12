/**
 * Database Seeder
 *
 * Populates the database with dummy users and posts for testing.
 * Usage: npm run seed
 */
const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables from .env (also populates process.env)
const { BCRYPT_ROUNDS } = require('../config/env');

// Import existing database connection setup
const connectDB = require('../config/db');

// Import models
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Follow = require('../models/Follow');

// --- Dummy Data ---

const users = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
    bio: 'Software developer & coffee enthusiast ☕ Building things that matter.',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'password123',
    bio: 'Photographer capturing life one frame at a time 📸',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    name: 'Carol Williams',
    email: 'carol@example.com',
    password: 'password123',
    bio: 'Travel addict | Foodie | Dreamer ✈️',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
];

const posts = [
  {
    content:
      'Just finished building a new feature for our social media app! The feeling of shipping code is unmatched. #coding #webdev',
    imageUrl: 'https://picsum.photos/seed/post1/600/400',
  },
  {
    content:
      'Beautiful sunset at the beach today. Sometimes you just need to stop and appreciate the little things in life. 🌅',
    imageUrl: 'https://picsum.photos/seed/post2/600/400',
  },
  {
    content:
      "Coffee and code - the perfect combination for a productive morning. What's your go-to productivity hack?",
    imageUrl: '',
  },
  {
    content:
      'Exploring the city with my camera today. Found some amazing street art that I just had to share! 🎨',
    imageUrl: 'https://picsum.photos/seed/post4/600/400',
  },
  {
    content:
      "Just tried the new café downtown - the matcha latte is absolutely divine! Highly recommend if you're in the area. 🍵",
    imageUrl: 'https://picsum.photos/seed/post5/600/400',
  },
];

// --- Seeding Logic ---

const seed = async () => {
  try {
    // Connect to the database using the existing connection setup
    await connectDB();

    console.log('\n--- Starting database seeding ---\n');

    // Clear existing data from all collections to avoid duplicates
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Like.deleteMany({});
    await Follow.deleteMany({});
    console.log('All collections cleared.\n');

    // Create users with hashed passwords (matching authController convention)
    console.log('Creating users...');
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const passwordHash = await bcrypt.hash(
          user.password,
          parseInt(BCRYPT_ROUNDS)
        );
        return User.create({
          name: user.name,
          email: user.email,
          passwordHash,
          bio: user.bio,
          avatar: user.avatar,
        });
      })
    );
    console.log(`Created ${createdUsers.length} users.`);
    createdUsers.forEach((u) => {
      console.log(`  - ${u.name} (${u.email})`);
    });
    console.log('');

    // Create posts distributed across users (round-robin assignment)
    console.log('Creating posts...');
    const createdPosts = await Promise.all(
      posts.map(async (post, index) => {
        const userIndex = index % createdUsers.length;
        return Post.create({
          userId: createdUsers[userIndex]._id,
          content: post.content,
          imageUrl: post.imageUrl,
        });
      })
    );
    console.log(`Created ${createdPosts.length} posts.`);
    createdPosts.forEach((p, i) => {
      const author = createdUsers[i % createdUsers.length];
      console.log(`  - Post #${i + 1} by ${author.name}`);
    });
    console.log('');

    console.log('--- Seeding complete! ---\n');

    // Close the database connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error(`\nError seeding database: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder
seed();
