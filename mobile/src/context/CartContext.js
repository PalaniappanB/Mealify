import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirm } from './ConfirmContext';

const CartContext = createContext(null);

// Design decision: a cart can only hold bags from ONE partner at a time (mirrors a
// single-pickup-location checkout). Adding a bag from a different partner prompts
// the customer to clear the current cart first (via the themed confirm modal).
export function CartProvider({ children }) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [partner, setPartner] = useState(null); // { id, name }
  const [items, setItems] = useState([]); // [{ listingId, title, discountedPrice, quantity, maxQuantity, pickupWindowStart, pickupWindowEnd }]

  const clear = useCallback(() => {
    setPartner(null);
    setItems([]);
  }, []);

  const addListingToCart = useCallback((listing, partnerInfo) => {
    setItems((current) => {
      const existing = current.find((i) => i.listingId === listing.id);
      if (existing) {
        const nextQty = Math.min(existing.quantity + 1, existing.maxQuantity);
        return current.map((i) => (i.listingId === listing.id ? { ...i, quantity: nextQty } : i));
      }
      return [
        ...current,
        {
          listingId: listing.id,
          title: listing.title,
          discountedPrice: Number(listing.discounted_price),
          maxQuantity: listing.quantity_available,
          quantity: 1,
          pickupWindowStart: listing.pickup_window_start,
          pickupWindowEnd: listing.pickup_window_end
        }
      ];
    });
    setPartner(partnerInfo);
  }, []);

  const addItem = useCallback(
    async (listing, partnerInfo) => {
      if (partner && partner.id !== partnerInfo.id && items.length > 0) {
        const ok = await confirm({
          title: t('cart.switchPartnerTitle'),
          message: t('cart.switchPartnerMessage'),
          confirmLabel: t('cart.clearAndAdd'),
          destructive: true
        });
        if (!ok) return;
        setItems([]);
      }
      addListingToCart(listing, partnerInfo);
    },
    [partner, items, addListingToCart, confirm, t]
  );

  const getQuantity = useCallback(
    (listingId) => items.find((i) => i.listingId === listingId)?.quantity || 0,
    [items]
  );

  const setQuantity = useCallback((listingId, quantity) => {
    setItems((current) => {
      if (quantity <= 0) return current.filter((i) => i.listingId !== listingId);
      return current.map((i) => (i.listingId === listingId ? { ...i, quantity: Math.min(quantity, i.maxQuantity) } : i));
    });
  }, []);

  const removeItem = useCallback((listingId) => {
    setItems((current) => current.filter((i) => i.listingId !== listingId));
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.discountedPrice * i.quantity, 0),
    [items]
  );

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const value = useMemo(
    () => ({ partner, items, addItem, getQuantity, setQuantity, removeItem, clear, subtotal, totalItems }),
    [partner, items, addItem, getQuantity, setQuantity, removeItem, clear, subtotal, totalItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
