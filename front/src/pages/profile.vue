<template>
  <Card class="max-w-md mx-auto mt-12">
    <CardHeader>
      <h2 class="text-xl font-semibold text-center">
        Profil
      </h2>
    </CardHeader>
    <CardContent>
      <div
        v-if="user"
        class="space-y-6"
      >
        <!-- Affichage du nom -->
        <div>
          <p class="text-sm text-gray-500">
            Nom
          </p>
          <p class="text-lg font-medium">
            {{ user.fullName }}
          </p>
        </div>

        <!-- Affichage de l'email -->
        <div>
          <p class="text-sm text-gray-500">
            Email
          </p>
          <p class="text-lg font-medium">
            {{ user.email }}
          </p>
        </div>

        <!-- Bouton de déconnexion -->
        <Button
          class="w-full"
          @click="logout"
        >
          Se déconnecter
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useAuthStore } from '~/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>
