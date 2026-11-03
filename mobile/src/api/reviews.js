import client from './client';

export const submitReview = (payload) => client.post('/reviews', payload).then((r) => r.data.review);
export const fetchPartnerReviews = (partnerId) => client.get(`/reviews/partner/${partnerId}`).then((r) => r.data);
