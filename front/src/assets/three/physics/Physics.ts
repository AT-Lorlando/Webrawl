export class Physics {
  private position: [number, number, number] = [0, 0.5, 0]
  private velocity: [number, number, number] = [0, 0, 0]
  private onGround = true

  constructor(
    private moveSpeed: number = 0.08,
    private jumpForce: number = 0.18,
    private gravity: number = 0.01
  ) {}

  public update(movement: { x: number, z: number }, shouldJump: boolean): [number, number, number] {
    this.velocity[0] = movement.x * this.moveSpeed
    this.velocity[2] = movement.z * this.moveSpeed

    if (shouldJump && this.onGround) {
      this.velocity[1] = this.jumpForce
      this.onGround = false
    }

    this.velocity[1] -= this.gravity

    this.position[0] += this.velocity[0]
    this.position[1] += this.velocity[1]
    this.position[2] += this.velocity[2]

    if (this.position[1] <= 0.5) {
      this.position[1] = 0.5
      this.velocity[1] = 0
      this.onGround = true
    }

    return [...this.position]
  }

  public getPosition(): [number, number, number] {
    return [...this.position]
  }
} 