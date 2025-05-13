// Penguin data - names and weights
const penguinTypes = [
    { 
        name: "Tux", 
        weight: 22.5, 
        distro: "Linux Kernel", 
        wingLength: 25.3, 
        beakLength: 8.1 
    },
    { 
        name: "Konqi", 
        weight: 18.7, 
        distro: "KDE", 
        wingLength: 22.7, 
        beakLength: 7.5 
    },
    { 
        name: "Beastie", 
        weight: 20.3, 
        distro: "BSD", 
        wingLength: 23.9, 
        beakLength: 7.8 
    },
    { 
        name: "Xue", 
        weight: 19.1, 
        distro: "Xubuntu", 
        wingLength: 21.6, 
        beakLength: 7.2 
    },
    { 
        name: "Penny", 
        weight: 16.4, 
        distro: "Debian", 
        wingLength: 20.5, 
        beakLength: 6.9 
    },
    { 
        name: "Dash", 
        weight: 15.8, 
        distro: "Ubuntu", 
        wingLength: 19.8, 
        beakLength: 6.7 
    },
    { 
        name: "Ferris", 
        weight: 17.2, 
        distro: "Fedora", 
        wingLength: 21.2, 
        beakLength: 7.0 
    },
    { 
        name: "Addy", 
        weight: 21.0, 
        distro: "Arch", 
        wingLength: 22.4, 
        beakLength: 7.6 
    },
    { 
        name: "Gentoo", 
        weight: 23.6, 
        distro: "Gentoo", 
        wingLength: 24.5, 
        beakLength: 8.3 
    },
    { 
        name: "Wilber", 
        weight: 14.8, 
        distro: "GIMP", 
        wingLength: 19.1, 
        beakLength: 6.5 
    }
];

// Game state
let gameActive = false;
let score = 0;
let timeLeft = 60;
let timerInterval;
let currentPenguin = null;
let penguinQueue = [];
let penguinOnScale = false;
let weighingResults = []; // Array to store weighing results

// DOM Elements
const queueArea = document.getElementById('queue-area');
const scaleReading = document.getElementById('scale-reading');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const weighBtn = document.getElementById('weigh-btn');
const nextBtn = document.getElementById('next-btn');
const startBtn = document.getElementById('start-btn');
const messageBox = document.getElementById('message-box');
const resultsBody = document.getElementById('results-body');

// Event listeners
startBtn.addEventListener('click', startGame);
weighBtn.addEventListener('click', weighPenguin);
nextBtn.addEventListener('click', nextPenguin);

// Game functions
function startGame() {
    gameActive = true;
    score = 0;
    timeLeft = 60;
    penguinQueue = [];
    penguinOnScale = false;
    currentPenguin = null;
    weighingResults = []; // Reset weighing results
    
    // Update UI
    scoreElement.textContent = score;
    timerElement.textContent = timeLeft;
    scaleReading.textContent = "0.0 kg";
    
    // Clear the queue area and results table
    queueArea.innerHTML = '';
    resultsBody.innerHTML = '';
    
    // Generate initial queue of penguins
    generatePenguinQueue(5);
    
    // Show/hide buttons
    startBtn.style.display = 'none';
    weighBtn.style.display = 'inline-block';
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
    showMessage("Start weighing penguins!");
}

function endGame() {
    clearInterval(timerInterval);
    gameActive = false;
    
    // Visualize average weights
    visualizeAverageWeights();
    
    // Show/hide buttons
    startBtn.style.display = 'inline-block';
    weighBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    
    // Show end message
    showMessage(`Game Over! You weighed ${score} penguins.`);
}

