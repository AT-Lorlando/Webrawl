import { getNoteById, type Note } from './Notes'
import { Audio, AudioListener, PositionalAudio, Camera } from 'three'
import * as THREE from 'three'
import { Scene } from 'three'

export class AudioManager {
  private audioListener: AudioListener
  private oscillators: Map<number, OscillatorNode> = new Map()
  private audioSources: Map<number, Audio | PositionalAudio> = new Map()
  private scene: Scene
  private useSpatialSound: boolean

  constructor(scene: Scene, camera: Camera, useSpatialSound: boolean = false) {
    this.scene = scene
    this.useSpatialSound = useSpatialSound
    this.audioListener = new AudioListener()
    camera.add(this.audioListener)
  }

  public playNote(noteId: number, position?: { x: number; y: number; z: number }) {
    const note = getNoteById(noteId)
    if (!note) return

    this.stopNote(noteId)

    const oscillator = this.audioListener.context.createOscillator()
    const gainNode = this.audioListener.context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = note.frequency

    gainNode.gain.setValueAtTime(0, this.audioListener.context.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioListener.context.currentTime + 0.01)
    gainNode.gain.linearRampToValueAtTime(0.2, this.audioListener.context.currentTime + 0.1)
    gainNode.gain.linearRampToValueAtTime(0.2, this.audioListener.context.currentTime + 0.5)
    gainNode.gain.linearRampToValueAtTime(0, this.audioListener.context.currentTime + 1)

    if (this.useSpatialSound && position) {
      // Create a positional audio source
      const positionalAudio = new PositionalAudio(this.audioListener)
      const source = positionalAudio.context.createOscillator()
      source.type = 'sine'
      source.frequency.value = note.frequency
      
      // Create a mesh to hold the audio source
      const audioMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      )
      audioMesh.position.set(position.x, position.y, position.z)
      this.scene.add(audioMesh)
      
      // Connect the audio
      source.connect(positionalAudio.gain)
      positionalAudio.setNodeSource(source)
      audioMesh.add(positionalAudio)
      
      source.start()
      this.audioSources.set(noteId, positionalAudio)
    } else {
      // Regular non-spatial audio
      const audio = new Audio(this.audioListener)
      const source = audio.context.createOscillator()
      source.type = 'sine'
      source.frequency.value = note.frequency
      
      source.connect(gainNode)
      gainNode.connect(this.audioListener.context.destination)
      
      source.start()
      this.audioSources.set(noteId, audio)
    }

    setTimeout(() => {
      this.stopNote(noteId)
    }, 1000)
  }

  public stopNote(noteId: number) {
    const audioSource = this.audioSources.get(noteId)
    if (audioSource) {
      if (audioSource instanceof PositionalAudio) {
        audioSource.stop()
        // Remove the mesh from the scene
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