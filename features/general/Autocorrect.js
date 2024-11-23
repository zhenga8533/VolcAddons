import { DARK_GRAY, GRAY, GREEN, LOGO, RED, WHITE } from "../../utils/Constants";
import { data } from "../../utils/Data";
import Settings from "../../utils/Settings";
import { delay } from "../../utils/ThreadTils";

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
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  // Autocorrect logic
  let bestWord = inputWord;
  let bestDistance = Infinity;

  Object.keys(dictionary).forEach((word) => {
    const distance = levenshteinDistance(inputWord, word);
    if (distance <= 2 && distance < bestDistance) {
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
  // Remove command from cache
  data.commands[command] -= 2;
  if (data.commands[command] <= 0) delete data.commands[command];

  command.split(" ").forEach((word, index) => {
    const wordbank = data.wordbanks[index];
    wordbank[word] -= 2;
    if (wordbank[word] <= 0) delete wordbank[word];
  });
  if (cd || !Settings.autocorrect) return;

  // Seperate command into args and correct wordbank
  const corrected = [];
  command.split(" ").forEach((word, index) => {
    corrected.push(autocorrect(word, data.wordbanks[index]));
  });

  // Attempt to run new command
  const newCommand = corrected.join(" ");
  if (newCommand !== command && data.commands.hasOwnProperty(newCommand)) {
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
register("chat", (command, event) => correct(command, event)).setCriteria(
  "Unknown command. Type \"/help\" for help. ('${command}')"
);

/**
 * Track invalid warp commands
 */
let lastMessage = "";
register("chat", (event) => correct(lastMessage, event)).setCriteria(
  "Unknown destination! Check the Fast Travel menu to view options!"
);

register("chat", (event) => correct(lastMessage, event)).setCriteria("You don't have permission to run that command!");

/**
 * Autocomplete
 */
let selected = 0;
let suggestions = [];
let suggesting = false;

const suggest = register("renderChat", () => {
  const select = suggestions.length - selected - 1;
  const strings = suggestions.map(
    (command, index) => `${(index === select ? WHITE : GRAY) + command + DARK_GRAY} (${data.commands[command]})`
  );

  // Draw suggestions
  const width = Renderer.getStringWidth(
    strings.reduce((longest, current) => (current.length > longest.length ? current : longest), "")
  );
  const height = strings.length * 9;
  const y = Renderer.screen.getHeight() - 18 - height;

  Renderer.translate(0, 0, 300);
  Renderer.drawRect(Renderer.color(0, 0, 0, 128), 7, y - 2, width + 4, height + 4);

  Renderer.translate(0, 0, 300);
  Renderer.drawString(strings.join("\n"), 9, y, true);
}).unregister();

const key = register("guiKey", (char, keyCode, __, event) => {
  let chat = Client.getCurrentChatMessage() + (keyCode <= 57 && keyCode !== 15 ? char : "");
  if (keyCode === 14) chat = chat.substring(0, chat.length - 2);
  suggestions = Object.keys(data.commands).filter(
    (command) => data.commands[command] >= 5 && command.startsWith(chat.substring(1))
  );
  suggestions.sort((a, b) => data.commands[a] - data.commands[b]);
  selected = MathLib.clamp(selected, 0, Math.max(0, suggestions.length - 1));

  if (!chat.startsWith("/") || chat.length < 3 || suggestions.length === 0) {
    suggest.unregister();
    return;
  }

  if (keyCode === 200) {
    // Up Key
    selected = MathLib.clamp(selected + 1, 0, suggestions.length - 1);
    if (suggesting) cancel(event);
  } else if (keyCode === 208) {
    // Down Key
    selected = MathLib.clamp(selected - 1, 0, suggestions.length - 1);
    if (suggesting) cancel(event);
  } else if (keyCode === 15) {
    // Tab Key
    const fill = suggestions[suggestions.length - selected - 1];
    Client.setCurrentChatMessage("/" + fill);
    suggestions = Object.keys(data.commands).filter(
      (command) => data.commands[command] >= 5 && command.startsWith(fill)
    );
    suggestions.sort((a, b) => data.commands[a] - data.commands[b]);
    selected = suggestions.length - suggestions.indexOf(fill) - 1;
    if (suggesting) cancel(event);
  } else {
    suggest.register();
    suggesting = true;
  }
}).unregister();

const close = register("guiClosed", () => {
  key.unregister();
  suggest.unregister();
  close.unregister();
  suggesting = false;
}).unregister();

register("guiOpened", () => {
  if (!Settings.autocomplete) return;

  Client.scheduleTask(1, () => {
    if (!Client.currentGui.get().toString().includes("GuiChat")) return;

    selected = 0;
    key.register();
    close.register();
  });
});

/**
 * Save words to wordbank.
 */
register("messageSent", (message) => {
  if (!message.startsWith("/")) return;
  lastMessage = message.substring(1);

  // Add to wordbank count
  lastMessage.split(" ").forEach((word, index) => {
    if (data.wordbanks.length < index + 1) data.wordbanks.push({});

    const wordbank = data.wordbanks[index];
    if (wordbank.hasOwnProperty(word)) wordbank[word]++;
    else wordbank[word] = 1;
  });

  // Add to command count
  if (data.commands.hasOwnProperty(lastMessage)) data.commands[lastMessage]++;
  else data.commands[lastMessage] = 1;
}).setPriority(Priority.HIGHEST);

/**
 * Reset commands.
 */
register("command", () => {
  data.wordbanks = [];
  ChatLib.chat(`${LOGO + GREEN}Successfully reset wordbank cache!`);
}).setName("resetWordbank");

register("command", () => {
  data.commands = {};
  ChatLib.chat(`${LOGO + GREEN}Successfully reset commands cache!`);
}).setName("resetCommands");

/**
 * Parse out uncommon commands/words
 */
try {
  if (Date.now() - data.lastJoin > 3_600_000) {
    data.wordbanks.forEach((wordbank) => {
      Object.keys(wordbank).forEach((word) => {
        wordbank[word]--;
        if (wordbank[word] <= 0) delete wordbank[word];
      });
    });

    Object.keys(data.commands).forEach((command) => {
      data.commands[command]--;
      if (data.commands[command] <= 0) delete data.commands[command];
    });
  }
} catch (e) {
  console.error(`[VolcAddons] Failed to parse data JSON!`);
}
