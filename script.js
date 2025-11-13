// Audio context for sound design
let audioContext;

// Scene, camera, renderer
let scene, camera, renderer, controls;

// Dogs
let dogs = [];
let dogStats = [
    { 
        name: 'Max', 
        hunger: 80, 
        energy: 70, 
        hygiene: 60, 
        happiness: 75, 
        selected: false,
        xp: 0,
        level: 1,
        xpToNextLevel: 100,
        traits: ['energetic', 'playful']
    }
];

// Maximum dogs allowed
const MAX_DOGS = 3;

// Unlock system
const unlockRequirements = {
    dogs: [
        { name: 'Luna', level: 2, cost: 50, traits: ['playful', 'messy'] },
        { name: 'Rocky', level: 3, cost: 75, traits: ['energetic', 'hungry'] },
        { name: 'Daisy', level: 4, cost: 100, traits: ['calm', 'clean'] }
    ],
    toys: [
        { name: 'Ball', level: 2, cost: 25, happinessBonus: 10 },
        { name: 'Frisbee', level: 3, cost: 40, happinessBonus: 15 },
        { name: 'Rope', level: 4, cost: 60, happinessBonus: 20 }
    ]
};

// Available dogs for adoption
const availableDogs = [
    { 
        name: 'Bella', 
        hunger: 90, 
        energy: 85, 
        hygiene: 80, 
        happiness: 80,
        xp: 0,
        level: 1,
        xpToNextLevel: 100,
        traits: ['energetic', 'playful']
    },
    { 
        name: 'Charlie', 
        hunger: 75, 
        energy: 65, 
        hygiene: 70, 
        happiness: 70,
        xp: 0,
        level: 1,
        xpToNextLevel: 100,
        traits: ['calm', 'clean']
    }
];

// Trait system - affects stat decay rates
const traits = {
    energetic: {
        name: 'Energetic',
        description: 'Loses energy slower but gets hungrier faster',
        effects: { energyDecay: 0.7, hungerDecay: 1.3 }
    },
    calm: {
        name: 'Calm',
        description: 'Loses energy slower and stays happier longer',
        effects: { energyDecay: 0.8, happinessDecay: 0.8 }
    },
    playful: {
        name: 'Playful',
        description: 'Gains more happiness from play but gets dirty faster',
        effects: { playBonus: 1.2, hygieneDecay: 1.2 }
    },
    clean: {
        name: 'Clean',
        description: 'Stays clean longer but needs more attention',
        effects: { hygieneDecay: 0.7, happinessDecay: 1.1 }
    },
    messy: {
        name: 'Messy',
        description: 'Gets dirty quickly but is easy to please',
        effects: { hygieneDecay: 1.4, happinessDecay: 0.8 }
    },
    hungry: {
        name: 'Hungry',
        description: 'Always hungry but has lots of energy',
        effects: { hungerDecay: 1.5, energyDecay: 0.8 }
    }
};

// Economy
let coins = 100;
let selectedDogIndex = null;

// Food items
const foodItems = [
    { name: 'Kibble', cost: 10, hunger: 20, energy: 10, happiness: 5 },
    { name: 'Treat', cost: 20, hunger: 15, energy: 5, happiness: 20 },
    { name: 'Premium Food', cost: 50, hunger: 40, energy: 30, happiness: 25 }
];

// Achievements
let achievements = [
    { name: 'First Steps', description: 'Feed a dog for the first time', unlocked: false, icon: '🍖' },
    { name: 'Clean Paws', description: 'Wash all dogs', unlocked: false, icon: '🛁' },
    { name: 'Happy Pack', description: 'Get all dogs to 100% happiness', unlocked: false, icon: '🎉' },
    { name: 'Rich Owner', description: 'Save 1000 coins', unlocked: false, icon: '💰' },
    { name: 'Marathon Player', description: 'Play 50 times', unlocked: false, icon: '🏃' }
];

