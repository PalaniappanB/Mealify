import client from './client';

export const fetchAdminOverview = () => client.get('/admin/overview').then((r) => r.data);
export const fetchAdminPartners = () => client.get('/admin/partners').then((r) => r.data.partners);
export const fetchAdminTrends = () => client.get('/admin/trends').then((r) => r.data.trends);
export const fetchAdminTopItems = () => client.get('/admin/top-items').then((r) => r.data);
