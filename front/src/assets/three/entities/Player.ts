import * as THREE from 'three'
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js'
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
  private readonly POSITION_THRESHOLD = 0.01
  private lastUpdateTime = 0
  private readonly UPDATE_INTERVAL = 10
  private label: CSS3DObject
  private labelElement: HTMLDivElement

  constructor(
    private scene: THREE.Scene,
    private cssScene: THREE.Scene,
    private camera: THREE.PerspectiveCamera,
    private wsManager: WebSocketManager,
    private gameCode: string,
    private isLocal: boolean = false,
    private playerName: string = 'Player',
    private color: THREE.Color = new THREE.Color(0x00ff00)
  ) {
    this.id = Math.random().toString(36).slice(2)
    this.physics = new Physics()
    this.inputManager = new InputManager()
    
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({ color: this.color })
    this.mesh = new THREE.Mesh(geometry, material)
    scene.add(this.mesh)

    // Create CSS3D label
    this.labelElement = document.createElement('div')
    this.labelElement.className = 'player-label'
    this.labelElement.textContent = this.playerName
    this.labelElement.style.cssText = `
      color: white;
      font-family: Arial, sans-serif;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      background: rgba(0, 0, 0, 0.7);
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      pointer-events: none;
      user-select: none;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      transform-origin: center center;
    `

    this.label = new CSS3DObject(this.labelElement)
    this.label.position.set(0, 1, 0) // Position above the player
    this.label.scale.set(0.01, 0.01, 0.01) // Scale down the HTML element to fit 3D world
    this.cssScene.add(this.label)
    this.updateLabelPosition()

    if (isLocal) {
      this.wsManager.connect(gameCode, this.id, false)
      this.wsManager.onMessage(this.handleMessage.bind(this))
    }
  }

  private updateLabelPosition() {
    // Position the label above the player mesh
    this.label.position.copy(this.mesh.position)
    this.label.position.y += 1 // Offset above the player
    
    // Make the label always face the camera
    this.label.lookAt(this.camera.position)
  }

  public updateLabelOrientation() {
    // Public method to update label orientation from GameScene
    this.updateLabelPosition()
  }

  private handleMessage(msg: WebSocketMessage) {
    if (msg.type === 'state' && msg.id !== this.id) {
      this.mesh.position.set(...msg.position!)
      this.updateLabelPosition()
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
        // Ancien système désactivé - utilise maintenant le piano acoustique directement
        // this.handleInstrumentInput()
        
        // Gestion de déliaison avec Shift
        if (this.inputManager.wasKeyPressedThisFrame('ShiftLeft')) {
          this.unlinkInstrument()
        }
      } else {
        const movement = this.inputManager.getMovement()
        const shouldJump = this.inputManager.isJumpPressed()
        const newPosition = this.physics.update(movement, shouldJump)
        
        this.mesh.position.set(...newPosition)
        this.updateLabelPosition()
        
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
      'KeyQ': 'Q',
      'KeyW': 'W',
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
    this.updateLabelPosition()
  }

  public cleanup() {
    this.scene.remove(this.mesh)
    this.cssScene.remove(this.label)
    this.mesh.geometry.dispose()
    ;(this.mesh.material as THREE.Material).dispose()
    if (this.isLocal) {
      this.inputManager.cleanup()
    }
  }
} 