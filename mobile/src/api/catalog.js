import client from './client';

export const fetchListings = (params) => client.get('/listings', { params }).then((r) => r.data.listings);
export const fetchListing = (id) => client.get(`/listings/${id}`).then((r) => r.data.listing);

export const fetchPartners = (params) => client.get('/partners', { params }).then((r) => r.data.partners);
export const fetchPartner = (id, params) => client.get(`/partners/${id}`, { params }).then((r) => r.data);
export const fetchCuisines = () => client.get('/partners/cuisines').then((r) => r.data.cuisines);

export const fetchAddresses = () => client.get('/addresses').then((r) => r.data.addresses);
export const createAddress = (payload) => client.post('/addresses', payload).then((r) => r.data.address);
