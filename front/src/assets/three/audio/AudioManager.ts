import { getNoteById, type Note } from './Notes'
import { Audio, AudioListener, PositionalAudio, Camera } from 'three'
import * as THREE from 'three'
import { Scene } from 'three'

// Import all piano notes
import pianoC4 from '../../../assets/sounds/piano-note-c4.wav'
import pianoD4 from '../../../assets/sounds/piano-note-d4.wav'
import pianoE4 from '../../../assets/sounds/piano-note-e4.wav'
import pianoF4 from '../../../assets/sounds/piano-note-f4.wav'
import pianoG4 from '../../../assets/sounds/piano-note-g4.wav'
import pianoA4 from '../../../assets/sounds/piano-note-a4.wav'
import pianoB4 from '../../../assets/sounds/piano-note-b4.wav'

export class AudioManager {
  // Volume constant (0.0 to 1.0)
  private volume: number = 0.1
  private audioListener: AudioListener
  private oscillators: Map<number, OscillatorNode> = new Map()
  private audioSources: Map<number, Audio | PositionalAudio> = new Map()
  private scene: Scene
  private useSpatialSound: boolean
  private audioBuffers: Map<string, AudioBuffer> = new Map()
  private isLoaded: boolean = false

  // Map note names to audio files
  private noteToAudioMap: { [key: string]: string } = {
    'A': pianoA4,  // La4
    'Z': pianoB4,  // Si4
    'E': pianoC4,  // Do5 -> C4 (une octave plus bas)
    'R': pianoD4,  // Do#5 -> D4 (une octave plus bas)
    'T': pianoE4,  // Ré5 -> E4 (une octave plus bas)
    'Y': pianoF4,  // Ré#5 -> F4 (une octave plus bas)
    'U': pianoG4,  // Mi5 -> G4 (une octave plus bas)
    'I': pianoA4,  // Fa5 -> A4 (une octave plus bas)
    'O': pianoB4,  // Fa#5 -> B4 (une octave plus bas)
    'P': pianoC4,  // Sol5 -> C4 (une octave plus bas)
  }

  constructor(scene: Scene, camera: Camera, useSpatialSound: boolean = false) {
    this.scene = scene
    this.useSpatialSound = useSpatialSound
    this.audioListener = new AudioListener()
    camera.add(this.audioListener)
    this.loadPianoNotes()
  }

  public setVolume(volume: number) {
    this.volume = volume
  }

  private async loadPianoNotes() {
    const loadPromises = Object.entries(this.noteToAudioMap).map(([note, url]) => 
      this.loadAudioFile(note, url)
    )
    
    try {
      await Promise.all(loadPromises)
      this.isLoaded = true
      console.log('All piano notes loaded successfully')
    } catch (error) {
      console.error('Failed to load piano notes:', error)
    }
  }

  public async loadAudioFile(name: string, url: string) {
    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.audioListener.context.decodeAudioData(arrayBuffer)
      this.audioBuffers.set(name, audioBuffer)
    } catch (error) {
      console.error(`Failed to load audio file ${name}:`, error)
    }
  }

  public playNote(noteId: number, position?: { x: number; y: number; z: number }, useAudioFile: boolean = true, octaveOffset: number = 0) {
    if (!this.isLoaded && useAudioFile) {
      console.warn('Audio files are not loaded yet')
      return
    }

    const note = getNoteById(noteId)
    if (!note) return

    this.stopNote(noteId)
    this.playAudioFileNote(note, position, octaveOffset)
  }

  private playAudioFileNote(note: Note, position?: { x: number; y: number; z: number }, octaveOffset: number = 0) {
    const buffer = this.audioBuffers.get(note.name)
    
    if (!buffer) {
      console.warn(`No audio file found for note ${note.name}`)
      return
    }

    if (this.useSpatialSound && position) {
      const positionalAudio = new PositionalAudio(this.audioListener)
      const source = positionalAudio.context.createBufferSource()
      source.buffer = buffer
      source.playbackRate.value = Math.pow(2, octaveOffset) // Transpose the octave
      
      positionalAudio.setVolume(this.volume)
      
      const audioMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      )
      audioMesh.position.set(position.x, position.y, position.z)
      this.scene.add(audioMesh)
      
      source.connect(positionalAudio.gain)
      positionalAudio.setNodeSource(source)
      audioMesh.add(positionalAudio)
      
      source.start()
      this.audioSources.set(note.id, positionalAudio)
    } else {
      const audio = new Audio(this.audioListener)
      const source = audio.context.createBufferSource()
      source.buffer = buffer
      source.playbackRate.value = Math.pow(2, octaveOffset) // Transpose the octave
      audio.setVolume(this.volume)
      
      source.connect(audio.gain)
      audio.gain.connect(this.audioListener.context.destination)
      
      source.start()
      this.audioSources.set(note.id, audio)
    }
  }


  public stopNote(noteId: number) {
    const audioSource = this.audioSources.get(noteId)
    if (audioSource) {
      if (audioSource instanceof PositionalAudio) {
        audioSource.stop()
        const mesh = audioSource.parent
        if (mesh) {
          this.scene.remove(mesh)
        }
      } else {
        audioSource.stop()
      }
      this.audioSources.delete(noteId)
    }
  }

  public cleanup() {
    this.audioSources.forEach(audioSource => {
      if (audioSource instanceof PositionalAudio) {
        audioSource.stop()
        const mesh = audioSource.parent
        if (mesh) {
          this.scene.remove(mesh)
        }
      } else {
        audioSource.stop()
      }
    })
    this.audioSources.clear()
  }

  public setSpatialSound(enabled: boolean) {
    this.useSpatialSound = enabled
  }
} 