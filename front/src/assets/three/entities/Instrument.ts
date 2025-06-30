import * as THREE from 'three'
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js'
import { WebSocketManager } from '../network/WebSocketManager'
import type { WebSocketMessage } from '../types'
import { AudioManager } from '../audio/AudioManager'
import { getNoteIdByName } from '../audio/Notes'

export type InstrumentType = 'piano' | 'guitar' | 'drums' | 'synthesizer' | 'violin' | 'acoustic_piano' | 'acoustic_guitar' | 'electric_piano' | 'electric_guitar' | 'electric_bass' | 'sax'

export class Instrument {
  protected mesh: THREE.Mesh
  protected linkedPlayerId: string | null = null
  protected readonly interactionDistance = 2.5
  protected audioManager!: AudioManager
  protected messageHandler: ((msg: WebSocketMessage) => void) | null = null
  protected unsubscribe: (() => void) | null = null
  protected label!: CSS3DObject
  protected labelElement!: HTMLDivElement
  protected instrumentType!: InstrumentType
  protected originalScale!: THREE.Vector3
  protected originalPosition!: THREE.Vector3
  protected noteParticles: THREE.Points[] = []
  protected isAnimating = false
  protected activeNotes: Map<string, { audio: HTMLAudioElement, noteName: string }> = new Map()
  protected pressedKeys: Set<string> = new Set()

  constructor(
    protected scene: THREE.Scene,
    protected cssScene: THREE.Scene,
    protected camera: THREE.PerspectiveCamera,
    protected wsManager: WebSocketManager,
    protected gameCode: string,
    protected id: string,
    position: [number, number, number],
    protected instrumentName: string = 'Instrument',
    protected color: THREE.Color = new THREE.Color(0x8B4513)
  ) {
    this.mesh = this.createInstrumentMesh()
    this.mesh.position.set(...position)
    this.originalScale = this.mesh.scale.clone()
    this.originalPosition = this.mesh.position.clone()
    scene.add(this.mesh)

    this.createLabel()
    this.setupMessageHandler()
    this.startIdleAnimation()
  }

  protected createInstrumentMesh(): THREE.Mesh {
    // Géométrie simple - sera remplacée par des modèles 3D
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({ 
      color: this.color,
      roughness: 0.3,
      metalness: 0.1
    })

    return new THREE.Mesh(geometry, material)
  }

  private startIdleAnimation() {
    const animateIdle = () => {
      if (!this.isAnimating && !this.linkedPlayerId) {
        const time = Date.now() * 0.001
        this.mesh.rotation.y = Math.sin(time * 0.5) * 0.1
        this.mesh.position.y = this.originalPosition.y + Math.sin(time * 2) * 0.02
      }
      requestAnimationFrame(animateIdle)
    }
    animateIdle()
  }

