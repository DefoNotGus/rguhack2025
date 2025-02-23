let gameData = {};
let currentRoom = "Lab";
let health = 100;
let inventory = [];
let commandHistory = [];
let commandIndex = -1;
let progress = 0;
let alarmActivated = false; // New variable to track alarm activation
let wrongPathTaken = false; // New variable to track wrong path

// Winning sequence
const winningPath = [
    { room: "Lab", option: 1 },
    { room: "Lab2", option: 3 },
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
        message += `  ${index + 1}. ${option}\n`;
    });

    displayMessage(message);
}

// Display messages in the game output
function displayMessage(msg) {
    const output = document.getElementById("game-output");
    const p = document.createElement("p");
    p.innerHTML = msg.replace(/\n/g, "<br>");
    output.appendChild(p);
    output.scrollTop = output.scrollHeight;
}

// Reset game on loss
function resetGame() {
    currentRoom = "Lab";
    health = 100;
    inventory = [];
    progress = 0;
    alarmActivated = false;
    wrongPathTaken = false;
    displayMessage("Game reset!\n You just woke up from a nap\n You are back in the Lab.");
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

        if (!gameData[currentRoom].items || gameData[currentRoom].items.length === 0) {
            displayMessage("There are no items to take here.");
            return;
        }

        if (!gameData[currentRoom].items.includes(item)) {
            displayMessage(`"${item}" is not in this room.`);
        } else if (inventory.length >= 4) {
            displayMessage("You can't carry more than 4 items.");
        } else {
            inventory.push(item);
            gameData[currentRoom].items = gameData[currentRoom].items.filter(i => i !== item);
            displayMessage(`You picked up ${item}.`);
            displayRoomInfo();
        }
    } else if (!isNaN(command) || gameData[currentRoom].options.includes(input)) {
        let choiceIndex = isNaN(command) ? gameData[currentRoom].options.indexOf(input) : parseInt(command) - 1;

        if (choiceIndex < 0 || choiceIndex >= gameData[currentRoom].options.length) {
            displayMessage("Invalid choice.");
            return;
        }

        if (progress < winningPath.length) {
            let nextStep = winningPath[progress];
            if (nextStep.room !== currentRoom || (nextStep.option !== undefined && nextStep.option - 1 !== choiceIndex)) {
                displayMessage("Wrong choice! You have fainted!.\n");
                resetGame();
                return;
            }
            progress++;
        }
        // Special Lab logic
        if (currentRoom === "Lab" && choiceIndex === 0) {
            alarmActivated = true;
            displayMessage("The alarms are now blaring!");
            currentRoom = "Lab2";
            displayRoomInfo();
            return;
        }

        if (currentRoom === "Lab" && choiceIndex === 3) {
            wrongPathTaken = true;
        }
        if (currentRoom === "Hallway" && choiceIndex === 1) {
            wrongPathTaken = true;
        }

        if (wrongPathTaken) {
            currentRoom = "BlockedLobby";
            displayMessage("You took the wrong path. You must restart.");
            return;
        }

        // Handle negative impacts
        if (gameData[currentRoom].negative_impact && gameData[currentRoom].negative_impact.length > 0) {
            gameData[currentRoom].negative_impact.forEach(item => {
                if (inventory.includes(item)) {
                    displayMessage(`The ${item} is causing problems!`);
                    let negativeDamage = 10;
                    health -= negativeDamage;
                    displayMessage(`You lost an extra ${negativeDamage}% health.`);
                    if (health <= 0) {
                        resetGame();
                        return;
                    }
                }
            });
        }

        // Handle positive impacts
        if (gameData[currentRoom].positive_impact && gameData[currentRoom].positive_impact.length > 0) {
            gameData[currentRoom].positive_impact.forEach(item => {
                if (inventory.includes(item)) {
                    displayMessage(`The ${item} is helping!`);
                    let reducedDamage = 10;
                    health += reducedDamage;
                    displayMessage(`You gained ${reducedDamage}% health.`);
                }
            });
        }

        // Handle room damage
        let damage = parseInt(gameData[currentRoom].room_damage);
        if (damage > 0) {
            health -= damage;
            displayMessage(`You lost ${damage}% health.`);
            if (health <= 0) {
                resetGame();
                return;
            }
        }

        //Special item effect
        if (inventory.includes("Fire Extinguisher") && currentRoom === "Lobby" && choiceIndex === 0) {
            gameData["Lobby"].room_damage = 0;
            displayMessage("You used the fire extinguisher and put out the fire!");
            displayRoomInfo();
            return;
        }

        if (progress < winningPath.length) {
            currentRoom = winningPath[progress].room;
            displayMessage(`Moved to ${currentRoom}.`);
        }

        displayRoomInfo();

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