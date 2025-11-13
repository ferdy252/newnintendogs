// Game State Management
let gameState = 'menu'; // menu, loading, playing, paused
let currentSaveSlot = null;
let settings = {
    masterVolume: 70,
    sfxEnabled: true,
    musicEnabled: false,
    graphicsQuality: 'medium',
    screenShake: true,
    autoSave: true,
    tutorialHints: true
};

// Loading tips
const loadingTips = [
    "Tip: Play with your dogs daily to keep them happy!",
    "Tip: Feed your dogs nutritious food to boost their energy.",
    "Tip: Clean dogs are happy dogs! Don't forget to wash them.",
    "Tip: Save up coins to adopt more furry friends.",
    "Tip: Each dog has their own personality - get to know them!",
    "Tip: Complete achievements to earn bonus coins.",
    "Tip: Check your dog's stats regularly to keep them healthy.",
    "Tip: Petting your dogs is free and makes them very happy!"
];

// Screen Navigation
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show selected screen
    document.getElementById(screenId).classList.add('active');
    
    // Handle specific screen logic
    switch(screenId) {
        case 'main-menu':
            gameState = 'menu';
            playMenuSound('navigate');
            // Stop stat decay when in main menu
            if (typeof stopStatDecay === 'function') {
                stopStatDecay();
            }
            break;
        case 'saved-files':
            updateSaveFileDisplay();
            playMenuSound('navigate');
            break;
        case 'settings':
            loadSettings();
            playMenuSound('navigate');
            break;
        case 'loading-screen':
            gameState = 'loading';
            startLoadingSequence();
            // Stop stat decay during loading
            if (typeof stopStatDecay === 'function') {
                stopStatDecay();
            }
            break;
        case 'game-screen':
            gameState = 'playing';
            playMenuSound('start');
            startAutoSave();
            // Start stat decay when entering game screen
            if (typeof startStatDecay === 'function') {
                startStatDecay();
            }
            break;
    }
}

// Menu Sounds
function playMenuSound(type) {
    if (!settings.sfxEnabled) return;
    
    switch(type) {
        case 'navigate':
            playSound(440, 0.1);
            break;
        case 'select':
            playSound(660, 0.1);
            break;
        case 'start':
            playSound(523, 0.2);
            setTimeout(() => playSound(659, 0.2), 100);
            setTimeout(() => playSound(784, 0.3), 200);
            break;
        case 'back':
            playSound(330, 0.1);
            break;
    }
}

// Game Functions
function startNewGame() {
    currentSaveSlot = null;
    playMenuSound('select');
    // Flag that we are starting a new game
    sessionStorage.removeItem('petSim_loadSlot');
    showScreen('loading-screen');
}

function loadGame(slot) {
    currentSaveSlot = slot;
    playMenuSound('select');

    const savedGame = localStorage.getItem(`petSim_save_${slot}`);
    if (savedGame) {
        // Store the slot to be loaded in session storage
        sessionStorage.setItem('petSim_loadSlot', slot);
        showScreen('loading-screen');
    } else {
        showNotification('No saved data in this slot.');
    }
}

function startLoadingSequence() {
    const progressFill = document.querySelector('.progress-fill');
    const loadingText = document.querySelector('.loading-text');
    const loadingTip = document.getElementById('loading-tip');
    
    // Show random tip
    const randomTip = loadingTips[Math.floor(Math.random() * loadingTips.length)];
    loadingTip.textContent = randomTip;
    
    // Animate progress bar
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 15 + 5; // Random progress increments
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            
            // Loading complete, start game
            setTimeout(() => {
                initializeGame();
            }, 500);
        }
        
        progressFill.style.width = progress + '%';
        
        // Update loading text based on progress
        if (progress < 30) {
            loadingText.textContent = 'Loading your cozy adventure...';
        } else if (progress < 60) {
            loadingText.textContent = 'Preparing your furry friends...';
        } else if (progress < 90) {
            loadingText.textContent = 'Almost ready...';
        } else {
            loadingText.textContent = 'Welcome to Pet Sim!';
        }
    }, 200);
}

function initializeGame() {
    // Initialize the main game
    if (typeof init === 'function') {
        init(); // This sets up the scene, camera, etc.

        const slotToLoad = sessionStorage.getItem('petSim_loadSlot');
        if (slotToLoad) {
            const savedGame = localStorage.getItem(`petSim_save_${slotToLoad}`);
            if (savedGame && typeof loadGameState === 'function') {
                const gameData = JSON.parse(savedGame);
                loadGameState(gameData);
                console.log('Loaded game from slot', slotToLoad);
            }
            sessionStorage.removeItem('petSim_loadSlot'); // Clean up
        } else if (typeof loadGameState === 'function') {
            // Start a fresh game
            loadGameState({});
            console.log('Started a new game.');
        }
    }
    showScreen('game-screen');
}

// Pause/Resume Functions
function pauseGame() {
    if (gameState !== 'playing') return;
    
    gameState = 'paused';
    document.getElementById('pause-menu').classList.add('active');
    playMenuSound('navigate');
    
    // Pause the game loop
    if (typeof cancelAnimationFrame !== 'undefined') {
        // Will be implemented when we integrate with the main game
    }
    
    // Stop stat decay when game is paused
    if (typeof stopStatDecay === 'function') {
        stopStatDecay();
    }
}