function generatePenguinQueue(count) {
    // Shuffle the penguin types to get random ones
    const shuffled = [...penguinTypes].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < count; i++) {
        // Get a random penguin type
        const penguinType = shuffled[i % shuffled.length];
        
        // More varied measurements
        const actualWeight = Number((penguinType.weight + (Math.random() * 4 - 2)).toFixed(1));
        const actualWingLength = Number((penguinType.wingLength + (Math.random() * 2 - 1)).toFixed(1));
        const actualBeakLength = Number((penguinType.beakLength + (Math.random() * 1 - 0.5)).toFixed(1));
        
        const penguin = {
            id: Date.now() + i,
            name: Math.random() > 0.5 ? penguinType.name : `${penguinType.name}-${Math.floor(Math.random() * 100)}`,
            distro: penguinType.distro,
            weight: actualWeight,
            wingLength: actualWingLength,
            beakLength: actualBeakLength,
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
    
    // Add more penguins if queue is getting low
    if (penguinQueue.length < 3) {
        generatePenguinQueue(3);
    }
}

function weighPenguin() {
    if (!gameActive || !currentPenguin || penguinOnScale) return;
    
    // Move penguin to scale
    currentPenguin.element.classList.remove('active');
    currentPenguin.element.classList.add('on-scale');
    penguinOnScale = true;
    
    // Display weight with a slight delay for realism
    setTimeout(() => {
        scaleReading.textContent = `${currentPenguin.weight.toFixed(1)} kg`;
        
        // Show info about the penguin
        showMessage(`${currentPenguin.name} from ${currentPenguin.distro}!`);
        
        // Add to results table
        addToResultsTable(currentPenguin);
        
        // Increment score
        score++;
        scoreElement.textContent = score;
        
        // Disable weigh button and enable next button
        weighBtn.disabled = true;
        nextBtn.disabled = false;
        
        // Play weighing sound
        playSound('weight_sound.mp3');
    }, 800);
}

function nextPenguin() {
    if (!gameActive || !penguinOnScale) return;
    
    // Remove penguin from scale
    currentPenguin.element.remove();
    penguinOnScale = false;
    
    // Reset scale
    scaleReading.textContent = "0.0 kg";
    
    // Activate next penguin
    activateNextPenguin();
    
    // Reset buttons
    weighBtn.disabled = false;
    nextBtn.disabled = true;
}

function addToResultsTable(penguin) {
    const result = {
        name: penguin.name,
        distro: penguin.distro,
        weight: penguin.weight,
        wingLength: penguin.wingLength,
        beakLength: penguin.beakLength,
        time: timeLeft,
        timestamp: new Date().toLocaleTimeString()
    };
    
    weighingResults.push(result);
    
    const row = document.createElement('tr');
    
    // Existing cells
    const nameCell = document.createElement('td');
    nameCell.textContent = result.name;
    
    const distroCell = document.createElement('td');
    distroCell.textContent = result.distro;
    
    const weightCell = document.createElement('td');
    weightCell.textContent = result.weight.toFixed(1);
    
    // New cells for wing and beak measurements
    const wingLengthCell = document.createElement('td');
    wingLengthCell.textContent = result.wingLength.toFixed(1);
    
    const beakLengthCell = document.createElement('td');
    beakLengthCell.textContent = result.beakLength.toFixed(1);
    
    const timeCell = document.createElement('td');
    timeCell.textContent = `${result.time}s`;
    
    const timestampCell = document.createElement('td');
    timestampCell.textContent = result.timestamp;
    
    // Append all cells to row
    row.appendChild(nameCell);
    row.appendChild(distroCell);
    row.appendChild(weightCell);
    row.appendChild(wingLengthCell);
    row.appendChild(beakLengthCell);
    row.appendChild(timeCell);
    row.appendChild(timestampCell);
    
    resultsBody.prepend(row);
}

function visualizeAverageWeights() {
    // Create visualization container
    const visualizationContainer = document.createElement('div');
    visualizationContainer.className = 'weight-visualization';
    visualizationContainer.innerHTML = '<h4>Penguin Measurements Distribution</h4>';

    // Create graph canvas
    const graphCanvas = document.createElement('canvas');
    graphCanvas.className = 'weight-graph-canvas';
    graphCanvas.width = 800;
    graphCanvas.height = 600;
    
    const ctx = graphCanvas.getContext('2d');

    // Collect data for different measurements
    const measurementTypes = ['weight', 'wingLength', 'beakLength'];
    const visualizations = {};

    measurementTypes.forEach(measureType => {
        const nameValues = {};
        const nameCounts = {};

        weighingResults.forEach(result => {
            const baseName = result.name.replace(/-\d+$/, '');
            
            if (!nameValues[baseName]) {
                nameValues[baseName] = 0;
                nameCounts[baseName] = 0;
            }
            nameValues[baseName] += result[measureType];
            nameCounts[baseName]++;
        });

        // Calculate average values
        const averageValues = {};
        const names = [];
        const values = [];

        Object.keys(nameValues).forEach(name => {
            const avgValue = nameValues[name] / nameCounts[name];
            averageValues[name] = avgValue;
            names.push(name);
            values.push(avgValue);
        });

        visualizations[measureType] = { 
            names, 
            values, 
            averageValues, 
            nameCounts 
        };
    });

    // Function to create a separate graph for each measurement type
    function createMeasurementGraph(measureType, graphPosition) {
        const { names, values, averageValues, nameCounts } = visualizations[measureType];
        
        const graphWidth = 250;
        const graphHeight = 250;
        const xOffset = (graphPosition % 2) * 350 + 50;
        const yOffset = Math.floor(graphPosition / 2) * 350 + 50;

        // Clear previous graph area
        ctx.clearRect(xOffset - 10, yOffset - 10, graphWidth + 20, graphHeight + 20);

        // Draw graph border
        ctx.strokeStyle = '#ddd';
        ctx.strokeRect(xOffset, yOffset, graphWidth, graphHeight);

        // Title
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${measureType.charAt(0).toUpperCase() + measureType.slice(1)} Distribution`, 
            xOffset + graphWidth / 2, yOffset - 20);

        // Axes and grid
        ctx.beginPath();
        ctx.moveTo(xOffset, yOffset + graphHeight);
        ctx.lineTo(xOffset + graphWidth, yOffset + graphHeight);
        ctx.moveTo(xOffset, yOffset);
        ctx.lineTo(xOffset, yOffset + graphHeight);
        ctx.strokeStyle = '#333';
        ctx.stroke();

        // Calculate min and max
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);

        // Plot data points
        names.forEach((name, index) => {
            const value = averageValues[name];
            const count = nameCounts[name];
            
            const xPos = xOffset + (index + 1) * (graphWidth / (names.length + 1));
            const yPos = yOffset + graphHeight - 
                ((value - minValue) / (maxValue - minValue)) * (graphHeight - 20);

            // Data point
            ctx.beginPath();
            ctx.arc(xPos, yPos, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#0a75ff';
            ctx.fill();

            // Name label
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.save();
            ctx.translate(xPos, yOffset + graphHeight + 10);
            ctx.rotate(-Math.PI / 4);
            ctx.textAlign = 'right';
            ctx.fillText(name, 0, 0);
            ctx.restore();

            // Count label
            ctx.fillText(`(${count})`, xPos, yPos - 10);
        });
    }

    // Create graphs for each measurement type
    createMeasurementGraph('weight', 0);
    createMeasurementGraph('wingLength', 1);
    createMeasurementGraph('beakLength', 2);

    visualizationContainer.appendChild(graphCanvas);

    // Add to results container
    const resultsContainer = document.querySelector('.results-container');
    
    // Remove any existing weight visualization
    const existingVisualization = resultsContainer.querySelector('.weight-visualization');
    if (existingVisualization) {
        existingVisualization.remove();
    }
    
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

// Initialize the game
function init() {
    weighBtn.disabled = false;
    nextBtn.disabled = true;
}

// Start the game
init();