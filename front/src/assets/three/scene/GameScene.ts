import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { WebSocketManager } from '../network/WebSocketManager'
import { Player } from '../entities/Player'
import type { GameConfig } from '../types'

export class GameScene {
  private scene: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private controls!: OrbitControls
  private wsManager!: WebSocketManager
  private localPlayer!: Player
  private otherPlayers: Map<string, Player> = new Map()
  private running = true

  constructor(private config: GameConfig) {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x222222)

    this.setupCamera()
    this.setupRenderer()
    this.setupLights()
    this.setupFloor()
    this.setupControls()

    this.wsManager = new WebSocketManager(undefined, undefined, config.logFn)
    this.localPlayer = new Player(this.scene, this.wsManager, config.gameCode, true)
    
    this.setupWebSocketHandlers()
    this.setupResizeHandler()
    this.animate()
  }

  private setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.config.container.clientWidth / this.config.container.clientHeight,
      0.1,
      1000
    )
    this.camera.position.set(2, 2, 5)
  }

  private setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(this.config.container.clientWidth, this.config.container.clientHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.config.container.appendChild(this.renderer.domElement)
  }

  private setupLights() {
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(5, 10, 7.5)
    this.scene.add(light)
  }

  private setupFloor() {
    const floorGeometry = new THREE.PlaneGeometry(20, 20)
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.5
    this.scene.add(floor)
  }

  private setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
  }

  private setupWebSocketHandlers() {
    this.wsManager.onMessage((msg) => {
      if (msg.type === 'join' && msg.id !== this.localPlayer.getId()) {
        const newPlayer = new Player(this.scene, this.wsManager, this.config.gameCode, false)
        this.otherPlayers.set(msg.id, newPlayer)
      } else if (msg.type === 'leave' && msg.id !== this.localPlayer.getId()) {
        const player = this.otherPlayers.get(msg.id)
        if (player) {
          player.cleanup()
          this.otherPlayers.delete(msg.id)
        }
      }
    })
  }

  private setupResizeHandler() {
    const onResize = () => {
      this.camera.aspect = this.config.container.clientWidth / this.config.container.clientHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(this.config.container.clientWidth, this.config.container.clientHeight)
    }
    window.addEventListener('resize', onResize)
  }

  private animate() {
    if (!this.running) return

    this.localPlayer.update()
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this.animate.bind(this))
  }

  public cleanup() {
    this.running = false
    this.localPlayer.cleanup()
    this.otherPlayers.forEach(player => player.cleanup())
    this.controls.dispose()
    this.renderer.dispose()
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }
    this.wsManager.close()
  }
} 