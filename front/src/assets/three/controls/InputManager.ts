export class InputManager {
  private keys: Record<string, boolean> = {}

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners() {
    window.addEventListener('keydown', e => this.handleKey(e, true))
    window.addEventListener('keyup', e => this.handleKey(e, false))
  }

  private handleKey(e: KeyboardEvent, down: boolean) {
    this.keys[e.code] = down
  }

  public isKeyPressed(code: string): boolean {
    return this.keys[code] || false
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
    return this.isKeyPressed('Space')
  }

  public cleanup() {
    window.removeEventListener('keydown', e => this.handleKey(e, true))
    window.removeEventListener('keyup', e => this.handleKey(e, false))
  }
} 