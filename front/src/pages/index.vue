<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900">
    <!-- Navigation Header -->
    <header class="relative z-10">
      <nav class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Icon name="lucide:music" class="w-5 h-5 text-white" />
            </div>
            <span class="text-xl font-bold text-white">Webrawl Music</span>
          </div>
          
          <div class="flex items-center space-x-4">
            <Button variant="ghost" class="text-white hover:text-cyan-200" @click="navigateTo('/login')">
              Connexion
            </Button>
            <Button class="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600" @click="navigateTo('/signup')">
              S'inscrire
            </Button>
          </div>
        </div>
      </nav>
    </header>

    <!-- Hero Section -->
    <main class="container mx-auto px-6 py-16">
      <div class="text-center space-y-8">
        <!-- Hero Title -->
        <div class="space-y-4">
          <h1 class="text-5xl md:text-7xl font-bold text-white leading-tight">
            Créez de la 
            <span class="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Musique
            </span>
            <br/>
            Ensemble
          </h1>
          <p class="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Rejoignez vos amis dans un monde virtuel interactif et créez des mélodies uniques ensemble en temps réel.
          </p>
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            class="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-lg px-8 py-4 h-auto"
            @click="navigateTo('/game')"
          >
            <Icon name="lucide:play" class="w-5 h-5 mr-2" />
            Commencer à Jouer
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            class="border-cyan-400 text-cyan-300 hover:bg-cyan-400/20 text-lg px-8 py-4 h-auto"
            @click="scrollToFeatures"
          >
            <Icon name="lucide:info" class="w-5 h-5 mr-2" />
            En savoir plus
          </Button>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <Card class="bg-white/10 backdrop-blur-sm border-white/20 text-center">
            <CardContent class="p-6">
              <div class="text-3xl font-bold text-white mb-2">∞</div>
              <div class="text-slate-300">Créativité illimitée</div>
            </CardContent>
          </Card>
          
          <Card class="bg-white/10 backdrop-blur-sm border-white/20 text-center">
            <CardContent class="p-6">
              <div class="text-3xl font-bold text-white mb-2">4</div>
              <div class="text-slate-300">Joueurs max par partie</div>
            </CardContent>
          </Card>
          
          <Card class="bg-white/10 backdrop-blur-sm border-white/20 text-center">
            <CardContent class="p-6">
              <div class="text-3xl font-bold text-white mb-2">⚡</div>
              <div class="text-slate-300">Temps réel</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>

    <!-- Features Section -->
    <section ref="featuresSection" class="container mx-auto px-6 py-16">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-white mb-4">Fonctionnalités</h2>
        <p class="text-slate-300 text-lg max-w-2xl mx-auto">
          Découvrez tout ce que Webrawl Music a à offrir pour votre expérience musicale collaborative.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <Card class="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
          <CardContent class="p-6">
            <div class="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-lg flex items-center justify-center mb-4">
              <Icon name="lucide:users" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Multijoueur</h3>
            <p class="text-slate-300">
              Jouez avec jusqu'à 4 amis simultanément dans le même monde virtuel.
            </p>
          </CardContent>
        </Card>

        <!-- Feature 2 -->
        <Card class="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
          <CardContent class="p-6">
            <div class="w-12 h-12 bg-gradient-to-r from-sky-400 to-blue-400 rounded-lg flex items-center justify-center mb-4">
              <Icon name="lucide:piano" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Instruments Virtuels</h3>
            <p class="text-slate-300">
              Accédez à différents pianos virtuels avec des sons haute qualité.
            </p>
          </CardContent>
        </Card>

        <!-- Feature 3 -->
        <Card class="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
          <CardContent class="p-6">
            <div class="w-12 h-12 bg-gradient-to-r from-lime-400 to-green-400 rounded-lg flex items-center justify-center mb-4">
              <Icon name="lucide:zap" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Temps Réel</h3>
            <p class="text-slate-300">
              Synchronisation parfaite entre tous les joueurs pour une expérience fluide.
            </p>
          </CardContent>
        </Card>

        <!-- Feature 4 -->
        <Card class="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
          <CardContent class="p-6">
            <div class="w-12 h-12 bg-gradient-to-r from-cyan-400 to-sky-400 rounded-lg flex items-center justify-center mb-4">
              <Icon name="lucide:volume-2" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Audio Spatial</h3>
            <p class="text-slate-300">
              Son 3D immersif qui change selon votre position dans l'espace virtuel.
            </p>
          </CardContent>
        </Card>

        <!-- Feature 5 -->
        <Card class="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
          <CardContent class="p-6">
            <div class="w-12 h-12 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-lg flex items-center justify-center mb-4">
              <Icon name="lucide:gamepad-2" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Contrôles Intuitifs</h3>
            <p class="text-slate-300">
              Interface simple et intuitive pour se déplacer et jouer de la musique.
            </p>
          </CardContent>
        </Card>

        <!-- Feature 6 -->
        <Card class="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
          <CardContent class="p-6">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center mb-4">
              <Icon name="lucide:share-2" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Partage Facile</h3>
            <p class="text-slate-300">
              Partagez un simple code avec vos amis pour qu'ils rejoignent votre session.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="container mx-auto px-6 py-16 text-center">
      <Card class="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border-cyan-400/30">
        <CardContent class="p-12">
          <h2 class="text-3xl font-bold text-white mb-4">
            Prêt à créer de la musique ensemble ?
          </h2>
          <p class="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Lancez votre première session musicale collaborative dès maintenant.
          </p>
          <Button 
            size="lg" 
            class="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-lg px-8 py-4 h-auto"
            @click="navigateTo('/game')"
          >
            <Icon name="lucide:music" class="w-5 h-5 mr-2" />
            Commencer Maintenant
          </Button>
        </CardContent>
      </Card>
    </section>

    <!-- Footer -->
    <footer class="container mx-auto px-6 py-8 border-t border-white/10">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded flex items-center justify-center">
            <Icon name="lucide:music" class="w-4 h-4 text-white" />
          </div>
          <span class="text-slate-400">© 2024 Webrawl Music</span>
        </div>
        <div class="text-slate-400 text-sm">
          Créé avec ❤️ pour la musique collaborative
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const featuresSection = ref<HTMLElement | null>(null)

function scrollToFeatures() {
  featuresSection.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
/* Animations pour les cartes */
.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-4px);
}
</style>
