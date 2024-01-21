/**
 * Strips rank and tags off player name.
 * 
 * @param {String} player - Player name with rank and tags.
 * @returns {String} Base player ign.
 */
export function getPlayerName(player) {
    let name = player;
    let nameIndex = name.indexOf(']');

    while (nameIndex !== -1) {
        name = name.substring(nameIndex + 2);
        nameIndex = name.indexOf(']');
    }

    return name.split(' ')[0];
}

/**
 * Extracts and returns the guild name from a player's name string.
 *
 * @param {String} player - Player's name, possibly with guild tags and ranks.
 * @returns {String} - Extracted guild name from the player's name.
 */
export function getGuildName(player) {
    let name = player;
    let rankIndex = name.indexOf('] ');
    if (rankIndex !== -1)
        name = name.substring(name.indexOf('] ') + 2);
    name = name.substring(0, name.indexOf('[') - 1);

    return name;
}

/**
 * Returns True if entity is player otherwise False.
 * 
 * @param {Entity} entity - OtherPlayerMP Minecraft Entity.
 * @returns {Boolean} - Whether or not player is human.
 */
export function isPlayer(entity) {
    return World.getPlayerByName(entity.getName())?.getPing() === 1;
}


/**
 * Circular Imports :)
 */
import { delay } from "./thread";
import { getInParty } from "./party";
import { REFORGES } from "./constants";


/**
 * Tracks chat for any powder gain messages.
 *
 * @param {Boolean} toAll - /ac if true, /pc if false.
 * @param {String} mob - Name of the mob.
 * @param {Number} x - X coordinate.
 * @param {Number} y - Y coordinate.
 * @param {Number} z - Z coordinate.
 */
export function announceMob(chat, mob, x, y ,z) {
    if ((chat === 2 && !getInParty()) || chat === 0) return;
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);
    const zoneLine = Scoreboard?.getLines()?.find((line) => line.getName().includes("⏣")) ??
        Scoreboard?.getLines()?.find((line) => line.getName().includes("ф"));
    const area = zoneLine === undefined ? "None" : zoneLine.getName().removeFormatting();
    
    const id = chat === 2 ? "" : ` @${(Math.random() + 1).toString(36).substring(6)} ${(Math.random() + 1).toString(36).substring(9)}`;
    const CHATS = ["OFF", "ac", "pc", `msg ${Player.getName()}`];
    ChatLib.command(`${CHATS[chat]} x: ${x}, y: ${y}, z: ${z} | ${mob} spawned at [${area} ]!${id}`);
}

/**
 * Converts seconds to XXhrXXmXXs format.
 * 
 * @param {Number} seconds - Total number of seconds to convert.
 * @returns {String} Formatted time in XXhrXXmXXs format.
 */
export function getTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
  
    const timeString = [
        hours > 0 ? `${hours}hr` : '',
        `${minutes < 10 && hours > 0 ? '0' : ''}${minutes > 0 || hours > 0 ? minutes + 'm' : ''}`,
        `${remainingSeconds < 10 && (hours > 0 || minutes > 0) ? '0' : ''}${remainingSeconds.toFixed(hours > 0 || minutes > 0 ? 0 : 2)}s`
    ].join('');
  
    return timeString;
}

/**
 * Rounds number and converts num to thousand seperator format.
 * 
 * @param {Number} num - Base number to convert.
 * @returns {String} Number converted to thousand seperator format.
 */
