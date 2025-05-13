// Penguin data - names and testing data
const penguinTypes = [
    { name: "Tux", distro: "Linux Kernel" },
    { name: "Konqi", distro: "KDE" },
    { name: "Beastie", distro: "BSD" },
    { name: "Xue", distro: "Xubuntu" },
    { name: "Penny", distro: "Debian" },
    { name: "Dash", distro: "Ubuntu" },
    { name: "Ferris", distro: "Fedora" },
    { name: "Addy", distro: "Arch" },
    { name: "Gentoo", distro: "Gentoo" },
    { name: "Wilber", distro: "GIMP" }
];

// Version designs for A/B testing
const versionDesigns = [
    { name: "A", color: "#ff5e5e", layout: "Simple", tested: false },
    { name: "B", color: "#5ea9ff", layout: "Complex", tested: false }
];

// Game state
let gameActive = false;
let score = 0;
let timeLeft = 60;
let timerInterval;
let currentPenguin = null;
let penguinQueue = [];
let penguinOnTest = false;
let testingResults = []; // Array to store testing results
let testStartTime = 0;
let testVersion = null;

// DOM Elements
const queueArea = document.getElementById('queue-area');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const testBtn = document.getElementById('test-btn');
const nextBtn = document.getElementById('next-btn');
const startBtn = document.getElementById('start-btn');
const messageBox = document.getElementById('message-box');
const resultsBody = document.getElementById('results-body');
const stationA = document.getElementById('station-a');
const stationB = document.getElementById('station-b');
const resetBtn = document.getElementById('reset-btn');

// Event listeners
startBtn.addEventListener('click', startGame);
testBtn.addEventListener('click', runTest);
nextBtn.addEventListener('click', nextPenguin);
resetBtn.addEventListener('click', resetGame);

// Game functions
function startGame() {
    gameActive = true;
    score = 0;
    timeLeft = 60;
    penguinQueue = [];
    penguinOnTest = false;
    currentPenguin = null;
    testingResults = []; // Reset testing results
    
    // Update UI
    scoreElement.textContent = score;
    timerElement.textContent = timeLeft;
    
    // Clear the queue area and results table
    queueArea.innerHTML = '';
    resultsBody.innerHTML = '';
    
    // Set up the testing stations
    setupTestingStations();
    
    // Generate initial queue of penguins
    generatePenguinQueue(5);
    
    // Show/hide buttons
    startBtn.style.display = 'none';
    testBtn.style.display = 'inline-block';
    nextBtn.style.display = 'inline-block';
    
    // Activate first penguin
    activateNextPenguin();
    
    // Start the timer
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
    
    // Show starting message
    showMessage("Start A/B testing with penguins!");
}

function setupTestingStations() {
    // Set up version A
    const screenA = stationA.querySelector('.screen-content');
    screenA.style.backgroundColor = versionDesigns[0].color;
    
    // Set up version B
    const screenB = stationB.querySelector('.screen-content');
    screenB.style.backgroundColor = versionDesigns[1].color;
    
    // Add timer displays to each station
    if (!stationA.querySelector('.timer-display')) {
        const timerA = document.createElement('div');
        timerA.className = 'timer-display';
        timerA.id = 'timer-a';
        timerA.textContent = '0.0s';
        stationA.appendChild(timerA);
        
        const timerB = document.createElement('div');
        timerB.className = 'timer-display';
        timerB.id = 'timer-b';
        timerB.textContent = '0.0s';
        stationB.appendChild(timerB);
    }
}

function endGame() {
    clearInterval(timerInterval);
    gameActive = false;
    
    // Visualize A/B testing results
    visualizeTestingResults();
    
    // Show/hide buttons
    startBtn.style.display = 'inline-block';
    testBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    
    // Show end message
    showMessage(`Testing complete! You tested ${score} penguins.`);
}

function generatePenguinQueue(count) {
    // Shuffle the penguin types to get random ones
    const shuffled = [...penguinTypes].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < count; i++) {
        // Get a random penguin type
        const penguinType = shuffled[i % shuffled.length];
        
        // Create a penguin object
        const penguin = {
            id: Date.now() + i,
            // Randomly select name or generate a variation
            name: Math.random() > 0.5 ? penguinType.name : `${penguinType.name}-${Math.floor(Math.random() * 100)}`,
            distro: penguinType.distro,
            element: null
        };
        
        // Add to queue
        penguinQueue.push(penguin);
        
        // Create and add the penguin element to the queue
        const penguinElement = document.createElement('div');
        penguinElement.className = 'penguin';
        penguinElement.style.backgroundImage = `url('penguin${i % 4 + 1}.png')`;
        penguinElement.dataset.id = penguin.id;
        
        queueArea.appendChild(penguinElement);
        penguin.element = penguinElement;
    }
}

