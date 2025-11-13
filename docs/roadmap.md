# Pet Sim – Roadmap

This document outlines future work, ordered by critical priority. Address blocking issues first, then implement core systems that enable other features.

## 🚨 CRITICAL FIXES (Immediate - Week 1)

### Blocker 1: Save/Load Integration (RESOLVED)
- **Status**: Completed on 2025-11-12
- **Issue**: Menu save/load system existed but didn't actually save/load game state.
- **Resolution**: 
  - Connected menu functions to `localStorage` via `getGameState()` and `loadGameState()`.
  - Implemented auto-save functionality tied to the settings menu.
  - Game now correctly loads saved data on startup and persists progress across sessions.

### Blocker 2: Stat Decay System (RESOLVED)
- **Status**: Completed on 2025-11-12
- **Issue**: Stat decay setInterval exists but may not be working properly with menu system
- **Impact**: Core game loop broken - dogs don't get hungry/tired over time
- **Resolution**:
  - Implemented a proper stat decay system that respects game state (playing/paused/menu)
  - Added visual/audio feedback when dogs reach critical stat levels (≤20%)
  - Integrated stat decay control with menu system to pause during menus/pause
  - Enhanced with time-based decay: when loading a saved game, stats decay based on elapsed time
  - Dogs now properly get hungry/tired over time, creating the core gameplay loop with urgency

## 🏗️ FOUNDATION SYSTEMS (Week 2-3)

### Epic 1: Complete Save System & Progression Foundation ✅
- **Goals**: Establish reliable persistence and basic progression
- **Status**: **COMPLETED** on 2025-11-12
- **Scope**:
  - ✅ Fix save/load integration (from Blocker 1)
  - ✅ Add XP/levels per dog with visual feedback
  - ✅ Basic trait system affecting stat decay rates
  - ✅ Unlock system for new dogs/toys
  - ✅ Economy balancing for current actions
- **Milestones**:
  - ✅ M1: Save/load actually works with all game state
  - ✅ M2: XP bar + level up notifications
  - ✅ M3: Basic traits (energetic, calm, messy, etc.)
  - ✅ M4: Economy tuning for current feature set
- **Dependencies**: None (but fixes Blocker 1)
- **Implementation Details**:
  - Enhanced save system to include XP, levels, traits, and unlock progression
  - Added visual XP bars and level badges for each dog
  - Implemented 6 basic traits with stat decay modifiers
  - Created unlock system for new dogs based on progression levels
  - Created unlock system for new toys based on progression levels
  - Balanced economy with adjusted costs and rewards via centralized economySettings

### Epic 2: Autonomous Dog Behaviors
- **Goals**: Make dogs feel alive without constant player input
- **Scope**:
  - Needs-based AI state machine (hunger → seek food, etc.)
  - Basic navigation to food/water/toys
  - Idle animations and ambient behaviors
  - Dog awareness of player camera
- **Milestones**:
  - M1: State machine + priority system
  - M2: Pathfinding to interactable objects
  - M3: Idle behaviors (sleep, play, explore)
  - M4: Polish and behavior tuning
- **Dependencies**: Save system (for dog personality traits)

## 🎮 CORE GAMEPLAY (Week 4-5)

### Epic 3: Interactive Environment
- **Goals**: Expand world with more objects and interactions
- **Scope**:
  - Food/water bowls that dogs actually use
  - Toy objects for autonomous play
  - Bed objects for sleeping
  - Wash station for cleaning
  - Object placement and customization
- **Milestones**:
  - M1: Food bowl + water bowl functionality
  - M2: Toys + autonomous play behavior
  - M3: Bed + sleep behaviors
  - M4: Wash station + cleaning AI
- **Dependencies**: Autonomous behaviors (Epic 2)

### Epic 4: Mini-Games & Daily Engagement
- **Goals**: Add skill-based gameplay and retention loops
- **Scope**:
  - Fetch mini-game (timing/aiming)
  - Basic daily quests (feed 3 times, play once, etc.)
  - Reward system with coins/XP
  - Achievement expansion
- **Milestones**:
  - M1: Fetch prototype with scoring
  - M2: Daily quest system
  - M3: Achievement expansion for new behaviors
  - M4: Reward balancing and retention metrics
- **Dependencies**: Interactive environment (Epic 3)

## 🎨 CONTENT & POLISH (Week 6+)

### Epic 5: Customization & Collection
- **Goals**: Deep personalization and collection mechanics
- **Scope**:
  - Unlockable dog breeds (appearance + stat tendencies)
  - Room customization (furniture, decorations)
  - Cosmetic items (collars, toys, beds)
  - Shop interface with preview system
- **Milestones**:
  - M1: Breed system (2-3 new breeds)
  - M2: Basic furniture placement
  - M3: Cosmetic shop + inventory
  - M4: Preview system + polish
- **Dependencies**: Mini-games (for currency earning)

### Epic 6: Quality of Life
- **Goals**: Improve accessibility and user experience
- **Scope**:
  - Settings persistence validation
  - Input remapping and accessibility options
  - Photo mode and sharing
  - Performance optimization
  - Bug fixes and polish
- **Dependencies**: Core systems complete

## 🔮 FUTURE FEATURES (Month 2+)

### Epic 7: Advanced Systems
- Cloud sync and cross-device persistence
- Community events and limited-time content
- Advanced AI learning and personality development
- Room expansions and building mechanics
- Multi-dog training and competitions

## Dependencies & Risks
- **Critical**: Save/load integration is blocking all other development
- **Technical**: Three.js pathfinding performance on low-end devices
- **Design**: Economy balancing to avoid grind or inflation
- **Scope**: Feature creep - focus on core loop first

## Implementation Priority
1. **Week 1**: Fix critical blockers (save/load, stat decay)
2. **Week 2-3**: Build foundation systems (progression, AI)
3. **Week 4-5**: Add core gameplay (environment, mini-games)
4. **Week 6+**: Expand content and polish

**Rule**: Don't start Epic 3+ until Epic 1-2 are fully functional and tested.