export function commafy(num) {
    return num.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Converts a number to a string in k, m, b notation
 * 
 * @param {Number} num - Base number to convert.
 * @returns {String} Formatted number if k, m, b notation
 */
export function formatNumber(num) {
    if (isNaN(num) || num === 0) return "0";
    
    const sign = Math.sign(num);
    const absNum = Math.abs(num);

    if (absNum < 1) return (sign === -1 ? '-' : '') + absNum.toFixed(2);

    const abbrev = ["", "k", "m", "b", "t", "q", "Q"];
    const index = Math.floor(Math.log10(absNum) / 3);
  
    const formattedNumber = ((sign === -1 ? -1 : 1) * absNum / Math.pow(10, index * 3)).toFixed(2) + abbrev[index];

    // Check if the number is a whole number, and if so, remove the ".00"
    if (Number.isInteger(absNum) && absNum < 1_000) return String(parseInt(formattedNumber));
    return formattedNumber;
}

/**
 * Converts formatted numbers with suffix notations into their numeric values.
 *
 * @param {String} str - Formatted number string with optional suffix notation (k, m, b).
 * @returns {Number} - Numeric value represented by the input string, considering the notation.
 */
export function unformatNumber(str) {
    if (str === undefined) return 0;

    const notationMap = {
        k: 1_000,
        m: 1_000_000,
        b: 1_000_000_000
    };
  
    const trimmedStr = str.trim();  // Remove leading and trailing whitespace
    const numericPart = parseFloat(trimmedStr.replace(/[^\d.-]/g, ''));  // Extract numeric part
    const notation = trimmedStr.slice(-1).toLowerCase();  // Get the notation
  
    const multiplier = notationMap[notation] || 1;  // Get the appropriate multiplier
  
    if (!isNaN(numericPart)) return numericPart * multiplier;
  
    return 0;  // If conversion is not possible, return 0
}

/**
 * Converts a string with underscores to title case format.
 * 
 * @param {String} input - Input string with underscores.
 * @returns {String} String in title case format.
 */
export function convertToTitleCase(input) {
    const args = input.includes('_') ? input.toLowerCase().split('_') : input.toLowerCase().split(' ');
    return args.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * Converts a string of words to pascal case format.
 * 
 * @param {String} input - Input string with underscores.
 * @returns {String} String in pascal case format.
 */
export function convertToPascalCase(input) {
    if (!input) return;
    
    return input
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
}

/**
 * Removes specified reforges from an item string based on item type.
 *
 * @param {String} itemType - Type of item ("weapon", "armor", "misc", "all").
 * @param {String} itemString - Original item string with reforges and other words.
 * @returns {String} - Item string with specified reforges removed.
 */
export function removeReforges(itemType, itemString) {
    // Get the corresponding reforges Set based on the item type
    const reforgesSet = itemType === "all" ? new Set([
        ...REFORGES.weapon,
        ...REFORGES.armor,
        ...REFORGES.misc
    ]) : REFORGES[itemType];

    // If the item type is not valid or the reforges Set is empty, return the original item string
    if (reforgesSet === undefined || !itemString)
        return itemString;

    // Split the item string into individual words
    const words = itemString.replace(/[^a-zA-Z\s]/g, '').split(" ");

    // Filter out the words that match any of the reforges using Set.has() for faster lookup
    const filteredWords = words.filter(word => !reforgesSet.has(word));

    return filteredWords.join(" ").trim();
}


/**
 * Finds words from an array that are present in a given string.
 *
 * @param {String} str - The input string to search for words.
 * @param {String[]} arr - An array of words to search for in the string.
 * @returns {String[]} - An array containing the words found in the string.
 */
export function findWordsInString(str, arr) {
    const wordSet = new Set(arr);
    const words = arr.filter(word => str.includes(word));
    return words;
}

/**
 * Finds the first occurrence of a valid Roman numeral in a given string.
 *
 * @param {String} str - The input string to search for a Roman numeral.
 * @returns {String} - The first valid Roman numeral found in the string,
 *                          or null if no valid Roman numerals are present.
 */
export function findFirstRomanNumeral(str) {
    const romanNumeralRegex = /(IX|IV|V?I{0,3})\b/g;
    const match = str.match(romanNumeralRegex);
    return match ? match[0] : null;
}

/**
 * Function to find the index of the largest value that is greater than a given target in a sorted array.
 * @param {Number[]} arr - The sorted array.
 * @param {Number} target - The target value.
 * @returns {Number} - The index of the largest value greater than the target.
 */
export function findGreaterIndex(arr, target) {
    let left = 0;
    let right = arr.length - 1;
  
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
    
        if (arr[mid] > target) right = mid - 1;
        else left = mid + 1;
    }
  
    return right;
  }

/**
 * Finds the closest position from an array of positions to a given origin position.
 *
 * @param {Number[]} origin - The origin position [x, y, z] to which distances are measured.
 * @param {Array[Number[]]} positions - An array containing positions to compare with the origin.
 * @returns {Type[]} - An array containing two elements: the closest position [x, y, z]
 *                    from the `positions` array and the distance between the origin and
 *                    the closest position.
 */
export function getClosest(origin, positions) {
    if (positions.length === 0) return [[], 999];

    const n = origin.length;
    const oX = origin[n - 3];
    const oY = origin[n - 2];
    const oZ = origin[n - 1];
    let closestPosition = origin;
    let closestDistance = 999;
    let distance = 999;

    positions.forEach(position => {
        const m = position.length;
        distance = Math.hypot(oX - position[m - 3], oY - position[m - 2], oZ - position[m - 1]);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestPosition = position;
        }
    });

    return [closestPosition, closestDistance];
};

