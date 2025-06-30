import * as THREE from 'three'

export const SCENE_CONFIG = {
  // Caméra
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: { x: 8, y: 6, z: 10 }
  },

  // Rendu
  renderer: {
    pixelRatioMax: 2,
    shadowMapSize: 2048,
    toneMappingExposure: 1.2
  },

  // Post-processing
  bloom: {
    strength: 0.5,
    radius: 0.4,
    threshold: 0.85
  },

  // Éclairage
  lighting: {
    ambient: {
      color: 0x404080,
      intensity: 0.4
    },
    directional: {
      color: 0xffffff,
      intensity: 0.8,
      position: { x: 5, y: 15, z: 5 },
      shadow: {
        mapSize: 2048,
        camera: {
          near: 0.5,
          far: 50,
          size: 20
        }
      }
    },
    pointLights: {
      colors: [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7],
      positions: [
        { x: 6, y: 4, z: 6 },
        { x: -6, y: 4, z: 6 },
        { x: 6, y: 4, z: -6 },
        { x: -6, y: 4, z: -6 },
        { x: 0, y: 6, z: 0 }
      ],
      baseIntensity: 0.3,
      intensityVariation: 0.2,
      distance: 10,
      decay: 2
    }
  },

  // Environnement
  environment: {
    backgroundColor: 0x1a1a2e,
    fog: {
      color: 0x1a1a2e,
      near: 10,
      far: 50
    },
    floor: {
      size: 30,
      color: 0x2c2c54,
      roughness: 0.8,
      metalness: 0.2
    },
    room: {
      size: { width: 30, height: 15, depth: 30 },
      wallColor: 0x2a2a3e,
      ceilingColor: 0x1a1a2e
    }
  },

  // Particules
  particles: {
    count: 100,
    size: 0.1,
    opacity: 0.6,
    colors: [
      { r: 1, g: 0.42, b: 0.42 },
      { r: 0.3, g: 0.8, b: 0.77 },
      { r: 0.27, g: 0.72, b: 0.82 },
      { r: 0.59, g: 0.8, b: 0.71 },
      { r: 1, g: 0.92, b: 0.65 }
    ]
  },

  // Instruments
  instruments: {
    interactionDistance: 2.5,
    configs: [
      {
        position: { x: 4, y: 0.5, z: 4 },
        type: 'piano' as const,
        name: 'Piano Principal'
      },
      {
        position: { x: -4, y: 0.5, z: 4 },
        type: 'guitar' as const,
        name: 'Guitare Acoustique'
      },
      {
        position: { x: 4, y: 0.5, z: -4 },
        type: 'drums' as const,
        name: 'Batterie'
      },
      {
        position: { x: -4, y: 0.5, z: -4 },
        type: 'synthesizer' as const,
        name: 'Synthétiseur'
      },
      {
        position: { x: 0, y: 0.5, z: 6 },
        type: 'violin' as const,
        name: 'Violon'
      }
    ],
    visual: {
      labelHeight: 1.8,
      scale: 0.01,
      colors: {
        piano: '#FFD700',
        guitar: '#FF8C00',
        drums: '#FF4444',
        synthesizer: '#00FFFF',
        violin: '#DDA0DD'
      },
      backgroundColors: {
        piano: 'rgba(139, 69, 19, 0.8)',
        guitar: 'rgba(210, 133, 61, 0.8)',
        drums: 'rgba(255, 68, 68, 0.8)',
        synthesizer: 'rgba(26, 26, 26, 0.8)',
        violin: 'rgba(139, 69, 19, 0.8)'
      },
      noteParticles: {
        count: 20,
        size: 0.1,
        opacity: 0.8,
        colors: {
          piano: [1, 0.84, 0],
          guitar: [1, 0.55, 0],
          drums: [1, 0.27, 0.27],
          synthesizer: [0, 1, 1],
          violin: [0.86, 0.44, 0.86]
        }
      }
    },
    animations: {
      bounceHeight: 0.2,
      bounceDuration: 300,
      scaleMultiplier: 0.1,
      idleRotationSpeed: 0.5,
      idleFloatSpeed: 2,
      idleFloatAmplitude: 0.02
    }
  },

  // Contrôles
  controls: {
    enableDamping: true,
    dampingFactor: 0.05,
    maxDistance: 20,
    minDistance: 3,
    maxPolarAngle: Math.PI / 2.2
  },

  // Joueurs
  players: {
    labelHeight: 1,
    scale: 0.01,
    moveSpeed: 0.08,
    jumpForce: 0.18,
    gravity: 0.01,
    updateThreshold: 0.01,
    updateInterval: 10
  },

  // Décorations
  decorations: {
    speakers: {
      positions: [
        { x: -12, y: 1, z: -12 },
        { x: 12, y: 1, z: -12 },
        { x: -12, y: 1, z: 12 },
        { x: 12, y: 1, z: 12 }
      ],
      color: 0x000000,
      grillColor: 0x333333
    },
    carpet: {
      radius: 8,
      color: 0x8B4513,
      position: { x: 0, y: -0.49, z: 0 }
    },
    acousticPanels: {
      color: 0x4a4a6a,
      size: { width: 2, height: 2, depth: 0.2 },
      positions: {
        cols: 5,
        rows: 2,
        spacing: 3
      }
    },
    plants: {
      positions: [
        { x: -10, y: 0, z: -10 },
        { x: 10, y: 0, z: -10 },
        { x: -10, y: 0, z: 10 },
        { x: 10, y: 0, z: 10 }
      ],
      potColor: 0x8B4513,
      leafColor: 0x228B22
    }
  }
}

export type SceneConfigType = typeof SCENE_CONFIG 