let stats = {
    feedCount: 0,
    washCount: 0,
    playCount: 0
};

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(frequency, duration, type = 'sine') {
    if (!audioContext) initAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f8ff);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('threejs-canvas').appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Warm point light for coziness
    const pointLight = new THREE.PointLight(0xfff5e6, 1, 20);
    pointLight.position.set(0, 8, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Home environment
    createHome();

    // Dogs
    createDogs();

    // UI
    updateUI();

    // Controls (simple orbit for now)
    controls = {
        mouseX: 0,
        mouseY: 0,
        update: function() {
            const targetX = this.mouseX * 5;
            const targetY = 5;
            const targetZ = 10 + this.mouseY * -2;
            camera.position.x += (targetX - camera.position.x) * 0.05;
            camera.position.y += (targetY - camera.position.y) * 0.05;
            camera.position.z += (targetZ - camera.position.z) * 0.05;
            camera.lookAt(scene.position);
        }
    };

    document.addEventListener('mousemove', onMouseMove);

    // Animate
    animate();
}

function createHome() {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xdeb887 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Walls (simple boxes)
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xf5f5dc });

    // Back wall
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), wallMaterial);
    backWall.position.z = -10;
    backWall.position.y = 5;
    scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.x = -10;
    leftWall.position.y = 5;
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), wallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.x = 10;
    rightWall.position.y = 5;
    scene.add(rightWall);

    // Front wall (partial for view)
    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), wallMaterial);
    frontWall.position.z = 10;
    frontWall.position.y = 5;
    frontWall.position.x = 5;
    scene.add(frontWall);

    // Simple furniture - bed
    const bedGeometry = new THREE.BoxGeometry(4, 1, 2);
    const bedMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const bed = new THREE.Mesh(bedGeometry, bedMaterial);
    bed.position.set(-5, 0.5, -5);
    bed.castShadow = true;
    scene.add(bed);
}

function adoptDog() {
    if (dogStats.length >= MAX_DOGS || availableDogs.length === 0) {
        return;
    }
    
    if (coins >= 100) {
        coins -= 100;
        
        // Get the first available dog
        const newDog = availableDogs.shift();
        newDog.selected = false;
        
        // Add to dogStats
        dogStats.push(newDog);
        
        // Create the 3D dog model
        createSingleDog(dogStats.length - 1);
        
        // Play adoption sound
        playSound(523, 0.3);
        setTimeout(() => playSound(659, 0.3), 100);
        setTimeout(() => playSound(784, 0.4), 200);
        
        // Show notification
        showNotification(`🐕 ${newDog.name} has joined your family!`);
        
        updateUI();
    }
}

// Economy balancing - adjusted costs and rewards
const economySettings = {
    washCost: 5,
    washReward: 15,
    playReward: 5,
    petReward: 0,
    feedXP: 10,
    playXP: 20,
    washXP: 15,
    petXP: 5
};

