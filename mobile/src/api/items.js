import client from './client';

export const fetchPartnerItems = () => client.get('/partner/items').then((r) => r.data.items);
export const createPartnerItem = (payload) => client.post('/partner/items', payload).then((r) => r.data.item);
export const updatePartnerItem = (id, payload) => client.put(`/partner/items/${id}`, payload).then((r) => r.data.item);
export const deletePartnerItem = (id) => client.delete(`/partner/items/${id}`).then((r) => r.data);

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

export const uploadItemImage = (id, asset) =>
  client.post(`/partner/items/${id}/image`, imageFormData(asset)).then((r) => r.data.item);

export const updateStoreStatus = (is_active) =>
  client.put('/partner/store/status', { is_active }).then((r) => r.data.partner);
