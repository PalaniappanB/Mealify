import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { fetchFavorites, addFavorite, removeFavorite } from '../api/favorites';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchFavorites();
      setFavorites(data);
    } catch (err) {
      // leave list empty on failure, non-critical feature
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isFavorite = useCallback((partnerId) => favorites.some((f) => f.id === partnerId), [favorites]);

  const toggleFavorite = useCallback(
    async (partner) => {
      if (isFavorite(partner.id)) {
        setFavorites((prev) => prev.filter((f) => f.id !== partner.id));
        try {
          await removeFavorite(partner.id);
        } catch (err) {
          setFavorites((prev) => [...prev, partner]);
        }
      } else {
        setFavorites((prev) => [...prev, partner]);
        try {
          await addFavorite(partner.id);
        } catch (err) {
          setFavorites((prev) => prev.filter((f) => f.id !== partner.id));
        }
      }
    },
    [isFavorite]
  );

  const value = useMemo(
    () => ({ favorites, loaded, isFavorite, toggleFavorite, refresh: load }),
    [favorites, loaded, isFavorite, toggleFavorite, load]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
