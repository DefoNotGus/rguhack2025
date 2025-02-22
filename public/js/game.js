// Game state
let gameState = {
    currentRoom: 'start',
    inventory: [],
    gameLog: []
};

// Game rooms/locations
const rooms = {
    start: {
        description: 'You are in a dark room. There is a door to the north.',
        exits: {
            north: 'hallway'
        }
    },
    hallway: {
        description: 'You are in a long hallway. There are doors to the north and south.',
        exits: {
            north: 'treasure',
            south: 'start'
        }
    }
};

// Available commands
const commands = {
    help: () => {
        displayMessage('Available commands: look, go [direction], inventory');
    },
    look: () => {
        displayMessage(rooms[gameState.currentRoom].description);
    },
    go: (direction) => {
        const currentRoom = rooms[gameState.currentRoom];
        if (currentRoom.exits[direction]) {
            gameState.currentRoom = currentRoom.exits[direction];
            displayMessage(`You go ${direction}.`);
            commands.look();
        } else {
            displayMessage("You can't go that way.");
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
function processCommand() {
    const inputElement = document.getElementById('game-input');
    const input = inputElement.value.toLowerCase().trim();
    inputElement.value = '';

    displayMessage('> ' + input);

    const [command, ...args] = input.split(' ');

    if (commands[command]) {
        commands[command](...args);
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

// Event listener for Enter key
document.getElementById('game-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        processCommand();
    }
});
