// Re-dates existing active listings so their pickup windows are in the future
// again, without re-seeding (which would duplicate partners/customers). Run
// this whenever demo data goes stale from inactivity.
require('dotenv').config();
const pool = require('./pool');

async function refresh() {
  const result = await pool.query(
    `UPDATE listings
     SET pickup_window_start = now() + (floor(random() * 3) + 1) * interval '1 hour',
         pickup_window_end = now() + (floor(random() * 3) + 4) * interval '1 hour',
         expires_at = now() + (floor(random() * 3) + 4) * interval '1 hour'
     WHERE status = 'active'
     RETURNING id`
  );
  console.log(`Refreshed ${result.rowCount} active listings to have future pickup windows.`);
  await pool.end();
}

refresh().catch((err) => {
  console.error('Refresh failed:', err);
  process.exit(1);
});