function activateNextPenguin() {
    if (penguinQueue.length === 0) {
        generatePenguinQueue(5);
    }
    
    currentPenguin = penguinQueue.shift();
    currentPenguin.element.classList.add('active');
    
    // Cycle between versions in strict order
    const untestedVersions = versionDesigns.filter(v => !v.tested);
    testVersion = untestedVersions[0] || versionDesigns[0];
    
    // Add more penguins if queue is getting low
    if (penguinQueue.length < 3) {
        generatePenguinQueue(3);
    }
}

function runTest() {
    if (!gameActive || !currentPenguin || penguinOnTest) return;
    
    // Check if this version has already been tested for this penguin
    const currentVersionDesign = versionDesigns.find(v => v.name === testVersion.name);
    
    if (currentVersionDesign.tested) {
        showMessage(`${currentPenguin.name} has already been tested on Version ${testVersion.name}`);
        return;
    }
    
    // Move penguin to test station
    currentPenguin.element.classList.remove('active');
    currentPenguin.element.classList.add('on-test');
    
    // Add class based on version
    if (testVersion.name === 'A') {
        currentPenguin.element.classList.add('at-a');
    } else {
        currentPenguin.element.classList.add('at-b');
    }
    
    penguinOnTest = true;
    testStartTime = Date.now();
    
    // Start the test timers
    const timerDisplay = document.getElementById(testVersion.name === 'A' ? 'timer-a' : 'timer-b');
    const timerUpdateInterval = setInterval(() => {
        const elapsedTime = (Date.now() - testStartTime) / 1000;
        timerDisplay.textContent = `${elapsedTime.toFixed(1)}s`;
    }, 100);
    
    // Simulate testing time - randomly between 2-6 seconds
    const testingTime = 2000 + Math.random() * 4000;
    
    setTimeout(() => {
        clearInterval(timerUpdateInterval);
        
        // Calculate final time spent on the test
        const timeSpent = (Date.now() - testStartTime) / 1000;
        
        // Mark this version as tested
        currentVersionDesign.tested = true;
        
        // Show info about the penguin
        showMessage(`${currentPenguin.name} from ${currentPenguin.distro} tested version ${testVersion.name} in ${timeSpent.toFixed(1)}s!`);
        
        // Add to results table
        addToResultsTable(currentPenguin, timeSpent);
        
        // Increment score
        score++;
        scoreElement.textContent = score;
        
        // Disable test button and enable next button
        testBtn.disabled = true;
        nextBtn.disabled = false;
        
        // Play testing complete sound
        playSound('weight_sound.mp3');
    }, testingTime);
}

function nextPenguin() {
    if (!gameActive || !penguinOnTest) return;
    
    // Remove penguin from test station
    currentPenguin.element.classList.remove('on-test', 'at-a', 'at-b');
    currentPenguin.element.remove();
    penguinOnTest = false;
    
    // Reset timers
    document.getElementById('timer-a').textContent = '0.0s';
    document.getElementById('timer-b').textContent = '0.0s';
    
    // Check if both versions have been tested
    const versionsAllTested = versionDesigns.every(v => v.tested);
    
    if (versionsAllTested) {
        // Reset tested status for next round
        versionDesigns.forEach(v => v.tested = false);
    }
    
    // Activate next penguin
    activateNextPenguin();
    
    // Reset buttons
    testBtn.disabled = false;
    nextBtn.disabled = true;
}

function addToResultsTable(penguin, timeSpent) {
    // Create result object with timestamp and additional details
    const result = {
        name: penguin.name,
        distro: penguin.distro,
        version: testVersion.name,
        time: timeSpent.toFixed(1),
        timestamp: new Date().toLocaleTimeString() // Add timestamp
    };
    
    // Add to results array
    testingResults.push(result);
    
    // Create table row
    const row = document.createElement('tr');
    
    // Add cells for each property
    const nameCell = document.createElement('td');
    nameCell.textContent = result.name;
    
    const distroCell = document.createElement('td');
    distroCell.textContent = result.distro;
    
    const versionCell = document.createElement('td');
    versionCell.textContent = result.version;
    
    const timeCell = document.createElement('td');
    timeCell.textContent = result.time;
    
    const timestampCell = document.createElement('td');
    timestampCell.textContent = result.timestamp;
    
    // Append cells to row
    row.appendChild(nameCell);
    row.appendChild(distroCell);
    row.appendChild(versionCell);
    row.appendChild(timeCell);
    row.appendChild(timestampCell);
    
    // Add row to table
    resultsBody.prepend(row); // Add to top so newest is first
}

