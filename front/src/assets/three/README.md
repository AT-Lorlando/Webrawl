# Webrawl Music - 3D Scene

## Vue d'ensemble

Cette application est un environnement musical 3D interactif où les joueurs peuvent se déplacer et jouer différents instruments en temps réel. Elle utilise Three.js pour le rendu 3D et WebGL pour les performances optimales.

## Architecture

### Structure des fichiers
```
three/
├── audio/
│   ├── AudioManager.ts      # Gestion audio avancée
│   └── Notes.ts            # Définition des notes musicales
├── config/
│   └── SceneConfig.ts      # Configuration de la scène
├── controls/
│   └── InputManager.ts     # Gestion des entrées clavier/souris
├── entities/
│   ├── Instrument.ts       # Classe de base des instruments
│   ├── AcousticPiano.ts    # Piano acoustique
│   ├── AcousticGuitar.ts   # Guitare acoustique
│   ├── ElectricPiano.ts    # Piano électrique
│   ├── ElectricGuitar.ts   # Guitare électrique
│   ├── ElectricBass.ts     # Basse électrique
│   ├── Saxophone.ts        # Saxophone
│   └── Player.ts           # Joueur avec avatar 3D
├── network/
│   └── WebSocketManager.ts # Communication temps réel
├── physics/
│   └── Physics.ts          # Système de physique simple
├── scene/
│   └── GameScene.ts        # Scène principale du jeu
├── types.ts                # Types TypeScript
└── main.ts                 # Point d'entrée
```

## Instruments Disponibles

### 🎹 Pianos
1. **Piano Principal** - Piano standard polyvalent
2. **Piano Acoustique** - Piano à queue avec son riche et couvercle
3. **Piano Électrique** - Piano compact avec indicateurs LED

### 🎸 Guitares
4. **Guitare Standard** - Guitare de base
5. **Guitare Acoustique** - Guitare avec caisse de résonance et rosace
6. **Guitare Électrique** - Guitare solid body avec micros

### 🎵 Autres Instruments
7. **Basse Électrique** - 4 cordes avec micros spécialisés
8. **Batterie** - Kit complet avec baguettes
9. **Synthétiseur** - Clavier électronique avec écran LED
10. **Violon** - Instrument à cordes traditionnel
11. **Saxophone** - Instrument à vent doré avec clés

## Disposition dans la Scène

```
Rangée du fond (-6z):
[Piano Acoustique] [Piano Électrique] [Synthétiseur] [Batterie] [Violon]

Rangée centrale (0z):
[Guitare Acoustique] [Guitare Électrique] [Basse Électrique] [Saxophone]

Centre avant (4z):
[Piano Principal]
```

## Contrôles

### Déplacement
- **WASD** : Se déplacer dans l'espace 3D
- **Souris** : Regarder autour / Contrôler la caméra
- **Shift** : Utiliser/Quitter un instrument (quand proche)

