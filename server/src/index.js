require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const partnerAuthRoutes = require('./routes/partnerAuth.routes');
const partnersRoutes = require('./routes/partners.routes');
const listingsRoutes = require('./routes/listings.routes');
const ordersRoutes = require('./routes/orders.routes');
const paymentsRoutes = require('./routes/payments.routes');
const addressesRoutes = require('./routes/addresses.routes');
const partnerDashboardRoutes = require('./routes/partnerDashboard.routes');
const chatRoutes = require('./routes/chat.routes');
const { refreshExpiredListings } = require('./db/refresh-demo-data');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true, service: 'mealify-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/partner-auth', partnerAuthRoutes);
app.use('/api/partners', partnersRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/partner', partnerDashboardRoutes);
app.use('/api/chat', chatRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mealify API listening on http://0.0.0.0:${PORT}`);
});

// Keep demo listings perpetually "active" without needing a manual re-seed —
// matters once this runs unattended on a server instead of a dev machine.
refreshExpiredListings().catch((err) => console.error('Initial demo-data refresh failed:', err.message));
setInterval(() => {
  refreshExpiredListings().catch((err) => console.error('Scheduled demo-data refresh failed:', err.message));
}, 60 * 60 * 1000);
