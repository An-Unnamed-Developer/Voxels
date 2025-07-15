const canvas = document.getElementById('gameCanvas');
const gl = canvas.getContext('webgl');

// Basic setup for a 3D perspective
function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Set up WebGL with a blue skybox
    gl.clearColor(0.53, 0.81, 0.92, 1.0); // Sky color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Load player skin and map it as shown in the provided images
    loadPlayerSkin();

    // Initialize basic world with blocks
    initializeWorld();

    // Set up event listeners for block placing/breaking
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    // Connect to the WebSocket server for multiplayer support
    connectToServer();
}

// Function for loading the player skin
function loadPlayerSkin() {
    const skinTexture = new Image();
    skinTexture.src = 'images/skins/builtin.jpeg'; // Replace with the actual path to the skin image
    skinTexture.onload = () => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skinTexture);
        gl.generateMipmap(gl.TEXTURE_2D);
    };
}

// Function to initialize the game world
function initializeWorld() {
    const groundHeight = -50; // Y-coordinate for the ground
    const groundWidth = 100; // X and Z dimensions for the ground
    const groundDepth = 100;

    // Generate a grid of blocks for the ground
    for (let x = -groundWidth; x < groundWidth; x++) {
        for (let z = -groundDepth; z < groundDepth; z++) {
            addBlock(x, groundHeight, z, 'dirt'); // Add dirt blocks for the ground
        }
    }
}

// Function to add a block to the world
function addBlock(x, y, z, type) {
    const block = {
        x: x,
        y: y,
        z: z,
        type: type,
        texture: 'images/blocks/' + type + '.png' // Replace with the actual path to the block texture
    };
    world.push(block); // Add the block to the world array
}

const world = []; // Array to hold the world blocks

// Handles click events for breaking and placing blocks
function handleClick(event) {
    const ray = getRayFromMouse(event);
    const block = getBlockAtRay(ray);
    if (block) {
        // Remove the block if it exists
        removeBlock(block);
    } else {
        // Place a new block at the clicked position
        placeBlock(ray);
    }
}

// Function to get a ray from the mouse position
function getRayFromMouse(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 2 - 1;
    const y = (event.clientY - rect.top) / rect.height * -2 + 1;
    return { x: x, y: y };
}

// Function to find the block at a ray
function getBlockAtRay(ray) {
    // Implement logic to find the block at the given ray
    // This is a simplified example and may need adjustment
    const blockSize = 1; // Assuming blocks are 1x1x1
    const origin = { x: 0, y: 0, z: 0 }; // Player's position
    const direction = { x: ray.x, y: ray.y, z: 0 }; // Ray direction

    for (let block of world) {
        if (isPointInBlock(origin, direction, block, blockSize)) {
            return block;
        }
    }
    return null;
}

// Function to check if a point is in a block
function isPointInBlock(origin, direction, block, blockSize) {
    const minX = block.x - blockSize / 2;
    const maxX = block.x + blockSize / 2;
    const minY = block.y - blockSize / 2;
    const maxY = block.y + blockSize / 2;
    const minZ = block.z - blockSize / 2;
    const maxZ = block.z + blockSize / 2;

    const t = (minX - origin.x) / direction.x;
    if (t < 0 || t > 1) return false;

    const y = origin.y + t * direction.y;
    const z = origin.z + t * direction.z;

    return y >= minY && y <= maxY && z >= minZ && z <= maxZ;
}

// Function to remove a block
function removeBlock(block) {
    const index = world.indexOf(block);
    if (index !== -1) {
        world.splice(index, 1);
    }
}

// Function to place a block
function placeBlock(ray) {
    // Implement logic to place a block at the given ray position
    // This is a simplified example and may need adjustment
    const blockSize = 1; // Assuming blocks are 1x1x1
    const origin = { x: 0, y: 0, z: 0 }; // Player's position
    const direction = { x: ray.x, y: ray.y, z: 0 }; // Ray direction

    const t = (origin.y - 1) / direction.y; // Place block below the player
    const x = origin.x + t * direction.x;
    const z = origin.z + t * direction.z;

    addBlock(x, origin.y - 1, z, 'stone'); // Place a stone block
}

// Handles key presses for movement and interaction
function handleKeyDown(event) {
    switch (event.key) {
        case 'w':
            moveForward();
            break;
        case 's':
            moveBackward();
            break;
        case 'a':
            moveLeft();
            break;
        case 'd':
            moveRight();
            break;
        case ' ':
            jump();
            break;
    }
}

let player = {
    x: 0,
    y: 0,
    z: 0,
    speed: 0.1
};

// Function for player movement forward
function moveForward() {
    player.z -= player.speed;
}

// Function for player movement backward
function moveBackward() {
    player.z += player.speed;
}

// Function for player movement left
function moveLeft() {
    player.x -= player.speed;
}

// Function for player movement right
function moveRight() {
    player.x += player.speed;
}

// Function for player jump
function jump() {
    player.y += 1; // Simple jump logic
}

// Connect to the WebSocket server for multiplayer support
function connectToServer() {
    const ws = new WebSocket("wss://voxels.uk.to/");
    ws.onopen = () => console.log("Connected to server");
    ws.onmessage = (message) => handleServerMessage(message);
    ws.onerror = (error) => console.error("WebSocket Error: ", error);
    ws.onclose = () => console.log("Disconnected from server");
}

function handleServerMessage(message) {
    const data = JSON.parse(message.data);
    switch (data.type) {
        case 'playerJoin':
            // Handle a new player joining the game
            break;
        case 'playerLeave':
            // Handle a player leaving the game
            break;
        case 'blockUpdate':
            // Handle updates to the game world (block changes)
            break;
        case 'playerMove':
            // Handle player movement updates
            break;
    }
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
});

init();
