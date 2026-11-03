import client from './client';

export const fetchFavorites = () => client.get('/favorites').then((r) => r.data.favorites);
export const addFavorite = (partnerId) => client.post('/favorites', { partner_id: partnerId }).then((r) => r.data.favorite);
export const removeFavorite = (partnerId) => client.delete(`/favorites/${partnerId}`).then((r) => r.data);