// Check for unlockable content based on progression
function checkUnlocks() {
    const maxLevel = Math.max(...dogStats.map(dog => dog.level));
    
    // Check for unlockable dogs
    const unlockableDogs = unlockRequirements.dogs.filter(dog => 
        maxLevel >= dog.level && 
        !availableDogs.some(available => available.name === dog.name) &&
        !dogStats.some(owned => owned.name === dog.name)
    );
    
    if (unlockableDogs.length > 0) {
        unlockableDogs.forEach(dog => {
            availableDogs.push({
                name: dog.name,
                hunger: 80,
                energy: 75,
                hygiene: 75,
                happiness: 75,
                xp: 0,
                level: 1,
                xpToNextLevel: 100,
                traits: dog.traits
            });
            showNotification(`🎉 New dog unlocked: ${dog.name}!`);
    // Check for unlockable toys
    const unlockableToys = unlockRequirements.toys.filter(toy => 
        maxLevel >= toy.level && 
        !window.gameProgression?.unlocks?.toys?.includes(toy.name)
    );
    
    if (unlockableToys.length > 0) {
        unlockableToys.forEach(toy => {
            if (!window.gameProgression.unlocks.toys) window.gameProgression.unlocks.toys = [];
            window.gameProgression.unlocks.toys.push(toy.name);
            showNotification(`🎉 New toy unlocked: ${toy.name}!`);
        });
    }

function createSingleDog(index) {
    const dogColors = [0xff6347, 0x32cd32, 0x1e90ff];
    const stat = dogStats[index];
    const dogGroup = new THREE.Group();
    dogGroup.userData.index = index;

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: dogColors[index] });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    dogGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 8, 6);
    const headMaterial = new THREE.MeshLambertMaterial({ color: dogColors[index] * 0.9 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1, 0.4);
    head.castShadow = true;
    head.userData.isHead = true;
    dogGroup.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.05, 6, 6);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.1, 1.05, 0.65);
    dogGroup.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.1, 1.05, 0.65);
    dogGroup.add(rightEye);

    // Nose
    const noseGeometry = new THREE.SphereGeometry(0.05, 6, 6);
    const noseMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 0.95, 0.7);
    dogGroup.add(nose);

    // Legs
    for (let i = 0; i < 4; i++) {
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 6);
        const legMaterial = new THREE.MeshLambertMaterial({ color: dogColors[index] * 0.8 });
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set((i % 2 === 0 ? -0.3 : 0.3), 0.25, (i < 2 ? 0.3 : -0.3));
        leg.castShadow = true;
        dogGroup.add(leg);
    }

    // Tail
    const tailGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.4, 6);
    const tailMaterial = new THREE.MeshLambertMaterial({ color: dogColors[index] });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.rotation.z = Math.PI / 4;
    tail.position.set(0, 0.8, -0.6);
    tail.castShadow = true;
    tail.userData.isTail = true;
    dogGroup.add(tail);

    // Selection indicator (hidden by default)
    const selectionRing = new THREE.Mesh(
        new THREE.RingGeometry(0.8, 0.9, 32),
        new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide })
    );
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.position.y = 0.05;
    selectionRing.visible = false;
    dogGroup.add(selectionRing);
    dogGroup.userData.selectionRing = selectionRing;

    // Position dogs dynamically based on count
    const spacing = 3;
    const totalWidth = (dogStats.length - 1) * spacing;
    dogGroup.position.set(index * spacing - totalWidth / 2, 0, 0);
    dogGroup.castShadow = true;
    dogGroup.receiveShadow = true;
    dogGroup.userData.baseY = dogGroup.position.y;
    dogGroup.userData.actionOffsetY = 0;
    dogGroup.userData.tailExtraRotZ = 0;
    scene.add(dogGroup);
    dogs.push(dogGroup);
}

function createDogs() {
    dogStats.forEach((stat, index) => {
        createSingleDog(index);
    });

    // Add click handler for dog selection
    document.addEventListener('click', onDogClick);
}

function onDogClick(event) {
    if (event.target && event.target.closest && event.target.closest('#ui-overlay')) {
        return;
    }
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(dogs, true);

    if (intersects.length > 0) {
        let clickedDog = intersects[0].object;
        while (clickedDog.parent && clickedDog.userData.index === undefined) {
            clickedDog = clickedDog.parent;
        }

        if (clickedDog.userData.index !== undefined) {
            selectDog(clickedDog.userData.index);
        }
    }
}

function selectDog(index) {
    // Deselect all dogs
    dogs.forEach((dog, i) => {
        dog.userData.selectionRing.visible = false;
        dogStats[i].selected = false;
    });

    // Select the clicked dog
    selectedDogIndex = index;
    dogs[index].userData.selectionRing.visible = true;
    dogStats[index].selected = true;
    
    updateUI();
    playSound(880, 0.2);
}

