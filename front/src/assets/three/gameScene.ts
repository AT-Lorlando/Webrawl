import { GameScene } from './scene/GameScene'
import type { GameConfig } from './types'

export default function initThreeScene(
  container: HTMLElement,
  gameCode: string,
  isHost: boolean,
  logFn?: (msg: string) => void
) {
  const config: GameConfig = {
    container,
    gameCode,
    isHost,
    logFn
  }

  const game = new GameScene(config)
  return () => game.cleanup()
} 