  protected createNoteParticles(noteId: number) {
    // Nombre de particules basé sur la note (notes plus hautes = plus de particules)
    const baseParticleCount = 15
    const noteMultiplier = Math.min(1 + (noteId - 1) * 0.02, 2) // Max 2x les particules
    const particleCount = Math.floor(baseParticleCount * noteMultiplier)
    
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    // Couleurs selon le type d'instrument
    const instrumentColors = {
      piano: [1, 0.84, 0],      // Gold
      guitar: [1, 0.55, 0],     // Orange
      drums: [1, 0.27, 0.27],   // Red
      synthesizer: [0, 1, 1],   // Cyan
      violin: [0.86, 0.44, 0.86], // Violet
      acoustic_piano: [1, 1, 1],  // White
      acoustic_guitar: [0.86, 0.44, 0.2], // Wood brown
      electric_piano: [0.2, 0.4, 1], // Blue
      electric_guitar: [1, 0, 0.4], // Pink
      electric_bass: [0, 0, 0.8], // Dark blue
      sax: [1, 0.84, 0] // Gold
    }
    
    const baseColor = instrumentColors[this.instrumentType] || [1, 1, 1] // Blanc par défaut
    
    // Variation de couleur basée sur la note (notes plus hautes = plus brillantes)
    const noteBrightness = Math.min(0.5 + (noteId - 1) * 0.02, 1.5)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Position autour de l'instrument - rayon basé sur la note
      const angle = (i / particleCount) * Math.PI * 2
      const baseRadius = 0.3 + (noteId - 1) * 0.01 // Notes plus hautes = rayon plus large
      const radius = baseRadius + Math.random() * 0.4
      
      positions[i3] = Math.cos(angle) * radius
      positions[i3 + 1] = Math.random() * 0.5
      positions[i3 + 2] = Math.sin(angle) * radius
      
      // Couleur avec variation et luminosité basée sur la note
      colors[i3] = Math.min(baseColor[0] * noteBrightness + (Math.random() - 0.5) * 0.2, 1)
      colors[i3 + 1] = Math.min(baseColor[1] * noteBrightness + (Math.random() - 0.5) * 0.2, 1)
      colors[i3 + 2] = Math.min(baseColor[2] * noteBrightness + (Math.random() - 0.5) * 0.2, 1)
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    // Taille des particules basée sur la note
    const particleSize = Math.min(0.08 + (noteId - 1) * 0.002, 0.15)
    
    const material = new THREE.PointsMaterial({
      size: particleSize,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })
    
    const particles = new THREE.Points(geometry, material)
    particles.position.copy(this.mesh.position)
    particles.position.y += 1
    
    this.scene.add(particles)
    this.noteParticles.push(particles)
    
    // Animation des particules avec vitesse basée sur la note
    this.animateNoteParticles(particles, geometry, noteId)
  }

  private animateNoteParticles(particles: THREE.Points, geometry: THREE.BufferGeometry, noteId: number) {
    const positions = geometry.attributes.position.array as Float32Array
    const originalPositions = [...positions]
    let time = 0
    
    // Vitesse d'animation basée sur la note (notes plus hautes = plus rapide)
    const baseSpeed = 0.015
    const noteSpeedMultiplier = Math.min(1 + (noteId - 1) * 0.01, 1.8)
    const speed = baseSpeed * noteSpeedMultiplier
    
    // Vitesse de montée basée sur la note
    const riseSpeed = Math.min(1.5 + (noteId - 1) * 0.05, 3)
    
    const animate = () => {
      time += speed
      
      for (let i = 0; i < positions.length; i += 3) {
        // Mouvement oscillatoire horizontal basé sur la note
        const oscillationIntensity = Math.min(0.08 + (noteId - 1) * 0.002, 0.15)
        positions[i] = originalPositions[i] + Math.sin(time + i) * oscillationIntensity
        positions[i + 1] = originalPositions[i + 1] + time * riseSpeed
        positions[i + 2] = originalPositions[i + 2] + Math.cos(time + i) * oscillationIntensity
      }
      
      geometry.attributes.position.needsUpdate = true
      
      // Réduire l'opacité - notes plus hautes disparaissent plus lentement
      const fadeSpeed = Math.max(0.015, 0.025 - (noteId - 1) * 0.0003)
      const material = particles.material as THREE.PointsMaterial
      material.opacity = Math.max(0, material.opacity - fadeSpeed)
      
      if (material.opacity > 0) {
        requestAnimationFrame(animate)
      } else {
        // Nettoyer les particules
        this.scene.remove(particles)
        geometry.dispose()
        material.dispose()
        
        const index = this.noteParticles.indexOf(particles)
        if (index > -1) {
          this.noteParticles.splice(index, 1)
        }
      }
    }
    
    animate()
  }