function visualizeTestingResults() {
    // Group results by version
    const versionA = testingResults.filter(result => result.version === 'A');
    const versionB = testingResults.filter(result => result.version === 'B');
    
    // Calculate average time for each version
    const avgTimeA = versionA.length > 0 
        ? versionA.reduce((sum, result) => sum + parseFloat(result.time), 0) / versionA.length 
        : 0;
    
    const avgTimeB = versionB.length > 0 
        ? versionB.reduce((sum, result) => sum + parseFloat(result.time), 0) / versionB.length 
        : 0;
    
    // Create visualization container
    const visualizationContainer = document.createElement('div');
    visualizationContainer.className = 'weight-visualization';
    visualizationContainer.innerHTML = '<h4>A/B Testing Results</h4>';
    
    // Create bar graph container
    const graphContainer = document.createElement('div');
    graphContainer.className = 'ab-graph';
    
    // Create Version A column
    const columnA = document.createElement('div');
    columnA.className = 'graph-column';
    
    const labelA = document.createElement('div');
    labelA.className = 'graph-label';
    labelA.textContent = `Version A (${versionA.length} tests)`;
    
    const barContainerA = document.createElement('div');
    barContainerA.className = 'graph-bar-container';
    
    const barA = document.createElement('div');
    barA.className = 'graph-bar';
    barA.style.backgroundColor = versionDesigns[0].color;
    
    const barValueA = document.createElement('div');
    barValueA.className = 'bar-value';
    barValueA.textContent = `${avgTimeA.toFixed(1)}s`;
    
    // Create Version B column
    const columnB = document.createElement('div');
    columnB.className = 'graph-column';
    
    const labelB = document.createElement('div');
    labelB.className = 'graph-label';
    labelB.textContent = `Version B (${versionB.length} tests)`;
    
    const barContainerB = document.createElement('div');
    barContainerB.className = 'graph-bar-container';
    
    const barB = document.createElement('div');
    barB.className = 'graph-bar';
    barB.style.backgroundColor = versionDesigns[1].color;
    
    const barValueB = document.createElement('div');
    barValueB.className = 'bar-value';
    barValueB.textContent = `${avgTimeB.toFixed(1)}s`;
    
    // Calculate bar heights (inversely proportional to time - faster is better)
    const maxTime = Math.max(avgTimeA, avgTimeB);
    const normFactor = maxTime > 0 ? 100 / maxTime : 0;
    
    // Set bar heights
    barA.style.height = `${avgTimeA * normFactor}%`;
    barB.style.height = `${avgTimeB * normFactor}%`;
    
    // Assemble the graph
    barContainerA.appendChild(barA);
    barA.appendChild(barValueA);
    columnA.appendChild(labelA);
    columnA.appendChild(barContainerA);
    
    barContainerB.appendChild(barB);
    barB.appendChild(barValueB);
    columnB.appendChild(labelB);
    columnB.appendChild(barContainerB);
    
    graphContainer.appendChild(columnA);
    graphContainer.appendChild(columnB);
    
    // Add conclusion
    const conclusion = document.createElement('div');
    conclusion.style.textAlign = 'center';
    conclusion.style.margin = '10px 0';
    conclusion.style.fontWeight = 'bold';
    
    if (avgTimeA < avgTimeB) {
        conclusion.textContent = 'Version A performed better with faster completion times!';
    } else if (avgTimeB < avgTimeA) {
        conclusion.textContent = 'Version B performed better with faster completion times!';
    } else {
        conclusion.textContent = 'Both versions performed equally.';
    }
    
    // Add to visualization container
    visualizationContainer.appendChild(graphContainer);
    visualizationContainer.appendChild(conclusion);
    
    // Add to results container
    const resultsContainer = document.querySelector('.results-container');
    resultsContainer.appendChild(visualizationContainer);
}

function showMessage(text) {
    messageBox.textContent = text;
    messageBox.classList.add('show');
    
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 3000);
}

function playSound(soundFile) {
    const sound = new Audio(soundFile);
    sound.play();
}

function resetGame() {
    // Stop any ongoing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Reset game state
    gameActive = false;
    score = 0;
    timeLeft = 60;
    penguinQueue = [];
    penguinOnTest = false;
    currentPenguin = null;
    testingResults = [];
    
    // Reset UI elements
    scoreElement.textContent = '0';
    timerElement.textContent = '60';
    queueArea.innerHTML = '';
    resultsBody.innerHTML = '';
    
    // Reset version testing status
    versionDesigns.forEach(v => v.tested = false);
    
    // Remove any existing visualization
    const visualization = document.querySelector('.weight-visualization');
    if (visualization) {
        visualization.remove();
    }
    
    // Reset button states
    startBtn.style.display = 'inline-block';
    testBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    
    // Reset testing stations
    const screenA = stationA.querySelector('.screen-content');
    screenA.style.backgroundColor = versionDesigns[0].color;
    
    const screenB = stationB.querySelector('.screen-content');
    screenB.style.backgroundColor = versionDesigns[1].color;
    
    // Reset timers in stations
    const timerA = document.getElementById('timer-a');
    const timerB = document.getElementById('timer-b');
    if (timerA) timerA.textContent = '0.0s';
    if (timerB) timerB.textContent = '0.0s';
    
    // Clear message box with a reset instruction
    showMessage("Game reset. Press Start to begin a new testing session!");
    
    // Ensure buttons are in their initial state
    testBtn.disabled = false;
    nextBtn.disabled = true;
}

// Initialize the game
function init() {
    testBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    testBtn.disabled = false;
    nextBtn.disabled = true;
    resetBtn.style.display = 'inline-block'; // Ensure reset button is visible
}

// Start the game
init();