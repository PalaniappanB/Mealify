const bcrypt = require('bcryptjs');
const pool = require('./pool');

const hoursFromNow = (h) => new Date(Date.now() + h * 60 * 60 * 1000);
const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000);

const PARTNERS = [
  {
    name: 'Bombay Bites Bakery', cuisine_type: 'Bakery', city: 'Mumbai',
    address: 'Linking Road, Bandra West, Mumbai', latitude: 19.0596, longitude: 72.8295,
    listings: [
      { title: 'Assorted Pastry Box', description: '6 mixed pastries baked this morning — chocolate, fruit and cream.', original_price: 480, discounted_price: 190, quantity_available: 8 },
      { title: 'Sourdough Loaf Duo', description: 'Two fresh sourdough loaves, slightly overbaked batch.', original_price: 360, discounted_price: 150, quantity_available: 5 },
      { title: 'Cookie Jar Surplus', description: 'A jar of assorted butter and oat cookies.', original_price: 250, discounted_price: 99, quantity_available: 10 }
    ]
  },
  {
    name: 'Karma Kitchen', cuisine_type: 'North Indian', city: 'Mumbai',
    address: 'SV Road, Andheri West, Mumbai', latitude: 19.1197, longitude: 72.8468,
    listings: [
      { title: 'Evening Thali Surplus Pack', description: 'Dal, sabzi, roti and rice — today’s unsold thali portions.', original_price: 320, discounted_price: 129, quantity_available: 6 },
      { title: 'Paneer Curry & Rice Combo', description: 'Paneer butter masala with jeera rice.', original_price: 280, discounted_price: 115, quantity_available: 4 }
    ]
  },
  {
    name: 'Dosa Junction', cuisine_type: 'South Indian', city: 'Bengaluru',
    address: 'Indiranagar 100 Feet Road, Bengaluru', latitude: 12.9719, longitude: 77.6412,
    listings: [
      { title: 'Masala Dosa Duo', description: 'Two masala dosas with chutney and sambar, made fresh for lunch service.', original_price: 220, discounted_price: 89, quantity_available: 7 },
      { title: 'Idli Vada Surplus Box', description: 'Steamed idlis and crispy vadas from the breakfast counter.', original_price: 180, discounted_price: 75, quantity_available: 9 },
      { title: 'Filter Coffee & Snack Combo', description: 'Two filter coffees with mixed bajji.', original_price: 140, discounted_price: 59, quantity_available: 12 }
    ]
  },
  {
    name: 'The Brew Cafe', cuisine_type: 'Cafe', city: 'Bengaluru',
    address: 'Church Street, Bengaluru', latitude: 12.9762, longitude: 77.6033,
    listings: [
      { title: 'Sandwich & Muffin Box', description: 'Grilled sandwiches paired with a blueberry muffin.', original_price: 300, discounted_price: 129, quantity_available: 6 },
      { title: 'All-Day Breakfast Surplus', description: 'Today’s unsold all-day-breakfast plates.', original_price: 340, discounted_price: 149, quantity_available: 3 }
    ]
  },
  {
    name: 'Old Delhi Chaat House', cuisine_type: 'Street Food', city: 'Delhi',
    address: 'Chandni Chowk, Old Delhi', latitude: 28.6506, longitude: 77.2303,
    listings: [
      { title: 'Chaat Surprise Box', description: 'Gol gappe, aloo tikki and dahi bhalla assortment.', original_price: 200, discounted_price: 85, quantity_available: 10 },
      { title: 'Kachori Sabzi Pack', description: 'Crisp kachoris with spiced potato curry.', original_price: 160, discounted_price: 65, quantity_available: 8 }
    ]
  },
  {
    name: 'Spice Route', cuisine_type: 'North Indian', city: 'Delhi',
    address: 'Connaught Place, New Delhi', latitude: 28.6315, longitude: 77.2167,
    listings: [
      { title: 'Butter Chicken Surplus Combo', description: 'Butter chicken with naan, from today’s dinner prep.', original_price: 420, discounted_price: 179, quantity_available: 5 },
      { title: 'Veg Thali Pack', description: 'Full vegetarian thali — unsold dinner portions.', original_price: 300, discounted_price: 119, quantity_available: 6 }
    ]
  },
  {
    name: "Nizam's Biryani Point", cuisine_type: 'Biryani', city: 'Hyderabad',
    address: 'Tolichowki, Hyderabad', latitude: 17.3937, longitude: 78.4013,
    listings: [
      { title: 'Chicken Biryani Family Pack', description: 'Large surplus batch of hyderabadi chicken biryani.', original_price: 550, discounted_price: 229, quantity_available: 4 },
      { title: 'Veg Biryani Box', description: 'Single-serve vegetable dum biryani with raita.', original_price: 220, discounted_price: 89, quantity_available: 8 }
    ]
  },
  {
    name: 'Marina Meals', cuisine_type: 'South Indian', city: 'Chennai',
    address: 'Besant Nagar, Chennai', latitude: 13.0004, longitude: 80.2669,
    listings: [
      { title: 'Curd Rice & Curry Box', description: 'Comfort curd rice with vathal kuzhambu.', original_price: 180, discounted_price: 75, quantity_available: 9 },
      { title: 'Meals Surplus Combo', description: 'Full South Indian meals — rice, sambar, rasam, two curries.', original_price: 260, discounted_price: 109, quantity_available: 5 }
    ]
  },
  {
    name: 'Continental Corner', cuisine_type: 'Continental', city: 'Pune',
    address: 'Koregaon Park, Pune', latitude: 18.5362, longitude: 73.8938,
    listings: [
      { title: 'Pasta & Garlic Bread Box', description: 'Penne arrabbiata with garlic bread, made for lunch service.', original_price: 340, discounted_price: 145, quantity_available: 6 },
      { title: 'Grilled Veggie Bowl', description: 'Grilled seasonal vegetables with herbed rice.', original_price: 280, discounted_price: 119, quantity_available: 4 }
    ]
  },
  {
    name: 'Wok & Roll Chinese', cuisine_type: 'Chinese', city: 'Pune',
    address: 'FC Road, Pune', latitude: 18.5236, longitude: 73.8478,
    listings: [
      { title: 'Manchurian & Fried Rice Box', description: 'Veg manchurian with hakka fried rice.', original_price: 260, discounted_price: 109, quantity_available: 7 },
      { title: 'Noodles & Spring Roll Combo', description: 'Hakka noodles with crispy spring rolls.', original_price: 240, discounted_price: 99, quantity_available: 5 }
    ]
  }
];

