import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { WebSocketManager } from '../network/WebSocketManager'
import { Player } from '../entities/Player'
import { Instrument, type InstrumentType } from '../entities/Instrument'
import { AcousticPiano } from '../entities/AcousticPiano'
import { AcousticGuitar } from '../entities/AcousticGuitar'
import { ElectricPiano } from '../entities/ElectricPiano'
import { ElectricGuitar } from '../entities/ElectricGuitar'
import { ElectricBass } from '../entities/ElectricBass'
import { Saxophone } from '../entities/Saxophone'
import type { GameConfig, WebSocketMessage, Player as PlayerInfo } from '../types'
import { AudioManager } from '../audio/AudioManager'


export class GameScene {
  private scene: THREE.Scene
  private cssScene: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private cssRenderer!: CSS3DRenderer
  private composer!: EffectComposer
  private controls!: OrbitControls
  private wsManager!: WebSocketManager
  private localPlayer!: Player
  private otherPlayers: Map<string, Player> = new Map()
  private instruments: Instrument[] = []
  private running = true
  private ambientLight!: THREE.AmbientLight
  private directionalLight!: THREE.DirectionalLight
  private pointLights: THREE.PointLight[] = []
  private particles!: THREE.Points
  private particleSystem!: THREE.BufferGeometry
  private audioManager!: AudioManager

  constructor(private config: GameConfig) {
    this.scene = new THREE.Scene()
    this.cssScene = new THREE.Scene()
    this.setupEnvironment()

    this.setupCamera()
    this.setupRenderer()
    this.setupPostProcessing()
    this.setupCSS3DRenderer()
    this.setupLights()
    this.setupFloor()
    this.setupControls()
    this.setupRoom()
    this.setupParticles()

    this.wsManager = new WebSocketManager(undefined, undefined, config.logFn)
    this.localPlayer = new Player(this.scene, this.cssScene, this.camera, this.wsManager, config.gameCode, true, 'You')
    
    this.setupInstruments()
    this.setupWebSocketHandlers()
    this.setupResizeHandler()
    this.animate()
    this.setupVolumeSlider()
    this.setupKeyboardControls()
  }

  private setupEnvironment() {
    // Arrière-plan avec dégradé
    this.scene.background = new THREE.Color(0x1a1a2e)
    
    // Brouillard pour l'ambiance
    this.scene.fog = new THREE.Fog(0x1a1a2e, 10, 50)
  }

  private setupPostProcessing() {
    // Créer le composer pour les effets de post-processing
    this.composer = new EffectComposer(this.renderer)
    
    // Pass de rendu principal
    const renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass)
    
