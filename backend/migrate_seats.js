const db = require('./db');

const generateSeats = (eventId, category, capacity) => {
  const seats = [];
  
  if (category === 'Music' || category === 'Festival') {
    // 20% VIP, 30% Gold, 50% GA
    const vipCount = Math.floor(capacity * 0.2);
    const goldCount = Math.floor(capacity * 0.3);
    const gaCount = capacity - vipCount - goldCount;

    for (let i = 0; i < vipCount; i++) seats.push([eventId, `VIP-${i + 1}`, 'VIP', 2.50]);
    for (let i = 0; i < goldCount; i++) seats.push([eventId, `GLD-${i + 1}`, 'Gold', 1.50]);
    for (let i = 0; i < gaCount; i++) seats.push([eventId, `GA-${i + 1}`, 'GA', 1.00]);

  } else if (category === 'Sports') {
    // 25% North, 25% South, 20% East, 20% West, 10% VIP
    const north = Math.floor(capacity * 0.25);
    const south = Math.floor(capacity * 0.25);
    const east = Math.floor(capacity * 0.20);
    const west = Math.floor(capacity * 0.20);
    const vip = capacity - north - south - east - west;

    for (let i = 0; i < north; i++) seats.push([eventId, `N-${i + 1}`, 'North Stand', 1.20]);
    for (let i = 0; i < south; i++) seats.push([eventId, `S-${i + 1}`, 'South Stand', 1.20]);
    for (let i = 0; i < east; i++) seats.push([eventId, `E-${i + 1}`, 'East Stand', 1.80]);
    for (let i = 0; i < west; i++) seats.push([eventId, `W-${i + 1}`, 'West Stand', 1.80]);
    for (let i = 0; i < vip; i++) seats.push([eventId, `VIP-${i + 1}`, 'VIP Box', 3.00]);

  } else if (category === 'Comedy') {
    const seatsPerTable = 4;
    for (let i = 0; i < capacity; i++) {
        const table = Math.floor(i / seatsPerTable) + 1;
        const seat = (i % seatsPerTable) + 1;
        seats.push([eventId, `T${table}-S${seat}`, 'Standard', 1.00]);
    }
  } else {
    // Technology, Classical, Theater, Other -> Grid layout
    const rows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const seatsPerRow = 10;
    for (let i = 0; i < capacity; i++) {
        const rowIndex = Math.floor(i / seatsPerRow);
        let rowName = "";
        if (rowIndex < 26) {
            rowName = rows[rowIndex];
        } else {
            rowName = rows[Math.floor(rowIndex / 26) - 1] + rows[rowIndex % 26];
        }
      const num = (i % seatsPerRow) + 1;
      seats.push([eventId, `${rowName}${num}`, 'Standard', 1.00]);
    }
  }
  return seats;
};

const migrate = async () => {
    try {
        await db.query('DELETE FROM event_seats'); // Clear existing seats for fresh migration
        const [events] = await db.query('SELECT id, category, total_capacity FROM events');
        for (const event of events) {
            console.log(`Generating seats for event ${event.id} (${event.category})`);
            const seatsData = generateSeats(event.id, event.category, event.total_capacity);
            if (seatsData.length > 0) {
                const BATCH_SIZE = 500;
                for (let i = 0; i < seatsData.length; i += BATCH_SIZE) {
                    const batch = seatsData.slice(i, i + BATCH_SIZE);
                    await db.query(
                        'INSERT IGNORE INTO event_seats (event_id, seat_number, seat_class, price_multiplier) VALUES ?',
                        [batch]
                    );
                }
            }
        }
        console.log('Migration complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

migrate();
