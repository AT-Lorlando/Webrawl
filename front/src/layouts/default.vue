<template>
  <div class="min-h-screen">
    <!-- Navigation Bar (optional for authenticated users) -->
    <nav v-if="showNavigation" class="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Icon name="lucide:music" class="w-5 h-5 text-white" />
            </div>
            <NuxtLink to="/" class="text-xl font-bold text-white hover:text-cyan-200 transition-colors">
              Webrawl Music
            </NuxtLink>
          </div>

          <!-- Navigation Items -->
          <div class="hidden md:flex items-center space-x-6">
            <NuxtLink 
              to="/game" 
              class="text-slate-300 hover:text-white transition-colors flex items-center space-x-2"
            >
              <Icon name="lucide:gamepad-2" class="w-4 h-4" />
              <span>Jouer</span>
            </NuxtLink>
            
            <div v-if="authStore.isAuthenticated" class="flex items-center space-x-4">
              <NuxtLink 
                to="/profile" 
                class="text-slate-300 hover:text-white transition-colors flex items-center space-x-2"
              >
                <Icon name="lucide:user" class="w-4 h-4" />
                <span>Profil</span>
              </NuxtLink>
              <Button 
                variant="ghost" 
                size="sm" 
                @click="authStore.logout"
                class="text-slate-300 hover:text-white"
              >
                <Icon name="lucide:log-out" class="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
            
            <div v-else class="flex items-center space-x-3">
              <NuxtLink to="/login">
                <Button variant="ghost" size="sm" class="text-slate-300 hover:text-white">
                  Connexion
                </Button>
              </NuxtLink>
              <NuxtLink to="/signup">
                <Button size="sm" class="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                  S'inscrire
                </Button>
              </NuxtLink>
            </div>
          </div>

          <!-- Mobile Menu Button -->
          <Button
            v-if="showNavigation"
            variant="ghost"
            size="sm"
            class="md:hidden text-white"
            @click="toggleMobileMenu"
          >
            <Icon :name="mobileMenuOpen ? 'lucide:x' : 'lucide:menu'" class="w-5 h-5" />
          </Button>
        </div>

        <!-- Mobile Menu -->
        <div v-if="mobileMenuOpen" class="md:hidden mt-4 pb-4 border-t border-white/10 pt-4">
          <div class="flex flex-col space-y-3">
            <NuxtLink 
              to="/game" 
              class="text-slate-300 hover:text-white transition-colors flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10"
              @click="mobileMenuOpen = false"
            >
              <Icon name="lucide:gamepad-2" class="w-4 h-4" />
              <span>Jouer</span>
            </NuxtLink>
            
            <div v-if="authStore.isAuthenticated" class="space-y-2">
              <NuxtLink 
                to="/profile" 
                class="text-slate-300 hover:text-white transition-colors flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10"
                @click="mobileMenuOpen = false"
              >
                <Icon name="lucide:user" class="w-4 h-4" />
                <span>Profil</span>
              </NuxtLink>
              <button 
                @click="authStore.logout(); mobileMenuOpen = false"
                class="w-full text-left text-slate-300 hover:text-white transition-colors flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10"
              >
                <Icon name="lucide:log-out" class="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
            
            <div v-else class="space-y-2">
              <NuxtLink 
                to="/login"
                class="block w-full text-left text-slate-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                @click="mobileMenuOpen = false"
              >
                Connexion
              </NuxtLink>
              <NuxtLink 
                to="/signup"
                class="block w-full text-left bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-2 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors"
                @click="mobileMenuOpen = false"
              >
                S'inscrire
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Toast Container -->
    <ClientOnly>
      <Toaster class="pointer-events-auto" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

// Don't show navigation on certain pages
const showNavigation = computed(() => {
  const excludedPaths = ['/login', '/signup', '/game']
  return !excludedPaths.includes(route.path)
})

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// Close mobile menu when route changes
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
</script>

<style scoped>
/* Smooth transitions for mobile menu */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