  protected playAnimation() {
    if (this.isAnimating) return
    
    this.isAnimating = true
    
    // Animation de rebond
    const originalY = this.mesh.position.y
    const bounceHeight = 0.2
    const duration = 300
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Fonction d'easing bounce
      const easeOutBounce = (t: number) => {
        if (t < 1 / 2.75) {
          return 7.5625 * t * t
        } else if (t < 2 / 2.75) {
          return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
        } else if (t < 2.5 / 2.75) {
          return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
        } else {
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
        }
      }
      
      const bounceValue = easeOutBounce(progress)
      this.mesh.position.y = originalY + bounceHeight * bounceValue * (1 - progress)
      
      // Animation de scale
      const scaleValue = 1 + 0.1 * Math.sin(progress * Math.PI)
      this.mesh.scale.copy(this.originalScale).multiplyScalar(scaleValue)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        this.mesh.position.y = originalY
        this.mesh.scale.copy(this.originalScale)
        this.isAnimating = false
      }
    }
    
    animate()
  }

  private createLabel() {
    this.labelElement = document.createElement('div')
    this.labelElement.className = 'instrument-label'
    this.labelElement.textContent = this.instrumentName

    // Couleur du label selon le type d'instrument
    const labelColors = {
      piano: '#FFD700',
      guitar: '#FF8C00',
      drums: '#FF4444',
      synthesizer: '#00FFFF',
      violin: '#DDA0DD',
      acoustic_piano: '#FFFFFF',
      acoustic_guitar: '#D2691E',
      electric_piano: '#3366FF',
      electric_guitar: '#FF0066',
      electric_bass: '#000080',
      sax: '#FFD700'
    }

    const backgroundColors = {
      piano: 'rgba(139, 69, 19, 0.8)',
      guitar: 'rgba(210, 133, 61, 0.8)',
      drums: 'rgba(255, 68, 68, 0.8)',
      synthesizer: 'rgba(26, 26, 26, 0.8)',
      violin: 'rgba(139, 69, 19, 0.8)',
      acoustic_piano: 'rgba(26, 26, 26, 0.8)',
      acoustic_guitar: 'rgba(139, 69, 19, 0.8)',
      electric_piano: 'rgba(45, 45, 45, 0.8)',
      electric_guitar: 'rgba(255, 0, 102, 0.8)',
      electric_bass: 'rgba(0, 0, 51, 0.8)',
      sax: 'rgba(255, 215, 0, 0.8)'
    }

    this.labelElement.style.cssText = `
      color: ${labelColors[this.instrumentType]};
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: bold;
      text-align: center;
      background: ${backgroundColors[this.instrumentType]};
      padding: 3px 6px;
      border-radius: 4px;
      border: 1px solid ${labelColors[this.instrumentType]}55;
      pointer-events: none;
      user-select: none;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      transform-origin: center center;
      transition: all 0.3s ease;
    `

    this.label = new CSS3DObject(this.labelElement)
    this.label.position.copy(this.mesh.position)
    this.label.position.y += 1.8 // Position above the instrument
    this.label.scale.set(0.01, 0.01, 0.01)
    this.cssScene.add(this.label)
    this.updateLabel()
  }

  public setVolume(volume: number) {
    this.audioManager.setVolume(volume)
  }

  private setupMessageHandler() {
    this.messageHandler = (msg: WebSocketMessage) => {
      if (msg.type === 'instrument_note' && 
          msg.instrumentId === this.id && 
          msg.noteId !== undefined) {
        this.audioManager.playNote(msg.noteId)
        this.createNoteParticles(msg.noteId)
        this.playAnimation()
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
      this.mesh.position.copy(this.originalPosition)
      this.mesh.rotation.y = 0
      this.labelElement.textContent = `${this.instrumentName} (${playerId.slice(0, 6)})`
      this.labelElement.style.background = 'rgba(0, 100, 0, 0.8)'
      this.labelElement.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)'
      console.log(`Joueur ${playerId} lié à l'instrument ${this.id}`)
    }
  }

  public unlinkPlayer() {
    if (this.linkedPlayerId !== null) {
      console.log(`Joueur ${this.linkedPlayerId} délié de l'instrument ${this.id}`)
      
      // Arrêter toutes les notes actives et vider les états quand le joueur se déconnecte
      this.stopAllActiveNotes()
      this.pressedKeys.clear()
      
      this.linkedPlayerId = null
      this.mesh.position.copy(this.originalPosition)
      this.mesh.rotation.y = 0
      this.labelElement.textContent = this.instrumentName
      this.labelElement.style.boxShadow = 'none'
      const backgroundColors = {
        piano: 'rgba(139, 69, 19, 0.8)',
        guitar: 'rgba(210, 133, 61, 0.8)',
        drums: 'rgba(255, 68, 68, 0.8)',
        synthesizer: 'rgba(26, 26, 26, 0.8)',
        violin: 'rgba(139, 69, 19, 0.8)',
        acoustic_piano: 'rgba(26, 26, 26, 0.8)',
        acoustic_guitar: 'rgba(139, 69, 19, 0.8)',
        electric_piano: 'rgba(45, 45, 45, 0.8)',
        electric_guitar: 'rgba(255, 0, 102, 0.8)',
        electric_bass: 'rgba(0, 0, 51, 0.8)',
        sax: 'rgba(255, 215, 0, 0.8)'
      }
      this.labelElement.style.background = backgroundColors[this.instrumentType]
    }
  }

  public isLinkedToPlayer(playerId: string): boolean {
    return this.linkedPlayerId === playerId
  }

  public playNote(noteName: string) {
    if (this.linkedPlayerId) {
      const noteId = getNoteIdByName(noteName)
      if (noteId !== undefined) {
        this.audioManager.playNote(noteId)
        this.createNoteParticles(noteId)
        this.playAnimation()
      }
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

  private updateLabel() {
    // Position the label above the instrument
    this.label.position.copy(this.mesh.position)
    this.label.position.y += 1.8
    
    // Make the label always face the camera
    this.label.lookAt(this.camera.position)
  }

  public updateLabelOrientation() {
    // Public method to update label orientation from GameScene
    this.updateLabel()
  }

  public cleanup() {
    // Arrêter toutes les notes actives et vider les états
    this.stopAllActiveNotes()
    this.pressedKeys.clear()
    
    // Nettoyer les particules
    this.noteParticles.forEach(particles => {
      this.scene.remove(particles)
      particles.geometry.dispose()
      ;(particles.material as THREE.Material).dispose()
    })
    this.noteParticles = []
    
    this.scene.remove(this.mesh)
    this.cssScene.remove(this.label)
    this.mesh.geometry.dispose()
    ;(this.mesh.material as THREE.Material).dispose()
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
  }

  // Méthode pour définir l'AudioManager
  public setAudioManager(audioManager: AudioManager) {
    this.audioManager = audioManager
  }

  // Méthodes de base pour la gestion du clavier - à override dans les classes filles
  public handleKeyDown(key: string) {
    // Ignorer si la touche est déjà pressée (éviter la répétition automatique du clavier)
    if (this.pressedKeys.has(key)) {
      return
    }
    
    // Marquer la touche comme pressée
    this.pressedKeys.add(key)
    
    // Comportement par défaut : jouer la note une fois (pour les cordes)
    this.playNoteFromKey(key)
  }

  public handleKeyUp(key: string) {
    // Retirer la touche des touches pressées
    this.pressedKeys.delete(key)
    
    // Comportement par défaut : ne rien faire (pour les cordes)
  }

  // Méthode de base pour jouer une note - à override dans les classes filles
  protected playNoteFromKey(key: string) {
    // À implémenter dans les classes filles
  }

  // Méthode pour arrêter une note active
  protected stopActiveNote(key: string) {
    const activeNote = this.activeNotes.get(key)
    if (activeNote) {
      activeNote.audio.pause()
      activeNote.audio.currentTime = 0
      this.activeNotes.delete(key)
    }
  }

  // Méthode pour arrêter toutes les notes actives
  protected stopAllActiveNotes() {
    this.activeNotes.forEach((noteData, key) => {
      noteData.audio.pause()
      noteData.audio.currentTime = 0
    })
    this.activeNotes.clear()
  }
} 