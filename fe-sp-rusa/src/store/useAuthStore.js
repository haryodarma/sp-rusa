import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

const cleanRole = (role) => {
  if (typeof role === 'string') {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('admin')) return 'admin';
    if (roleLower.includes('guest')) return 'guest';
  }
  return role;
};

const useAuthStore = create((set) => ({
  user: null, // { email, username, role }
  token: null,
  isAuthenticated: false,

  // Method untuk set session setelah login sukses
  login: (accessToken) => {
    try {
      const decoded = jwtDecode(accessToken);
      localStorage.setItem('access_token', accessToken);
      set({
        token: accessToken,
        user: {
          email: decoded.email,
          username: decoded.username,
          role: cleanRole(decoded.role),
        },
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Invalid token', error);
    }
  },

  // Method untuk logout
  logout: () => {
    localStorage.removeItem('access_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  // Method untuk hydrate (restore session) saat aplikasi dimuat
  hydrate: () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Simple check for expiration if exp exists
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('access_token');
          set({ user: null, token: null, isAuthenticated: false });
        } else {
          set({
            token,
            user: {
              email: decoded.email,
              username: decoded.username,
              role: cleanRole(decoded.role),
            },
            isAuthenticated: true,
          });
        }
      } catch (error) {
        localStorage.removeItem('access_token');
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },
}));

export default useAuthStore;
