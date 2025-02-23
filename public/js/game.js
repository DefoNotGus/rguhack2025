// Game state
let gameState = {
    currentRoom: 'Lab',
    inventory: [],
    health: 100,
    gameLog: [],
    passedOption1: false // Tracks if Option 1 in Room 1 was chosen
};

// Command history tracking
let commandHistory = [];
let historyIndex = -1;

// Load rooms data from JSON
async function loadRooms() {
    try {
        const response = await fetch('rooms.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading rooms:', error);
        return {};
    }
}

// Display the room info neatly
function displayRoom(rooms) {
    const room = rooms[gameState.currentRoom];
    let message = `Room: ${gameState.currentRoom}\n\n`;
    message += `Description: ${room.description}\n\n`;

    if (room.items.length > 0) {
        message += `\n Items in the room:\n - ${room.items.join("\n - ")}\n\n`;
    }

    message += `Available Actions:\n`;
    room.options.forEach((option, index) => {
        message += ` ${index + 1}. ${option}\n`;
    });

    displayMessage(message);
}

// Process the player's health effects
function applyRoomEffects(rooms) {
    const room = rooms[gameState.currentRoom];

    // Check negative impact items in inventory
    let hasNegativeItems = gameState.inventory.some(item => room.negative_impact.includes(item));
    if (hasNegativeItems) {
        gameState.health -= 40;
        displayMessage("You feel weaker due to hazardous items in your inventory. Health reduced by 40%.");
    }

    // Check for room damage if no protective items are in inventory
    let roomDamage = parseInt(room.room_damage) || 0;
    let hasProtection = gameState.inventory.some(item => room.positive_impact.includes(item));
    if (roomDamage > 0 && !hasProtection) {
        gameState.health -= roomDamage;
        displayMessage(`The environment affects you. You take ${roomDamage}% damage.`);
    }

    // If health is 0 or below, reset the player to Lab
    if (gameState.health <= 0) {
        displayMessage("You fainted. You wake up back in the Lab.");
        gameState.health = 100;    // Reset health
        gameState.currentRoom = 'Lab';    // Reset to starting room
    }
}

// Player selects an option
async function chooseOption(input, rooms) {
    const room = rooms[gameState.currentRoom];
    const choice = isNaN(input) ? input : room.options[parseInt(input) - 1];

    if (!room.options.includes(choice)) {
        displayMessage("Invalid option. Choose a valid action.");
        return;
    }

    let nextRoom = null;

    // Implement winning path logic
    if (gameState.currentRoom === "Room1" && choice === "Option 1") {
        gameState.passedOption1 = true; // Track that player chose Option 1
        nextRoom = "Room1"; // Room 1 comes up again but with limited options
    } else if (gameState.currentRoom === "Room1" && gameState.passedOption1 && choice === "Option 3") {
        nextRoom = "Room2";
    } else if (gameState.currentRoom === "Room2" && choice === "Option 4") {
        nextRoom = "Room3";
    } else if (gameState.currentRoom === "Room3" && choice === "Option 1") {
        nextRoom = "Room4";
    } else if (gameState.currentRoom === "Room4") {
        displayMessage("Congratulations! You won the game!");
        return;
    }

    // Implement "BlockedLobby" conditions
    if (gameState.currentRoom === "Room1" && choice === "Option 4" && !gameState.passedOption1) {
        nextRoom = "BlockedLobby";
    } else if (gameState.currentRoom === "Room2" && choice === "Option 2") {
        nextRoom = "BlockedLobby";
    }

    if (nextRoom) {
        gameState.currentRoom = nextRoom;
        displayMessage(`You chose correctly. Moving to ${nextRoom}...`);
    } else {
        displayMessage("Wrong decision. You panic and rush back to the Lab.");
        gameState.currentRoom = "Lab";
    }

    applyRoomEffects(rooms);
    displayRoom(rooms);
}

// Available commands
const commands = {
    help: () => {
        displayMessage('Available commands: take [item], inventory, health, [option number/text]');
    },

    take: async (item) => {
        const rooms = await loadRooms();
        const room = rooms[gameState.currentRoom];

        if (room.items.includes(item)) {
            if (gameState.inventory.length >= 4) {
                let removedItem = gameState.inventory.shift(); // Remove oldest item
                displayMessage(`Inventory is full. You dropped ${removedItem} to pick up ${item}.`);
            }
            gameState.inventory.push(item);
            room.items = room.items.filter(i => i !== item);
            displayMessage(`You picked up ${item}.`);
        } else {
            displayMessage(`There is no ${item} here.`);
        }
    },

    inventory: () => {
        if (gameState.inventory.length === 0) {
            displayMessage('Your inventory is empty.');
        } else {
            displayMessage('Inventory: ' + gameState.inventory.join(', '));
        }
    },

    health: () => {
        displayMessage(`Your health: ${gameState.health}%`);
    }
};

// Process user input
async function processCommand() {
    const inputElement = document.getElementById('game-input');
    const input = inputElement.value.trim();

    if (!input) return;

    // Store command in history
    commandHistory.push(input);
    historyIndex = commandHistory.length; // Reset index to allow new commands
    inputElement.value = '';

    displayMessage('> ' + input);
    const rooms = await loadRooms();

    if (commands[input]) {
        commands[input]();
    } else if (!isNaN(input) || rooms[gameState.currentRoom].options.includes(input)) {
        chooseOption(input, rooms);
    } else {
        displayMessage("Invalid command. Type 'help' for options.");
    }
}

// Display message in the game output
function displayMessage(message) {
    const outputElement = document.getElementById('game-output');
    gameState.gameLog.push(message);
    outputElement.innerHTML = gameState.gameLog.map(msg => `<p>${msg}</p>`).join('');
    outputElement.scrollTop = outputElement.scrollHeight;
}

// Initialize game
async function initGame() {
    const rooms = await loadRooms();
    displayRoom(rooms);

    document.getElementById('game-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            processCommand();
        }
    });

    // Command history navigation with Up/Down keys
    document.getElementById('game-input').addEventListener('keydown', function(event) {
        if (event.key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                this.value = commandHistory[historyIndex];
            }
            event.preventDefault();
        } else if (event.key === 'ArrowDown') {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                this.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                this.value = ''; // Clears input if at the latest command
            }
            event.preventDefault();
        }
    });
}

// Start the game when the page loads
window.addEventListener('load', initGame);