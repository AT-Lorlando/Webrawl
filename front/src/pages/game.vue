<template>
  <div>
    <div v-if="!connected">
      <button @click="hostGame">Host Game</button>
      <button @click="showJoin = true">Join Game</button>
      <div v-if="showJoin">
        <input v-model="joinCode" placeholder="Enter game code" />
        <button @click="joinGame">Join</button>
      </div>
    </div>
    <div v-else>
      <div v-if="gameCode" class="text-white z-30 absolute top-40 left-0">
        <p>Game Code: <b>{{ gameCode }}</b></p>
        <p>Share this code with friends to join your game.</p>
      </div>
      <div ref="container" class="three-container"></div>
      <div class="volume-slider">
        <input type="range" min="0" max="1" step="0.01" id="volume-slider"/>
      </div>
      <div class="ws-log">
        <div v-for="(entry, i) in log" :key="i">{{ entry }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import initThreeScene from '~/assets/three/main'

const container = ref<HTMLElement | null>(null)
const connected = ref(false)
const showJoin = ref(false)
const joinCode = ref('')
const gameCode = ref('')
const log = ref<string[]>([])

function randomCode(length = 6) {
  return Math.random().toString(36).substr(2, length).toUpperCase()
}

function hostGame() {
  gameCode.value = randomCode()
  connect(gameCode.value, true)
}

function joinGame() {
  if (joinCode.value) {
    gameCode.value = joinCode.value.toUpperCase()
    connect(gameCode.value, false)
  }
}

function addLog(msg: string) {
  log.value.unshift(msg)
  if (log.value.length > 20) log.value.length = 20
}

function connect(code: string, isHost: boolean) {
  connected.value = true
  setTimeout(() => {
    if (container.value) {
      initThreeScene(container.value, code, isHost, addLog)
    }
  })
}
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
.ws-log {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0,0,0,0.7);
  color: #0f0;
  font-family: monospace;
  font-size: 13px;
  max-width: 800px;
  max-height: 50vh;
  overflow-y: auto;
  z-index: 10;
  padding: 8px 12px;
  border-bottom-right-radius: 8px;
}

.volume-slider {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
}
</style>