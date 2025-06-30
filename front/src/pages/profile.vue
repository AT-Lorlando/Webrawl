<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <div class="flex items-center justify-center space-x-3 mb-6">
          <div class="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
            <Icon name="lucide:user" class="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 class="text-4xl font-bold text-white">Profil</h1>
            <p class="text-slate-300">Gérez votre compte et vos statistiques</p>
          </div>
        </div>
      </div>

      <div v-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- User Information -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Profile Card -->
          <Card class="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <Icon name="lucide:user" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 class="text-2xl font-semibold text-white">
                    Informations personnelles
                  </h2>
                  <p class="text-slate-300">Vos données de compte</p>
                </div>
              </div>
            </CardHeader>
            <CardContent class="space-y-6">
              <!-- Nom -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-300">Nom complet</label>
                <div class="bg-white/10 border border-white/20 rounded-lg p-3">
                  <p class="text-white font-medium">{{ user.fullName }}</p>
                </div>
              </div>

              <!-- Email -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-300">Adresse email</label>
                <div class="bg-white/10 border border-white/20 rounded-lg p-3">
                  <p class="text-white font-medium">{{ user.email }}</p>
                </div>
              </div>

              <!-- Member Since -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-300">Membre depuis</label>
                <div class="bg-white/10 border border-white/20 rounded-lg p-3">
                  <p class="text-white font-medium">{{ formatDate(new Date()) }}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Quick Actions -->
          <Card class="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <h3 class="text-xl font-semibold text-white flex items-center">
                <Icon name="lucide:zap" class="w-5 h-5 mr-2" />
                Actions rapides
              </h3>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  class="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 h-auto p-4"
                  @click="navigateTo('/game')"
                >
                  <div class="text-center">
                    <Icon name="lucide:play" class="w-6 h-6 mx-auto mb-2" />
                    <div class="font-medium">Nouvelle Partie</div>
                    <div class="text-xs opacity-90">Créer une session musicale</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  class="border-cyan-400 text-cyan-300 hover:bg-cyan-400/20 h-auto p-4"
                  @click="navigateTo('/')"
                >
                  <div class="text-center">
                    <Icon name="lucide:home" class="w-6 h-6 mx-auto mb-2" />
                    <div class="font-medium">Accueil</div>
                    <div class="text-xs opacity-90">Retour à la page principale</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Game Stats -->
          <Card class="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <h3 class="text-xl font-semibold text-white flex items-center">
                <Icon name="lucide:bar-chart-3" class="w-5 h-5 mr-2" />
                Statistiques
              </h3>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="text-center">
                <div class="text-3xl font-bold text-cyan-400 mb-1">0</div>
                <div class="text-slate-300 text-sm">Parties jouées</div>
              </div>
              
              <div class="text-center">
                <div class="text-3xl font-bold text-emerald-400 mb-1">0h</div>
                <div class="text-slate-300 text-sm">Temps de jeu</div>
              </div>
              
              <div class="text-center">
                <div class="text-3xl font-bold text-teal-400 mb-1">0</div>
                <div class="text-slate-300 text-sm">Notes jouées</div>
              </div>
            </CardContent>
          </Card>

          <!-- Account Actions -->
          <Card class="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <h3 class="text-xl font-semibold text-white flex items-center">
                <Icon name="lucide:settings" class="w-5 h-5 mr-2" />
                Compte
              </h3>
            </CardHeader>
            <CardContent class="space-y-3">
              <Button
                variant="outline"
                class="w-full border-slate-400 text-slate-300 hover:bg-slate-400/20"
                disabled
              >
                <Icon name="lucide:edit" class="w-4 h-4 mr-2" />
                Modifier le profil
                <span class="ml-auto text-xs bg-slate-600 px-2 py-1 rounded">Bientôt</span>
              </Button>

              <Button
                variant="outline"
                class="w-full border-slate-400 text-slate-300 hover:bg-slate-400/20"
                disabled
              >
                <Icon name="lucide:key" class="w-4 h-4 mr-2" />
                Changer le mot de passe
                <span class="ml-auto text-xs bg-slate-600 px-2 py-1 rounded">Bientôt</span>
              </Button>

              <div class="border-t border-white/10 pt-3 mt-4">
                <Button
                  variant="destructive"
                  class="w-full bg-red-500/80 hover:bg-red-600/80"
                  @click="logout"
                >
                  <Icon name="lucide:log-out" class="w-4 h-4 mr-2" />
                  Se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Recent Activity -->
          <Card class="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <h3 class="text-xl font-semibold text-white flex items-center">
                <Icon name="lucide:clock" class="w-5 h-5 mr-2" />
                Activité récente
              </h3>
            </CardHeader>
            <CardContent>
              <div class="text-center py-8">
                <Icon name="lucide:music" class="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p class="text-slate-400 text-sm">
                  Aucune activité récente.<br/>
                  Commencez à jouer pour voir vos statistiques !
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Not logged in -->
      <div v-else class="text-center">
        <Card class="bg-white/10 backdrop-blur-sm border-white/20 max-w-md mx-auto">
          <CardContent class="p-8">
            <Icon name="lucide:user-x" class="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 class="text-xl font-semibold text-white mb-2">Non connecté</h2>
            <p class="text-slate-300 mb-6">Vous devez être connecté pour accéder à votre profil.</p>
            <div class="space-y-3">
              <Button
                class="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                @click="navigateTo('/login')"
              >
                <Icon name="lucide:log-in" class="w-4 h-4 mr-2" />
                Se connecter
              </Button>
              <Button
                variant="outline"
                class="w-full border-cyan-400 text-cyan-300 hover:bg-cyan-400/20"
                @click="navigateTo('/signup')"
              >
                <Icon name="lucide:user-plus" class="w-4 h-4 mr-2" />
                Créer un compte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

function logout() {
  authStore.logout()
  toast.success('Déconnexion réussie', {
    description: 'À bientôt sur Webrawl Music !'
  })
  navigateTo('/')
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// Redirect if not authenticated
watchEffect(() => {
  if (!authStore.isAuthenticated) {
    // Allow the template to render the "not logged in" state
    // instead of redirecting immediately
  }
})
</script>
