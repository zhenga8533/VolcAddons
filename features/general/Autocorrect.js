import settings from "../../utils/settings";
import { GREEN, LOGO, RED } from "../../utils/constants";
import { registerWhen } from "../../utils/register";
import { delay } from "../../utils/thread";
import { data } from "../../utils/data";


/**
 * Finds the word with closest distance using Levensthein Distance formula.
 * 
 * @param {String} inputWord - Word to correct.
 * @param {Object} dictionary - Dictionary containing all the words and their counts.
 * @returns 
 */
function autocorrect(inputWord, dictionary) {
    if (dictionary.hasOwnProperty(inputWord)) return inputWord;

    // Function to calculate Levenshtein distance between two strings
    function levenshteinDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = [];

        // Initialize first column
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        // Initialize first row
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }

    // Autocorrect logic
    let bestWord = inputWord;
    let bestDistance = Infinity;

    Object.keys(dictionary).forEach(word => {
        const distance = levenshteinDistance(inputWord, word);
        if (distance <= settings.autocorrect && distance < bestDistance) {
            bestWord = word;
            bestDistance = distance;
        }
    });

    return bestWord;
}


/**
 * Corrects a command by attempting to replace misspelled words with the most probable correct ones from a wordbank.
 * 
 * @param {String} command - Full command argument that was not processable.
 * @param {ForgeTClientChatReceivedEvent} event - Chat event.
 * @returns {String} - The corrected command if autocorrection is enabled; otherwise, returns null.
*/
function correct(command, event) {
    if (cd) return;

    // Seperate command into args and correct wordbank
    const corrected = [];
    command.split(' ').forEach(word => {
        data.wordbank[word] -= 2;
        if (data.wordbank[word] <= 0) delete data.wordbank[word];
        if (settings.autocorrect !== 0) corrected.push(autocorrect(word, data.wordbank));
    });
    
    // Attempt to run new command
    if (settings.autocorrect === 0) return;
    const newCommand = corrected.join(' ');
    if (newCommand !== command) {
        // Run new command
        cancel(event);
        ChatLib.chat(`${LOGO + RED}Invalid command: "/${command}", attempting to run: "/${newCommand}"!`);
        ChatLib.command(newCommand);

        // Put invalid command on CD for 3 seconds
        cd = true;
        delay(() => {
            cd = false;
        }, 3000);
    }
}

/**
 * Track invalid commands and attempt to correct them.
 */
let cd = false;
register("chat", (command, event) => correct(command, event))
.setCriteria("Unknown command. Type \"/help\" for help. ('${command}')");

/**
 * Track invalid warp commands
 */
let lastMessage = "";
register("chat", (event) => correct(lastMessage, event))
.setCriteria("Unknown destination! Check the Fast Travel menu to view options!");

/**
 * Save words to wordbank.
 */
register("messageSent", (message) => {
    if (!message.startsWith('/')) return;
    lastMessage = message.substring(1);

    // Add to wordbank count
    const wordbank = data.wordbank;
    lastMessage.split(' ').forEach(word => {
        if (word in wordbank) wordbank[word]++;
        else wordbank[word] = 1;
    });
});


/**
 * Auto complete command
 */
registerWhen(register("guiKey", (c, keyCode, gui) => {
    if (gui.class.getName() !== "net.optifine.gui.GuiChatOF" || keyCode !== 15) return;  // Detect tab key
    
    // Find most common occurrence
    const commands = data.commands;
    let maxKey = null;
    let maxValue = 0;

    const current = Client.getCurrentChatMessage();
    Object.keys(commands).filter(command => command.startsWith(current)).forEach(command => {
        if (commands[command] > maxValue) {
            maxValue = commands[command];
            maxKey = command;
        }
    });

    // Set most common as user message
    if (maxValue === 0) return;
    Client.setCurrentChatMessage(maxKey);
}), () => settings.autocomplete);

/**
 * Reset wordbank command.
 */
register("command", () => {
    data.wordbank = {};
    ChatLib.chat(`${LOGO + GREEN}Successfully reset commands' wordbank!`);
}).setName("resetWordbank");

/**
 * Parse out uncommon commands/words
 */
register("gameUnload", () => {
    Object.keys(data.wordbank).forEach(word => {
        if (--data.wordbank[word] <= 0) delete data.wordbank[word];
    });
    data.save();
});
