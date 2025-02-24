// Game state variables
let gameData = {};  // Stores room data loaded from JSON
let currentRoom = "Lab";  // Tracks the player's current location
let health = 100;  // Player's health
let inventory = [];  // Items the player has collected
let block_checker = false;  // Controls access to certain rooms based on choices
let playeremoji = ""
let choosingEmoji = true; 

// Asynchronously loads game data from a JSON file
async function loadGameData() {
    try {
        const response = await fetch("js/rooms.json"); // Fetch the room data
        gameData = await response.json(); // Parse JSON data and store it in gameData
        displayMessage("You just woke up in a RGU lab \n Sleeping in the job again...");
        askForEmoji(); // Ask for emoji first
    } catch (error) {
        console.error("Error loading game data:", error);
        displayMessage("Error loading game data. Please try again."); // Show error message if data fails to load
    }
}
// Function to ask the player to choose an emoji with typewriter effect
function askForEmoji() {
    typeWriterEffect("Choose your player emoji:\n1. 🦜 (Parrot)\n2. 😎 (Cool)\n3. 🤡 (Clown)\n4. 👻 (Ghost)");
    document.getElementById("game-input").addEventListener("keydown", handleEmojiInput);
}

// Function to handle emoji input
function handleEmojiInput(event) {
    if (event.key === "Enter") {
        let input = document.getElementById("game-input").value.trim();
        let emoji;

        switch (input) {
            case "1":
            case "🦜":
                emoji = "🦜";
                break;
            case "2":
            case "😎":
                emoji = "😎";
                break;
            case "3":
            case "🤡":
                emoji = "🤡";
                break;
            case "4":
            case "👻":
                emoji = "👻";
                break;
            default:
                displayMessage("Invalid choice. Please choose from 1-4 or the emojis.");
                return;
        }

        playeremoji = emoji;
        displayMessage(`You chose ${playeremoji}!`);
        document.getElementById("game-input").value = "";
        document.getElementById("game-input").removeEventListener("keydown", handleEmojiInput);
        choosingEmoji = false; // Set flag to false
        displayMessage("You just woke up in a RGU lab\n There is smoke everywhere... \n Good luck!");
        displayRoomInfo();
    }
}
//Change Image
function updateRoomImage() {
    const imageElement = document.getElementById("game-illustration"); // Ensure this ID exists in your HTML
    if (imageElement) {
        imageElement.src = `img/${currentRoom}.png`; // Set the new image source
        imageElement.alt = `Image of ${currentRoom}`; // Update alt text for accessibility
    } else {
        console.warn("Room image element not found!");
    }
}

// Displays room information
function displayRoomInfo() {
    const room = gameData[currentRoom];
    if (!room) {
        displayMessage("Error: Room data missing!");
        return;
    }
    updateRoomImage();

    let message = "";
    if (currentRoom === "BlockedLobby") {
        message = `📍 You are in the Lobby\n`;
        message += `📝 ${room.description}\n`;
        message += `🎒 Items: ${room.items.length > 0 ? room.items.join(", ") : "None"}\n`;
        message += `⚡ Available Actions:\n`;
    } else {
        message = `📍 You are in the ${currentRoom}\n`;
        message += `📝 ${room.description}\n`;
        message += `🎒 Items: ${room.items.length > 0 ? room.items.join(", ") : "None"}\n`;
        message += `⚡ Available Actions:\n`;
    }

    room.options.forEach((option, index) => {
        message += `  ${index + 1}. ${option}\n`;
    });

    displayMessage(message);
}

// Simulates a typewriter effect by displaying text character by character
function typeWriterEffect(text, speed = 20) {
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
        } else {
            // Scroll to bottom after the entire message is typed
            requestAnimationFrame(() => {
                outputElement.scrollTop = outputElement.scrollHeight;
            });
        }
    }
    type();
}

// Displays a message in the game output area
function displayMessage(msg) {
    const output = document.getElementById("game-output");
    const p = document.createElement("p");
    p.innerHTML = msg.replace(/\n/g, "<br>");
    output.appendChild(p);

    // Use requestAnimationFrame to ensure the scroll happens after the DOM updates
    requestAnimationFrame(() => {
        output.scrollTop = output.scrollHeight;
    });
}