/**
 * Checks if a given date string is a valid date in the format "MM/DD/YYYY".
 *
 * @param {String} dateString - The date string to validate in the format "MM/DD/YYYY".
 * @returns {Boolean} - True if the date is valid, false otherwise.
 */
export function isValidDate(dateString) {
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month === 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};

/**
 * Converts a Roman numeral to an integer value.
 *
 * @param {String} str - The Roman numeral string to be converted.
 * @returns {Number} - The integer representation of the given Roman numeral.
 */
export function romanToNum(str) {
    if (!isNaN(str)) return str;
    const roman = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

    let num = 0.0;
    for (let i = 0; i < str.length; i++) {
        let curr = roman[str[i]];
        let next = roman[str[i + 1]];
        (curr < next) ? (num -= curr) : (num += curr);
    }
    return num;
};

/**
 * Converts a number 1-10 to its roman numeral counterpart.
 *
 * @param {Number} num - The integer representation of the Roman numeral.
 * @returns {String} - The roman numeral counterpart.
 */
export function numToRoman(num) {
    return ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][num - 1];
};

/**
 * Get x and y coords of top left of container index.
 * 
 * @param {Number} slot - Slot index.
 * @param {String} containerType - Container class name.
 * @returns 
 */
export function getSlotCoords(slot, containerType) {
    // Credit to https://www.chattriggers.com/modules/v/ExperimentationTable for baseline rendering
    const screen = Renderer?.screen;
    if (containerType === "ContainerPlayer") {
        if (slot > 4 && slot <= 9) {
            const x = screen?.getWidth() / 2 - 80
            const y = screen?.getHeight() / 3 + ((slot - 4) * 18) - 3;
            return [x, y];
        }

        const x = slot % 9;
        const y = Math.floor(slot / 9);
        
        const renderX = screen?.getWidth() / 2 + ((x - 4) * 18) - 8;
        const renderY = screen?.getHeight() / 2 + ((y - Player.getContainer().getSize() / 18) * 18) +  + (slot < 36 ? 27.5 : 32);

        return [renderX, renderY];
    } else if (containerType === "ContainerChest") {
        const x = slot % 9;
        const y = Math.floor(slot / 9);
        const revPos = Player.getContainer().getSize() - slot;
        const diff = revPos > 36 ? 0 :
            revPos > 9 ? 13 : 17;

        const renderX = screen?.getWidth() / 2 + ((x - 4) * 18) - 8;
        const renderY = (screen?.getHeight() + 10) / 2 + ((y - Player.getContainer().getSize() / 18) * 18) - 8 + diff;
    
        return [renderX, renderY];
    }
}

let soundCD = false;
/**
 * Plays a sound and sets cooldown
 * 
 * @param {Sound} sound - A sound ogg file from constants.js 
 * @param {Number} cd - Cooldown caused by sound play.
 */
export function playSound(sound, cd) {
    if (soundCD) return;

    sound?.play();
    soundCD = true;
    delay(() => soundCD = false, cd);
}

const decoder = java.util.Base64.getDecoder();
const compressor = net.minecraft.nbt.CompressedStreamTools;
/**
 * Decode Hypixel item NBT bytes
 * Credit to https://www.chattriggers.com/modules/v/SBInvSee for decoding!
 * 
 * @param {String} bytes - Encoded hypixel item data.
 * @returns {String} Decoded NBT data.
 */
export function decode(bytes) {
    const bytearray = decoder.decode(bytes);
    const inputstream = new java.io.ByteArrayInputStream(bytearray);
    const nbt = compressor.func_74796_a(inputstream);
    return nbt.func_150295_c("i", 10);
}

/**
 * Returns a random index in array.
 * 
 * @param {Type[]} arr - Array to find the random index of.
 * @returns {Number} Random number from 0 to arr.length - 1
 */
export function randIndex(arr) {
    return Math.floor(Math.random() * (arr.length - 1));
}
