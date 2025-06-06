import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'


const url = '0.0.0.0'
const port = 3334
const wsUrl = `ws://${url}:${port}`

// Type for box state
interface BoxState {
  id: string
  position: [number, number, number]
  velocity: [number, number, number]
}

function randomColor() {
  return new THREE.Color(Math.random(), Math.random(), Math.random())
}

export default function initThreeScene(
  container: HTMLElement,
  gameCode: string,
  isHost: boolean,
  logFn?: (msg: string) => void
) {
  // Local player ID
  const localId = Math.random().toString(36).slice(2)

  // Scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x222222)

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  )
  camera.position.set(2, 2, 5)

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)

  // Light
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(5, 10, 7.5)
  scene.add(light)

  // Orbit Controls
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // Floor
  const floorGeometry = new THREE.PlaneGeometry(20, 20)
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -0.5
  scene.add(floor)

  // Local box
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  // Other players' boxes
  const otherBoxes: Record<string, THREE.Mesh> = {}
  const otherColors: Record<string, THREE.Color> = {}

  // Physics
  let position: [number, number, number] = [0, 0.5, 0]
  let velocity: [number, number, number] = [0, 0, 0]
  let onGround = true

  // Keyboard controls
  const keys: Record<string, boolean> = {}
  function handleKey(e: KeyboardEvent, down: boolean) {
    keys[e.code] = down
  }
  window.addEventListener('keydown', e => handleKey(e, true))
  window.addEventListener('keyup', e => handleKey(e, false))

  // WebSocket
  const ws = new WebSocket(wsUrl)
  ws.onopen = () => {
    logFn?.('[ws] open')
    const joinMsg = {
      type: isHost ? 'host' : 'join',
      gameCode,
      id: localId,
    }
    ws.send(JSON.stringify(joinMsg))
    logFn?.('[ws] send: ' + JSON.stringify(joinMsg))
    // Immediately send our initial position so others can see us
    const stateMsg = {
      type: 'state',
      id: localId,
      position,
      gameCode,
    }
    ws.send(JSON.stringify(stateMsg))
    // logFn?.('[ws] send: ' + JSON.stringify(stateMsg))
  }
  ws.onerror = (e) => {
    logFn?.('[ws] error: ' + (e instanceof Event ? 'Event' : JSON.stringify(e)))
  }
  ws.onclose = (e) => {
    logFn?.('[ws] close')
  }

  // WebSocket message handling
  ws.onmessage = (event) => {
    logFn?.('[ws] recv: ' + event.data)
    const msg = JSON.parse(event.data)
    if (msg.type === 'join') {
      logFn?.('[ws] recv: ' + JSON.stringify(msg))
    }
    if (msg.type === 'state' && msg.id !== localId) {
      // Always update or create other box
      let mesh = otherBoxes[msg.id]
      if (!mesh) {
        const color = randomColor()
        otherColors[msg.id] = color
        mesh = new THREE.Mesh(geometry.clone(), new THREE.MeshStandardMaterial({ color }))
        scene.add(mesh)
        otherBoxes[msg.id] = mesh
      }
      mesh.position.set(msg.position[0], msg.position[1], msg.position[2])
    }
    if (msg.type === 'leave' && msg.id !== localId) {
      if (otherBoxes[msg.id]) {
        scene.remove(otherBoxes[msg.id])
        delete otherBoxes[msg.id]
        delete otherColors[msg.id]
      }
    }
  }

  // Handle resize
  function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }
  window.addEventListener('resize', onResize)

  // Animation loop
  let running = true
  function animate() {
    if (!running) return
    // Controls
    let speed = 0.08
    if (keys['ArrowLeft']) velocity[0] = -speed
    else if (keys['ArrowRight']) velocity[0] = speed
    else velocity[0] = 0
    if (keys['ArrowUp']) velocity[2] = -speed
    else if (keys['ArrowDown']) velocity[2] = speed
    else velocity[2] = 0
    // Jump
    if (keys['Space'] && onGround) {
      velocity[1] = 0.18
      onGround = false
    }
    // Gravity
    velocity[1] -= 0.01
    // Update position
    position[0] += velocity[0]
    position[1] += velocity[1]
    position[2] += velocity[2]
    // Floor collision
    if (position[1] <= 0.5) {
      position[1] = 0.5
      velocity[1] = 0
      onGround = true
    }
    cube.position.set(...position)
    // Send state
    if (ws.readyState === WebSocket.OPEN) {
      const stateMsg = { type: 'state', id: localId, position, gameCode }
      ws.send(JSON.stringify(stateMsg))
      // logFn?.('[ws] send: ' + JSON.stringify(stateMsg))
    }
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }
  animate()

  // Cleanup function
  return () => {
    running = false
    window.removeEventListener('resize', onResize)
    window.removeEventListener('keydown', e => handleKey(e, true))
    window.removeEventListener('keyup', e => handleKey(e, false))
    controls.dispose()
    renderer.dispose()
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
    geometry.dispose()
    material.dispose()
    ws.close()
  }
} 