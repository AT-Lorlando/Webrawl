import * as THREE from 'three'
import { Physics } from '../physics/Physics'
import { InputManager } from '../controls/InputManager'
import { WebSocketManager } from '../network/WebSocketManager'
import type { WebSocketMessage } from '../types'

export class Player {
  private mesh: THREE.Mesh
  private physics: Physics
  private inputManager: InputManager
  private id: string

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
    if (msg.type === 'state' && msg.id !== this.id && msg.position) {
      this.mesh.position.set(...msg.position)
    }
  }

  public update() {
    if (this.isLocal) {
      const movement = this.inputManager.getMovement()
      const shouldJump = this.inputManager.isJumpPressed()
      const newPosition = this.physics.update(movement, shouldJump)
      
      this.mesh.position.set(...newPosition)
      
      // Send state update
      this.wsManager.send({
        type: 'state',
        id: this.id,
        gameCode: this.gameCode,
        position: newPosition
      })
    }
  }

  public getId(): string {
    return this.id
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