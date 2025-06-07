import * as THREE from 'three'
import { Physics } from '../physics/Physics'
import { InputManager } from '../controls/InputManager'
import { WebSocketManager } from '../network/WebSocketManager'
import type { WebSocketMessage } from '../types'
import { Instrument } from './Instrument'

export class Player {
  private mesh: THREE.Mesh
  private physics: Physics
  private inputManager: InputManager
  private id: string
  private linkedInstrument: Instrument | null = null
  private lastSentPosition: [number, number, number] = [0, 0, 0]
  private readonly POSITION_THRESHOLD = 0.001
  private lastUpdateTime = 0
  private readonly UPDATE_INTERVAL = 10

  constructor(
    private scene: THREE.Scene,
    private wsManager: WebSocketManager,
    private gameCode: string,
    private isLocal: boolean = false,
    private color: THREE.Color = new THREE.Color(0x00ff00)
  ) {
    this.id = Math.random().toString(36).slice(2)
    this.physics = new Physics()
    this.inputManager = new InputManager()
    
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({ color: this.color })
    this.mesh = new THREE.Mesh(geometry, material)
    scene.add(this.mesh)

    if (isLocal) {
      this.wsManager.connect(gameCode, this.id, false)
      this.wsManager.onMessage(this.handleMessage.bind(this))
    }
  }

  private handleMessage(msg: WebSocketMessage) {
    if (msg.type === 'state' && msg.id !== this.id) {
      this.mesh.position.set(...msg.position!)
    }
  }

  private shouldSendUpdate(newPosition: [number, number, number]): boolean {
    const now = Date.now()
    if (now - this.lastUpdateTime < this.UPDATE_INTERVAL) {
      return false
    }

    const dx = Math.abs(newPosition[0] - this.lastSentPosition[0])
    const dy = Math.abs(newPosition[1] - this.lastSentPosition[1])
    const dz = Math.abs(newPosition[2] - this.lastSentPosition[2])

    return dx > this.POSITION_THRESHOLD || 
           dy > this.POSITION_THRESHOLD || 
           dz > this.POSITION_THRESHOLD
  }

  public update(instruments: Instrument[]) {
    if (this.isLocal) {
      if (this.linkedInstrument) {
        this.handleInstrumentInput()
      } else {
        const movement = this.inputManager.getMovement()
        const shouldJump = this.inputManager.isJumpPressed()
        const newPosition = this.physics.update(movement, shouldJump)
        
        this.mesh.position.set(...newPosition)
        
        if (this.inputManager.wasKeyPressedThisFrame('ShiftLeft')) {
          const nearbyInstrument = instruments.find(instrument => 
            instrument.isPlayerInRange(newPosition) && !instrument.isLinkedToPlayer(this.id)
          )
          if (nearbyInstrument) {
            this.linkInstrument(nearbyInstrument)
          }
        }

        if (this.shouldSendUpdate(newPosition)) {
          this.wsManager.send({
            type: 'state',
            id: this.id,
            gameCode: this.gameCode,
            position: newPosition
          })
          this.lastSentPosition = [...newPosition]
          this.lastUpdateTime = Date.now()
        }
      }

      this.inputManager.clearKeyPressedThisFrame()
    }
  }

  private handleInstrumentInput() {
    const noteMap: Record<string, string> = {
      'KeyA': 'A',
      'KeyZ': 'Z',
      'KeyE': 'E',
      'KeyR': 'R',
      'KeyT': 'T',
      'KeyY': 'Y',
      'KeyU': 'U',
      'KeyI': 'I',
      'KeyO': 'O',
      'KeyP': 'P'
    }

    if (this.inputManager.wasKeyPressedThisFrame('ShiftLeft')) {
      this.unlinkInstrument()
      return
    }

    for (const [key, note] of Object.entries(noteMap)) {
      if (this.inputManager.wasKeyPressedThisFrame(key)) {
        this.linkedInstrument?.playNote(note)
      }
    }
  }

  public linkInstrument(instrument: Instrument) {
    this.linkedInstrument = instrument
    instrument.linkPlayer(this.id)
  }

  public unlinkInstrument() {
    if (this.linkedInstrument) {
      this.linkedInstrument.unlinkPlayer()
      this.linkedInstrument = null
    }
  }

  public getId(): string {
    return this.id
  }

  public getPosition(): [number, number, number] {
    return [
      this.mesh.position.x,
      this.mesh.position.y,
      this.mesh.position.z
    ]
  }

  public setPosition(position: [number, number, number]) {
    this.mesh.position.set(...position)
  }

  public cleanup() {
    this.scene.remove(this.mesh)
    this.mesh.geometry.dispose()
    ;(this.mesh.material as THREE.Material).dispose()
    if (this.isLocal) {
      this.inputManager.cleanup()
    }
  }
} 