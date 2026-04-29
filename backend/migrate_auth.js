const db = require('./db.js'); 

(async () => {
    try {
        console.log('Creating otps table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS otps (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otp VARCHAR(10) NOT NULL,
                expiry DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Successfully created otps table.');

        console.log('Altering users table to add reset_token and reset_expiry...');
        try {
            await db.query(`ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL`);
        } catch (e) {
            console.log('Column reset_token might already exist:', e.message);
        }
        
        try {
            await db.query(`ALTER TABLE users ADD COLUMN reset_expiry DATETIME DEFAULT NULL`);
        } catch (e) {
            console.log('Column reset_expiry might already exist:', e.message);
        }

        console.log('Successfully updated users table.');
    } catch(err) {
        console.error('Migration failed:', err);
    }
    process.exit(0); 
})();
