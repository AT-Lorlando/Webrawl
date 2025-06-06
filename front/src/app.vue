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
</script>
