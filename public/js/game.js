// Game state variables
let gameData = {};  // Stores room data loaded from JSON
let currentRoom = "Lab";  // Tracks the player's current location
let health = 100;  // Player's health
let inventory = [];  // Items the player has collected
let block_checker = false;  // Controls access to certain rooms based on choices

// Asynchronously loads game data from a JSON file
async function loadGameData() {
    try {
        const response = await fetch("js/rooms.json"); // Fetch the room data
        gameData = await response.json(); // Parse JSON data and store it in gameData
        displayMessage("You just woke up in a RGU lab\n There is smoke everywhere... \n Good luck!");
        displayRoomInfo(); // Display initial room information
    } catch (error) {
        console.error("Error loading game data:", error);
        displayMessage("Error loading game data. Please try again."); // Show error message if data fails to load
    }
}

// Displays room information with a typewriter effect after a delay
function displayRoomInfo() {
    const room = gameData[currentRoom]; // Get current room data
    if (!room) {
        setTimeout(() => typeWriterEffect("Error: Room data missing!"), 1000);
        return;
    }

    let message = `📍 You are in the ${currentRoom}\n`;
    message += `📝 ${room.description}\n`;
    message += `🎒 Items: ${room.items.length > 0 ? room.items.join(", ") : "None"}\n`;
    message += `⚡ Available Actions:\n`;

    // List available options in the room
    room.options.forEach((option, index) => {
        message += `  ${index + 1}. ${option}\n`;
    });

    setTimeout(() => typeWriterEffect(message), 1000); // Delays the message display
}

// Simulates a typewriter effect by displaying text character by character
function typeWriterEffect(text, speed = 10) {
    let index = 0;
    const outputElement = document.getElementById("game-output");
    if (!outputElement) return;

    const span = document.createElement("span"); // Create a new span to append text
    outputElement.appendChild(span);

    function type() {
        if (index < text.length) {
            if (text.charAt(index) === "\n") {
                span.innerHTML += "<br>"; // Convert newlines to HTML line breaks
            } else {
                span.innerHTML += text.charAt(index);
            }
            index++;
            setTimeout(type, speed); // Recursively call with a delay
        }
    }
    type();
}

// Displays a message in the game output area
function displayMessage(msg) {
    const output = document.getElementById("game-output");
    const p = document.createElement("p");
    p.innerHTML = msg.replace(/\n/g, "<br>"); // Convert \n to <br> for proper formatting
    output.appendChild(p);
    output.scrollTop = output.scrollHeight; // Auto-scroll to the latest message
}

// Resets the game to the initial state
function resetGame() {
    currentRoom = "Lab"; // Reset the player to the starting room
    health = 100; // Restore full health
    inventory = []; // Empty inventory
    block_checker = false; // Reset room access control
    displayMessage("You just woke up from a nap\n You are back in the Lab.");
    displayRoomInfo(); // Show the initial room info again
}

// Processes player input commands
function processCommand() {
    let input = document.getElementById("game-input").value.trim().toLowerCase();
    if (!input) return;

    // Display user's command in the game output
    displayMessage(`➡️ <strong>You:</strong> ${input}`);

    document.getElementById("game-input").value = ""; // Clear input field

    const args = input.split(" ");
    const command = args[0];

    if (command === "help") {
        displayMessage(`
            📜 <strong>Available Commands:</strong><br>
            <strong>1, 2, 3...</strong> - Choose an option to move<br>
            <strong>take [item]</strong> - Pick up an item in the room<br>
            <strong>inventory</strong> - View your collected items<br>
            <strong>health</strong> - Check your health status<br>
            <strong>reset</strong> - Restart the game
        `);
        return;
    }

    if (command === "take") {
        if (args.length < 2) {
            displayMessage("❌ Specify an item to take. Example: <strong>take key</strong>");
            return;
        }

        const item = args.slice(1).join(" ");
        const room = gameData[currentRoom];

        if (room.items.includes(item)) {
            inventory.push(item);
            room.items = room.items.filter(i => i !== item); // Remove from room
            displayMessage(`🎒 You picked up: <strong>${item}</strong>`);
        } else {
            displayMessage(`❌ There is no <strong>${item}</strong> here.`);
        }
        return;
    }
    if (command === "look") {
        displayRoomInfo();
        return;
    }
    if (command === "reset") {
        resetGame();
        return;
    }
    if (command === "inventory") {
        if (inventory.length === 0) {
            displayMessage("🎒 Your inventory is empty.");
        } else {
            displayMessage(`🎒 <strong>Inventory:</strong> ${inventory.join(", ")}`);
        }
        return;
    }

    if (command === "health") {
        displayMessage(`❤️ <strong>Health:</strong> ${health}%`);
        return;
    }

    if (!isNaN(command)) {
        let choiceIndex = parseInt(command) - 1;

        if (choiceIndex < 0 || choiceIndex >= gameData[currentRoom].options.length) {
            displayMessage("⚠️ Invalid choice.");
            resetGame();
            return;
        }

        // Room transition logic
        if (currentRoom === "Lab") {
            if (choiceIndex === 0) {
                currentRoom = "Lab again";
                block_checker = true;
            } else if (choiceIndex === 3) {
                currentRoom = "Hallway";
                block_checker = false;
            } else {
                displayMessage("❌ Wrong choice! You have fainted!");
                resetGame();
                return;
            }
        } else if (currentRoom === "Lab again") {
            if (choiceIndex === 2) {
                currentRoom = "Hallway";
            } else {
                displayMessage("❌ Wrong choice! You have fainted!");
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
                displayMessage("❌ Wrong choice! You have fainted!");
                resetGame();
                return;
            }
        } else if (currentRoom === "Lobby") {
            if (choiceIndex === 0) {
                currentRoom = "Assembly Point";
            } else {
                displayMessage("❌ Wrong choice! You have fainted!");
                resetGame();
                return;
            }
        } else if (currentRoom === "BlockedLobby") {
            displayMessage("❌ Wrong choice! You have fainted!");
            resetGame();
            return;
            
        } else if (currentRoom === "Assambly Point") {
            displayMessage("🎉 You win! 🎉");
            
            setTimeout(() => {
                displayMessage("Restarting game...");
                resetGame();
            }, 5000); // 5-second delay before restarting
            return;
        }
        

        // Health system logic
        let damage = parseInt(gameData[currentRoom].room_damage);
        let requiredItems = gameData[currentRoom].positive_impact; // Items that prevent damage
        let missingItems = requiredItems.filter(item => !inventory.includes(item)); // Items player doesn't have

        if (damage > 0) {
            if (missingItems.length === 0) {
                damage = 0; // No damage if player has all required items
            } else {
                health -= damage;
                let missingItemsMessage = missingItems.length > 0 
                    ? `🛑 You needed: <strong>${missingItems.join(", ")}</strong> to avoid damage!` 
                    : "";

                displayMessage(`💔 You lost ${damage}% health. ${missingItemsMessage}`);
            }

            if (health <= 0) {
                resetGame();
                return;
            }
        }

        gameData[currentRoom].negative_impact.forEach(item => {
            if (inventory.includes(item)) {
                health -= 40;
                displayMessage(`⚠️ The ${item} is causing problems! You lost 40% health.`);
                if (health <= 0) {
                    resetGame();
                    return;
                }
            }
        });

        displayRoomInfo(); // Show updated room information
    } else {
        displayMessage("❓ Unknown command. Type <strong>help</strong> for a list of commands.");
    }
}



// Adds an event listener to process commands when Enter is pressed
document.getElementById("game-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        processCommand();
    }
});

// Load the game data when the script is run
loadGameData();