function updateUI() {
    const dogsList = document.getElementById('dogs-list');
    dogsList.innerHTML = `
        <div class="coins-display">💰 Coins: ${coins}</div>
    `;

    dogStats.forEach((dog, index) => {
        const dogCard = document.createElement('div');
        dogCard.className = `dog-card ${dog.selected ? 'selected' : ''}`;
        dogCard.onclick = () => selectDog(index);
        dogCard.innerHTML = `
            <h3>${dog.selected ? '⭐ ' : ''}${dog.name} <span class="level-badge">Lv.${dog.level}</span></h3>
            <div class="stat-bar">
                <span class="stat-label">Hunger</span>
                <div class="stat-bar-fill">
                    <div class="stat-fill hunger" style="width: ${dog.hunger}%"></div>
                </div>
                <span class="stat-value">${Math.round(dog.hunger)}</span>
            </div>
            <div class="stat-bar">
                <span class="stat-label">Energy</span>
                <div class="stat-bar-fill">
                    <div class="stat-fill energy" style="width: ${dog.energy}%"></div>
                </div>
                <span class="stat-value">${Math.round(dog.energy)}</span>
            </div>
            <div class="stat-bar">
                <span class="stat-label">Hygiene</span>
                <div class="stat-bar-fill">
                    <div class="stat-fill hygiene" style="width: ${dog.hygiene}%"></div>
                </div>
                <span class="stat-value">${Math.round(dog.hygiene)}</span>
            </div>
            <div class="stat-bar">
                <span class="stat-label">Happiness</span>
                <div class="stat-bar-fill">
                    <div class="stat-fill happiness" style="width: ${dog.happiness}%"></div>
                </div>
                <span class="stat-value">${Math.round(dog.happiness)}</span>
            </div>
            <div class="stat-bar xp-bar">
                <span class="stat-label">XP</span>
                <div class="stat-bar-fill">
                    <div class="stat-fill xp" style="width: ${(dog.xp / dog.xpToNextLevel) * 100}%"></div>
                </div>
                <span class="stat-value">${dog.xp}/${dog.xpToNextLevel}</span>
            </div>
            ${dog.traits ? `
            <div class="traits-display">
                ${dog.traits.map(trait => `<span class="trait-badge" title="${traits[trait]?.description || trait}">${traits[trait]?.name || trait}</span>`).join('')}
            </div>
            ` : ''}
        `;
        dogsList.appendChild(dogCard);
    });

    // Actions Panel
    const actionsPanel = document.getElementById('action-buttons');
    actionsPanel.innerHTML = '<h3>Quick Actions</h3>';

    const selectedDog = selectedDogIndex !== null ? dogStats[selectedDogIndex] : null;
    const targetText = selectedDog ? selectedDog.name : 'All Dogs';
    
    actionsPanel.innerHTML += `<p class="target-text">Target: <strong>${targetText}</strong></p>`;

    const actions = [
        { name: '🧼 Wash', action: () => performAction('wash'), cost: economySettings.washCost },
        { name: '🎾 Play', action: () => performAction('play'), cost: 0 },
        { name: '🐶 Pet', action: () => performAction('pet'), cost: 0 }
    ];

    actions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.textContent = `${action.name} ${action.cost > 0 ? '(-' + action.cost + ' 💰)' : ''}`;
        btn.disabled = action.cost > coins;
        btn.addEventListener('click', action.action);
        actionsPanel.appendChild(btn);
    });

    actions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.textContent = `${action.name} ${action.cost > 0 ? '(-' + action.cost + ' 💰)' : ''}`;
        btn.disabled = action.cost > coins;
        btn.addEventListener('click', action.action);
        actionsPanel.appendChild(btn);
    });

    // Food Store
    actionsPanel.innerHTML += '<h3 style="margin-top: 20px;">🍖 Food Store</h3>';
    foodItems.forEach((item, index) => {
        const btn = document.createElement('button');
        btn.className = 'action-btn food-btn';
        btn.disabled = item.cost > coins;
        btn.innerHTML = `
            <div class="food-item">
                <div><strong>${item.name}</strong></div>
                <div class="food-stats">🍖${item.hunger} ⚡${item.energy} 😊${item.happiness}</div>
                <div class="food-cost">${item.cost} 💰</div>
            </div>
        `;
        btn.addEventListener('click', () => buyFood(index));
        actionsPanel.appendChild(btn);
    });

    // Adopt Dog Section
    if (dogStats.length < MAX_DOGS && availableDogs.length > 0) {
        actionsPanel.innerHTML += '<h3 style="margin-top: 20px;">🐕 Adopt New Dog</h3>';
        const adoptBtn = document.createElement('button');
        adoptBtn.className = 'action-btn adopt-btn';
        adoptBtn.innerHTML = `
            <div class="adopt-item">
                <div><strong>Adopt ${availableDogs[0].name}</strong></div>
                <div class="adopt-cost">Cost: 100 💰</div>
                <div class="adopt-info">Max dogs: ${MAX_DOGS}</div>
            </div>
        `;
        adoptBtn.disabled = coins < 100;
        adoptBtn.addEventListener('click', () => adoptDog());
        actionsPanel.appendChild(adoptBtn);
    }

    // Achievements
    const unlockedAchievements = achievements.filter(a => a.unlocked);
    if (unlockedAchievements.length > 0) {
        actionsPanel.innerHTML += `<h3 style="margin-top: 20px;">🏆 Achievements (${unlockedAchievements.length}/${achievements.length})</h3>`;
        actionsPanel.innerHTML += '<div class="achievements-list">';
        achievements.forEach(achievement => {
            if (achievement.unlocked) {
                actionsPanel.innerHTML += `<div class="achievement unlocked">${achievement.icon} ${achievement.name}</div>`;
            }
        });
        actionsPanel.innerHTML += '</div>';
    }
}

