let gameData = {};
let currentRoom = "Lab";
let health = 100;
let inventory = [];
let block_checker = false;

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

function displayMessage(msg) {
    const output = document.getElementById("game-output");
    const p = document.createElement("p");
    p.innerHTML = msg.replace(/\n/g, "<br>");
    output.appendChild(p);
    output.scrollTop = output.scrollHeight;
}

function resetGame() {
    currentRoom = "Lab";
    health = 100;
    inventory = [];
    block_checker = false;
    displayMessage("Game reset!\n You just woke up from a nap\n You are back in the Lab.");
    displayRoomInfo();
}

function processCommand() {
    let input = document.getElementById("game-input").value.trim();
    if (!input) return;

    document.getElementById("game-input").value = "";

    const args = input.split(" ");
    const command = args[0];

    if (!isNaN(command)) {
        let choiceIndex = parseInt(command) - 1;

        if (choiceIndex < 0 || choiceIndex >= gameData[currentRoom].options.length) {
            displayMessage("Invalid choice.");
            resetGame();
            return;
        }

        if (currentRoom === "Lab") {
            if (choiceIndex === 0) {
                currentRoom = "Lab again";
                block_checker = true;
            } else if (choiceIndex === 3) {
                currentRoom = "Hallway";
                block_checker = false;
            } else {
                displayMessage("Wrong choice! You have fainted!.");
                resetGame();
                return;
            }
        } else if (currentRoom === "Lab again") {
            if (choiceIndex === 2) {
                currentRoom = "Hallway";
            } else {
                displayMessage("Wrong choice! You have fainted!.");
                resetGame();
                return;
            }
        } else if (currentRoom === "Hallway") {
            if (choiceIndex === 1) {
                currentRoom = "BlockedLobby";
            } else if (choiceIndex === 3) {
                if (block_checker) {
                    currentRoom = "Lobby";
                } else {
                    currentRoom = "BlockedLobby";
                }
            } else {
                displayMessage("Wrong choice! You have fainted!.");
                resetGame();
                return;
            }
        } else if (currentRoom === "Lobby") {
            if (choiceIndex === 0) {
                currentRoom = "Assambly Point";
            } else {
                displayMessage("Wrong choice! You have fainted!.");
                resetGame();
                return;
            }
        } else if (currentRoom === "BlockedLobby") {
            displayMessage("Wrong choice! You have fainted!.");
            resetGame();
            return;
        } else if (currentRoom === "Assambly Point") {
            displayMessage("🎉 You win! 🎉");
            resetGame();
            return;
        }

        //Health logic
        let damage = parseInt(gameData[currentRoom].room_damage);
        if (damage > 0) {
            gameData[currentRoom].positive_impact.forEach(item => {
                if (inventory.includes(item)) {
                    damage = 0;
                }
            });
            health -= damage;
            displayMessage(`You lost ${damage}% health.`);
            if (health <= 0) {
                resetGame();
                return;
            }
        }

        gameData[currentRoom].negative_impact.forEach(item => {
            if (inventory.includes(item)) {
                health -= 40;
                displayMessage(`The ${item} is causing problems! You lost 40% health.`);
                if (health <= 0) {
                    resetGame();
                    return;
                }
            }
        });

        displayRoomInfo();
    } else {
        displayMessage("Unknown command.");
        resetGame();
    }
}

document.getElementById("game-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        processCommand();
    }
});

loadGameData();