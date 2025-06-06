import { defineStore } from 'pinia';
import type { AxiosInstance } from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | { id: number; fullName: string; email: string },
    token: null as null | string,
  }),
  getters: {
    isAuthenticated: state => state.user !== null,
  },
  actions: {
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
    },
    login(userData: { id: number; fullName: string; email: string }, token: string) {
      this.user = userData;
      this.token = token;
      localStorage.setItem('token', token);
    },
    initializeAuth(axiosInstance: AxiosInstance) {
      const token = localStorage.getItem('token');
      if (token) {
        this.token = token;
      }
      axiosInstance.get('/auth/user').then((response) => {
        this.user = response.data;
      }).catch(() => {
        this.logout();
      });
    },
  },
});
