import axios from 'axios';
import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const axiosInstance = axios.create({
    baseURL: config.public.API_URL,
  });

  axiosInstance.interceptors.request.use(
    (request) => {
      const authStore = useAuthStore();
      const token = authStore.token;
      if (token) {
        request.headers['Authorization'] = `Bearer ${token}`;
      }
      return request;
    },
    error => Promise.reject(error),
  );

  axiosInstance.interceptors.response.use(
    response => response,
    (error) => {
      return Promise.reject(error);
    },
  );

  nuxtApp.provide('axios', axiosInstance);
});
