const express = require('express');
const pool = require('../db/pool');
const { authRequired } = require('../middleware/auth');
const { distanceKm } = require('../utils/distance');

const router = express.Router();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';

// Natural-language "find me food" assistant. Fetches currently-available listings,
// hands a compact summary to a local Ollama model, and asks it to pick the most
// relevant ones. Falls back to plain keyword matching if Ollama is unreachable or
// the model's output can't be parsed, so the feature degrades gracefully rather
// than breaking the search experience.
router.post('/search', authRequired('customer'), async (req, res) => {
  const { message, lat, lng } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ error: 'message is required' });

  try {
    const result = await pool.query(
      `SELECT l.*, p.name AS partner_name, p.cuisine_type, p.city, p.logo_url,
              p.latitude AS partner_lat, p.longitude AS partner_lng
       FROM listings l JOIN partners p ON p.id = l.partner_id
       WHERE l.status = 'active' AND l.quantity_available > 0 AND l.expires_at > now() AND p.is_active = true
       ORDER BY l.pickup_window_start
       LIMIT 40`
    );

    const listings = result.rows.map((l) => ({
      ...l,
      distance_km: lat && lng ? distanceKm(Number(lat), Number(lng), l.partner_lat, l.partner_lng) : null
    }));

    const { ids } = await askOllama(message, listings);
    const uniqueIds = [...new Set(ids)];

    let matched = uniqueIds.map((id) => listings.find((l) => l.id === id)).filter(Boolean);
    // Small local models don't reliably respect numeric constraints in the prompt,
    // so enforce any "under/below X rupees" the customer typed as a hard filter.
    const maxPrice = extractMaxPrice(message);
    if (maxPrice) matched = matched.filter((l) => Number(l.discounted_price) <= maxPrice);
    if (matched.length === 0) {
      matched = keywordFallback(message, listings);
    }
    matched = matched.slice(0, 10);

    // Built from the actual matched results rather than the model's own prose,
    // since a small local model can describe items that don't match its own id list.
    res.json({ reply: describeMatches(matched), listings: matched });
  } catch (err) {
    console.error('Chat search failed:', err.message);
    try {
      const listings = await fetchActiveListingsFallback();
      const matched = keywordFallback(message, listings).slice(0, 10);
      res.json({ reply: describeMatches(matched), listings: matched });
    } catch (fallbackErr) {
      res.status(500).json({ error: 'Search assistant is unavailable right now' });
    }
  }
});

async function fetchActiveListingsFallback() {
  const result = await pool.query(
    `SELECT l.*, p.name AS partner_name, p.cuisine_type, p.city, p.logo_url
     FROM listings l JOIN partners p ON p.id = l.partner_id
     WHERE l.status = 'active' AND l.quantity_available > 0 AND l.expires_at > now() AND p.is_active = true
     LIMIT 40`
  );
  return result.rows;
}

function extractMaxPrice(message) {
  // Only treat a number as a price ceiling when it's clearly phrased as one
  // (e.g. "under 150", "150 rupees") — an unrelated number like "for 2 people"
  // should never zero out the results.
  const contextual = message.match(/(?:under|below|less than|within|max|up ?to)\D{0,6}(\d+)/i);
  if (contextual) return Number(contextual[1]);
  const withUnit = message.match(/(\d+)\s*(?:rs\.?|rupees?|₹)/i);
  if (withUnit) return Number(withUnit[1]);
  return null;
}

function keywordFallback(message, listings) {
  const terms = message.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const maxPrice = extractMaxPrice(message);

  return listings.filter((l) => {
    const haystack = `${l.title} ${l.description || ''} ${l.cuisine_type}`.toLowerCase();
    const textMatch = terms.some((term) => haystack.includes(term));
    const priceOk = maxPrice ? Number(l.discounted_price) <= maxPrice : true;
    return (textMatch || terms.length === 0) && priceOk;
  });
}

function describeMatches(matched) {
  if (matched.length === 0) {
    return "🤔 Couldn't find a close match — try a different cuisine, or a higher budget?";
  }
  const names = matched.slice(0, 3).map((l) => l.title);
  const more = matched.length > names.length ? ` + ${matched.length - names.length} more` : '';
  const opener = matched.length === 1 ? '🎉 Found one for you:' : `🎉 Found ${matched.length} tasty options:`;
  return `${opener} ${names.join(', ')}${more}.`;
}

async function askOllama(message, listings) {
  const menu = listings
    .map((l) => `#${l.id} | ${l.title} | ${l.cuisine_type} | ₹${l.discounted_price} | ${l.partner_name}`)
    .join('\n');

  const prompt = `You are a friendly food search assistant for Mealify, a surplus-food marketplace app.
Below is the list of currently available food bags, one per line, formatted as:
#id | title | cuisine | price | restaurant name

${menu}

The customer says: "${message}"

Pick only ids from the list above that best match the request. Prioritize in this order:
1. Cuisine or dish keywords the customer mentioned.
2. Any price limit the customer mentioned.
3. General relevance.
Never invent an id that isn't in the list. Reply with ONLY a JSON object, no other text, in this exact shape:
{"ids": [list of matching numeric ids, most relevant first, at most 8]}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false, format: 'json' }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Ollama responded with ${response.status}`);
    const data = await response.json();
    const parsed = JSON.parse(data.response);
    const ids = Array.isArray(parsed.ids) ? parsed.ids.map(Number).filter(Number.isFinite) : [];
    return { ids };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = router;
