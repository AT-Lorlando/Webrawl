<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900">
    <!-- Game Lobby Interface -->
    <div v-if="!connected" class="min-h-screen flex items-center justify-center p-6">
      <div class="w-full max-w-4xl">
        <GameHeader />
        
        <GameOptions 
        :is-connecting="isConnecting"
        :game-code="gameCode"
        :join-code="joinCode"
        :player-count="playerCount"
        :log="log"
        @host-game="hostGame"
        @join-game="joinGame"
        @format-join-code="formatJoinCode"
        />

        <GameInstructions />

        <!-- Back to Home -->
        <div class="text-center mt-8">
          <Button variant="ghost" class="text-slate-400 hover:text-white" @click="navigateTo('/')">
            <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>

    <!-- Game Interface -->
    <div v-else class="relative">
      <!-- Game Info Overlay -->
      <div v-if="gameCode" class="absolute top-6 left-6 z-50">
        <Card class="bg-black/80 backdrop-blur-sm border-white/20">
          <CardContent class="p-4">
            <div class="flex items-center space-x-4">
              <div>
                <div class="text-white font-semibold">Code de Partie</div>
                <div class="text-2xl font-mono font-bold text-cyan-400">{{ gameCode }}</div>
              </div>
              <Button
                size="sm"
                variant="outline"
                class="border-cyan-400 text-cyan-300 hover:bg-cyan-400/20"
                @click="copyGameCode"
              >
                <Icon name="lucide:copy" class="w-4 h-4 mr-1" />
                Copier
              </Button>
            </div>
            <p class="text-slate-400 text-sm mt-2">
              Partagez ce code avec vos amis pour qu'ils rejoignent votre partie
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Instruments Panel -->
      <div class="absolute top-6 left-1/2 transform -translate-x-1/2 z-50">
        <Card class="bg-black/80 backdrop-blur-sm border-white/20">
          <CardContent class="p-4">
            <div class="text-center">
              <h3 class="text-white font-semibold mb-3 flex items-center justify-center">
                <Icon name="lucide:music" class="w-4 h-4 mr-2" />
                Instruments Disponibles
              </h3>
              <div class="grid grid-cols-5 gap-3">
                <div v-for="instrument in instrumentInfo" :key="instrument.name" class="text-center">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1"
                       :style="{ background: instrument.color }">
                    <Icon :name="instrument.icon" class="w-4 h-4 text-white" />
                  </div>
                  <div class="text-xs text-slate-300">{{ instrument.name }}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Game Controls -->
      <div class="absolute top-6 right-6 z-50 space-y-4">
        <!-- Volume Control -->
        <Card class="bg-black/80 backdrop-blur-sm border-white/20">
          <CardContent class="p-4">
            <div class="flex items-center space-x-3">
              <Icon name="lucide:volume-2" class="w-5 h-5 text-white" />
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                id="volume-slider"
                class="w-24 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
              <span class="text-white text-sm min-w-[3ch]">{{ Math.round(volume * 100) }}%</span>
            </div>
          </CardContent>
        </Card>

        <!-- Player Count -->
        <Card class="bg-black/80 backdrop-blur-sm border-white/20">
          <CardContent class="p-3">
            <div class="text-center">
              <div class="text-cyan-400 font-bold text-lg">{{ playerCount }}</div>
              <div class="text-slate-300 text-xs">Joueurs connectés</div>
            </div>
          </CardContent>
        </Card>

        <!-- Exit Game -->
        <Button
          variant="destructive"
          size="sm"
          @click="exitGame"
          class="bg-red-500/80 hover:bg-red-600/80"
        >
          <Icon name="lucide:x" class="w-4 h-4 mr-1" />
          Quitter
        </Button>
      </div>

      <!-- 3D Game Container -->
      <div ref="container" class="three-container"></div>

      <!-- Enhanced Instructions Overlay -->
      <div class="absolute bottom-6 left-6 z-50">
        <Card class="bg-black/60 backdrop-blur-sm border-white/10">
          <CardContent class="p-4">
            <h4 class="text-white font-semibold mb-3 flex items-center">
              <Icon name="lucide:gamepad-2" class="w-4 h-4 mr-2" />
              Contrôles
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm text-slate-300">
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <kbd class="px-2 py-1 bg-white/20 rounded text-xs">WASD</kbd>
                  <span>Se déplacer</span>
                </div>
                <div class="flex items-center space-x-2">
                  <kbd class="px-2 py-1 bg-white/20 rounded text-xs">Shift</kbd>
                  <span>Utiliser/Quitter instrument</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <kbd class="px-2 py-1 bg-white/20 rounded text-xs">Q-P</kbd>
                  <span>Jouer des notes</span>
                </div>
                <div class="flex items-center space-x-2">
                  <kbd class="px-2 py-1 bg-white/20 rounded text-xs">Souris</kbd>
                  <span>Regarder autour</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Performance Stats -->
      <div class="absolute bottom-6 right-6 z-40">
        <Card class="bg-black/80 backdrop-blur-sm border-white/20 max-w-sm">
          <CardContent class="p-3">
            <div class="space-y-2">
              <div v-if="log.length > 0" class="max-h-24 overflow-y-auto space-y-1">
                <div v-for="(entry, i) in log.slice(0, 3)" :key="i" class="text-xs text-green-400 font-mono">
                  {{ entry }}
                </div>
              </div>
              <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                <span>FPS:</span>
                <span class="text-cyan-400">{{ fps }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Instructions pour le piano acoustique -->
      <div class="piano-instructions" v-if="showInstructions">
        <div class="instructions-header">
          <h3>🎵 Contrôles des instruments</h3>
          <button @click="toggleInstructions" class="close-btn">×</button>
        </div>
        
        <div class="instructions-content">
          <div class="main-info">
            <h4>🎵 Système unifié pour tous les instruments</h4>
            <p>Tous les instruments utilisent les mêmes touches !</p>
            
            <div class="instrument-behaviors">
              <h5>🎮 Comportements différenciés :</h5>
              <div class="behavior-item">
                <span class="instrument-type">🎹 Piano :</span>
                <span class="behavior">Appuyer = Note + <strong>ESPACE = Pédale sustain</strong></span>
              </div>
              <div class="behavior-item">
                <span class="instrument-type">🎷 Vents (Saxophone) :</span>
                <span class="behavior">Maintenir touche = Note continue, Relâcher = Stop</span>
              </div>
              <div class="behavior-item">
                <span class="instrument-type">🎸 Cordes (Guitares/Basse) :</span>
                <span class="behavior">Appuyer = Note unique (decay naturel)</span>
              </div>
            </div>
          </div>
          
          <div class="controls-summary">
            <div class="key-mapping-summary">
              <div class="key-row">
                <span class="row-label">Chiffres :</span>
                <span class="keys">1 2 3 4 5 6 7 8 9 0 - =</span>
              </div>
              <div class="key-row">
                <span class="row-label">QWERTY :</span>
                <span class="keys">Q W E R T Y U I O P [ ]</span>
              </div>
              <div class="key-row">
                <span class="row-label">ASDF :</span>
                <span class="keys">A S D F G H J K L ; ' \</span>
              </div>
            </div>
          </div>
          
          <div class="note-info">
            <small>💡 Approchez-vous d'un instrument → Shift pour vous y connecter → Jouez avec les touches ci-dessus</small>
          </div>
          
          <div class="instruments-list">
            <h4>🎪 Instruments disponibles :</h4>
            <div class="instruments-grid">
              <span class="instrument">🎹 Piano Acoustique</span>
              <span class="instrument">🎸 Guitare Acoustique</span>
              <span class="instrument">🎹 Piano Électrique</span>
              <span class="instrument">🎸⚡ Guitare Électrique</span>
              <span class="instrument">🎸🔊 Basse Électrique</span>
              <span class="instrument">🎷 Saxophone</span>
            </div>
          </div>
          
          <!-- Détails complets (pliable) -->
          <div class="detailed-section" v-if="showDetailedPiano">
            <h4>🎹 Notes détaillées (Piano Acoustique)</h4>
            
            <div class="octave-section">
              <h4>Octave 3 (Grave)</h4>
              <div class="key-mapping">
                <span class="key">1</span><span class="note">C3</span>
                <span class="key">2</span><span class="note">Cd3</span>
                <span class="key">3</span><span class="note">D3</span>
                <span class="key">4</span><span class="note">Dd3</span>
                <span class="key">5</span><span class="note">E3</span>
                <span class="key">6</span><span class="note">F3</span>
                <span class="key">7</span><span class="note">Fd3</span>
                <span class="key">8</span><span class="note">G3</span>
                <span class="key">9</span><span class="note">Gd3</span>
                <span class="key">0</span><span class="note">A3</span>
                <span class="key">-</span><span class="note">Ad3</span>
                <span class="key">=</span><span class="note">B3</span>
              </div>
            </div>
            
            <div class="octave-section">
              <h4>Octave 4 (Médium)</h4>
              <div class="key-mapping">
                <span class="key">Q</span><span class="note">C4</span>
                <span class="key">W</span><span class="note">Cd4</span>
                <span class="key">E</span><span class="note">D4</span>
                <span class="key">R</span><span class="note">Dd4</span>
                <span class="key">T</span><span class="note">E4</span>
                <span class="key">Y</span><span class="note">F4</span>
                <span class="key">U</span><span class="note">Fd4</span>
                <span class="key">I</span><span class="note">G4</span>
                <span class="key">O</span><span class="note">Gd4</span>
                <span class="key">P</span><span class="note">A4</span>
                <span class="key">[</span><span class="note">Ad4</span>
                <span class="key">]</span><span class="note">B4</span>
              </div>
            </div>
            
            <div class="octave-section">
              <h4>Octave 5 (Aigu)</h4>
              <div class="key-mapping">
                <span class="key">A</span><span class="note">C5</span>
                <span class="key">S</span><span class="note">Cd5</span>
                <span class="key">D</span><span class="note">D5</span>
                <span class="key">F</span><span class="note">Dd5</span>
                <span class="key">G</span><span class="note">E5</span>
                <span class="key">H</span><span class="note">F5</span>
                <span class="key">J</span><span class="note">Fd5</span>
                <span class="key">K</span><span class="note">G5</span>
                <span class="key">L</span><span class="note">Gd5</span>
                <span class="key">;</span><span class="note">A5</span>
                <span class="key">'</span><span class="note">Ad5</span>
                <span class="key">\</span><span class="note">B5</span>
              </div>
            </div>
          </div>
          
          <button @click="toggleDetailedPiano" class="details-btn">
            {{ showDetailedPiano ? 'Masquer notes détaillées' : 'Voir notes détaillées' }}
          </button>
        </div>
      </div>
      
              <!-- Bouton pour afficher les instructions -->
        <button v-if="!showInstructions" @click="toggleInstructions" class="show-instructions-btn">
          🎵 Guide des Instruments
        </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import initThreeScene from '~/assets/three/main'

const container = ref<HTMLElement | null>(null)
const connected = ref(false)
const joinCode = ref('')
const gameCode = ref('')
const log = ref<string[]>([])
const isConnecting = ref(false)
const volume = ref(0.5)
const playerCount = ref(1)
const fps = ref(60)
const showInstructions = ref(true)
const showDetailedPiano = ref(false)

// Informations sur les instruments
const instrumentInfo = ref([
  {
    name: 'Piano',
    icon: 'lucide:piano',
    color: 'linear-gradient(135deg, #8B4513, #A0522D)'
  },
  {
    name: 'Piano Acoustique',
    icon: 'lucide:piano',
    color: 'linear-gradient(135deg, #1a1a1a, #333333)'
  },
  {
    name: 'Piano Électrique',
    icon: 'lucide:zap',
    color: 'linear-gradient(135deg, #2d2d2d, #0066ff)'
  },
  {
    name: 'Guitare',
    icon: 'lucide:guitar',
    color: 'linear-gradient(135deg, #D2691E, #CD853F)'
  },
  {
    name: 'Guitare Acoustique',
    icon: 'lucide:guitar',
    color: 'linear-gradient(135deg, #8B4513, #A0522D)'
  },
  {
    name: 'Guitare Électrique',
    icon: 'lucide:zap',
    color: 'linear-gradient(135deg, #FF0066, #FF3399)'
  },
  {
    name: 'Basse Électrique',
    icon: 'lucide:music-2',
    color: 'linear-gradient(135deg, #000033, #000080)'
  },
  {
    name: 'Batterie',
    icon: 'lucide:drum',
    color: 'linear-gradient(135deg, #FF4444, #FF6B6B)'
  },
  {
    name: 'Synthé',
    icon: 'lucide:zap',
    color: 'linear-gradient(135deg, #1a1a1a, #333333)'
  },
  {
    name: 'Violon',
    icon: 'lucide:music',
    color: 'linear-gradient(135deg, #8B4513, #A0522D)'
  },
  {
    name: 'Saxophone',
    icon: 'lucide:music',
    color: 'linear-gradient(135deg, #FFD700, #FFA500)'
  }
])

// FPS Monitoring
let fpsInterval: NodeJS.Timeout | undefined
let frameCount = 0
let lastTime = 0

function randomCode(length = 6) {
  return Math.random().toString(36).substr(2, length).toUpperCase()
}

function formatJoinCode() {
  joinCode.value = joinCode.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

async function hostGame() {
  if (isConnecting.value) return
  
  isConnecting.value = true
  gameCode.value = randomCode()
  
  toast('Création de la partie...', {
    description: `Code: ${gameCode.value}`
  })
  
  await connect(gameCode.value, true)
}

async function joinGame() {
  if (!joinCode.value || joinCode.value.length < 6 || isConnecting.value) return
  
  isConnecting.value = true
  gameCode.value = joinCode.value.toUpperCase()
  
  toast('Connexion à la partie...', {
    description: `Code: ${gameCode.value}`
  })
  
  await connect(gameCode.value, false)
}

async function copyGameCode() {
  try {
    await navigator.clipboard.writeText(gameCode.value)
    toast('Code copié !', {
      description: 'Le code de partie a été copié dans le presse-papiers'
    })
  } catch (err) {
    toast('Erreur', {
      description: 'Impossible de copier le code'
    })
  }
}

function exitGame() {
  connected.value = false
  gameCode.value = ''
  joinCode.value = ''
  log.value = []
  isConnecting.value = false
  playerCount.value = 1
  
  // Clean up Three.js scene if needed
  if (container.value) {
    container.value.innerHTML = ''
  }
  
  toast('Partie quittée', {
    description: 'Vous avez quitté la session musicale'
  })
}

function addLog(msg: string) {
  log.value.unshift(`${new Date().toLocaleTimeString()}: ${msg}`)
  if (log.value.length > 20) log.value.length = 20
  
  // Simuler le changement du nombre de joueurs basé sur les logs
  if (msg.includes('joined') || msg.includes('rejoint')) {
    playerCount.value = Math.min(playerCount.value + 1, 4)
  } else if (msg.includes('left') || msg.includes('quitté')) {
    playerCount.value = Math.max(playerCount.value - 1, 1)
  }
}

async function connect(code: string, isHost: boolean) {
  try {
    connected.value = true
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (container.value) {
      initThreeScene(container.value, code, isHost, addLog)
      
      toast.success('Connexion réussie !', {
        description: isHost ? 'Partie créée avec succès' : 'Vous avez rejoint la partie'
      })
      
      // Simuler l'activité réseau
      addLog(isHost ? 'Partie créée' : 'Partie rejointe')
    }
  } catch (error) {
    console.error('Connection failed:', error)
    toast.error('Erreur de connexion', {
      description: 'Impossible de se connecter à la partie'
    })
    connected.value = false
  } finally {
    isConnecting.value = false
  }
}

// Gestion du volume
function updateVolume() {
  const volumeSlider = document.getElementById('volume-slider') as HTMLInputElement
  if (volumeSlider) {
    volume.value = parseFloat(volumeSlider.value)
  }
}

const toggleInstructions = () => {
  showInstructions.value = !showInstructions.value
}

const toggleDetailedPiano = () => {
  showDetailedPiano.value = !showDetailedPiano.value
}

onMounted(() => {
  // Écouter les changements de volume
  const volumeSlider = document.getElementById('volume-slider')
  if (volumeSlider) {
    volumeSlider.addEventListener('input', updateVolume)
    // Définir la valeur initiale
    ;(volumeSlider as HTMLInputElement).value = volume.value.toString()
  }
  
  // Compteur FPS
  lastTime = performance.now()
  fpsInterval = setInterval(() => {
    const now = performance.now()
    const delta = now - lastTime
    fps.value = frameCount > 0 ? Math.round((frameCount * 1000) / delta) : 0
    lastTime = now
    frameCount = 0
  }, 1000)
  
  function countFrame() {
    frameCount++
    requestAnimationFrame(countFrame)
  }
  countFrame()
})

onUnmounted(() => {
  if (fpsInterval) clearInterval(fpsInterval)
  
  const volumeSlider = document.getElementById('volume-slider')
  if (volumeSlider) {
    volumeSlider.removeEventListener('input', updateVolume)
  }
})
</script>

<style scoped>
.three-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

/* Custom range slider styles */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  cursor: pointer;
  border: 2px solid white;
}

/* Styles pour les nouveaux comportements d'instruments */
.instrument-behaviors {
  margin-top: 15px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 3px solid #4ecdc4;
}

.instrument-behaviors h5 {
  color: #4ecdc4;
  margin-bottom: 8px;
  font-size: 13px;
}

.behavior-item {
  display: flex;
  margin-bottom: 6px;
  font-size: 11px;
  align-items: center;
}

.instrument-type {
  min-width: 80px;
  font-weight: bold;
  margin-right: 8px;
}

.behavior {
  color: #e2e8f0;
}

.behavior strong {
  color: #10b981;
  background: rgba(16, 185, 129, 0.2);
  padding: 1px 4px;
  border-radius: 3px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

input[type="range"]::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

kbd {
  font-family: ui-monospace, monospace;
}

.piano-instructions {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 12px;
  padding: 20px;
  max-width: 400px;
  border: 2px solid #4f46e5;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.instructions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.instructions-header h3 {
  margin: 0;
  color: #4f46e5;
  font-size: 1.2rem;
}

.close-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.octave-section {
  margin-bottom: 15px;
}

.octave-section h4 {
  margin: 0 0 8px 0;
  color: #a78bfa;
  font-size: 1rem;
}

.instrument-section {
  margin-bottom: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid #4f46e5;
}

.instrument-section h4 {
  margin: 0 0 6px 0;
  color: #fbbf24;
  font-size: 0.95rem;
}

.detailed-section {
  margin-top: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.note-info {
  margin: 15px 0;
  padding: 8px 12px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 6px;
  border-left: 3px solid #22c55e;
}

.note-info small {
  color: #a3e635;
  font-weight: 500;
}

.details-btn {
  margin-top: 10px;
  background: rgba(79, 70, 229, 0.2);
  color: #c7d2fe;
  border: 1px solid rgba(79, 70, 229, 0.5);
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.details-btn:hover {
  background: rgba(79, 70, 229, 0.3);
  border-color: rgba(79, 70, 229, 0.7);
}

.key-mapping {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  font-size: 0.8rem;
}

.key {
  background: #374151;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
  min-width: 24px;
}

.note {
  color: #d1d5db;
  padding: 4px 8px;
  text-align: center;
  font-family: monospace;
}

.show-instructions-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(79, 70, 229, 0.9);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.show-instructions-btn:hover {
  background: rgba(79, 70, 229, 1);
}

/* Responsive */
@media (max-width: 768px) {
  .piano-instructions {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
    font-size: 0.9rem;
  }
  
  .key-mapping {
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }
  
  .key, .note {
    font-size: 0.7rem;
    padding: 3px 6px;
  }
}

.main-info {
  text-align: center;
  margin-bottom: 20px;
  padding: 15px;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(139, 92, 246, 0.2));
  border-radius: 10px;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.main-info h4 {
  margin: 0 0 8px 0;
  color: #f59e0b;
  font-size: 1.1rem;
}

.main-info p {
  margin: 0;
  color: #e5e7eb;
  font-size: 0.9rem;
}

.controls-summary {
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.key-mapping-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.key-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.row-label {
  font-weight: bold;
  color: #94a3b8;
  min-width: 80px;
  font-size: 0.85rem;
}

.keys {
  font-family: monospace;
  font-size: 0.8rem;
  color: #f1f5f9;
  background: rgba(30, 41, 59, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
  letter-spacing: 1px;
}

.instruments-list {
  margin: 15px 0;
}

.instruments-list h4 {
  margin: 0 0 10px 0;
  color: #34d399;
  font-size: 1rem;
}

.instruments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}

.instrument {
  background: rgba(52, 211, 153, 0.1);
  color: #6ee7b7;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgba(52, 211, 153, 0.3);
  font-size: 0.8rem;
  text-align: center;
}
</style>