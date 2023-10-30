import { GREEN, LOGO, RED } from "../../utils/constants";
import settings from "../../utils/settings";
import { delay } from "../../utils/thread";
import { data, registerWhen } from "../../utils/variables";


/**
 * Memoization object to store calculated P(word) values.
 */
const memo = {};
const N = Object.values(data.wordbank).reduce((acc, val) => acc + val, 0);

/**
 * Calculate the probability of a given word in a dictionary.
 * 
 * @param {string} word - The word to calculate the probability for.\
 * @returns {number} The probability of the word.
 */
function P(word) {
    if (memo[word]) return memo[word];
    memo[word] = data.wordbank[word] / N;
    return memo[word];
}

/**
 * Find the most probable spelling correction for a word.
 * 
 * @param {string} word - The word for which to find the correction.
 * @returns {string} The most probable spelling correction.
 */
function correction(word) {
    const candidatesList = candidates(word);
    const firstCandidate = candidatesList[0];
    return candidatesList.reduce((maxWord, candidate) => P(candidate) > P(maxWord) ? candidate : maxWord, firstCandidate);
}

/**
 * Generate possible spelling corrections for a given word.
 * 
 * @param {string} word - The word for which to generate corrections.
 * @returns {Array} An array of possible spelling corrections.
 */
function candidates(word) {
    const t1 = known([word]);
    if (t1.length > 0) return t1;

    const t2 = known(edits1(word));
    if (t2.length > 0) return t2;
    
    if (settings.autoTransfer >= 2) {
        const t3 = known(edits2(word));
        if (t3.length > 0) return t3;
    }

    return [word];
}

/**
 * Filter a list of words to find those that appear in the dictionary.
 * 
 * @param {Array} words - An array of words to filter.
 * @returns {Array} A filtered array of words that exist in the dictionary.
 */
function known(words) {
    return words.filter(w => {
        const occur = data.wordbank[w];
        return occur && occur > 10;
    });
}

/**
 * Generate all edits that are one edit away from a given word.
 * 
 * @param {string} word - The word for which to generate edits.
 * @returns {Array} An array of edits one step away from the word.
 */
function edits1(word) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const splits = [];

    for (let i = 0; i <= word.length; i++) {
        splits.push([word.slice(0, i), word.slice(i)]);
    }

    const edits = new Set();

    splits.forEach(([L, R]) => {
        if (R.length > 0) edits.add(L + R.slice(1)); // Deletes
        if (R.length > 1) edits.add(L + R[1] + R[0] + R.slice(2)); // Transposes
        edits.add(...letters.split('').map(c => L + c + R.slice(1))); // Replaces
        edits.add(...letters.split('').map(c => L + c + R)); // Inserts
    });

    return Array.from(edits);
}

/**
 * Currently extremely inefficient so not in use.
 * Generate all edits that are two edits away from a given word.
 * 
 * @param {string} word - The word for which to generate edits.
 * @returns {Array} An array of edits two steps away from the word.
 */
function edits2(word) {
    const results = new Set();
    edits1(word).forEach(e1 => {
        edits1(e1).forEach(e2 => {
            results.add(e2);
        });
    });

    return Array.from(results);
}

/**
 * Track invalid commands and attempt to correct them.
 */
let cd = false;
register("chat", (command, event) => {
    if (cd) return;

    // Seperate command into args and correct wordbank
    const args = command.split(' ');
    const corrected = [];
    args.forEach(word => {
        data.wordbank[word] -= 3;
        if (settings.autocorrect !== 0) corrected.push(correction(word));
    });
    data.commands[command] -= 3;
    
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
}).setCriteria("Unknown command. Type \"/help\" for help. ('${command}')");

/**
 * Save words to wordbank.
 */
register("messageSent", (message) => {
    if (!message.startsWith('/')) return;
    
    // Add to command count
    const commands = data.commands;
    if (message in commands) commands[message]++;
    else commands[message] = 1;

    // Add to wordbank count
    const wordbank = data.wordbank;
    message.substring(1).split(' ').forEach(word => {
        if (word in wordbank) wordbank[word]++;
        else wordbank[word] = 1;
    });
});

/**
 * Reset wordbank command.
 */
register("command", () => {
    data.wordbank = {};
    ChatLib.chat(`${LOGO + GREEN}Successfully reset commands' wordbank!`);
}).setName("resetWordbank");


/**
 * Auto complete command
 */
registerWhen(register("guiKey", (c, keyCode) => {
    if (keyCode !== 15) return;  // Detect tab key
    
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
