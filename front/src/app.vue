<template>
  <div>
    <ClientOnly>
      <Toaster class="pointer-events-auto" />
    </ClientOnly>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script lang="ts" setup>
import { Toaster } from '@/components/ui/sonner';
import { onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import type { AxiosInstance } from 'axios';

// Initialiser l'authentification après le montage
onMounted(async () => {
  const { $axios } = useNuxtApp();
  const authStore = useAuthStore();
  
  if ($axios) {
    await authStore.initializeAuth($axios as AxiosInstance);
  }
});
</script>
