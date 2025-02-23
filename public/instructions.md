⌨️ Commands
Command	Description
help	Displays a list of available commands.
inventory	Shows the items you are carrying.
health	Displays your current health percentage.
take [item]	Picks up an item from the room (max 4 items).
[option number] or [option text]	Selects an action in the current room.
🔹 Example:

To pick up an item: take key
To check your health: health
To choose an option: 1 or Option 1
🛣️ Winning Path
To win the game, follow this exact sequence: 1️⃣ Room 1 → Choose Option 1
2️⃣ Room 1 (again) → Choose Option 3
3️⃣ Room 2 → Choose Option 4
4️⃣ Room 3 → Choose Option 1
5️⃣ Room 4 → Choose any option → 🎉 You win! 🎉

You can do Room 1 option 4 straight away but then you will lose in room 3

🚧 Blocked Lobby Conditions
You will be sent to BlockedLobby if:

You choose Option 4 in Room 1 before Option 1.
You choose Option 2 in Room 2.
If this happens, you cannot proceed and must restart.

🔄 Command History Navigation
You can scroll through past commands just like in a terminal:

⬆️ Arrow Up → Go back to the previous command.
⬇️ Arrow Down → Move forward to the next command (or clear input).
💀 Health & Damage System
Some rooms reduce health if you don't have protective items.
Hazardous items in your inventory can reduce health.
If health reaches 0%, you faint and wake up back in the Lab with 100% health.
🎮 Game Controls
1️⃣ Type commands into the input box.
2️⃣ Press Enter to execute a command.
3️⃣ Use Arrow Up/Down to navigate past commands.
4️⃣ Read the output in the game window.

