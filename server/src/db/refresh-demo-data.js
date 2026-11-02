// Re-dates listings whose pickup window has already expired so demo data never
// goes stale from inactivity. Safe to call repeatedly — only touches listings
// that have actually expired, leaving still-valid ones untouched.
const pool = require('./pool');

async function refreshExpiredListings() {
  const result = await pool.query(
    `UPDATE listings
     SET pickup_window_start = now() + (floor(random() * 3) + 1) * interval '1 hour',
         pickup_window_end = now() + (floor(random() * 3) + 4) * interval '1 hour',
         expires_at = now() + (floor(random() * 3) + 4) * interval '1 hour'
     WHERE status = 'active' AND expires_at <= now()
     RETURNING id`
  );
  if (result.rowCount > 0) {
    console.log(`Refreshed ${result.rowCount} expired listing(s) to have future pickup windows.`);
  }
  return result.rowCount;
}

module.exports = { refreshExpiredListings };

if (require.main === module) {
  require('dotenv').config();
  refreshExpiredListings()
    .then((count) => {
      if (count === 0) console.log('No expired listings to refresh.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Refresh failed:', err);
      process.exit(1);
    });
}
