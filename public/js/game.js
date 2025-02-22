// Game state
let gameState = {
    currentRoom: 'start',
    inventory: [],
    gameLog: []
};

// Load rooms data from JSON
async function loadRooms() {
    try {
        const response = await fetch('rooms.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading rooms:', error);
        // Fallback to default rooms if JSON fails to load
        return defaultRooms;
    }
}

// Fallback default rooms
const defaultRooms = {
    start: {
        description: 'You are in a dark room. There is a door to the north.',
        exits: {
            north: 'hallway'
        },
        items: ['torch', 'note']
    },
    hallway: {
        description: 'You are in a long hallway. There are doors to the north and south.',
        exits: {
            north: 'treasure',
            south: 'start'
        },
        items: ['key']
    },
    treasure: {
        description: 'You are in the treasure room. There is a large chest here.',
        exits: {
            south: 'hallway'
        },
        items: ['gold coin', 'jewel']
    }
};

// Available commands
const commands = {
    help: () => {
        displayMessage('Available commands: look, go [direction], take [item], drop [item], inventory');
    },
    
    look: (rooms) => {
        const currentRoom = rooms[gameState.currentRoom];
        let description = currentRoom.description;
        
        if (currentRoom.items && currentRoom.items.length > 0) {
            description += '\nYou can see: ' + currentRoom.items.join(', ');
        }
        
        displayMessage(description);
    },
    
    go: (direction, rooms) => {
        const currentRoom = rooms[gameState.currentRoom];
        if (currentRoom.exits[direction]) {
            gameState.currentRoom = currentRoom.exits[direction];
            displayMessage(`You go ${direction}.`);
            commands.look(rooms);
        } else {
            displayMessage("You can't go that way.");
        }
    },
    
    take: (item, rooms) => {
        const currentRoom = rooms[gameState.currentRoom];
        const itemIndex = currentRoom.items ? currentRoom.items.indexOf(item) : -1;
        
        if (itemIndex !== -1) {
            // Remove item from room and add to inventory
            currentRoom.items.splice(itemIndex, 1);
            gameState.inventory.push(item);
            displayMessage(`You take the ${item}.`);
        } else {
            displayMessage(`There is no ${item} here.`);
        }
    },
    
    drop: (item, rooms) => {
        const itemIndex = gameState.inventory.indexOf(item);
        
        if (itemIndex !== -1) {
            // Remove item from inventory and add to current room
            gameState.inventory.splice(itemIndex, 1);
            if (!rooms[gameState.currentRoom].items) {
                rooms[gameState.currentRoom].items = [];
            }
            rooms[gameState.currentRoom].items.push(item);
            displayMessage(`You drop the ${item}.`);
        } else {
            displayMessage(`You don't have ${item}.`);
        }
    },
    
    inventory: () => {
        if (gameState.inventory.length === 0) {
            displayMessage('Your inventory is empty.');
        } else {
            displayMessage('Inventory: ' + gameState.inventory.join(', '));
        }
    }
};

// Process user input
async function processCommand() {
    const inputElement = document.getElementById('game-input');
    const input = inputElement.value.toLowerCase().trim();
    inputElement.value = '';

    displayMessage('> ' + input);

    const [command, ...args] = input.split(' ');
    const rooms = await loadRooms();

    if (commands[command]) {
        commands[command](args.join(' '), rooms);
    } else {
        displayMessage("I don't understand that command.");
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
    commands.look(rooms);
    
    // Event listener for Enter key
    document.getElementById('game-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            processCommand();
        }
    });
}

// Start the game when the page loads
window.addEventListener('load', initGame);
