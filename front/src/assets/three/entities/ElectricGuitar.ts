import * as THREE from 'three'
import { Instrument } from './Instrument'
import type { InstrumentType } from './Instrument'
import { WebSocketManager } from '../network/WebSocketManager'
import { AudioManager } from '../audio/AudioManager'

// Import des sons de guitare électrique
import electricGuitarC3 from '../../../assets/sounds/electric_guitar/C3.wav'
import electricGuitarCd3 from '../../../assets/sounds/electric_guitar/Cd3.wav'
import electricGuitarD3 from '../../../assets/sounds/electric_guitar/D3.wav'
import electricGuitarDd3 from '../../../assets/sounds/electric_guitar/Dd3.wav'
import electricGuitarE3 from '../../../assets/sounds/electric_guitar/E3.wav'
import electricGuitarF3 from '../../../assets/sounds/electric_guitar/F3.wav'
import electricGuitarFd3 from '../../../assets/sounds/electric_guitar/Fd3.wav'
import electricGuitarG3 from '../../../assets/sounds/electric_guitar/G3.wav'
import electricGuitarGd3 from '../../../assets/sounds/electric_guitar/Gd3.wav'
import electricGuitarA3 from '../../../assets/sounds/electric_guitar/A3.wav'
import electricGuitarAd3 from '../../../assets/sounds/electric_guitar/Ad3.wav'
import electricGuitarB3 from '../../../assets/sounds/electric_guitar/B3.wav'

export class ElectricGuitar extends Instrument {
  protected override instrumentType: InstrumentType = 'electric_guitar'

  // Map des notes vers les fichiers audio
  private noteToAudioMap: { [key: string]: string } = {
    'C3': electricGuitarC3,
    'Cd3': electricGuitarCd3,
    'D3': electricGuitarD3,
    'Dd3': electricGuitarDd3,
    'E3': electricGuitarE3,
    'F3': electricGuitarF3,
    'Fd3': electricGuitarFd3,
    'G3': electricGuitarG3,
    'Gd3': electricGuitarGd3,
    'A3': electricGuitarA3,
    'Ad3': electricGuitarAd3,
    'B3': electricGuitarB3,
  }

  // Map des touches Shift + principales vers les notes
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
      'Guitare Électrique',
      new THREE.Color(0xFF0066)
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
    
    console.log(`🎸⚡ Chargement des sons pour Guitare Électrique...`)

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
    console.log(`✅ Guitare Électrique: ${loadedCount} sons chargés, ${failedCount} échecs`)
  }

  // Méthode pour jouer une note via une touche du clavier - Pour les cordes : une note par pression
  protected override playNoteFromKey(key: string) {
    const noteName = this.keyToNoteMap[key]
    if (noteName && this.linkedPlayerId) {
      console.log('🎸⚡ Playing note:', noteName, 'from key:', key)
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