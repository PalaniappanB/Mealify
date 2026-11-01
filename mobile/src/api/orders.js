import client from './client';

export const createOrder = (payload) => client.post('/orders', payload).then((r) => r.data.order);
export const fetchOrders = () => client.get('/orders').then((r) => r.data.orders);
export const fetchOrder = (id) => client.get(`/orders/${id}`).then((r) => r.data);
export const cancelOrder = (id) => client.put(`/orders/${id}/cancel`).then((r) => r.data.order);
export const fetchImpactSummary = () => client.get('/orders/impact/summary').then((r) => r.data);

export const mockCharge = (orderId) => client.post('/payments/mock-charge', { orderId }).then((r) => r.data);

export const fetchPartnerListings = () => client.get('/partner/listings').then((r) => r.data.listings);
export const createPartnerListing = (payload) => client.post('/partner/listings', payload).then((r) => r.data.listing);
export const updatePartnerListing = (id, payload) =>
  client.put(`/partner/listings/${id}`, payload).then((r) => r.data.listing);
export const deletePartnerListing = (id) => client.delete(`/partner/listings/${id}`).then((r) => r.data.listing);

export const fetchPartnerReports = () => client.get('/partner/reports').then((r) => r.data);

export const fetchPartnerOrders = () => client.get('/partner/orders').then((r) => r.data.orders);
export const fetchPartnerOrder = (id) => client.get(`/partner/orders/${id}`).then((r) => r.data);
export const updatePartnerOrderStatus = (id, status) =>
  client.put(`/partner/orders/${id}/status`, { status }).then((r) => r.data.order);

function imageFormData(asset) {
  const form = new FormData();
  const filename = asset.uri.split('/').pop() || `photo-${Date.now()}.jpg`;
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
  form.append('image', {
    uri: asset.uri,
    name: filename,
    type: asset.mimeType || `image/${ext === 'jpg' ? 'jpeg' : ext}`
  });
  return form;
}

// Content-Type is intentionally left unset here — React Native's networking layer
// generates the multipart boundary itself from the FormData body. Forcing the
// header manually strips that boundary and the server can't parse the upload.
export const uploadListingImage = (listingId, asset) =>
  client.post(`/partner/listings/${listingId}/image`, imageFormData(asset)).then((r) => r.data.listing);

export const uploadPartnerLogo = (asset) =>
  client.post('/partner/logo', imageFormData(asset)).then((r) => r.data.partner);
