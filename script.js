// Penguin data - names and weights
const penguinTypes = [
    { name: "Tux", weight: 22.5, distro: "Linux Kernel" },
    { name: "Konqi", weight: 18.7, distro: "KDE" },
    { name: "Beastie", weight: 20.3, distro: "BSD" },
    { name: "Xue", weight: 19.1, distro: "Xubuntu" },
    { name: "Penny", weight: 16.4, distro: "Debian" },
    { name: "Dash", weight: 15.8, distro: "Ubuntu" },
    { name: "Ferris", weight: 17.2, distro: "Fedora" },
    { name: "Addy", weight: 21.0, distro: "Arch" },
    { name: "Gentoo", weight: 23.6, distro: "Gentoo" },
    { name: "Wilber", weight: 14.8, distro: "GIMP" }
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
        
        // Create more varied weight randomization
        const actualWeight = Number((penguinType.weight + (Math.random() * 4 - 2)).toFixed(1));
        
        // Create a penguin object
        const penguin = {
            id: Date.now() + i,
            // Randomly select name or generate a variation
            name: Math.random() > 0.5 ? penguinType.name : `${penguinType.name}-${Math.floor(Math.random() * 100)}`,
            distro: penguinType.distro,
            weight: actualWeight,
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
    // Create result object with timestamp and additional details
    const result = {
        name: penguin.name,
        distro: penguin.distro,
        weight: penguin.weight,
        time: timeLeft,
        timestamp: new Date().toLocaleTimeString() // Add timestamp
    };
    
    // Add to results array
    weighingResults.push(result);
    
    // Create table row
    const row = document.createElement('tr');
    
    // Add cells for each property
    const nameCell = document.createElement('td');
    nameCell.textContent = result.name;
    
    const distroCell = document.createElement('td');
    distroCell.textContent = result.distro;
    
    const weightCell = document.createElement('td');
    weightCell.textContent = result.weight.toFixed(1);
    
    const timeCell = document.createElement('td');
    timeCell.textContent = `${result.time}s`;
    
    const timestampCell = document.createElement('td');
    timestampCell.textContent = result.timestamp;
    
    // Append cells to row
    row.appendChild(nameCell);
    row.appendChild(distroCell);
    row.appendChild(weightCell);
    row.appendChild(timeCell);
    row.appendChild(timestampCell);
    
    // Add row to table
    resultsBody.prepend(row); // Add to top so newest is first
}

function visualizeAverageWeights() {
    // Create visualization container with coordinate axes
    const visualizationContainer = document.createElement('div');
    visualizationContainer.className = 'weight-visualization';
    visualizationContainer.innerHTML = '<h4>Penguin Weight Distribution</h4>';

    // Create graph canvas for precise coordinate visualization
    const graphCanvas = document.createElement('canvas');
    graphCanvas.className = 'weight-graph-canvas';
    graphCanvas.width = 600;
    graphCanvas.height = 400;
    
    const ctx = graphCanvas.getContext('2d');

    // Prepare data
    const nameWeights = {};
    const nameCounts = {};

    weighingResults.forEach(result => {
        const baseName = result.name.replace(/-\d+$/, '');
        
        if (!nameWeights[baseName]) {
            nameWeights[baseName] = 0;
            nameCounts[baseName] = 0;
        }
        nameWeights[baseName] += result.weight;
        nameCounts[baseName]++;
    });

    // Calculate average weights
    const averageWeights = {};
    const names = [];
    const weights = [];

    Object.keys(nameWeights).forEach(name => {
        const avgWeight = nameWeights[name] / nameCounts[name];
        averageWeights[name] = avgWeight;
        names.push(name);
        weights.push(avgWeight);
    });

    // Draw coordinate axes
    function drawAxes() {
        ctx.beginPath();
        ctx.moveTo(50, 350);  // Origin
        ctx.lineTo(50, 50);   // Y-axis
        ctx.lineTo(550, 50);  // X-axis
        ctx.strokeStyle = '#333';
        ctx.stroke();

        // Y-axis labels (weight)
        ctx.textAlign = 'right';
        ctx.fillStyle = '#333';
        const maxWeight = Math.max(...weights);
        const minWeight = Math.min(...weights);
        
        for (let i = 0; i <= 5; i++) {
            const yPos = 350 - (i * 60);
            const weightValue = minWeight + (i * (maxWeight - minWeight) / 5);
            ctx.fillText(weightValue.toFixed(1), 45, yPos);
            
            // Light grid lines
            ctx.beginPath();
            ctx.moveTo(50, yPos);
            ctx.lineTo(550, yPos);
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.stroke();
        }

        // X-axis labels (penguin names)
        ctx.textAlign = 'center';
        names.forEach((name, index) => {
            const xPos = 50 + (index + 1) * (500 / (names.length + 1));
            ctx.fillText(name, xPos, 370);
        });
    }

    // Plot data points
    function plotDataPoints() {
        names.forEach((name, index) => {
            const weight = averageWeights[name];
            const xPos = 50 + (index + 1) * (500 / (names.length + 1));
            const yPos = 350 - ((weight - Math.min(...weights)) / (Math.max(...weights) - Math.min(...weights)) * 300);

            // Draw point
            ctx.beginPath();
            ctx.arc(xPos, yPos, 8, 0, 2 * Math.PI);
            ctx.fillStyle = '#0a75ff';
            ctx.fill();

            // Draw count as text near point
            ctx.fillStyle = '#333';
            ctx.fillText(`(${nameCounts[name]})`, xPos, yPos - 10);
        });
    }

    // Draw title for axes
    function drawTitles() {
        ctx.save();
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        
        // X-axis title
        ctx.textAlign = 'center';
        ctx.fillText('Penguin Names', 300, 395);
        
        // Y-axis title
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Average Weight (kg)', -200, 20);
        
        ctx.restore();
    }

    // Render the graph
    drawAxes();
    plotDataPoints();
    drawTitles();

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