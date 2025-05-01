const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school-management';
require('dotenv').config();

const hashPassword = (plain) => bcrypt.hashSync(plain, 10);

async function addAdmin() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const username = process.argv[2] ? process.argv[2] : '';
  if (username === '') {
    throw new Error('Username required');
  }

  const password = process.argv[3] ? process.argv[3] : '';
  if (password === '') {
    throw new Error('Password required');
  }

  const user = await User.create({ username: username, password: hashPassword(password), role: 'admin' });

  console.log('Added Admin user:', user);
  process.exit();
}

addAdmin().catch(err => {
  console.error('Failed to add Admin user:', err);
  process.exit(1);
});