function performAction(actionType) {
    const targetDogs = selectedDogIndex !== null ? [selectedDogIndex] : dogStats.map((_, index) => index);
    
    targetDogs.forEach(index => {
        const dog = dogStats[index];
        
        switch (actionType) {
            case 'wash':
                if (coins >= economySettings.washCost) {
                    coins -= economySettings.washCost;
                    dog.hygiene = Math.min(100, dog.hygiene + 30);
                    dog.happiness = Math.min(100, dog.happiness + 10);
                    playSound(330, 0.5);
                    stats.washCount++;
                    
                    // Gain XP for washing
                    gainXP(index, economySettings.washXP);
                    
                    // Animate the dog
                    animateDogAction(index, 'wash');
                }
                break;
            case 'play':
                dog.energy = Math.max(0, dog.energy - 15);
                dog.happiness = Math.min(100, dog.happiness + 25);
                dog.hygiene = Math.max(0, dog.hygiene - 5);
                playSound(440, 0.5);
                stats.playCount++;
                
                // Earn coins for playing
                coins += economySettings.playReward;
                
                // Gain XP for playing
                gainXP(index, economySettings.playXP);
                
                // Animate the dog
                animateDogAction(index, 'play');
                break;
            case 'pet':
                dog.happiness = Math.min(100, dog.happiness + 15);
                playSound(660, 0.2);
                
                // Gain XP for petting
                gainXP(index, economySettings.petXP);
                
                animateDogAction(index, 'pet');
                break;
        }
    });
    
    checkAchievements();
    checkUnlocks();
    updateUI();
}

function buyFood(foodIndex) {
    const food = foodItems[foodIndex];
    
    if (coins >= food.cost) {
        coins -= food.cost;
        
        const targetDogs = selectedDogIndex !== null ? [selectedDogIndex] : dogStats.map((_, index) => index);
        
        targetDogs.forEach(index => {
            const dog = dogStats[index];
            dog.hunger = Math.min(100, dog.hunger + food.hunger);
            dog.energy = Math.min(100, dog.energy + food.energy);
            dog.happiness = Math.min(100, dog.happiness + food.happiness);
            
            // Gain XP for feeding
            gainXP(index, economySettings.feedXP);
            
            animateDogAction(index, 'feed');
        });
        
        stats.feedCount++;
        playSound(220, 0.5);
        checkAchievements();
        updateUI();
    }
}

function checkAchievements() {
    // First Steps
    if (stats.feedCount >= 1 && !achievements[0].unlocked) {
        unlockAchievement(0);
    }
    
    // Clean Paws
    if (stats.washCount >= dogStats.length && dogStats.every(dog => dog.hygiene > 80) && !achievements[1].unlocked) {
        unlockAchievement(1);
    }
    
    // Happy Pack
    if (dogStats.length > 0 && dogStats.every(dog => dog.happiness === 100) && !achievements[2].unlocked) {
        unlockAchievement(2);
    }
    
    // Rich Owner
    if (coins >= 1000 && !achievements[3].unlocked) {
        unlockAchievement(3);
    }
    
    // Marathon Player
    if (stats.playCount >= 50 && !achievements[4].unlocked) {
        unlockAchievement(4);
    }
}

function unlockAchievement(index) {
    achievements[index].unlocked = true;
    coins += 50; // Reward for unlocking achievement
    
    // Play achievement sound
    playSound(523, 0.3);
    setTimeout(() => playSound(659, 0.3), 100);
    setTimeout(() => playSound(784, 0.4), 200);
    
    // Show notification
    showNotification(`🏆 Achievement Unlocked: ${achievements[index].name}! +50 💰`);
}

