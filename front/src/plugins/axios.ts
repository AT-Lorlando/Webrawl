import axios from 'axios';
import { defineNuxtPlugin, useRuntimeConfig } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const axiosInstance = axios.create({
    baseURL: config.public.API_URL,
  });

  axiosInstance.interceptors.request.use(
    (request) => {
      // Obtenir le token directement depuis localStorage
      const token = localStorage.getItem('token');
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