    // Effet Bloom pour les éléments lumineux
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.config.container.clientWidth, this.config.container.clientHeight),
      0.5,  // strength
      0.4,  // radius
      0.85  // threshold
    )
    this.composer.addPass(bloomPass)
    
    // Pass de sortie finale
    const outputPass = new OutputPass()
    this.composer.addPass(outputPass)
  }

  private setupRoom() {
    // Créer les murs de la pièce
    this.createWalls()
    
    // Ajouter du mobilier et des décorations
    this.addRoomDecorations()
  }

  private createWalls() {
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a3e,
      roughness: 0.8,
      metalness: 0.1
    })

    // Mur du fond
    const backWallGeometry = new THREE.PlaneGeometry(30, 15)
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial)
    backWall.position.set(0, 7.5, -15)
    this.scene.add(backWall)

    // Murs latéraux
    const sideWallGeometry = new THREE.PlaneGeometry(30, 15)
    
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial)
    leftWall.position.set(-15, 7.5, 0)
    leftWall.rotation.y = Math.PI / 2
    this.scene.add(leftWall)

    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial)
    rightWall.position.set(15, 7.5, 0)
    rightWall.rotation.y = -Math.PI / 2
    this.scene.add(rightWall)

    // Plafond
    const ceilingGeometry = new THREE.PlaneGeometry(30, 30)
    const ceilingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a2e,
      roughness: 0.9
    })
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial)
    ceiling.position.set(0, 15, 0)
    ceiling.rotation.x = Math.PI / 2
    this.scene.add(ceiling)
  }

  private addRoomDecorations() {
    // Ajouter des haut-parleurs dans les coins
    this.addSpeakers()
    
    // Ajouter un tapis central
    this.addCarpet()
    
    // Ajouter des panneaux acoustiques sur les murs
    this.addAcousticPanels()
    
    // Ajouter quelques plantes
    this.addPlants()
  }

  private addSpeakers() {
    const speakerGeometry = new THREE.BoxGeometry(1, 2, 1)
    const speakerMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x000000,
      roughness: 0.3,
      metalness: 0.7
    })

    const positions = [
      [-12, 1, -12],
      [12, 1, -12],
      [-12, 1, 12],
      [12, 1, 12]
    ]

    positions.forEach(pos => {
      const speaker = new THREE.Mesh(speakerGeometry, speakerMaterial)
      speaker.position.set(pos[0], pos[1], pos[2])
      this.scene.add(speaker)

      // Ajouter des détails (grille de haut-parleur)
      const grillGeometry = new THREE.CircleGeometry(0.3, 16)
      const grillMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        metalness: 0.5
      })
      const grill = new THREE.Mesh(grillGeometry, grillMaterial)
      grill.position.copy(speaker.position)
      grill.position.z += 0.51
      this.scene.add(grill)
    })
  }

  private addCarpet() {
    const carpetGeometry = new THREE.CircleGeometry(8, 32)
    const carpetMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      roughness: 1.0,
      metalness: 0.0
    })
    const carpet = new THREE.Mesh(carpetGeometry, carpetMaterial)
    carpet.rotation.x = -Math.PI / 2
    carpet.position.y = -0.49
    this.scene.add(carpet)
  }

  private addAcousticPanels() {
    const panelGeometry = new THREE.BoxGeometry(2, 2, 0.2)
    const panelMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4a4a6a,
      roughness: 0.9
    })

    // Panneaux sur le mur du fond
    for (let i = -2; i <= 2; i++) {
      for (let j = 0; j < 2; j++) {
        const panel = new THREE.Mesh(panelGeometry, panelMaterial)
        panel.position.set(i * 3, 3 + j * 3, -14.9)
        this.scene.add(panel)
      }
    }
  }

  private addPlants() {
    const potGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.6, 8)
    const potMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 })
    
    const leafGeometry = new THREE.SphereGeometry(0.4, 8, 6)
    const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 })

    const plantPositions = [
      [-10, 0, -10],
      [10, 0, -10],
      [-10, 0, 10],
      [10, 0, 10]
    ]

    plantPositions.forEach(pos => {
      // Pot
      const pot = new THREE.Mesh(potGeometry, potMaterial)
      pot.position.set(pos[0], 0.3, pos[2])
      this.scene.add(pot)

      // Feuillage
      const leaves = new THREE.Mesh(leafGeometry, leafMaterial)
      leaves.position.set(pos[0], 1, pos[2])
      leaves.scale.set(1, 1.5, 1)
      this.scene.add(leaves)
    })
  }

  private setupInstruments() {
    // Créer l'AudioManager
    this.audioManager = new AudioManager(this.scene, this.camera)
    
    const instrumentConfigs: Array<{
      position: [number, number, number]
      type: InstrumentType
      name: string
    }> = [
      // Rangée du fond
      { position: [-8, 0.5, -6], type: 'acoustic_piano', name: 'Piano Acoustique' },
      { position: [-4, 0.5, -6], type: 'electric_piano', name: 'Piano Électrique' },
      { position: [0, 0.5, -6], type: 'synthesizer', name: 'Synthétiseur' },
      { position: [4, 0.5, -6], type: 'drums', name: 'Batterie' },
      { position: [8, 0.5, -6], type: 'violin', name: 'Violon' },
      
      // Rangée centrale  
      { position: [-6, 0.5, 0], type: 'acoustic_guitar', name: 'Guitare Acoustique' },
      { position: [-2, 0.5, 0], type: 'electric_guitar', name: 'Guitare Électrique' },
      { position: [2, 0.5, 0], type: 'electric_bass', name: 'Basse Électrique' },
      { position: [6, 0.5, 0], type: 'sax', name: 'Saxophone' },
      
      // Piano principal au centre avant
      { position: [0, 0.5, 4], type: 'piano', name: 'Piano Principal' }
    ]

    instrumentConfigs.forEach((config, index) => {
      let instrument: Instrument
      
      switch (config.type) {
        case 'acoustic_piano':
          instrument = new AcousticPiano(this.scene, this.cssScene, this.camera, this.wsManager, this.config.gameCode, `instrument_${index}`, config.position)
          break
        case 'acoustic_guitar':
          instrument = new AcousticGuitar(this.scene, this.cssScene, this.camera, this.wsManager, this.config.gameCode, `instrument_${index}`, config.position)
          break
        case 'electric_piano':
          instrument = new ElectricPiano(this.scene, this.cssScene, this.camera, this.wsManager, this.config.gameCode, `instrument_${index}`, config.position)
          break
        case 'electric_guitar':
          instrument = new ElectricGuitar(this.scene, this.cssScene, this.camera, this.wsManager, this.config.gameCode, `instrument_${index}`, config.position)
          break
        case 'electric_bass':
          instrument = new ElectricBass(this.scene, this.cssScene, this.camera, this.wsManager, this.config.gameCode, `instrument_${index}`, config.position)
          break
        case 'sax':
          instrument = new Saxophone(this.scene, this.cssScene, this.camera, this.wsManager, this.config.gameCode, `instrument_${index}`, config.position)
          break
        default:
          instrument = new Instrument(
            this.scene,
            this.cssScene,
            this.camera,
            this.wsManager,
            this.config.gameCode,
            `instrument_${index}`,
            config.position,
            config.name,
            new THREE.Color(0x8B4513)
          )
      }
      
      // Associer l'AudioManager à l'instrument
      instrument.setAudioManager(this.audioManager)
      
      this.instruments.push(instrument)
    })
  }

  private setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.config.container.clientWidth / this.config.container.clientHeight,
      0.1,
      1000
    )
    this.camera.position.set(8, 6, 10)
  }

  private setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    this.renderer.setSize(this.config.container.clientWidth, this.config.container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.config.container.appendChild(this.renderer.domElement)
  }

  private setupCSS3DRenderer() {
    this.cssRenderer = new CSS3DRenderer()
    this.cssRenderer.setSize(this.config.container.clientWidth, this.config.container.clientHeight)
    this.cssRenderer.domElement.style.position = 'absolute'
    this.cssRenderer.domElement.style.top = '0'
    this.cssRenderer.domElement.style.left = '0'
    this.cssRenderer.domElement.style.pointerEvents = 'none'
    this.config.container.appendChild(this.cssRenderer.domElement)
  }

  private setupLights() {
    // Lumière ambiante plus douce
    this.ambientLight = new THREE.AmbientLight(0x404080, 0.4)
    this.scene.add(this.ambientLight)

    // Lumière directionnelle principale
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    this.directionalLight.position.set(5, 15, 5)
    this.directionalLight.castShadow = true
    this.directionalLight.shadow.mapSize.width = 2048
    this.directionalLight.shadow.mapSize.height = 2048
    this.directionalLight.shadow.camera.near = 0.5
    this.directionalLight.shadow.camera.far = 50
    this.directionalLight.shadow.camera.left = -20
    this.directionalLight.shadow.camera.right = 20
    this.directionalLight.shadow.camera.top = 20
    this.directionalLight.shadow.camera.bottom = -20
    this.scene.add(this.directionalLight)

    // Lumières colorées pour l'ambiance
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7]
    const positions = [
      [6, 4, 6],
      [-6, 4, 6],
      [6, 4, -6],
      [-6, 4, -6],
      [0, 6, 0]
    ]

    positions.forEach((pos, index) => {
      const pointLight = new THREE.PointLight(colors[index], 0.5, 10, 2)
      pointLight.position.set(pos[0], pos[1], pos[2])
      pointLight.castShadow = true
      this.scene.add(pointLight)
      this.pointLights.push(pointLight)
    })

    // Effet de lumière qui pulse
    this.animateLights()
  }

  private animateLights() {
    const animateLight = () => {
      if (!this.running) return

      const time = Date.now() * 0.001
      this.pointLights.forEach((light, index) => {
        const offset = index * Math.PI * 0.4
        light.intensity = 0.3 + 0.2 * Math.sin(time + offset)
        
        // Légère oscillation de position
        const originalY = [4, 4, 4, 4, 6][index]
        light.position.y = originalY + 0.5 * Math.sin(time * 0.5 + offset)
      })

      requestAnimationFrame(animateLight)
    }
    animateLight()
  }

  private setupFloor() {
    const floorGeometry = new THREE.PlaneGeometry(30, 30)
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2c2c54,
      roughness: 0.8,
      metalness: 0.2
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.5
    floor.receiveShadow = true
    this.scene.add(floor)

    // Motif sur le sol
    const patternGeometry = new THREE.RingGeometry(0.5, 0.6, 8)
    const patternMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x40407a,
      transparent: true,
      opacity: 0.6
    })

    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (i === 0 && j === 0) continue // Skip center
        const pattern = new THREE.Mesh(patternGeometry, patternMaterial)
        pattern.position.set(i * 4, -0.48, j * 4)
        pattern.rotation.x = -Math.PI / 2
        this.scene.add(pattern)
      }
    }
  }

  private setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.maxDistance = 20
    this.controls.minDistance = 3
    this.controls.maxPolarAngle = Math.PI / 2.2
  }

  private setupWebSocketHandlers() {
    this.wsManager.onMessage((msg: WebSocketMessage) => {
      if (msg.type === 'player_info' && msg.players) {
        this.handlePlayerInfo(msg.players)
      } else if (msg.type === 'join' && msg.id !== this.localPlayer.getId()) {
        this.createOtherPlayer(msg.id)
        this.showPlayerNotification(`${msg.id.slice(0, 6)} a rejoint la partie`, 'join')
        this.createJoinEffect()
      } else if (msg.type === 'leave' && msg.id !== this.localPlayer.getId()) {
        this.removeOtherPlayer(msg.id)
        this.showPlayerNotification(`${msg.id.slice(0, 6)} a quitté la partie`, 'leave')
      } else if (msg.type === 'state' && msg.id !== this.localPlayer.getId() && msg.position) {
        const player = this.otherPlayers.get(msg.id)
        if (player) {
          player.setPosition(msg.position)
        }
      }
    })
  }

  private handlePlayerInfo(players: PlayerInfo[]) {
    this.otherPlayers.forEach(player => player.cleanup())
    this.otherPlayers.clear()

    players.forEach(player => {
      if (player.id !== this.localPlayer.getId()) {
        this.createOtherPlayer(player.id, player.position)
      }
    })
  }

  private createOtherPlayer(id: string, initialPosition?: [number, number, number]) {
    const player = new Player(this.scene, this.cssScene, this.camera, this.wsManager, this.config.gameCode, false, `Player ${id.slice(0, 6)}`)
    if (initialPosition) {
      player.setPosition(initialPosition)
    }
    this.otherPlayers.set(id, player)
  }

  private removeOtherPlayer(id: string) {
    const player = this.otherPlayers.get(id)
    if (player) {
      player.cleanup()
      this.otherPlayers.delete(id)
    }
  }

  private setupResizeHandler() {
    const onResize = () => {
      const width = this.config.container.clientWidth
      const height = this.config.container.clientHeight
      
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      
      this.renderer.setSize(width, height)
      this.composer.setSize(width, height)
      this.cssRenderer.setSize(width, height)
    }
    window.addEventListener('resize', onResize)
  }

  private setupParticles() {
    const particleCount = 100
    this.particleSystem = new THREE.BufferGeometry()
    
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    
    const colorPalette = [
      new THREE.Color(0xff6b6b),
      new THREE.Color(0x4ecdc4),
      new THREE.Color(0x45b7d1),
      new THREE.Color(0x96ceb4),
      new THREE.Color(0xffeaa7)
    ]
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Position aléatoire dans la pièce
      positions[i3] = (Math.random() - 0.5) * 25     // x
      positions[i3 + 1] = Math.random() * 12 + 2     // y
      positions[i3 + 2] = (Math.random() - 0.5) * 25 // z
      
      // Couleur aléatoire
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
      
      // Taille aléatoire
      sizes[i] = Math.random() * 3 + 1
    }
    
    this.particleSystem.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.particleSystem.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    this.particleSystem.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    })
    
    this.particles = new THREE.Points(this.particleSystem, particleMaterial)
    this.scene.add(this.particles)
  }

  private animateParticles() {
    if (!this.particles) return
    
    const positions = this.particleSystem.attributes.position.array as Float32Array
    const time = Date.now() * 0.001
    
    for (let i = 0; i < positions.length; i += 3) {
      // Mouvement flottant
      positions[i + 1] += Math.sin(time + i) * 0.01     // y movement
      positions[i] += Math.cos(time + i * 0.1) * 0.005  // x movement
      positions[i + 2] += Math.sin(time + i * 0.05) * 0.005 // z movement
      
      // Reset particle if it goes too high
      if (positions[i + 1] > 14) {
        positions[i + 1] = 2
      }
    }
    
    this.particleSystem.attributes.position.needsUpdate = true
    
    // Rotation lente des particules
    this.particles.rotation.y += 0.001
  }

  private animate() {
    if (!this.running) return

    this.localPlayer.update(this.instruments)
    this.otherPlayers.forEach(player => player.update(this.instruments))
    
    // Update label orientations to face camera
    this.localPlayer.updateLabelOrientation()
    this.otherPlayers.forEach(player => player.updateLabelOrientation())
    this.instruments.forEach(instrument => instrument.updateLabelOrientation())
    
    // Animate particles
    this.animateParticles()
    
    this.controls.update()
    
    // Render avec post-processing
    this.cssRenderer.render(this.cssScene, this.camera)
    this.composer.render()
    
    requestAnimationFrame(this.animate.bind(this))
  }

  public cleanup() {
    this.running = false
    this.localPlayer.cleanup()
    this.otherPlayers.forEach(player => player.cleanup())
    this.instruments.forEach(instrument => instrument.cleanup())
    this.controls.dispose()
    this.renderer.dispose()
    this.composer.dispose()
    
    // Clean up particles
    if (this.particles) {
      this.scene.remove(this.particles)
      this.particleSystem.dispose()
    }
    
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }
    if (this.cssRenderer.domElement.parentNode) {
      this.cssRenderer.domElement.parentNode.removeChild(this.cssRenderer.domElement)
    }
    this.wsManager.close()
  }

  // add event listener for volume slider
  private setupVolumeSlider() {
    const volumeSlider = document.getElementById('volume-slider')
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement
        this.instruments.forEach(instrument => instrument.setVolume(Number(target.value)))
      })
    }
  }

  private showPlayerNotification(message: string, type: 'join' | 'leave') {
    // Créer une notification 3D flottante
    const notificationDiv = document.createElement('div')
    notificationDiv.textContent = message
    notificationDiv.style.cssText = `
      color: ${type === 'join' ? '#00ff88' : '#ff6b6b'};
      font-family: Arial, sans-serif;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      background: rgba(0, 0, 0, 0.8);
      padding: 8px 12px;
      border-radius: 8px;
      border: 2px solid ${type === 'join' ? '#00ff88' : '#ff6b6b'};
      box-shadow: 0 0 20px ${type === 'join' ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 107, 107, 0.5)'};
      pointer-events: none;
      user-select: none;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      transform-origin: center center;
      transition: all 0.3s ease;
    `

    const notification = new CSS3DObject(notificationDiv)
    notification.position.set(0, 8, 0)
    notification.scale.set(0.02, 0.02, 0.02)
    this.cssScene.add(notification)

    // Animation de la notification
    this.animateNotification(notification)
  }

  private animateNotification(notification: CSS3DObject) {
    const startTime = Date.now()
    const duration = 3000 // 3 secondes
    const initialY = notification.position.y
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / duration
      
      if (progress >= 1) {
        this.cssScene.remove(notification)
        return
      }
      
      // Mouvement vers le haut
      notification.position.y = initialY + progress * 3
      
      // Fade out dans les dernières 30%
      if (progress > 0.7) {
        const fadeProgress = (progress - 0.7) / 0.3
        const element = notification.element as HTMLElement
        element.style.opacity = (1 - fadeProgress).toString()
      }
      
      // Oscillation légère
      notification.position.x = Math.sin(elapsed * 0.005) * 0.5
      
      // Toujours faire face à la caméra
      notification.lookAt(this.camera.position)
      
      requestAnimationFrame(animate)
    }
    
    animate()
  }

  private createJoinEffect() {
    // Créer un effet de cercle qui s'étend
    const ringGeometry = new THREE.RingGeometry(0.1, 0.2, 32)
    const ringMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff88,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    })
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.position.set(0, 0.1, 0)
    ring.rotation.x = -Math.PI / 2
    this.scene.add(ring)
    
    // Animation de l'effet
    const startTime = Date.now()
    const duration = 2000
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / duration
      
      if (progress >= 1) {
        this.scene.remove(ring)
        ringGeometry.dispose()
        ringMaterial.dispose()
        return
      }
      
      // Expansion du cercle
      const scale = 1 + progress * 10
      ring.scale.set(scale, scale, scale)
      
      // Fade out
      ringMaterial.opacity = 0.8 * (1 - progress)
      
      requestAnimationFrame(animate)
    }
    
    animate()
  }

  private setupKeyboardControls() {
    // Écouter les événements de clavier
    document.addEventListener('keydown', (event) => {
      this.handleKeyDown(event)
    })
    
    document.addEventListener('keyup', (event) => {
      this.handleKeyUp(event)
    })
  }

  private handleKeyDown(event: KeyboardEvent) {
    // Empêcher la propagation pour éviter les conflits
    event.preventDefault()
    
    // Gestion de la pédale sustain pour piano (Barre d'espace)
    if (event.code === 'Space') {
      for (const instrument of this.instruments) {
        if ((instrument as any).linkedPlayerId && (instrument as any).setSustainPedal) {
          (instrument as any).setSustainPedal(true)
          break
        }
      }
      return
    }
    
    // Système unifié : tous les instruments utilisent les mêmes touches
    // Seul l'instrument lié au joueur jouera
    if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
      // Chercher l'instrument lié au joueur local
      for (const instrument of this.instruments) {
        if ((instrument as any).linkedPlayerId && (instrument as any).handleKeyDown) {
          (instrument as any).handleKeyDown(event.code)
          break // Arrêter après avoir trouvé l'instrument lié
        }
      }
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    // Empêcher la propagation pour éviter les conflits
    event.preventDefault()
    
    // Gestion de la pédale sustain pour piano (Barre d'espace)
    if (event.code === 'Space') {
      for (const instrument of this.instruments) {
        if ((instrument as any).linkedPlayerId && (instrument as any).setSustainPedal) {
          (instrument as any).setSustainPedal(false)
          break
        }
      }
      return
    }
    
    // Système unifié pour le keyup
    if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
      // Chercher l'instrument lié au joueur local
      for (const instrument of this.instruments) {
        if ((instrument as any).linkedPlayerId && (instrument as any).handleKeyUp) {
          (instrument as any).handleKeyUp(event.code)
          break // Arrêter après avoir trouvé l'instrument lié
        }
      }
    }
  }
} 