// XP and Level System
function gainXP(dogIndex, amount) {
    const dog = dogStats[dogIndex];
    dog.xp += amount;
    
    // Check for level up
    if (dog.xp >= dog.xpToNextLevel) {
        levelUpDog(dogIndex);
    }
    
    updateUI();
}

function levelUpDog(dogIndex) {
    const dog = dogStats[dogIndex];
    const oldLevel = dog.level;
    dog.level += 1;
    
    // Reset XP and increase requirement for next level
    dog.xp = 0;
    dog.xpToNextLevel = Math.floor(dog.xpToNextLevel * 1.5);
    
    // Level up benefits
    const healthBoost = 10;
    dog.hunger = Math.min(100, dog.hunger + healthBoost);
    dog.energy = Math.min(100, dog.energy + healthBoost);
    dog.hygiene = Math.min(100, dog.hygiene + healthBoost);
    dog.happiness = Math.min(100, dog.happiness + healthBoost);
    
    // Play level up sound
    playSound(523, 0.2);
    setTimeout(() => playSound(659, 0.2), 100);
    setTimeout(() => playSound(784, 0.2), 200);
    setTimeout(() => playSound(1047, 0.3), 300);
    
    // Show level up notification
    showNotification(`🎉 ${dog.name} leveled up! Level ${dog.level} reached!`);
    
    // Animate the dog
    animateLevelUp(dogIndex);
}

