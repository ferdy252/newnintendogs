# Pet Sim – Cozy Dog Care

## Overview
A small 3D pet simulation where you care for a pack of dogs in a cozy room. Interact via a clean UI to feed, wash, play, and pet your dogs. Earn and spend coins, unlock achievements, and enjoy subtle animations and sound cues.

- Tech stack: HTML, CSS, Vanilla JS, Three.js (r128 via CDN)
- Entry point: `index.html`
- No build step required; runs locally in a modern browser

## Project Structure
- `index.html` (root directory)
  - Main menu system with multiple screens: Main Menu, Saved Files, Settings, Loading, Game
  - Loads Three.js from CDN and Font Awesome for icons
  - Contains pause menu and in-game UI overlay panels
- `menu.css`
  - Modern menu UI with glassmorphism effects, animations, responsive design
  - Screen transitions, loading animations, settings controls
- `menu.js`
  - Menu navigation system, game state management, save/load functionality
  - Settings persistence, loading screen with tips, keyboard shortcuts
- `style.css`
  - Game UI styling: stat bars, buttons, notifications, achievements
- `script.js`
  - Game initialization and loop: `init`, `animate`
  - Environment: `createHome` (floor, walls, bed), lights, camera
  - Dogs: `createDogs` (starts with 1 dog, max 3), `adoptDog` system
  - UI: `updateUI` renders dog cards, actions, food store, achievements
  - Interactions: `onDogClick`, `selectDog`, `performAction`, `buyFood`
  - Systems: economy, achievements, stat decay, audio cues
  - Utilities: `checkAchievements`, `unlockAchievement`, `showNotification`, `animateDogAction`, `animateDogs`, `onMouseMove`

## Game Systems
- Menu System
  - Main menu with Start Game, Settings, and About options
  - Save file selection with 3 slots, displays last played time and stats
  - Settings panel with audio, display, and gameplay options
  - Loading screen with animated progress bar and helpful tips
  - Pause menu accessible during gameplay (ESC key or pause button)
- Dogs and Stats
  - Start with 1 dog (Max), can adopt up to 3 dogs total
  - Dogs: Max (starter), Bella, Charlie (adoptable for 100 coins each)
  - Stats per dog: `hunger`, `energy`, `hygiene`, `happiness`
  - Selection ring highlights the selected dog (or act on all dogs if none is selected)
- Save System
  - 3 save slots for persisting game state via manual saves or optional auto-save.
  - Saves: `coins`, `dogStats`, `achievements`, interaction `stats`, and `selectedDogIndex`.
  - Settings saved separately and persist across all save files
- Economy
  - `coins` start at 100
  - Earn: +5 when using Play, +50 per achievement unlock
  - Spend: Wash costs 5; Adoption costs 100; Food has variable costs
- Actions (via Quick Actions)
  - Wash: hygiene +30, happiness +10, costs 5 coins
  - Play: happiness +25, energy −15, hygiene −5, earns +5 coins
  - Pet: happiness +15
- Food Store
  - Kibble (10 coins): hunger +20, energy +10, happiness +5
  - Treat (20 coins): hunger +15, energy +5, happiness +20
  - Premium Food (50 coins): hunger +40, energy +30, happiness +25
- Achievements
  - First Steps: feed once
  - Clean Paws: wash all current dogs and all dogs hygiene > 80
  - Happy Pack: all dogs happiness = 100
  - Rich Owner: coins ≥ 1000
  - Marathon Player: play count ≥ 50
  - Unlocks trigger a notification, sound jingle, and +50 coins
- Stat Decay
  - Active decay: Every 5 seconds during gameplay, all four stats drop by 2 points for each dog
  - Time-based decay: When loading a saved game, stats decay based on elapsed time since last save
  - Critical alerts: Visual/audio feedback when any stat drops to 20% or below
  - State-aware: Decay pauses when game is paused or in menus
- Audio Cues
  - Lightweight Web Audio beeps for feedback; uses an `OscillatorNode` and `GainNode`
- 3D Environment and Animation
  - Simple room (floor, three walls, bed), warm lighting
  - Gentle idle bobbing, tail wag, head nod
  - Action animations: jump (feed/play), wiggle (pet), shake (wash)

## How to Run
- Option 1: Open `index.html` directly in a modern browser.
- Option 2 (recommended for a local server experience): serve the `pet-sim-game` folder with any static server and visit it in the browser.

No installation or build steps are required. Three.js is loaded via CDN.

## How to Play
- **Starting**: Open the game to see the main menu. Click "Start Game" to choose a save slot.
- **Main Game**: 
  - Click a dog in the 3D scene to select it. If none is selected, actions affect all dogs.
  - Use Quick Actions (Wash, Play, Pet) in the Actions panel.
  - Buy food in the Food Store to adjust stats.
  - Adopt new dogs for 100 coins each (max 3 dogs total).
- **Controls**:
  - ESC key: Pause/resume game or navigate back in menus
  - Click dogs: Select individual dog for targeted actions
  - Pause button: Access pause menu during gameplay
- **Menu Navigation**:
  - Main menu → Save files → Loading screen → Game
  - Settings can be accessed from main menu and persist across saves
  - Save your progress manually or enable auto-save in settings

## Architecture Summary
- Rendering loop: `animate` runs every frame, updating controls, dog animations, and rendering the scene.
- State
  - UI state: `selectedDogIndex`
  - Game state: `coins`, `dogStats` (per-dog stats), `stats` (feed/wash/play counters), `achievements`
  - Scene state: `dogs` (array of `THREE.Group`) and per-dog `userData` (selection ring, animation offsets)
- Event flow
  - `onDogClick` raycasts into the dog meshes and calls `selectDog`
  - UI buttons call `performAction` or `buyFood`
  - Timers: stat decay `setInterval` every 5 seconds
  - Window resize handler adjusts camera and renderer

## Contributing
- Keep code clear and self-explanatory; add comments only for non-obvious logic.
- Update this README immediately when changing gameplay, UI, or architecture.
- Remove obsolete files and unused code when refactoring.
- Use Git history to track changes; do not duplicate docs files for versions.

## Documentation Plan (to grow with the game)
Create feature docs as needed under `docs/` (one file per feature):
- `docs/architecture.md` — deeper dive on scene graph, modules, data flow
- `docs/dog-model.md` — dog stats, selection, interactions, and persistence plan
- `docs/economy.md` — coin sources/sinks, balancing notes
- `docs/achievements.md` — full list, criteria, rewards, and UX
- `docs/animation-and-audio.md` — animation loops, action anims, sound design cues
- `docs/ui-and-controls.md` — overlay components, interactions, accessibility
- Deprecated content should be moved to `docs/archive/` with deprecation notes

## Changelog
- **2025-11-12**: Implemented a complete save/load system using `localStorage`. Players can now save progress in one of three slots, load saved games, and enable auto-saving. This resolves a critical blocker preventing long-term play.
- **2025-11-12**: Fixed the stat decay system to properly integrate with the menu system. Stats now decay only during active gameplay and pause when in menus or paused. Added visual/audio feedback for critical stat levels (≤20%). This completes the core gameplay loop where dogs get hungry/tired over time.
- **2025-11-12**: Enhanced stat decay with time-based calculations. When loading a saved game, stats decay based on elapsed time since the last save, creating urgency for players to return regularly.
- **Unreleased**: Initial implementation with 1 starting dog (up to 3), 3D room, core actions (feed, wash, play), food store, achievements, stat decay, and basic audio cues.

## License
- Add a license here if/when one is chosen.
