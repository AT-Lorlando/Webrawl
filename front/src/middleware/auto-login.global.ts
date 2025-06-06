import type { AxiosInstance } from 'axios';
import { defineNuxtRouteMiddleware, useNuxtApp } from '#imports';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;

  const authStore = useAuthStore();
  const $axios = useNuxtApp().$axios as AxiosInstance;
  authStore.initializeAuth($axios);
});
