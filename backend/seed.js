const bcrypt = require('bcryptjs');
require('dotenv').config();
const db = require('./db');

const seedDB = async () => {
  try {
    console.log('Seeding database...');

    // 1. Create a default Admin Organizer
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Insert Ignore to avoid crash if running twice
    const [adminResult] = await db.query(
      `INSERT IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      ['Super Admin', 'admin@bookmyevent.com', hashedPassword, 'admin']
    );

    let adminId = adminResult.insertId;
    if (adminId === 0) {
      // means it was ignored, let's fetch it
      const [existingAdmin] = await db.query('SELECT id FROM users WHERE email = ?', ['admin@bookmyevent.com']);
      adminId = existingAdmin[0].id;
    }

    // 2. Clear old test events (Optional, but good for fresh seed)
    await db.query('DELETE FROM events');

    /* 
    // 3. Insert 4 diverse dummy events
    const eventsToInsert = [
      ...
    ];

    for (let eq of eventsToInsert) {
      await db.query(
        ...
      );
    }
    */

    console.log('Successfully seeded database with 1 Admin user (Demo events skipped)!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Failed!', err);
    process.exit(1);
  }
};

seedDB();
