import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { fetchAddresses, createAddress } from '../api/catalog';

const LocationContext = createContext(null);

const FALLBACK_LOCATION = { latitude: 19.076, longitude: 72.8777 };

export function LocationProvider({ children }) {
  const { t } = useTranslation();
  const { role } = useAuth();
  const [coords, setCoords] = useState(FALLBACK_LOCATION);
  const [label, setLabel] = useState(t('location.default'));
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);

  const loadAddresses = useCallback(async () => {
    if (role !== 'customer') return [];
    try {
      const data = await fetchAddresses();
      setAddresses(data);
      return data;
    } catch (err) {
      return [];
    }
  }, [role]);

  const useDeviceLocation = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return { granted: false };
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const next = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setCoords(next);
      try {
        const [place] = await Location.reverseGeocodeAsync(next);
        setLabel(place ? [place.city || place.subregion, place.region].filter(Boolean).join(', ') : t('location.currentLocation'));
      } catch (err) {
        setLabel(t('location.currentLocation'));
      }
      return { granted: true };
    } finally {
      setLoading(false);
    }
  }, [t]);

  const useAddress = useCallback((address) => {
    setCoords({ latitude: address.latitude, longitude: address.longitude });
    setLabel(`${address.label} · ${address.address_text}`);
  }, []);

  const saveNewAddress = useCallback(
    async (label_, addressText, point) => {
      const created = await createAddress({
        label: label_,
        address_text: addressText,
        latitude: point.latitude,
        longitude: point.longitude
      });
      setAddresses((prev) => [...prev, created]);
      useAddress(created);
      return created;
    },
    [useAddress]
  );

  useEffect(() => {
    if (role !== 'customer') {
      setLoading(false);
      return;
    }
    (async () => {
      const data = await loadAddresses();
      const defaultAddr = data.find((a) => a.is_default);
      if (defaultAddr) {
        useAddress(defaultAddr);
        setLoading(false);
        return;
      }
      const result = await useDeviceLocation();
      if (!result.granted) {
        setLabel(t('location.default'));
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const value = useMemo(
    () => ({
      ...coords,
      label,
      loading,
      addresses,
      useDeviceLocation,
      useAddress,
      saveNewAddress,
      refreshAddresses: loadAddresses
    }),
    [coords, label, loading, addresses, useDeviceLocation, useAddress, saveNewAddress, loadAddresses]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