function handleWrongChoice() {
    displayMessage("❌ You have fainted!");
    resetGame();
}

function handleWin() {
    displayMessage("🎉 You win! 🎉");
    displayMessage("Restarting game...\nReady!\n Use 'reset' command");
}
// Resets the game to the initial state
// Function to reset the game's core state
function resetGame() {
    currentRoom = "Lab";
    health = 100;
    inventory = [];
    block_checker = false;
    updateHealthDisplay();
    displayMessage("It was all a dream...");
    displayRoomInfo();
}

// Function to change the player's emoji and reset game
function changeEmoji() {
    playeremoji = "";
    choosingEmoji = true;
    displayMessage("Please choose your new emoji.");
    askForEmoji();

}

// Function to update the health bar and text
function updateHealthDisplay() {
    const healthBar = document.querySelector('.health-bar');
    const healthText = document.getElementById('health');

    if (healthBar && healthText) {
        healthBar.style.width = `${health}%`;
        healthText.textContent = `${health}%`;

        if (health > 70) {
            healthBar.style.backgroundColor = 'green';
        } else if (health > 30) {
            healthBar.style.backgroundColor = 'orange';
        } else {
            healthBar.style.backgroundColor = 'red';
        }
    }
}
// Processes player input commands
function processCommand() {
    let input = document.getElementById("game-input").value.trim().toLowerCase();
    if (!input) return;

    let decision = input; // Default to input

    // Check if the input is a number between 1 and 5
    if (!isNaN(input) && parseInt(input) >= 1 && parseInt(input) <= 5) {
        let choiceIndex = parseInt(input) - 1; // Convert input to index

        if (gameData[currentRoom] && gameData[currentRoom].options && gameData[currentRoom].options[choiceIndex]) {
            decision = gameData[currentRoom].options[choiceIndex]; // Use the room option
        }
    }

    // Display user's command in the game output
    displayMessage(`${playeremoji} <strong>You:</strong> ${decision}`);

    document.getElementById("game-input").value = ""; // Clear input field

    const args = input.split(" ");
    const command = args[0];

    if (command === "help") {
        displayMessage(`
            📜 <strong>Available Commands:</strong><br>
            <strong>Make decisions</strong> - Choose an option to move<br>
            <strong>take [item]</strong> - Pick up an item in the room<br>
            <strong>inventory</strong> - View your collected items<br>
            <strong>health</strong> - Check your health status<br>
            <strong>reset</strong> - Restart the game
            <strong>restart</strong> - Change emoji and start from zero!
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
    if (command === "restart") {
        changeEmoji();
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
                handleWrongChoice();
                return;
            }
        } else if (currentRoom === "Lab again") {
            if (choiceIndex === 2) {
                currentRoom = "Hallway";
            } else {
                handleWrongChoice();
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
                handleWrongChoice();
                return;
            }
        } else if (currentRoom === "Lobby") {
            if (choiceIndex === 0) {
                if (inventory.includes("fire extinguisher")) {
                    currentRoom = "Assembly Point";
                } else {
                    displayMessage("🔥 I can't go through the fire without a fire extinguisher!");
                    handleWrongChoice();
                    return; 
                }
            } else {
                handleWrongChoice();
                return;
            }
        } else if (currentRoom === "BlockedLobby") {
            handleWrongChoice();
            return;
        } else if (currentRoom === "Assembly Point") {
            handleWin();
            return;
        }
        
        updateRoomImage(); // Update image before showing room info

        // Health system logic
        let damage = parseInt(gameData[currentRoom].room_damage);
        let requiredItems = gameData[currentRoom].positive_impact;
        let missingItems = requiredItems.filter(item => !inventory.includes(item));

        if (damage > 0) {
            if (missingItems.length === 0) {
                damage = 0;
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

        updateHealthDisplay(); // Update health display after damage
        displayRoomInfo();
    } else {
        displayMessage("❓ Unknown command. Type <strong>help</strong> for a list of commands.");
    }
}



// Adds an event listener to process commands when Enter is pressed
document.getElementById("game-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !choosingEmoji) { //Only process command if not choosing emoji
        processCommand();
    }
});

// Load the game data when the script is run
loadGameData();
