import client from './client';

export const signup = (payload) => client.post('/auth/signup', payload).then((r) => r.data);
export const login = (payload) => client.post('/auth/login', payload).then((r) => r.data);
export const requestOtp = (phone) => client.post('/auth/otp/request', { phone }).then((r) => r.data);
export const verifyOtp = (payload) => client.post('/auth/otp/verify', payload).then((r) => r.data);
export const fetchMe = () => client.get('/auth/me').then((r) => r.data.user);
export const updateMe = (payload) => client.put('/auth/me', payload).then((r) => r.data.user);

export const partnerLogin = (payload) => client.post('/partner-auth/login', payload).then((r) => r.data);
export const partnerSignup = (payload) => client.post('/partner-auth/signup', payload).then((r) => r.data);
export const fetchPartnerMe = () => client.get('/partner-auth/me').then((r) => r.data.staff);
