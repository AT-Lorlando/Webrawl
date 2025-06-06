<template>
  <div class="w-screen h-screen flex flex-col overflow-clip">
    <header
      class="text-white px-6 py-4 flex justify-between items-center border-b-2 border-gray-400 z-10"
    >
      <NuxtLink
        to="/"
        class="text-2xl font-bold"
      >Logo</NuxtLink>
      <nav>
        <ul class="flex space-x-4 text-xl">
          <li v-if="!authStore.isAuthenticated">
            <NuxtLink
              to="/login"
              class="hover:text-gray-300 underlineEffect"
            >
              <span>
                Login
              </span>
            </NuxtLink>
          </li>
          <li v-if="!authStore.isAuthenticated">
            <NuxtLink
              to="/signup"
              class="hover:text-gray-300 underlineEffect"
            >
              <span>Signup</span></NuxtLink>
          </li>
          <li v-if="authStore.isAuthenticated">
            <NuxtLink
              to="/profile"
              class="space-x-2 underlineEffect"
            >
              <span>Profile</span>
            </NuxtLink>
          </li>
          <li v-if="authStore.isAuthenticated">
            <button
              class="underlineEffect cursor-pointer"
              @click="logout"
            >
              <span>
                Logout
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </header>

    <main class="h-full">
      <slot />
    </main>

    <footer class="text-white text-center p-4 justify-end">
      Footer
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useRouter } from '#imports';

const authStore = useAuthStore();
const router = useRouter();

function logout() {
  authStore.logout();
  router.push('/');
}
</script>

<style scoped></style>