const CUSTOMERS = [
  { name: 'Aditi Sharma', email: 'aditi.sharma@example.com', phone: '9820011122', preferred_language: 'en' },
  { name: 'Rohan Mehta', email: 'rohan.mehta@example.com', phone: '9820011123', preferred_language: 'en' },
  { name: 'Priya Nair', email: 'priya.nair@example.com', phone: '9820011124', preferred_language: 'hi' },
  { name: 'Karthik Subramanian', email: 'karthik.s@example.com', phone: '9820011125', preferred_language: 'en' },
  { name: 'Simran Kaur', email: 'simran.kaur@example.com', phone: '9820011126', preferred_language: 'hi' }
].map((c) => ({
  ...c,
  avatar_url: `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(c.name)}&backgroundColor=f2dee3,f7efd8,fbf8f6`
}));

const DEMO_PASSWORD = 'password123';
const PARTNER_PASSWORD = 'partner123';

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
}

async function seed() {
  console.log('Seeding Mealify database...');

  const customerPasswordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const partnerPasswordHash = await bcrypt.hash(PARTNER_PASSWORD, 10);

  const customerIds = [];
  for (const c of CUSTOMERS) {
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, preferred_language, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [c.name, c.email, c.phone, customerPasswordHash, c.preferred_language, c.avatar_url]
    );
    customerIds.push(result.rows[0].id);
  }

  await pool.query(
    `INSERT INTO addresses (user_id, label, address_text, latitude, longitude, is_default)
     VALUES ($1, 'Home', 'Bandra West, Mumbai', 19.0596, 72.8295, true)`,
    [customerIds[0]]
  );
  await pool.query(
    `INSERT INTO addresses (user_id, label, address_text, latitude, longitude, is_default)
     VALUES ($1, 'Work', 'Indiranagar, Bengaluru', 12.9719, 77.6412, true)`,
    [customerIds[1]]
  );

  const partnerListingIds = [];
  for (const p of PARTNERS) {
    const partnerResult = await pool.query(
      `INSERT INTO partners (name, cuisine_type, address, city, latitude, longitude, logo_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING id`,
      [p.name, p.cuisine_type, p.address, p.city, p.latitude, p.longitude,
        `https://api.dicebear.com/7.x/shapes/png?seed=${encodeURIComponent(p.name)}`]
    );
    const partnerId = partnerResult.rows[0].id;

    const slug = slugify(p.name);
    await pool.query(
      `INSERT INTO partner_staff (partner_id, name, email, password_hash)
       VALUES ($1, $2, $3, $4)`,
      [partnerId, `${p.name} Manager`, `manager@${slug}.mealify.demo`, partnerPasswordHash]
    );

    const idsForPartner = [];
    for (let i = 0; i < p.listings.length; i += 1) {
      const l = p.listings[i];
      const pickupStart = hoursFromNow(2 + i);
      const pickupEnd = hoursFromNow(4 + i);
      const listingResult = await pool.query(
        `INSERT INTO listings (partner_id, title, description, original_price, discounted_price,
                                quantity_available, pickup_window_start, pickup_window_end, expires_at, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active') RETURNING id`,
        [partnerId, l.title, l.description, l.original_price, l.discounted_price,
          l.quantity_available, pickupStart, pickupEnd, pickupEnd]
      );
      idsForPartner.push({ id: listingResult.rows[0].id, price: l.discounted_price, title: l.title });
    }

    // One sold-out listing per partner, for a realistic mixed feed
    const firstListing = p.listings[0];
    await pool.query(
      `INSERT INTO listings (partner_id, title, description, original_price, discounted_price,
                              quantity_available, pickup_window_start, pickup_window_end, expires_at, status)
       VALUES ($1, $2, $3, $4, $5, 0, $6, $7, $8, 'sold_out')`,
      [partnerId, `${firstListing.title} (Morning Batch)`, firstListing.description,
        firstListing.original_price, firstListing.discounted_price,
        hoursAgo(3), hoursAgo(1), hoursAgo(1)]
    );

    partnerListingIds.push({ partnerId, listings: idsForPartner });
  }

  // Historical orders for the first two customers
  const pastOrders = [
    { customerIdx: 0, partnerIdx: 0, status: 'completed', paymentStatus: 'paid', hoursAgoPlaced: 30 },
    { customerIdx: 0, partnerIdx: 2, status: 'completed', paymentStatus: 'paid', hoursAgoPlaced: 10 },
    { customerIdx: 1, partnerIdx: 3, status: 'cancelled', paymentStatus: 'refunded', hoursAgoPlaced: 20 },
    { customerIdx: 1, partnerIdx: 6, status: 'ready', paymentStatus: 'paid', hoursAgoPlaced: 1 }
  ];

  for (const po of pastOrders) {
    const userId = customerIds[po.customerIdx];
    const { partnerId, listings } = partnerListingIds[po.partnerIdx];
    const item = listings[0];
    const quantity = 1;
    const total = (Number(item.price) * quantity).toFixed(2);
    const placedAt = hoursAgo(po.hoursAgoPlaced);

    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, partner_id, status, total_amount, payment_status,
                            pickup_window_start, pickup_window_end, pickup_code, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [userId, partnerId, po.status, total, po.paymentStatus,
        hoursAgo(po.hoursAgoPlaced - 1), hoursAgo(po.hoursAgoPlaced - 2),
        Math.random().toString(36).slice(2, 8).toUpperCase(), placedAt]
    );
    const orderId = orderResult.rows[0].id;

    await pool.query(
      `INSERT INTO order_items (order_id, listing_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)`,
      [orderId, item.id, quantity, item.price]
    );

    if (po.paymentStatus === 'paid') {
      await pool.query(
        `INSERT INTO payments (order_id, provider, provider_payment_id, amount, status, created_at)
         VALUES ($1, 'mock', $2, $3, 'success', $4)`,
        [orderId, `mock_seed_${orderId}`, total, placedAt]
      );
    }
  }

  console.log('Seed complete.');
  console.log(`  Partners: ${PARTNERS.length}`);
  console.log(`  Customers: ${CUSTOMERS.length} (password: ${DEMO_PASSWORD})`);
  console.log(`  Partner staff password: ${PARTNER_PASSWORD}`);
  console.log('  Sample customer login: aditi.sharma@example.com / password123');
  console.log('  Sample partner login: manager@bombay.bites.bakery.mealify.demo / partner123');

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
