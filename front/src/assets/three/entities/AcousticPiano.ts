import * as THREE from 'three'
import { Instrument } from './Instrument'
import type { InstrumentType } from './Instrument'
import { WebSocketManager } from '../network/WebSocketManager'
import { AudioManager } from '../audio/AudioManager'

// Import des sons de piano acoustique
import acousticPianoC3 from '../../../assets/sounds/acoustic_piano/C3.wav'
import acousticPianoCd3 from '../../../assets/sounds/acoustic_piano/Cd3.wav'
import acousticPianoD3 from '../../../assets/sounds/acoustic_piano/D3.wav'
import acousticPianoDd3 from '../../../assets/sounds/acoustic_piano/Dd3.wav'
import acousticPianoE3 from '../../../assets/sounds/acoustic_piano/E3.wav'
import acousticPianoF3 from '../../../assets/sounds/acoustic_piano/F3.wav'
import acousticPianoFd3 from '../../../assets/sounds/acoustic_piano/Fd3.wav'
import acousticPianoG3 from '../../../assets/sounds/acoustic_piano/G3.wav'
import acousticPianoGd3 from '../../../assets/sounds/acoustic_piano/Gd3.wav'
import acousticPianoA3 from '../../../assets/sounds/acoustic_piano/A3.wav'
import acousticPianoAd3 from '../../../assets/sounds/acoustic_piano/Ad3.wav'
import acousticPianoB3 from '../../../assets/sounds/acoustic_piano/B3.wav'
import acousticPianoC4 from '../../../assets/sounds/acoustic_piano/C4.wav'
import acousticPianoCd4 from '../../../assets/sounds/acoustic_piano/Cd4.wav'
import acousticPianoD4 from '../../../assets/sounds/acoustic_piano/D4.wav'
import acousticPianoDd4 from '../../../assets/sounds/acoustic_piano/Dd4.wav'
import acousticPianoE4 from '../../../assets/sounds/acoustic_piano/E4.wav'
import acousticPianoF4 from '../../../assets/sounds/acoustic_piano/F4.wav'
import acousticPianoFd4 from '../../../assets/sounds/acoustic_piano/Fd4.wav'
import acousticPianoG4 from '../../../assets/sounds/acoustic_piano/G4.wav'
import acousticPianoGd4 from '../../../assets/sounds/acoustic_piano/Gd4.wav'
import acousticPianoA4 from '../../../assets/sounds/acoustic_piano/A4.wav'
import acousticPianoAd4 from '../../../assets/sounds/acoustic_piano/Ad4.wav'
import acousticPianoB4 from '../../../assets/sounds/acoustic_piano/B4.wav'
import acousticPianoC5 from '../../../assets/sounds/acoustic_piano/C5.wav'
import acousticPianoCd5 from '../../../assets/sounds/acoustic_piano/Cd5.wav'
import acousticPianoD5 from '../../../assets/sounds/acoustic_piano/D5.wav'
import acousticPianoDd5 from '../../../assets/sounds/acoustic_piano/Dd5.wav'
import acousticPianoE5 from '../../../assets/sounds/acoustic_piano/E5.wav'
import acousticPianoF5 from '../../../assets/sounds/acoustic_piano/F5.wav'
import acousticPianoFd5 from '../../../assets/sounds/acoustic_piano/Fd5.wav'
import acousticPianoG5 from '../../../assets/sounds/acoustic_piano/G5.wav'
import acousticPianoGd5 from '../../../assets/sounds/acoustic_piano/Gd5.wav'
import acousticPianoA5 from '../../../assets/sounds/acoustic_piano/A5.wav'
import acousticPianoAd5 from '../../../assets/sounds/acoustic_piano/Ad5.wav'
import acousticPianoB5 from '../../../assets/sounds/acoustic_piano/B5.wav'

export class AcousticPiano extends Instrument {
  protected override instrumentType: InstrumentType = 'acoustic_piano'
  private sustainPedal = false
  private sustainedNotes: Set<string> = new Set()

