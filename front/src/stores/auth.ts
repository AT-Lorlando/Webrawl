import { defineStore } from 'pinia';
import type { AxiosInstance } from 'axios';

interface User {
  id: number;
  fullName: string;
  email: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),
  getters: {
    isAuthenticated: (state) => state.user !== null,
  },
  actions: {
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
    },
    login(userData: User, token: string) {
      // S'assurer que userData est un objet JavaScript standard
      this.user = {
        id: userData.id,
        fullName: userData.fullName,
        email: userData.email,
      };
      this.token = token;
      localStorage.setItem('token', token);
    },
    async initializeAuth(axiosInstance: AxiosInstance) {
      const token = localStorage.getItem('token');
      if (token) {
        this.token = token;
        try {
          const response = await axiosInstance.get('/auth/user');
          // S'assurer que la réponse est un objet JavaScript standard
          this.user = {
            id: response.data.id,
            fullName: response.data.fullName,
            email: response.data.email,
          };
        } catch (error) {
        this.logout();
        }
      }
    },
  },
});
