import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { authAPI, cartAPI, wishlistAPI } from '../services/api';
import toast from 'react-hot-toast';

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      setAuth: (user, token) => {
        localStorage.setItem('saree_token', token);
        set({ user, token, isAuthenticated: true });
      },

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await authAPI.login({ email, password });
          localStorage.setItem('saree_token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
          toast.success(`Welcome back, ${data.user.name.split(' ')[0]}! 🌸`);
          return { success: true };
        } catch (err) {
          set({ loading: false });
          return { success: false, message: err.response?.data?.message };
        }
      },

      register: async (userData) => {
        set({ loading: true });
        try {
          const { data } = await authAPI.register(userData);
          localStorage.setItem('saree_token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
          toast.success('Account created successfully! 🎉');
          return { success: true };
        } catch (err) {
          set({ loading: false });
          return { success: false, message: err.response?.data?.message };
        }
      },

      logout: async () => {
        try { await authAPI.logout(); } catch {}
        localStorage.removeItem('saree_token');
        localStorage.removeItem('saree_user');
        set({ user: null, token: null, isAuthenticated: false });
        toast.success('Logged out successfully');
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),

      fetchMe: async () => {
        try {
          const { data } = await authAPI.getMe();
          set({ user: data.user });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'saree-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ─── Cart Store ───────────────────────────────────────────────────────────────
export const useCartStore = create(
  subscribeWithSelector((set, get) => ({
    items: [],
    total: 0,
    itemCount: 0,
    loading: false,

    setCart: (cart) => {
      const items = cart.items || [];
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      set({ items, total, itemCount });
    },

    fetchCart: async () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) return;
      set({ loading: true });
      try {
        const { data } = await cartAPI.get();
        get().setCart(data.cart);
      } catch {}
      finally { set({ loading: false }); }
    },

    addToCart: async (productId, quantity = 1, color = '') => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        toast.error('Please login to add items to cart');
        return false;
      }
      try {
        const { data } = await cartAPI.add(productId, quantity, color);
        get().setCart(data.cart);
        toast.success('Added to cart! 🛒');
        return true;
      } catch { return false; }
    },

    updateQuantity: async (itemId, quantity) => {
      try {
        const { data } = await cartAPI.update(itemId, quantity);
        get().setCart(data.cart);
      } catch {}
    },

    removeItem: async (itemId) => {
      try {
        await cartAPI.remove(itemId);
        set((state) => {
          const items = state.items.filter((i) => i._id !== itemId);
          const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
          const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
          return { items, total, itemCount };
        });
        toast.success('Item removed from cart');
      } catch {}
    },

    clearCart: () => set({ items: [], total: 0, itemCount: 0 }),
  }))
);

// ─── Wishlist Store ───────────────────────────────────────────────────────────
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      productIds: new Set(),
      loading: false,

      fetchWishlist: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;
        set({ loading: true });
        try {
          const { data } = await wishlistAPI.get();
          const ids = new Set(data.wishlist.map((p) => p._id));
          set({ items: data.wishlist, productIds: ids });
        } catch {}
        finally { set({ loading: false }); }
      },

      toggle: async (productId) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          toast.error('Please login to save to wishlist');
          return;
        }
        const wasInWishlist = get().productIds.has(productId);
        // Optimistic update
        set((state) => {
          const newIds = new Set(state.productIds);
          if (wasInWishlist) newIds.delete(productId);
          else newIds.add(productId);
          return { productIds: newIds };
        });

        try {
          const { data } = await wishlistAPI.toggle(productId);
          toast.success(data.message);
        } catch {
          // Revert
          set((state) => {
            const newIds = new Set(state.productIds);
            if (wasInWishlist) newIds.add(productId);
            else newIds.delete(productId);
            return { productIds: newIds };
          });
        }
      },

      isWishlisted: (productId) => {
        const ids = get().productIds;
        if (!ids) return false;
        if (ids instanceof Set) return ids.has(productId);
        if (Array.isArray(ids)) return ids.includes(productId);
        return false;
      },
    }),
    {
      name: 'saree-wishlist',
      // Serialize Set → Array when saving to localStorage
      partialize: (state) => ({
        productIds: Array.isArray(state.productIds)
          ? state.productIds
          : [...state.productIds],
      }),
      // Deserialize Array → Set when loading from localStorage
      onRehydrateStorage: () => (state) => {
        if (state && state.productIds) {
          state.productIds = new Set(state.productIds);
        }
      },
    }
  )
);

// ─── UI Store ─────────────────────────────────────────────────────────────────
export const useUIStore = create((set) => ({
  cartOpen: false,
  searchOpen: false,
  mobileMenuOpen: false,
  quickViewProduct: null,

  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),

  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),

  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),

  setQuickView: (product) => set({ quickViewProduct: product }),
  closeQuickView: () => set({ quickViewProduct: null }),
}));