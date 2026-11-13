import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const items = get().items;
        // Generate unique key based on product, orderType, rental dates, customization
        const itemKey = `${item.product}_${item.orderType}_${item.rentalDates?.startDate || ''}_${item.customization?.text || ''}`;
        
        const existingIndex = items.findIndex((i) => i.itemKey === itemKey);
        if (existingIndex > -1) {
          const updatedItems = [...items];
          updatedItems[existingIndex].quantity += item.quantity;
          updatedItems[existingIndex].lineTotal = 
            (updatedItems[existingIndex].unitPrice + (updatedItems[existingIndex].customization?.extraCharge || 0)) * updatedItems[existingIndex].quantity;
          set({ items: updatedItems });
        } else {
          set({ items: [...items, { ...item, itemKey }] });
        }
      },

      removeItem: (itemKey) => {
        set({ items: get().items.filter((i) => i.itemKey !== itemKey) });
      },

      updateQuantity: (itemKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemKey);
          return;
        }
        const updatedItems = get().items.map((i) => {
          if (i.itemKey === itemKey) {
            const lineTotal = (i.unitPrice + (i.customization?.extraCharge || 0)) * quantity;
            return { ...i, quantity, lineTotal };
          }
          return i;
        });
        set({ items: updatedItems });
      },

      clearCart: () => set({ items: [] }),

      // Calculated totals
      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      },

      getDiscountTotal: () => {
        return get().items.reduce((sum, item) => {
          if (item.offerPrice && item.offerPrice < item.unitPrice) {
            return sum + ((item.unitPrice - item.offerPrice) * item.quantity);
          }
          return sum;
        }, 0);
      },

      getDepositTotal: () => {
        return get().items.reduce((sum, item) => {
          if (item.orderType === 'Rent' && item.rentalDates?.depositPerUnit) {
            return sum + (item.rentalDates.depositPerUnit * item.quantity);
          }
          return sum;
        }, 0);
      },

      getGrandTotal: () => {
        const subtotal = get().items.reduce((sum, item) => sum + item.lineTotal, 0);
        const deposit = get().getDepositTotal();
        return subtotal + deposit;
      }
    }),
    {
      name: 'chidambaram_gold_cart'
    }
  )
);

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (product) => {
        const items = get().items;
        const exists = items.some((p) => p._id === product._id);
        if (exists) {
          set({ items: items.filter((p) => p._id !== product._id) });
        } else {
          set({ items: [...items, product] });
        }
      },
      isInWishlist: (productId) => {
        return get().items.some((p) => p._id === productId);
      }
    }),
    {
      name: 'chidambaram_gold_wishlist'
    }
  )
);

