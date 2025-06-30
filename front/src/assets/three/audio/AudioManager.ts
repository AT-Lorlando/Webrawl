import { getNoteById, type Note } from './Notes'
import { Audio, AudioListener, PositionalAudio, Camera } from 'three'
import * as THREE from 'three'
import { Scene } from 'three'

export class AudioManager {
  // Volume constant (0.0 to 1.0)
  private volume: number = 0.1
  private audioListener: AudioListener
  private oscillators: Map<number, OscillatorNode> = new Map()
  private audioSources: Map<number, Audio | PositionalAudio> = new Map()
  private scene: Scene
  private audioBuffers: Map<string, AudioBuffer> = new Map()
  private isLoaded: boolean = false

  constructor(scene: Scene, camera: Camera) {
    this.scene = scene
    this.audioListener = new AudioListener()
    camera.add(this.audioListener)
  }

  public setVolume(volume: number) {
    this.volume = volume
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

  public async loadSound(noteName: string, url: string): Promise<void> {
    return this.loadAudioFile(noteName, url)
  }

  public hasSoundLoaded(noteName: string): boolean {
    return this.audioBuffers.has(noteName)
  }

  public playNote(noteId: number, position?: { x: number; y: number; z: number }, useAudioFile: boolean = true, octaveOffset: number = 0) {
    const note = getNoteById(noteId)
    if (!note) return

    this.stopNote(noteId)
    this.playAudioFileNote(note, position, octaveOffset)
  }

  private playAudioFileNote(note: Note, position?: { x: number; y: number; z: number }, octaveOffset: number = 0) {
    let buffer = this.audioBuffers.get(note.name)
    
    // Fallback: essayer de trouver un son de piano de base si le son spécifique n'existe pas
    if (!buffer) {
      // Essayer avec les sons de piano de base mappés par touche
      const keyToNoteMap: { [key: string]: string } = {
        'Q': 'Q', 'W': 'W', 'E': 'E', 'R': 'R', 'T': 'T',
        'Y': 'Y', 'U': 'U', 'I': 'I', 'O': 'O', 'P': 'P'
      }
      
      // Essayer de trouver une correspondance dans les sons de piano de base
      for (const [key, mappedNote] of Object.entries(keyToNoteMap)) {
        buffer = this.audioBuffers.get(mappedNote)
        if (buffer) {
          console.warn(`🎵 Utilisation du son fallback ${mappedNote} pour ${note.name}`)
          break
        }
      }
      
      if (!buffer) {
        console.warn(`❌ Aucun son trouvé pour ${note.name} (ni fallback)`)
        return
      }
    }
    
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
} 