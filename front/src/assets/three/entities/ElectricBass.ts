import * as THREE from 'three'
import { Instrument } from './Instrument'
import type { InstrumentType } from './Instrument'
import { WebSocketManager } from '../network/WebSocketManager'
import { AudioManager } from '../audio/AudioManager'

// Import des sons de basse électrique
import electricBassC3 from '../../../assets/sounds/electric_bass/C3.wav'
import electricBassCd3 from '../../../assets/sounds/electric_bass/Cd3.wav'
import electricBassD3 from '../../../assets/sounds/electric_bass/D3.wav'
import electricBassDd3 from '../../../assets/sounds/electric_bass/Dd3.wav'
import electricBassE3 from '../../../assets/sounds/electric_bass/E3.wav'
import electricBassF3 from '../../../assets/sounds/electric_bass/F3.wav'
import electricBassFd3 from '../../../assets/sounds/electric_bass/Fd3.wav'
import electricBassG3 from '../../../assets/sounds/electric_bass/G3.wav'
import electricBassGd3 from '../../../assets/sounds/electric_bass/Gd3.wav'
import electricBassA3 from '../../../assets/sounds/electric_bass/A3.wav'
import electricBassAd3 from '../../../assets/sounds/electric_bass/Ad3.wav'
import electricBassB3 from '../../../assets/sounds/electric_bass/B3.wav'

export class ElectricBass extends Instrument {
  protected override instrumentType: InstrumentType = 'electric_bass'

  // Map des notes vers les fichiers audio
  private noteToAudioMap: { [key: string]: string } = {
    'C3': electricBassC3,
    'Cd3': electricBassCd3,
    'D3': electricBassD3,
    'Dd3': electricBassDd3,
    'E3': electricBassE3,
    'F3': electricBassF3,
    'Fd3': electricBassFd3,
    'G3': electricBassG3,
    'Gd3': electricBassGd3,
    'A3': electricBassA3,
    'Ad3': electricBassAd3,
    'B3': electricBassB3,
  }

  // Map des touches Ctrl + principales vers les notes
  private keyToNoteMap: { [key: string]: string } = {
    // Mapping unifié - même que tous les autres instruments
    'Digit1': 'C3',   'Digit2': 'Cd3',  'Digit3': 'D3',   'Digit4': 'Dd3',  'Digit5': 'E3',   'Digit6': 'F3',
    'Digit7': 'Fd3',  'Digit8': 'G3',   'Digit9': 'Gd3',  'Digit0': 'A3',   'Minus': 'Ad3',  'Equal': 'B3',
    
    'KeyQ': 'C3',   'KeyW': 'Cd3',  'KeyE': 'D3',   'KeyR': 'Dd3',  'KeyT': 'E3',   'KeyY': 'F3',
    'KeyU': 'Fd3',  'KeyI': 'G3',   'KeyO': 'Gd3',  'KeyP': 'A3',   'BracketLeft': 'Ad3',  'BracketRight': 'B3',
    
    'KeyA': 'C3',   'KeyS': 'Cd3',  'KeyD': 'D3',   'KeyF': 'Dd3',  'KeyG': 'E3',   'KeyH': 'F3',
    'KeyJ': 'Fd3',  'KeyK': 'G3',   'KeyL': 'Gd3',  'Semicolon': 'A3',   'Quote': 'Ad3',  'Backslash': 'B3'
  }

  constructor(
    scene: THREE.Scene,
    cssScene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    wsManager: WebSocketManager,
    gameCode: string,
    id: string,
    position: [number, number, number]
  ) {
    super(
      scene,
      cssScene,
      camera,
      wsManager,
      gameCode,
      id,
      position,
      'Basse Électrique',
      new THREE.Color(0x000080)
    )
  }

  // Override setAudioManager pour charger les sons après définition de l'AudioManager
  public override setAudioManager(audioManager: AudioManager) {
    super.setAudioManager(audioManager)
    this.loadSounds()
  }

  private async loadSounds() {
    let loadedCount = 0
    let failedCount = 0
    
    console.log(`🎸🔊 Chargement des sons pour Basse Électrique...`)

    const loadPromises = Object.entries(this.noteToAudioMap).map(async ([note, url]) => {
      try {
        await this.audioManager.loadSound(note, url)
        loadedCount++
        return { note, success: true }
      } catch (error) {
        failedCount++
        console.warn(`❌ Échec du chargement: ${note}`, error)
        return { note, success: false, error }
      }
    })

    await Promise.allSettled(loadPromises)
    console.log(`✅ Basse Électrique: ${loadedCount} sons chargés, ${failedCount} échecs`)
  }

  // Méthode pour jouer une note via une touche du clavier - Pour les cordes : une note par pression
  protected override playNoteFromKey(key: string) {
    const noteName = this.keyToNoteMap[key]
    if (noteName && this.linkedPlayerId) {
      console.log('🎸🔊 Playing note:', noteName, 'from key:', key)
      this.playNoteDirectly(noteName)
      this.createNoteParticles(this.getNoteIdFromName(noteName))
      this.playAnimation()
      
      // Envoyer via WebSocket
      this.wsManager.send({
        type: 'instrument_note',
        id: this.linkedPlayerId,
        instrumentId: this.id,
        noteId: this.getNoteIdFromName(noteName),
        gameCode: this.gameCode
      })
    }
  }

  // Méthode pour jouer directement un son
  private playNoteDirectly(noteName: string) {
    const url = this.noteToAudioMap[noteName]
    if (url) {
      const audio = new Audio()
      audio.src = url
      audio.volume = 1
      audio.play().catch(error => console.warn('Erreur lecture audio:', error))
    }
  }

  // Helper pour obtenir un noteId à partir du nom
  private getNoteIdFromName(noteName: string): number {
    const noteMap: { [key: string]: number } = {
      'C3': 1, 'Cd3': 2, 'D3': 3, 'Dd3': 4, 'E3': 5, 'F3': 6,
      'Fd3': 7, 'G3': 8, 'Gd3': 9, 'A3': 10, 'Ad3': 11, 'B3': 12
    }
    return noteMap[noteName] || 1
  }
} 