### Notes musicales
- **Q-P** : Jouer les notes (Do à Sol sur l'octave)
  - Q → La4 (A4)
  - W → Si4 (B4)
  - E → Do4 (C4)
  - R → Ré4 (D4)
  - T → Mi4 (E4)
  - Y → Fa4 (F4)
  - U → Sol4 (G4)
  - I → La4 (A4)
  - O → Si4 (B4)
  - P → Do4 (C4)

## Effets Visuels

### Rendu
- **WebGL** avec Three.js pour les performances
- **CSS3D** pour les labels et interfaces
- **Post-processing** avec bloom et effets de lumière
- **Ombres dynamiques** et éclairage réaliste

### Animations
- **Particules musicales** : Chaque note jouée génère des particules colorées
- **Animation d'instruments** : Rebond et mise à l'échelle lors du jeu
- **Animation idle** : Oscillation douce des instruments libres
- **Effets de join/leave** : Animations pour les joueurs qui rejoignent/quittent

### Couleurs par instrument
- **Piano** : Or (Gold)
- **Piano Acoustique** : Blanc (White) 
- **Piano Électrique** : Bleu (Blue)
- **Guitare** : Orange
- **Guitare Acoustique** : Brun bois (Wood brown)
- **Guitare Électrique** : Rose (Pink)
- **Basse Électrique** : Bleu foncé (Dark blue)
- **Batterie** : Rouge (Red)
- **Synthétiseur** : Cyan
- **Violon** : Violet (Violet)
- **Saxophone** : Or (Gold)

## Système Audio

### Chargement des sons
Chaque instrument charge ses propres fichiers audio depuis `/sounds/[instrument]/`:
- `acoustic_piano/` - Sons de piano acoustique
- `acoustic_guitar/` - Sons de guitare acoustique  
- `electric_piano/` - Sons de piano électrique
- `electric_guitar/` - Sons de guitare électrique
- `electric_bass/` - Sons de basse électrique
- `sax/` - Sons de saxophone

### Format des fichiers
- **Format** : WAV (non compressé)
- **Nomenclature** : `[Note][Octave].wav` (ex: `C4.wav`, `A#3.wav`)
- **Octaves** : 3, 4, 5 (couvrant 3 octaves par instrument)

### 🐛 Débogage Audio

#### Structure des fichiers requise
Les fichiers audio doivent être placés dans `front/public/sounds/` :
```
front/public/sounds/
├── acoustic_piano/
│   ├── C3.wav, C#3.wav, D3.wav, ... B3.wav  (12 notes)
│   ├── C4.wav, C#4.wav, D4.wav, ... B4.wav  (12 notes)
│   └── C5.wav, C#5.wav, D5.wav, ... B5.wav  (12 notes)
├── acoustic_guitar/
│   └── [même structure]
├── electric_piano/
│   └── [même structure]
├── electric_guitar/
│   └── [même structure]
├── electric_bass/
│   └── [même structure]
└── sax/
    └── [même structure]
```

#### Diagnostiquer les problèmes

**❌ "Unable to decode audio data"**
- Vérifiez que les fichiers sont dans `public/sounds/[instrument]/`
- Vérifiez que les fichiers sont au format WAV non compressé
- Vérifiez les noms de fichiers (ex: `C4.wav`, `A#3.wav`)
- Testez un fichier dans votre navigateur: `http://localhost:3000/sounds/acoustic_piano/C4.wav`

**❌ "Cannot read properties of undefined"**
- Ce bug a été corrigé avec un fallback vers des couleurs par défaut
- Rechargez la page après les modifications

**🎵 Fallback automatique**
- Si un son d'instrument spécifique manque, le système utilise les sons de piano de base
- Regardez la console pour les messages de fallback

#### Logs de débogage
La console affiche des émojis pour suivre le chargement :
- 🎹 Piano Acoustique en cours de chargement...
- ✅ Piano Acoustique: 36 sons chargés, 0 échecs
- ❌ Échec du chargement: B5 (/sounds/acoustic_piano/B5.wav)
- 🎵 Utilisation du son fallback Q pour C4

## Fonctionnalités Multijoueur

### WebSocket
- Communication temps réel entre joueurs
- Synchronisation des positions et actions
- Partage des notes jouées entre tous les clients

### Gestion des joueurs
- **Avatar 3D** : Cube coloré avec nom flottant
- **Détection de collision** : Empêche les joueurs de se chevaucher
- **Notifications** : Alertes visuelles pour join/leave

### Instruments partagés
- **Un instrument = Un joueur** : Système d'exclusivité
- **Indication visuelle** : Label vert quand un instrument est utilisé
- **Libération automatique** : L'instrument se libère quand le joueur s'éloigne

## Performance

### Optimisations
- **Culling de frustum** : Objets hors-champ non rendus
- **LOD (Level of Detail)** : Détails variables selon la distance
- **Pool d'objets** : Réutilisation des particules
- **Audio streaming** : Chargement à la demande

### Limites recommandées
- **Joueurs simultanés** : 4 maximum
- **Particules actives** : 100 maximum par joueur
- **Distance de rendu** : 50 unités depuis la caméra

## Développement

### Ajout d'un nouvel instrument

1. **Créer la classe** dans `entities/`:
```typescript
export class MonInstrument extends Instrument {
  protected instrumentType: InstrumentType = 'mon_instrument'
  // ... implémentation
}
```

2. **Ajouter le type** dans `Instrument.ts`:
```typescript
export type InstrumentType = '...' | 'mon_instrument'
```

3. **Créer les sons** dans `/sounds/mon_instrument/`:
```
mon_instrument/
├── C3.wav
├── C#3.wav
├── D3.wav
└── ...
```

4. **Ajouter dans GameScene.ts**:
```typescript
case 'mon_instrument':
  instrument = new MonInstrument(...)
  break
```

## Bugs Connus

### ✅ Corrigés
- **Bug de floating** : Les instruments ne passent plus sous le sol lors du link/unlink
- **Position reset** : La position originale est maintenant sauvegardée et restaurée
- **Animation idle** : Arrêtée correctement quand un joueur utilise l'instrument

### 🔧 En cours
- Optimisation du chargement des sons volumineux
- Amélioration de la détection de collision entre joueurs
- Synchronisation plus fluide des animations multijoueur

---

*Dernière mise à jour : Janvier 2025* 