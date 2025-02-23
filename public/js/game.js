let gameData = {};
let currentRoom = "Lab";
let health = 100;
let inventory = [];
let commandHistory = [];
let commandIndex = -1;
let progress = 0;

// Winning sequence
const winningPath = [
    { room: "Lab", option: 1 },
    { room: "Lab", option: 4 },
    { room: "Hallway", option: 4 },
    { room: "Lobby", option: 1 },
    { room: "Assambly Point" }
];

// Fetch the room data
async function loadGameData() {
    try {
        const response = await fetch("js/rooms.json");
        gameData = await response.json();
        displayMessage("Welcome to Fire Inc.!");
        displayRoomInfo();
    } catch (error) {
        console.error("Error loading game data:", error);
        displayMessage("Error loading game data. Please try again.");
    }
}

// Display the current room's state
function displayRoomInfo() {
    const room = gameData[currentRoom];
    if (!room) {
        displayMessage("Error: Room data missing!");
        return;
    }

    let message = `📍 You are in ${currentRoom}\n`;
    message += `📝 ${room.description}\n`;
    message += `🚪 Exits: ${room.exits.join(", ")}\n`;
    message += `🎒 Items: ${room.items.length > 0 ? room.items.join(", ") : "None"}\n`;
    message += `⚡ Available Actions:\n`;

    room.options.forEach((option, index) => {
        message += `   ${index + 1}. ${option}\n`;
    });

    displayMessage(message);
}

// Display messages in the game output
function displayMessage(msg) {
    const output = document.getElementById("game-output");
    const p = document.createElement("p");
    p.innerHTML = msg.replace(/\n/g, "<br>"); // Preserve line breaks
    output.appendChild(p);
    output.scrollTop = output.scrollHeight;
}

// Reset game on loss
function resetGame() {
    currentRoom = "Lab";
    health = 100;
    inventory = [];
    progress = 0;
    displayMessage("Game reset! You are back in the Lab.");
    displayRoomInfo();
}

// Process user commands
function processCommand() {
    let input = document.getElementById("game-input").value.toLowerCase().trim();
    if (!input) return;

    commandHistory.push(input);
    commandIndex = commandHistory.length;
    document.getElementById("game-input").value = "";

    const args = input.split(" ");
    const command = args[0];

    if (command === "help") {
        displayMessage("Commands: help, inventory, health, take [item], [option number] or [option text]");
    } else if (command === "inventory") {
        displayMessage("You have: " + (inventory.length ? inventory.join(", ") : "nothing"));
    } else if (command === "health") {
        displayMessage("Health: " + health + "%");
    } else if (command === "take") {
        let item = args.slice(1).join(" ");
        
        // Ensure the room has items before trying to take one
        if (!gameData[currentRoom].items || gameData[currentRoom].items.length === 0) {
            displayMessage("There are no items to take here.");
            return;
        }
        
        // Check if the item exists in the room
        if (!gameData[currentRoom].items.includes(item)) {
            displayMessage(`"${item}" is not in this room.`);
        } else if (inventory.length >= 4) {
            displayMessage("You can't carry more than 4 items.");
        } else {
            inventory.push(item); // Add item to inventory
            gameData[currentRoom].items = gameData[currentRoom].items.filter(i => i !== item); // Remove from room
            displayMessage(`You picked up ${item}.`);
            displayRoomInfo(); // Refresh room info to reflect removed item
        }
    } else if (!isNaN(command) || gameData[currentRoom].options.includes(input)) {
        let choiceIndex = isNaN(command) ? gameData[currentRoom].options.indexOf(input) : parseInt(command) - 1;

        if (choiceIndex < 0 || choiceIndex >= gameData[currentRoom].options.length) {
            displayMessage("Invalid choice.");
            return;
        }

        // Enforce correct sequence
        if (progress < winningPath.length) {
            let nextStep = winningPath[progress];
            if (nextStep.room !== currentRoom || (nextStep.option !== undefined && nextStep.option - 1 !== choiceIndex)) {
                displayMessage("Wrong choice! Restarting game.");
                resetGame();
                return;
            }
            progress++;
        }

        // Handle special lose conditions
        if (currentRoom === "Lab" && choiceIndex === 3 && progress < 1) {
            currentRoom = "BlockedLobby";
            displayMessage("You are now in BlockedLobby. You must restart.");
            return;
        }
        if (currentRoom === "Hallway" && choiceIndex === 1) {
            currentRoom = "BlockedLobby";
            displayMessage("You took the wrong path. You must restart.");
            return;
        }

        // Handle health reduction
        let damage = parseInt(gameData[currentRoom].room_damage);
        if (damage > 0) {
            health -= damage;
            displayMessage(`You lost ${damage}% health.`);
            if (health <= 0) {
                resetGame();
                return;
            }
        }

        // Move to next room
        if (progress < winningPath.length) {
            currentRoom = winningPath[progress].room;
            displayMessage(`Moved to ${currentRoom}.`);
        }

        // Display the new room info
        displayRoomInfo();

        // Winning condition
        if (currentRoom === "Assambly Point") {
            displayMessage("🎉 You win! 🎉");
            resetGame();
        }
    } else {
        displayMessage("Unknown command.");
    }
}

// Handle keyboard input for command history
document.getElementById("game-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        processCommand();
    } else if (event.key === "ArrowUp") {
        if (commandIndex > 0) {
            commandIndex--;
            document.getElementById("game-input").value = commandHistory[commandIndex];
        }
    } else if (event.key === "ArrowDown") {
        if (commandIndex < commandHistory.length - 1) {
            commandIndex++;
            document.getElementById("game-input").value = commandHistory[commandIndex];
        } else {
            document.getElementById("game-input").value = "";
        }
    }
});

// Load the game data
loadGameData();
