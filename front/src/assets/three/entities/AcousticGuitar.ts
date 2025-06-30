import * as THREE from 'three'
import { Instrument } from './Instrument'
import type { InstrumentType } from './Instrument'
import { WebSocketManager } from '../network/WebSocketManager'
import { AudioManager } from '../audio/AudioManager'

// Import des sons de guitare acoustique (utilise les mêmes sons que le piano pour l'instant)
import acousticGuitarC3 from '../../../assets/sounds/acoustic_guitar/C3.wav'
import acousticGuitarCd3 from '../../../assets/sounds/acoustic_guitar/Cd3.wav'
import acousticGuitarD3 from '../../../assets/sounds/acoustic_guitar/D3.wav'
import acousticGuitarDd3 from '../../../assets/sounds/acoustic_guitar/Dd3.wav'
import acousticGuitarE3 from '../../../assets/sounds/acoustic_guitar/E3.wav'
import acousticGuitarF3 from '../../../assets/sounds/acoustic_guitar/F3.wav'
import acousticGuitarFd3 from '../../../assets/sounds/acoustic_guitar/Fd3.wav'
import acousticGuitarG3 from '../../../assets/sounds/acoustic_guitar/G3.wav'
import acousticGuitarGd3 from '../../../assets/sounds/acoustic_guitar/Gd3.wav'
import acousticGuitarA3 from '../../../assets/sounds/acoustic_guitar/A3.wav'
import acousticGuitarAd3 from '../../../assets/sounds/acoustic_guitar/Ad3.wav'
import acousticGuitarB3 from '../../../assets/sounds/acoustic_guitar/B3.wav'

export class AcousticGuitar extends Instrument {
  protected override instrumentType: InstrumentType = 'acoustic_guitar'

  // Map des notes vers les fichiers audio
  private noteToAudioMap: { [key: string]: string } = {
    'C3': acousticGuitarC3,
    'Cd3': acousticGuitarCd3,
    'D3': acousticGuitarD3,
    'Dd3': acousticGuitarDd3,
    'E3': acousticGuitarE3,
    'F3': acousticGuitarF3,
    'Fd3': acousticGuitarFd3,
    'G3': acousticGuitarG3,
    'Gd3': acousticGuitarGd3,
    'A3': acousticGuitarA3,
    'Ad3': acousticGuitarAd3,
    'B3': acousticGuitarB3,
  }

  // Map des touches du numpad vers les notes
  private keyToNoteMap: { [key: string]: string } = {
    // Octave 3 - Rangée des chiffres (utilise seulement les 12 premières notes)
    'Digit1': 'C3',   'Digit2': 'Cd3',  'Digit3': 'D3',   'Digit4': 'Dd3',  'Digit5': 'E3',   'Digit6': 'F3',
    'Digit7': 'Fd3',  'Digit8': 'G3',   'Digit9': 'Gd3',  'Digit0': 'A3',   'Minus': 'Ad3',  'Equal': 'B3',
    
    // Octave 4 - Rangée QWERTY (mêmes notes répétées pour plus de flexibilité)  
    'KeyQ': 'C3',   'KeyW': 'Cd3',  'KeyE': 'D3',   'KeyR': 'Dd3',  'KeyT': 'E3',   'KeyY': 'F3',
    'KeyU': 'Fd3',  'KeyI': 'G3',   'KeyO': 'Gd3',  'KeyP': 'A3',   'BracketLeft': 'Ad3',  'BracketRight': 'B3',
    
    // Octave 5 - Rangée ASDF (mêmes notes répétées)
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
      'Guitare Acoustique',
      new THREE.Color(0xD2691E)
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
    
    console.log(`🎸 Chargement des sons pour Guitare Acoustique...`)

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
    console.log(`✅ Guitare Acoustique: ${loadedCount} sons chargés, ${failedCount} échecs`)
  }

  // Méthode pour jouer une note via une touche du clavier - Pour les cordes : une note par pression
  protected override playNoteFromKey(key: string) {
    const noteName = this.keyToNoteMap[key]
    if (noteName && this.linkedPlayerId) {
      console.log('🎸 Playing note:', noteName, 'from key:', key)
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

  // Pour les cordes, on garde le comportement par défaut : handleKeyDown/handleKeyUp héritées d'Instrument

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