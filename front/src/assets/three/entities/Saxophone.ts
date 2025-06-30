import * as THREE from 'three'
import { Instrument } from './Instrument'
import type { InstrumentType } from './Instrument'
import { WebSocketManager } from '../network/WebSocketManager'
import { AudioManager } from '../audio/AudioManager'

// Import des sons de saxophone
import saxC3 from '../../../assets/sounds/sax/C3.wav'
import saxCd3 from '../../../assets/sounds/sax/Cd3.wav'
import saxD3 from '../../../assets/sounds/sax/D3.wav'
import saxDd3 from '../../../assets/sounds/sax/Dd3.wav'
import saxE3 from '../../../assets/sounds/sax/E3.wav'
import saxF3 from '../../../assets/sounds/sax/F3.wav'
import saxFd3 from '../../../assets/sounds/sax/Fd3.wav'
import saxG3 from '../../../assets/sounds/sax/G3.wav'
import saxGd3 from '../../../assets/sounds/sax/Gd3.wav'
import saxA3 from '../../../assets/sounds/sax/A3.wav'
import saxAd3 from '../../../assets/sounds/sax/Ad3.wav'
import saxB3 from '../../../assets/sounds/sax/B3.wav'

export class Saxophone extends Instrument {
  protected override instrumentType: InstrumentType = 'sax'

  // Map des notes vers les fichiers audio
  private noteToAudioMap: { [key: string]: string } = {
    'C3': saxC3,
    'Cd3': saxCd3,
    'D3': saxD3,
    'Dd3': saxDd3,
    'E3': saxE3,
    'F3': saxF3,
    'Fd3': saxFd3,
    'G3': saxG3,
    'Gd3': saxGd3,
    'A3': saxA3,
    'Ad3': saxAd3,
    'B3': saxB3,
  }

  // Map des touches Alt + principales vers les notes
  private keyToNoteMap: { [key: string]: string } = {
    'Digit1': 'C3',   'Digit2': 'Cd3',  'Digit3': 'D3',   'Digit4': 'Dd3',
    'Digit5': 'E3',   'Digit6': 'F3',   'Digit7': 'Fd3',  'Digit8': 'G3',
    'Digit9': 'Gd3',  'Digit0': 'A3',   'Minus': 'Ad3',   'Equal': 'B3',
    
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
      'Saxophone',
      new THREE.Color(0xFFD700)
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
    
    console.log(`🎷 Chargement des sons pour Saxophone...`)

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
    console.log(`✅ Saxophone: ${loadedCount} sons chargés, ${failedCount} échecs`)
  }

  // Override des méthodes de gestion du clavier pour les vents
  public override handleKeyDown(key: string) {
    // Ignorer si la touche est déjà pressée (éviter la répétition automatique du clavier)
    if (this.pressedKeys.has(key)) {
      return
    }
    
    // Marquer la touche comme pressée
    this.pressedKeys.add(key)
    
    // Pour les vents, commencer la note en continu
    this.startContinuousNote(key)
  }

  public override handleKeyUp(key: string) {
    // Retirer la touche des touches pressées
    this.pressedKeys.delete(key)
    
    // Pour les vents, arrêter immédiatement la note
    this.stopActiveNote(key)
  }

  // Méthode pour démarrer une note continue
  private startContinuousNote(key: string) {
    const noteName = this.keyToNoteMap[key]
    if (noteName && this.linkedPlayerId) {
      // Arrêter la note si elle est déjà active
      this.stopActiveNote(key)
      
      console.log('🎷 Starting continuous note:', noteName, 'from key:', key)
      
      // Créer et jouer le son en loop
      const audio = this.playNoteDirectly(noteName, true) // true = loop
      if (audio) {
        this.activeNotes.set(key, { audio, noteName })
      }
      
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

  // Méthode pour jouer une note via une touche du clavier (legacy)
  protected override playNoteFromKey(key: string) {
    // Pour le saxophone, utiliser le système de notes continues
    this.startContinuousNote(key)
  }

  // Méthode pour jouer directement un son
  private playNoteDirectly(noteName: string, loop: boolean = false): HTMLAudioElement | null {
    const url = this.noteToAudioMap[noteName]
    if (url) {
      const audio = new Audio()
      audio.src = url
      audio.loop = loop // Activer le loop pour les notes continues
      
      // Pour les vents, démarrer avec un fade-in léger pour éviter les clicks
      if (loop) {
        audio.volume = 0
        audio.play().catch(error => console.warn('Erreur lecture audio:', error))
        
        // Fade-in progressif pour un démarrage en douceur
        let currentVolume = 0
        const fadeIn = setInterval(() => {
          currentVolume += 0.1
          if (currentVolume >= 1) {
            currentVolume = 1
            clearInterval(fadeIn)
          }
          audio.volume = currentVolume
        }, 20)
      } else {
        audio.volume = 1
        audio.play().catch(error => console.warn('Erreur lecture audio:', error))
      }
      
      return audio
    }
    return null
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