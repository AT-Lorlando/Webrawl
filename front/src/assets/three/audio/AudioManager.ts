import { getNoteById, type Note } from './Notes'

export class AudioManager {
  private audioContext: AudioContext
  private oscillators: Map<number, OscillatorNode> = new Map()

  constructor() {
    this.audioContext = new AudioContext()
  }

  public playNote(noteId: number) {
    const note = getNoteById(noteId)
    if (!note) return

    this.stopNote(noteId)

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = note.frequency

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01) // Attack
    gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1) // Decay
    gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.5) // Sustain
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1) // Release

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.start()
    this.oscillators.set(noteId, oscillator)

    setTimeout(() => {
      this.stopNote(noteId)
    }, 1000)
  }

  public stopNote(noteId: number) {
    const oscillator = this.oscillators.get(noteId)
    if (oscillator) {
      oscillator.stop()
      this.oscillators.delete(noteId)
    }
  }

  public cleanup() {
    this.oscillators.forEach(oscillator => oscillator.stop())
    this.oscillators.clear()
  }
} 