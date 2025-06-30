import * as THREE from 'three'
import { Instrument } from './Instrument'
import type { InstrumentType } from './Instrument'
import { WebSocketManager } from '../network/WebSocketManager'
import { AudioManager } from '../audio/AudioManager'

// Import des sons de piano électrique
import electricPianoC3 from '../../../assets/sounds/electric_piano/C3.wav'
import electricPianoCd3 from '../../../assets/sounds/electric_piano/Cd3.wav'
import electricPianoD3 from '../../../assets/sounds/electric_piano/D3.wav'
import electricPianoDd3 from '../../../assets/sounds/electric_piano/Dd3.wav'
import electricPianoE3 from '../../../assets/sounds/electric_piano/E3.wav'
import electricPianoF3 from '../../../assets/sounds/electric_piano/F3.wav'
import electricPianoFd3 from '../../../assets/sounds/electric_piano/Fd3.wav'
import electricPianoG3 from '../../../assets/sounds/electric_piano/G3.wav'
import electricPianoGd3 from '../../../assets/sounds/electric_piano/Gd3.wav'
import electricPianoA3 from '../../../assets/sounds/electric_piano/A3.wav'
import electricPianoAd3 from '../../../assets/sounds/electric_piano/Ad3.wav'
import electricPianoB3 from '../../../assets/sounds/electric_piano/B3.wav'

export class ElectricPiano extends Instrument {
  protected override instrumentType: InstrumentType = 'electric_piano'
  private sustainPedal = false
  private sustainedNotes: Set<string> = new Set()

  // Map des notes vers les fichiers audio
  private noteToAudioMap: { [key: string]: string } = {
    'C3': electricPianoC3,
    'Cd3': electricPianoCd3,
    'D3': electricPianoD3,
    'Dd3': electricPianoDd3,
    'E3': electricPianoE3,
    'F3': electricPianoF3,
    'Fd3': electricPianoFd3,
    'G3': electricPianoG3,
    'Gd3': electricPianoGd3,
    'A3': electricPianoA3,
    'Ad3': electricPianoAd3,
    'B3': electricPianoB3,
  }

  // Map des touches F1-F12 vers les notes
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
      'Piano Électrique',
      new THREE.Color(0x3366FF)
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
    
    console.log(`🎹 Chargement des sons pour Piano Électrique...`)

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
    console.log(`✅ Piano Électrique: ${loadedCount} sons chargés, ${failedCount} échecs`)
  }

  // Override des méthodes de gestion du clavier pour le piano électrique
  public override handleKeyDown(key: string) {
    // Ignorer si la touche est déjà pressée (éviter la répétition automatique du clavier)
    if (this.pressedKeys.has(key)) {
      return
    }
    
    // Marquer la touche comme pressée
    this.pressedKeys.add(key)
    
    this.playNoteFromKey(key)
  }

  public override handleKeyUp(key: string) {
    // Retirer la touche des touches pressées
    this.pressedKeys.delete(key)
    
    // Pour le piano électrique, arrêter la note seulement si la pédale sustain n'est pas enfoncée
    if (!this.sustainPedal) {
      this.stopActiveNote(key)
    } else {
      // Ajouter la note aux notes sustain
      this.sustainedNotes.add(key)
    }
  }

  // Méthode pour jouer une note via une touche du clavier
  protected override playNoteFromKey(key: string) {
    const noteName = this.keyToNoteMap[key]
    if (noteName && this.linkedPlayerId) {
      // Arrêter la note si elle est déjà active (pour éviter les superpositions)
      this.stopActiveNote(key)
      
      console.log('🎹⚡ Playing note:', noteName, 'from key:', key)
      
      // Jouer la nouvelle note
      const audio = this.playNoteDirectly(noteName)
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

  // Méthode pour jouer directement un son
  private playNoteDirectly(noteName: string): HTMLAudioElement | null {
    const url = this.noteToAudioMap[noteName]
    if (url) {
      const audio = new Audio()
      audio.src = url
      audio.volume = 1
      audio.play().catch(error => console.warn('Erreur lecture audio:', error))
      return audio
    }
    return null
  }

  // Méthode pour gérer la pédale sustain
  public setSustainPedal(active: boolean) {
    this.sustainPedal = active
    
    if (!active) {
      // Quand la pédale est relâchée, arrêter toutes les notes sustain
      this.sustainedNotes.forEach(key => {
        this.stopActiveNote(key)
      })
      this.sustainedNotes.clear()
    }
    
    console.log(`🎹⚡ Pédale sustain (Piano Électrique): ${active ? 'ON' : 'OFF'}`)
  }

  // Override unlinkPlayer pour nettoyer les notes sustain spécifiques au piano électrique
  public override unlinkPlayer() {
    // Nettoyer l'état du sustain et les notes sustain
    this.sustainPedal = false
    this.sustainedNotes.clear()
    
    // Appeler la méthode parent
    super.unlinkPlayer()
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