function animateLevelUp(dogIndex) {
    const dog = dogs[dogIndex];
    if (!dog) return;
    
    // Create level up effect
    const levelUpEffect = document.createElement('div');
    levelUpEffect.className = 'level-up-effect';
    levelUpEffect.innerHTML = '⭐ LEVEL UP! ⭐';
    levelUpEffect.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #FFD700, #FFA500);
        color: white;
        padding: 20px 40px;
        border-radius: 20px;
        font-size: 1.5rem;
        font-weight: bold;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease, transform 0.3s ease;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    `;
    
    document.body.appendChild(levelUpEffect);
    
    setTimeout(() => {
        levelUpEffect.style.opacity = '1';
        levelUpEffect.style.transform = 'translate(-50%, -50%) scale(1.1)';
    }, 100);
    
    setTimeout(() => {
        levelUpEffect.style.opacity = '0';
        levelUpEffect.style.transform = 'translate(-50%, -50%) scale(0.9)';
        setTimeout(() => levelUpEffect.remove(), 300);
    }, 2000);
    
    // Animate the dog with celebration
    const duration = 1000;
    const startTime = Date.now();
    const originalY = dog.position.y;
    
    const celebrate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress < 1) {
            const bounceHeight = Math.abs(Math.sin(progress * Math.PI * 4)) * 0.8;
            dog.position.y = originalY + bounceHeight;
            dog.rotation.y = Math.sin(progress * Math.PI * 8) * 0.2;
            requestAnimationFrame(celebrate);
        } else {
            dog.position.y = originalY;
            dog.rotation.y = 0;
        }
    };
    
    celebrate();
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function animateDogAction(dogIndex, action) {
    const dog = dogs[dogIndex];
    const originalY = dog.position.y;
    
    if (action === 'play' || action === 'feed') {
        const jumpHeight = 0.5;
        const duration = 500;
        const startTime = Date.now();
        
        const jump = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                dog.userData.actionOffsetY = Math.sin(progress * Math.PI) * jumpHeight;
                requestAnimationFrame(jump);
            } else {
                dog.userData.actionOffsetY = 0;
            }
        };
        
        jump();
    } else if (action === 'pet') {
        const duration = 600;
        const startTime = Date.now();
        const head = dog.children.find(child => child.userData && child.userData.isHead);
        const tail = dog.children.find(child => child.userData && child.userData.isTail);
        const baseHeadRotZ = head ? head.rotation.z : 0;

        const wiggle = () => {
            const elapsed = Date.now() - startTime;
            const t = elapsed / duration;
            if (t < 1) {
                const s = Math.sin(t * Math.PI * 4);
                if (head) head.rotation.z = baseHeadRotZ + s * 0.25;
                if (dog.userData) dog.userData.tailExtraRotZ = s * 0.4;
                requestAnimationFrame(wiggle);
            } else {
                if (head) head.rotation.z = baseHeadRotZ;
                if (dog.userData) dog.userData.tailExtraRotZ = 0;
            }
        };
        wiggle();
    } else if (action === 'wash') {
        const duration = 500;
        const startTime = Date.now();
        const baseX = dog.position.x;
        const shake = () => {
            const elapsed = Date.now() - startTime;
            const t = elapsed / duration;
            if (t < 1) {
                dog.position.x = baseX + Math.sin(t * Math.PI * 8) * 0.1;
                requestAnimationFrame(shake);
            } else {
                dog.position.x = baseX;
            }
        };
        shake();
    }
}

function animateDogs() {
    dogs.forEach(dog => {
        // Gentle bobbing
        const idleBob = Math.sin(Date.now() * 0.005) * 0.05;
        const actionY = dog.userData && dog.userData.actionOffsetY ? dog.userData.actionOffsetY : 0;
        dog.position.y = (dog.userData ? dog.userData.baseY : 0) + idleBob + actionY;

        // Tail wagging
        const tail = dog.children.find(child => child.userData && child.userData.isTail);
        if (tail) {
            const extra = dog.userData && dog.userData.tailExtraRotZ ? dog.userData.tailExtraRotZ : 0;
            tail.rotation.z = Math.PI / 4 + Math.sin(Date.now() * 0.01) * 0.3 + extra;
        }

        // Head nodding occasionally
        const head = dog.children.find(child => child.userData && child.userData.isHead);
        if (head) {
            head.rotation.x = Math.sin(Date.now() * 0.003) * 0.1;
        }
    });
}

function onMouseMove(event) {
    controls.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    controls.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    animateDogs();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Remove auto-initialization
// init() will be called from menu.js when loading is complete

// Save and Load Functions
function getGameState() {
    return {
        coins,
        dogStats,
        achievements,
        stats,
        selectedDogIndex,
        availableDogs,
        settings: typeof settings !== 'undefined' ? settings : null,
        timestamp: Date.now(),
        gameVersion: '1.0.0',
        // Add progression data
        progression: {
            totalXP: dogStats.reduce((sum, dog) => sum + dog.xp, 0),
            level: Math.max(...dogStats.map(dog => dog.level), 1),
            unlocks: window.gameProgression?.unlocks || {
                dogs: [],
                toys: [],
                foodItems: []
            }
        }
    };
}

function loadGameState(data) {
    coins = data.coins || 100;
    dogStats = data.dogStats || [{ 
        name: 'Max', 
        hunger: 80, 
        energy: 70, 
        hygiene: 60, 
        happiness: 75, 
        selected: false,
        xp: 0,
        level: 1,
        xpToNextLevel: 100,
        traits: ['energetic', 'playful']
    }];
    achievements = data.achievements || achievements;
    stats = data.stats || { feedCount: 0, washCount: 0, playCount: 0 };
    selectedDogIndex = data.selectedDogIndex !== undefined ? data.selectedDogIndex : null;
    
    // Reset availableDogs to the original array when starting a new game
    if (!data.availableDogs) {
        availableDogs.length = 0;
        availableDogs.push(
            { 
                name: 'Bella', 
                hunger: 90, 
                energy: 85, 
                hygiene: 80, 
                happiness: 80,
                xp: 0,
                level: 1,
                xpToNextLevel: 100,
                traits: ['energetic', 'playful']
            },
            { 
                name: 'Charlie', 
                hunger: 75, 
                energy: 65, 
                hygiene: 70, 
                happiness: 70,
                xp: 0,
                level: 1,
                xpToNextLevel: 100,
                traits: ['calm', 'clean']
            }
        );
    } else {
        availableDogs.length = 0;
        data.availableDogs.forEach(dog => availableDogs.push(dog));
    }
    
    // Load settings if available
    if (data.settings && typeof loadSettings === 'function') {
        settings = { ...settings, ...data.settings };
    }

    // Load progression data
    if (data.progression) {
        window.gameProgression = data.progression;
    }

    // Calculate time-based stat decay
    if (data.timestamp) {
        const elapsedMinutes = (Date.now() - data.timestamp) / (1000 * 60);
        const elapsedHours = elapsedMinutes / 60;
        
        const decayPoints = Math.floor(elapsedMinutes / 5) * 2;
        
        if (decayPoints > 0) {
            let criticalStatWarning = false;
            
            dogStats.forEach(dog => {
                // Apply time-based decay
                dog.hunger = Math.max(0, dog.hunger - decayPoints);
                dog.energy = Math.max(0, dog.energy - decayPoints);
                dog.hygiene = Math.max(0, dog.hygiene - decayPoints);
                dog.happiness = Math.max(0, dog.happiness - decayPoints);
                
                // Check for critical stats (below 20%)
                if (dog.hunger <= 20 || dog.energy <= 20 || dog.hygiene <= 20 || dog.happiness <= 20) {
                    criticalStatWarning = true;
                }
            });
            
            // Show notification about time-based decay
            if (typeof showNotification === 'function') {
                if (elapsedHours >= 1) {
                    showNotification(`⏱️ Your dogs were left alone for ${Math.floor(elapsedHours)} hours. They're getting hungry!`);
                } else if (elapsedMinutes >= 30) {
                    showNotification(`⏱️ Your dogs were left alone for ${Math.floor(elapsedMinutes)} minutes. They need attention!`);
                }
                
                if (criticalStatWarning) {
                    showNotification('⚠️ One or more dogs have critical stats due to time away!');
                    if (typeof playSound === 'function') {
                        playSound(220, 0.5, 'sawtooth');
                    }
                }
            }
        }
    }

    // Clear existing dogs from the scene
    if (dogs && dogs.length > 0) {
        dogs.forEach(dog => scene.remove(dog));
    }
    dogs = [];

    // Recreate dogs and UI
    createDogs();
    updateUI();
    
    // Reselect dog if one was selected
    if (selectedDogIndex !== null && selectedDogIndex < dogStats.length) {
        selectDog(selectedDogIndex);
    }

    console.log('Game state loaded successfully!');
}

