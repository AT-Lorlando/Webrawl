export class InputManager {
  private keys: Record<string, boolean> = {}
  private keyPressedThisFrame: Set<string> = new Set()

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners() {
    window.addEventListener('keydown', e => this.handleKeyDown(e))
    window.addEventListener('keyup', e => this.handleKeyUp(e))
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (!this.keys[e.code]) {
      this.keyPressedThisFrame.add(e.code)
    }
    this.keys[e.code] = true
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.keys[e.code] = false
  }

  public isKeyPressed(code: string): boolean {
    return this.keys[code] || false
  }

  public wasKeyPressedThisFrame(code: string): boolean {
    return this.keyPressedThisFrame.has(code)
  }

  public clearKeyPressedThisFrame() {
    this.keyPressedThisFrame.clear()
  }

  public getMovement(): { x: number, z: number } {
    let x = 0
    let z = 0

    if (this.isKeyPressed('ArrowLeft')) x = -1
    else if (this.isKeyPressed('ArrowRight')) x = 1

    if (this.isKeyPressed('ArrowUp')) z = -1
    else if (this.isKeyPressed('ArrowDown')) z = 1

    return { x, z }
  }

  public isJumpPressed(): boolean {
    return this.wasKeyPressedThisFrame('Space')
  }

  public cleanup() {
    window.removeEventListener('keydown', e => this.handleKeyDown(e))
    window.removeEventListener('keyup', e => this.handleKeyUp(e))
  }
} 