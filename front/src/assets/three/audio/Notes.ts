export interface Note {
  id: number
  name: string
  frequency: number
}

export const NOTES: Note[] = [
  { id: 0, name: 'A', frequency: 440.00 },  // La4
  { id: 1, name: 'Z', frequency: 493.88 },  // Si4
  { id: 2, name: 'E', frequency: 523.25 },  // Do5
  { id: 3, name: 'R', frequency: 554.37 },  // Do#5
  { id: 4, name: 'T', frequency: 587.33 },  // Ré5
  { id: 5, name: 'Y', frequency: 622.25 },  // Ré#5
  { id: 6, name: 'U', frequency: 659.25 },  // Mi5
  { id: 7, name: 'I', frequency: 698.46 },  // Fa5
  { id: 8, name: 'O', frequency: 739.99 },  // Fa#5
  { id: 9, name: 'P', frequency: 783.99 },  // Sol5
]

export const getNoteById = (id: number): Note | undefined => {
  return NOTES.find(note => note.id === id)
}

export const getNoteByName = (name: string): Note | undefined => {
  return NOTES.find(note => note.name === name)
}

export const getNoteIdByName = (name: string): number | undefined => {
  return getNoteByName(name)?.id
} 