// Stat decay system
let statDecayInterval = null;

function startStatDecay() {
    if (statDecayInterval) clearInterval(statDecayInterval);
    
    statDecayInterval = setInterval(() => {
        // Only decay stats when the game is actively playing (not paused or in menus)
        if (typeof gameState !== 'undefined' && gameState === 'playing') {
            let criticalStatWarning = false;
            
            dogStats.forEach(dog => {
                // Calculate decay rates based on traits
                let hungerDecay = 2;
                let energyDecay = 2;
                let hygieneDecay = 2;
                let happinessDecay = 2;
                
                if (dog.traits) {
                    dog.traits.forEach(trait => {
                        if (traits[trait]) {
                            const effects = traits[trait].effects;
                            if (effects.hungerDecay) hungerDecay *= effects.hungerDecay;
                            if (effects.energyDecay) energyDecay *= effects.energyDecay;
                            if (effects.hygieneDecay) hygieneDecay *= effects.hygieneDecay;
                            if (effects.happinessDecay) happinessDecay *= effects.happinessDecay;
                        }
                    });
                }
                
                // Apply trait-adjusted decay
                dog.hunger = Math.max(0, dog.hunger - hungerDecay);
                dog.energy = Math.max(0, dog.energy - energyDecay);
                dog.hygiene = Math.max(0, dog.hygiene - hygieneDecay);
                dog.happiness = Math.max(0, dog.happiness - happinessDecay);
                
                // Check for critical stats (below 20%)
                if (dog.hunger <= 20 || dog.energy <= 20 || dog.hygiene <= 20 || dog.happiness <= 20) {
                    criticalStatWarning = true;
                }
            });
            
            // Update UI to reflect stat changes
            updateUI();
            
            // Play warning sound and show notification for critical stats
            if (criticalStatWarning) {
                // Play warning sound
                if (typeof playSound === 'function') {
                    playSound(220, 0.5, 'sawtooth'); // Low warning tone
                }
                
                // Show critical stat warning
                if (typeof showNotification === 'function') {
                    showNotification('⚠️ One or more dogs have critical stats!');
                }
            }
        }
    }, 5000); // Decay every 5 seconds
}

function stopStatDecay() {
    if (statDecayInterval) {
        clearInterval(statDecayInterval);
        statDecayInterval = null;
    }
}

// Start the stat decay when the script loads
startStatDecay();