function resumeGame() {
    if (gameState !== 'paused') return;
    
    gameState = 'playing';
    document.getElementById('pause-menu').classList.remove('active');
    playMenuSound('select');
    
    // Resume the game loop
    if (typeof animate === 'function') {
        animate();
    }
    
    // Resume stat decay when game is resumed
    if (typeof startStatDecay === 'function') {
        startStatDecay();
    }
}

// Save/Load Functions
function saveCurrentGame() {
    if (typeof getGameState !== 'function') {
        showNotification('Error: Cannot find game state.');
        return;
    }

    if (currentSaveSlot === null) {
        // Find first available save slot, or default to 1
        currentSaveSlot = 1;
        for (let i = 1; i <= 3; i++) {
            if (!localStorage.getItem(`petSim_save_${i}`)) {
                currentSaveSlot = i;
                break;
            }
        }
    }

    const gameData = getGameState();
    gameData.timestamp = Date.now();

    localStorage.setItem(`petSim_save_${currentSaveSlot}`, JSON.stringify(gameData));
    showNotification(`Game saved to slot ${currentSaveSlot}!`);
    playMenuSound('select');
    updateSaveFileDisplay(); // Refresh the save file screen
}

function updateSaveFileDisplay() {
    // Update save file cards with actual save data
    for (let i = 1; i <= 3; i++) {
        const savedGame = localStorage.getItem(`petSim_save_${i}`);
        const saveCard = document.querySelector(`.save-file-card:nth-child(${i + 1})`);
        
        if (savedGame && saveCard) {
            const gameData = JSON.parse(savedGame);
            const date = new Date(gameData.timestamp);
            const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            saveCard.querySelector('.save-date').textContent = `Last played: ${dateStr}`;
            saveCard.querySelector('.save-stats').innerHTML = `
                <span><i class="fas fa-coins"></i> ${gameData.coins || 0}</span>
                <span><i class="fas fa-paw"></i> ${(gameData.dogStats || []).length} dogs</span>
            `;
        }
    }
}

// Settings Functions
function loadSettings() {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('petSim_settings');
    if (savedSettings) {
        settings = { ...settings, ...JSON.parse(savedSettings) };
    }
    
    // Update UI
    document.getElementById('master-volume').value = settings.masterVolume;
    document.querySelector('.volume-value').textContent = settings.masterVolume + '%';
    document.getElementById('sfx-enabled').checked = settings.sfxEnabled;
    document.getElementById('music-enabled').checked = settings.musicEnabled;
    document.getElementById('graphics-quality').value = settings.graphicsQuality;
    document.getElementById('screen-shake').checked = settings.screenShake;
    document.getElementById('auto-save').checked = settings.autoSave;
    document.getElementById('tutorial-hints').checked = settings.tutorialHints;
}

function saveSettings() {
    const wasAutoSaveEnabled = settings.autoSave;

    settings.masterVolume = parseInt(document.getElementById('master-volume').value);
    settings.sfxEnabled = document.getElementById('sfx-enabled').checked;
    settings.musicEnabled = document.getElementById('music-enabled').checked;
    settings.graphicsQuality = document.getElementById('graphics-quality').value;
    settings.screenShake = document.getElementById('screen-shake').checked;
    settings.autoSave = document.getElementById('auto-save').checked;
    settings.tutorialHints = document.getElementById('tutorial-hints').checked;
    
    localStorage.setItem('petSim_settings', JSON.stringify(settings));
    playMenuSound('select');

    // If auto-save setting changed, update the interval
    if (wasAutoSaveEnabled !== settings.autoSave) {
        if (settings.autoSave) {
            startAutoSave();
            showNotification('Auto-save enabled.');
        } else {
            stopAutoSave();
            showNotification('Auto-save disabled.');
        }
    }
}

// About Dialog
function showAbout() {
    playMenuSound('navigate');
    showNotification('Pet Sim v1.0 - A cozy dog care adventure made with love!');
}

// Utility Functions
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-size: 1rem;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Settings event listeners
    document.getElementById('master-volume').addEventListener('input', (e) => {
        document.querySelector('.volume-value').textContent = e.target.value + '%';
        settings.masterVolume = parseInt(e.target.value);
        saveSettings();
    });
    
    // Add event listeners for all settings
    const settingInputs = document.querySelectorAll('#settings input[type="checkbox"], #settings select');
    settingInputs.forEach(input => {
        input.addEventListener('change', saveSettings);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            switch(gameState) {
                case 'playing':
                    pauseGame();
                    break;
                case 'paused':
                    resumeGame();
                    break;
                case 'settings':
                case 'saved-files':
                    showScreen('main-menu');
                    break;
            }
        }
    });
    
    // Prevent right-click context menu in game
    document.addEventListener('contextmenu', (e) => {
        if (gameState === 'playing' || gameState === 'paused') {
            e.preventDefault();
        }
    });
});

// Auto-save functionality
let autoSaveInterval = null;

function startAutoSave() {
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    if (settings.autoSave) {
        autoSaveInterval = setInterval(() => {
            if (gameState === 'playing') {
                saveCurrentGame();
                console.log('Auto-saved game.');
            }
        }, 60000); // Auto-save every 60 seconds
    }
}

function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

// Initialize the menu system
showScreen('main-menu');
