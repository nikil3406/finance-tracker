import { dbAll, dbRun } from './src/db.js';

async function seed() {
  const users = await dbAll('SELECT id FROM users');
  if (users.length === 0) {
    console.log('No users found. Please register a user first.');
    process.exit(1);
  }

  const data = [
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

  for (const user of users) {
    const userId = user.id;
    console.log('Seeding items for user ID:', userId, `(${user.username})`);
    for (const item of data) {
      const date = new Date();
      date.setDate(date.getDate() - item.daysAgo);
      const dateStr = date.toISOString().replace('T', ' ').split('.')[0];
      
      await dbRun(
        'INSERT INTO items (user_id, type, name, amount, category, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, item.type, item.name, item.amount, item.category, dateStr]
      );
    }
  }
  
  console.log('Dummy data seeded successfully for all users!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
