const db = require('./db.js'); 
(async () => {
    try {
        await db.query("ALTER TABLE event_seats MODIFY seat_class VARCHAR(50) DEFAULT 'Standard'");
        console.log('Altered table'); 
    } catch(err) {
        console.error(err);
    }
    process.exit(0); 
})();
