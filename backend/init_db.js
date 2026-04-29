const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const initDB = async () => {
    try {
        console.log('Connecting to MySQL instance to initialize schemas...');
        const connectionConfig = process.env.MYSQL_URL || {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        };

        const connection = await mysql.createConnection(connectionConfig);

        const sql = fs.readFileSync(path.join(__dirname, 'schema.sql')).toString();
        // Remove comments and split by actual statement
        const sqlStatements = sql.replace(/--.*$/gm, '').split(';').filter(stmt => stmt.trim());

        for (let stmt of sqlStatements) {
            console.log(`Executing: ${stmt.substring(0, 50).trim()}...`);
            await connection.query(stmt);
        }

        console.log('Database and Tables initialized successfully!');
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('Failed to initialize database', err);
        process.exit(1);
    }
};

initDB();
