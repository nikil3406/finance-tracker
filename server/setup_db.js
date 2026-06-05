import { dbRun, dbAll, initDb } from './src/db.js';
import bcrypt from 'bcryptjs';

async function setupDatabase() {
  console.log('Initializing database...');
  initDb();

  // Wait a bit for table creation
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check if demo user exists
  const users = await dbAll('SELECT id, username FROM users');
  console.log(`Found ${users.length} users in database`);

  let demoUserId = null;

  // Create demo user if it doesn't exist
  if (users.length === 0) {
    console.log('Creating demo user...');
    const password = 'abc';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await dbRun(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      ['abc', 'abc@gmail.com', passwordHash]
    );
    demoUserId = result.lastID;
    console.log(`Demo user created with ID: ${demoUserId} (username: demo, password: Demo123!)`);
  } else {
    demoUserId = users[0].id;
    console.log(`Using existing user: ${users[0].username} (ID: ${demoUserId})`);
  }

  // Seed demo data
  console.log('\nSeeding transaction data...');
  const sampleData = [
    { type: 'income', name: 'Monthly Salary', amount: 85000, category: 'Work', daysAgo: 28 },
    { type: 'income', name: 'Freelance Project', amount: 15000, category: 'Side Hustle', daysAgo: 15 },
    { type: 'income', name: 'Stock Dividends', amount: 5000, category: 'Investment', daysAgo: 5 },
    { type: 'expense', name: 'Monthly Rent', amount: 25000, category: 'Housing', daysAgo: 27 },
    { type: 'expense', name: 'Amazon Shopping', amount: 4500, category: 'Shopping', daysAgo: 20 },
    { type: 'expense', name: 'Grocery Store', amount: 2200, category: 'Food', daysAgo: 22 },
    { type: 'expense', name: 'Gas Station', amount: 3500, category: 'Transport', daysAgo: 18 },
    { type: 'expense', name: 'Dinner with Friends', amount: 1800, category: 'Dining', daysAgo: 15 },
    { type: 'expense', name: 'Netflix Subscription', amount: 800, category: 'Entertainment', daysAgo: 14 },
    { type: 'expense', name: 'Weekly Groceries', amount: 2500, category: 'Food', daysAgo: 12 },
    { type: 'expense', name: 'Gym Membership', amount: 2000, category: 'Health', daysAgo: 8 },
    { type: 'expense', name: 'Electric Bill', amount: 3200, category: 'Utilities', daysAgo: 5 },
    { type: 'expense', name: 'Sushi Night', amount: 1200, category: 'Dining', daysAgo: 3 },
    { type: 'expense', name: 'New Sneakers', amount: 6500, category: 'Shopping', daysAgo: 1 },
    { type: 'expense', name: 'Internet Bill', amount: 1500, category: 'Utilities', daysAgo: 26 },
  ];

  // Check if items already exist
  const existingItems = await dbAll('SELECT COUNT(*) as count FROM items WHERE user_id = ?', [demoUserId]);
  const itemCount = existingItems[0].count;

  if (itemCount === 0) {
    for (const item of sampleData) {
      const date = new Date();
      date.setDate(date.getDate() - item.daysAgo);
      const dateStr = date.toISOString().replace('T', ' ').split('.')[0];

      await dbRun(
        'INSERT INTO items (user_id, type, name, amount, category, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [demoUserId, item.type, item.name, item.amount, item.category, dateStr]
      );
    }
    console.log(`✓ Seeded ${sampleData.length} transactions`);
  } else {
    console.log(`✓ Database already has ${itemCount} transactions, skipping seed`);
  }

  console.log('\n✓ Database setup complete!');
  console.log('\nDemo Credentials:');
  console.log('  Username: demo');
  console.log('  Email: demo@example.com');
  console.log('  Password: Demo123!');
  process.exit(0);
}

setupDatabase().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
