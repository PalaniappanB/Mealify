import client from './client';

export const searchWithAi = (message, coords) =>
  client.post('/chat/search', { message, lat: coords?.latitude, lng: coords?.longitude }).then((r) => r.data);
