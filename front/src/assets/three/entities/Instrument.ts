import * as THREE from 'three'
import { WebSocketManager } from '../network/WebSocketManager'
import type { WebSocketMessage } from '../types'
import { AudioManager } from '../audio/AudioManager'
import { getNoteIdByName } from '../audio/Notes'

export class Instrument {
  private mesh: THREE.Mesh
  private linkedPlayerId: string | null = null
  private readonly interactionDistance = 2
  private audioManager: AudioManager
  private messageHandler: ((msg: WebSocketMessage) => void) | null = null
  private unsubscribe: (() => void) | null = null

  constructor(
    private scene: THREE.Scene,
    private camera: THREE.PerspectiveCamera,
    private wsManager: WebSocketManager,
    private gameCode: string,
    private id: string,
    position: [number, number, number],
    private color: THREE.Color = new THREE.Color(0x8B4513)
  ) {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32)
    const material = new THREE.MeshStandardMaterial({ color: this.color })
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.set(...position)
    scene.add(this.mesh)

    this.audioManager = new AudioManager(scene, this.camera, true)
    this.setupMessageHandler()
  }

  private setupMessageHandler() {
    this.messageHandler = (msg: WebSocketMessage) => {
      if (msg.type === 'instrument_note' && 
          msg.instrumentId === this.id && 
          msg.noteId !== undefined) {
        this.audioManager.playNote(msg.noteId)
      }
    }
    this.unsubscribe = this.wsManager.onMessage(this.messageHandler)
  }

  public isPlayerInRange(playerPosition: [number, number, number]): boolean {
    const distance = Math.sqrt(
      Math.pow(playerPosition[0] - this.mesh.position.x, 2) +
      Math.pow(playerPosition[2] - this.mesh.position.z, 2)
    )
    return distance <= this.interactionDistance
  }

  public linkPlayer(playerId: string) {
    if (this.linkedPlayerId === null) {
      this.linkedPlayerId = playerId
      console.log(`Joueur ${playerId} lié à l'instrument ${this.id}`)
    }
  }

  public unlinkPlayer() {
    if (this.linkedPlayerId !== null) {
      console.log(`Joueur ${this.linkedPlayerId} délié de l'instrument ${this.id}`)
      this.linkedPlayerId = null
    }
  }

  public isLinkedToPlayer(playerId: string): boolean {
    return this.linkedPlayerId === playerId
  }

  public playNote(noteName: string) {
    if (this.linkedPlayerId) {
      const noteId = getNoteIdByName(noteName)
      if (noteId !== undefined) {
        this.wsManager.send({
          type: 'instrument_note',
          id: this.linkedPlayerId,
          instrumentId: this.id,
          noteId,
          gameCode: this.gameCode
        })
      }
    }
  }

  public cleanup() {
    this.scene.remove(this.mesh)
    this.mesh.geometry.dispose()
    ;(this.mesh.material as THREE.Material).dispose()
    this.audioManager.cleanup()
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
  }
} 