import { dbRun, dbAll, initDb, db } from './src/db.js';
import bcrypt from 'bcryptjs';

async function resetAndSeedDatabase() {
  console.log('🔄 Resetting and seeding database...\n');

  // Drop existing tables if they exist
  await dbRun('DROP TABLE IF EXISTS items');
  await dbRun('DROP TABLE IF EXISTS users');

  // Reinitialize database
  initDb();
  
  // Wait for table creation
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Create demo user
  console.log('👤 Creating demo user...');
  const password = 'abc';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const result = await dbRun(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    ['abc', 'abc@gmail.com', passwordHash]
  );
  const demoUserId = result.lastID;
  console.log(`✓ Demo user created (ID: ${demoUserId})\n`);

  // Sample transaction data
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

  console.log('💾 Seeding transaction data...');
  for (const item of sampleData) {
    const date = new Date();
    date.setDate(date.getDate() - item.daysAgo);
    const dateStr = date.toISOString().replace('T', ' ').split('.')[0];

    await dbRun(
      'INSERT INTO items (user_id, type, name, amount, category, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [demoUserId, item.type, item.name, item.amount, item.category, dateStr]
    );
  }
  console.log(`✓ Seeded ${sampleData.length} transactions\n`);

  // Verify data
  const items = await dbAll('SELECT COUNT(*) as count FROM items');
  const itemCount = items[0].count;
  console.log('📊 Database Summary:');
  console.log(`  • Total items: ${itemCount}`);
  console.log(`  • Total income items: ${sampleData.filter(d => d.type === 'income').length}`);
  console.log(`  • Total expense items: ${sampleData.filter(d => d.type === 'expense').length}`);

  console.log('\n✅ Database setup complete!\n');
  console.log('🔐 Demo Credentials:');
  console.log('   Username: abc');
  console.log('   Email: abc@gmail.com');
  console.log('   Password: abc');
  console.log('\n');

  process.exit(0);
}

resetAndSeedDatabase().catch(err => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
});