  // Map des notes vers les fichiers audio
  private noteToAudioMap: { [key: string]: string } = {
    'C3': acousticPianoC3,
    'Cd3': acousticPianoCd3,
    'D3': acousticPianoD3,
    'Dd3': acousticPianoDd3,
    'E3': acousticPianoE3,
    'F3': acousticPianoF3,
    'Fd3': acousticPianoFd3,
    'G3': acousticPianoG3,
    'Gd3': acousticPianoGd3,
    'A3': acousticPianoA3,
    'Ad3': acousticPianoAd3,
    'B3': acousticPianoB3,
    'C4': acousticPianoC4,
    'Cd4': acousticPianoCd4,
    'D4': acousticPianoD4,
    'Dd4': acousticPianoDd4,
    'E4': acousticPianoE4,
    'F4': acousticPianoF4,
    'Fd4': acousticPianoFd4,
    'G4': acousticPianoG4,
    'Gd4': acousticPianoGd4,
    'A4': acousticPianoA4,
    'Ad4': acousticPianoAd4,
    'B4': acousticPianoB4,
    'C5': acousticPianoC5,
    'Cd5': acousticPianoCd5,
    'D5': acousticPianoD5,
    'Dd5': acousticPianoDd5,
    'E5': acousticPianoE5,
    'F5': acousticPianoF5,
    'Fd5': acousticPianoFd5,
    'G5': acousticPianoG5,
    'Gd5': acousticPianoGd5,
    'A5': acousticPianoA5,
    'Ad5': acousticPianoAd5,
    'B5': acousticPianoB5,
  }

  // Map des touches du clavier vers les notes
  private keyToNoteMap: { [key: string]: string } = {
    // Octave 3 - Rangée des chiffres
    'Digit1': 'C3',   'Digit2': 'Cd3',  'Digit3': 'D3',   'Digit4': 'Dd3',  'Digit5': 'E3',   'Digit6': 'F3',
    'Digit7': 'Fd3',  'Digit8': 'G3',   'Digit9': 'Gd3',  'Digit0': 'A3',   'Minus': 'Ad3',  'Equal': 'B3',
    
    // Octave 4 - Rangée QWERTY  
    'KeyQ': 'C4',   'KeyW': 'Cd4',  'KeyE': 'D4',   'KeyR': 'Dd4',  'KeyT': 'E4',   'KeyY': 'F4',
    'KeyU': 'Fd4',  'KeyI': 'G4',   'KeyO': 'Gd4',  'KeyP': 'A4',   'BracketLeft': 'Ad4',  'BracketRight': 'B4',
    
    // Octave 5 - Rangée ASDF
    'KeyA': 'C5',   'KeyS': 'Cd5',  'KeyD': 'D5',   'KeyF': 'Dd5',  'KeyG': 'E5',   'KeyH': 'F5',
    'KeyJ': 'Fd5',  'KeyK': 'G5',   'KeyL': 'Gd5',  'Semicolon': 'A5',   'Quote': 'Ad5',  'Backslash': 'B5'
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
      'Piano Acoustique',
      new THREE.Color(0x1a1a1a)
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
    
    console.log(`🎹 Chargement des sons pour Piano Acoustique...`)

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
    console.log(`✅ Piano Acoustique: ${loadedCount} sons chargés, ${failedCount} échecs`)
  }

  // Override des méthodes de gestion du clavier pour le piano
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
    
    // Pour le piano, arrêter la note seulement si la pédale sustain n'est pas enfoncée
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
      // Créer et jouer le son directement
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
    
    console.log(`🎹 Pédale sustain: ${active ? 'ON' : 'OFF'}`)
  }

  // Override unlinkPlayer pour nettoyer les notes sustain spécifiques au piano
  public override unlinkPlayer() {
    // Nettoyer l'état du sustain et les notes sustain
    this.sustainPedal = false
    this.sustainedNotes.clear()
    
    // Appeler la méthode parent
    super.unlinkPlayer()
  }

  // Helper pour obtenir un noteId à partir du nom (temporaire)
  private getNoteIdFromName(noteName: string): number {
    // Mapping simple pour les particules - peut être amélioré
    const noteMap: { [key: string]: number } = {
      'C3': 1, 'Cd3': 2, 'D3': 3, 'Dd3': 4, 'E3': 5, 'F3': 6,
      'Fd3': 7, 'G3': 8, 'Gd3': 9, 'A3': 10, 'Ad3': 11, 'B3': 12,
      'C4': 13, 'Cd4': 14, 'D4': 15, 'Dd4': 16, 'E4': 17, 'F4': 18,
      'Fd4': 19, 'G4': 20, 'Gd4': 21, 'A4': 22, 'Ad4': 23, 'B4': 24,
      'C5': 25, 'Cd5': 26, 'D5': 27, 'Dd5': 28, 'E5': 29, 'F5': 30,
      'Fd5': 31, 'G5': 32, 'Gd5': 33, 'A5': 34, 'Ad5': 35, 'B5': 36
    }
    return noteMap[noteName] || 1
  }
} 