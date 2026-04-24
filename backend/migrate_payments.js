const mysql = require('mysql2/promise');
require('dotenv').config();

const migrate = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'bookmyevent'
        });

        console.log('ALTERING payments table...');
        await connection.query(`
            ALTER TABLE payments 
            MODIFY COLUMN payment_method ENUM('credit_card', 'debit_card', 'upi', 'net_banking', 'razorpay') NOT NULL
        `);

        console.log('Migration Successful! Razorpay is now authorized in the DB.');
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('Migration Failed:', err);
        process.exit(1);
    }
};

migrate();
