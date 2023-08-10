import { delay } from "./thread";


/**
 * Tracks chat for any powder gain messages.
 *
 * @param {boolean} toAll - /ac if true, /pc if false.
 * @param {string} mob - Name of the mob.
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @param {number} z - Z coordinate.
 */
export function announceMob(toAll, mob, x, y ,z) {
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);
    let zoneLine = Scoreboard.getLines().find((line) => line.getName().includes("⏣"));
    if (zoneLine === undefined) zoneLine = Scoreboard.getLines().find((line) => line.getName().includes("ф"));
    const area = zoneLine === undefined ? "None" : zoneLine.getName().removeFormatting();
    
    const id = toAll ? ` @${(Math.random() + 1).toString(36).substring(6)}` : "";
    ChatLib.command(`ac x: ${x}, y: ${y}, z: ${z} | ${mob} Spawned at [${area} ]!${id}`);
}

/**
 * Converts seconds to XXhrXXmXXs format.
 * 
 * @param {number} seconds - Total number of seconds to convert.
 * @returns {string} Formatted time in XXhrXXmXXs format.
 */
export function getTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
  
    const timeString = [
        hours > 0 ? `${hours}hr` : '',
        minutes > 0 ? `${minutes}m` : '',
        `${remainingSeconds.toFixed(hours > 0 || minutes > 0 ? 0 : 2)}s`
    ].join('');
  
    return timeString;
}

/**
 * Rounds number and converts num to thousand seperator format.
 * 
 * @param {number} num - Base number to convert.
 * @returns {string} Number converted to thousand seperator format.
 */
export function commafy(num) {
    return num.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Converts a number to a string in k, m, b notation
 * 
 * @param {number} num 
 * @returns {string} Formatted number if k, m, b notation
 */
export function formatNumber(num) {
    if (isNaN(num)) return 0;

    const absNum = Math.abs(num);
    const abbrev = ["", "k", "m", "b"];
    const index = Math.floor(Math.log10(absNum) / 3);
  
    return (num / Math.pow(10, index * 3)).toFixed(2) + abbrev[index];
  }

/**
 * Strips rank and tags off player name.
 * 
 * @param {string} player - Player name with rank and tags.
 * @returns {string} Base player ign.
 */
export function getPlayerName(player) {
    let name = player;
    let nameIndex = name.indexOf(']');

    while (nameIndex != -1) {
        name = name.substring(nameIndex + 2);
        nameIndex = name.indexOf(']');
    }

    return name;
}
export function getGuildName(player) {
    let name = player;
    let rankIndex = name.indexOf('] ');
    if (rankIndex != -1)
        name = name.substring(name.indexOf('] ') + 2);
    name = name.substring(0, name.indexOf('[') - 1);

    return name;
}

/**
 * Converts a string with underscores to title case format.
 * 
 * @param {string} input - Input string with underscores.
 * @returns {string} String in title case format.
 */
export function convertToTitleCase(input) {
    return input
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
/**
 * Converts a string of words to pascal case format.
 * 
 * @param {string} input - Input string with underscores.
 * @returns {string} String in pascal case format.
 */
export function convertToPascalCase(input) {
    if (!input) return; 

    return input
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
}

/**
 * Removes any modifiers off item name.
 * 
 * @param {string} itemType - Item auction class.
 * @param {string} itemString - Item with any modifiers.
 * @returns {string} Base name of item.
 */
const REFORGES = {
    "weapon": new Set([
        "Epic", "Fair", "Fast", "Gentle", "Heroic", "Legendary", "odd", "Sharp", "Spicy", "Coldfused", "Dirty", "Fabled", "Gilded", "Suspicious",
        "Warped", "Withered", "Bulky", "Fanged",
        "Awkward", "Deadly", "Fine", "Grand", "Hasty", "Neat", "Rapid", "Rich", "Unreal", "Precise", "Spiritual", "Headstrong",
        "Great", "Rugged", "Lush", "Lumberjacks", "Double-Bit", "Moil", "Toil", "Blessed", "Earthy"
    ]),
    "armor": new Set([
        "Clean", "Fierce", "Heavy", "Light", "Mythic", "Pure", "Titanic", "Smart", "Wise", "Candied", "Submerged", "Perfect", "Reinforced",
        "Renowned", "Spiked", "Hyper", "Giant", "Jaded", "Cubic", "Necrotic", "Empowered", "Ancient", "Undead", "Loving", "Ridiculous",
        "Bustling", "Mossy", "Festive",
        "Very", "Highly", "Extremely", "Not so", "Thicc", "Absolutely", "Even More"
    ]),
    "misc": new Set([
        "Glistening", "Strengthened", "Waxed", "Fortified", "Rooted", "Blooming", "Snowy", "Blood-Soaked",
        "Salty", "Treacherous", "Lucky", "Stiff", "Dirty", "Chomp", "Pitchin",
        "Ambered", "Auspicious", "Fleet", "Heated", "Magnetic", "Mithraic", "Refined", "Stellar", "Fruitful",
        "Robust", "Zooming", "Peasants", "Green Thumb", "Blessed", "Bountiful",
        "Lvl"
    ])
};
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
 * @param {string} str - The input string to search for words.
 * @param {string[]} arr - An array of words to search for in the string.
 * @returns {string[]} - An array containing the words found in the string.
 */
export function findWordsInString(str, arr) {
    const wordSet = new Set(arr);
    const words = arr.filter(word => str.includes(word));
    return words;
}

/**
 * Finds the first occurrence of a valid Roman numeral in a given string.
 *
 * @param {string} str - The input string to search for a Roman numeral.
 * @returns {string|null} - The first valid Roman numeral found in the string,
 *                          or null if no valid Roman numerals are present.
 */
export function findFirstRomanNumeral(str) {
    const romanNumeralRegex = /(IX|IV|V?I{0,3})\b/g;
    const match = str.match(romanNumeralRegex);
    return match ? match[0] : null;
}

/**
 * Retrieves all entities of type StandClass within a 3x3 area of chunks centered around the given coordinates (x, z).
 *
 * @param {number} x - The x-coordinate of the center chunk.
 * @param {number} z - The z-coordinate of the center chunk.
 * @param {number} diff - The difference from the center chunk to extend the search (3x3 area).
 * @returns {Object[]} - An array containing all StandClass entities found within the 3x3 area.
 */
const StandClass = Java.type("net.minecraft.entity.item.EntityArmorStand").class;
export function get3x3Stands(x, z, diff) {
    const stands = [...World.getChunk(x, 69, z).getAllEntitiesOfType(StandClass)];
    stands.push(...World.getChunk(x + diff, 69, z + diff).getAllEntitiesOfType(StandClass));
    stands.push(...World.getChunk(x + diff, 69, z - diff).getAllEntitiesOfType(StandClass));
    stands.push(...World.getChunk(x - diff, 69, z + diff).getAllEntitiesOfType(StandClass));
    stands.push(...World.getChunk(x - diff, 69, z - diff).getAllEntitiesOfType(StandClass));
    stands.push(...World.getChunk(x + diff, 69, z).getAllEntitiesOfType(StandClass));
    stands.push(...World.getChunk(x - diff, 69, z).getAllEntitiesOfType(StandClass));
    stands.push(...World.getChunk(x, 69, z + diff).getAllEntitiesOfType(StandClass));
    stands.push(...World.getChunk(x, 69, z - diff).getAllEntitiesOfType(StandClass));

    return stands;
}

/**
 * Finds the closest position from an array of positions to a given origin position.
 *
 * @param {number[]} origin - The origin position [x, y, z] to which distances are measured.
 * @param {number[][]} positions - An array containing positions to compare with the origin.
 * @returns {Array} - An array containing two elements: the closest position [x, y, z]
 *                    from the `positions` array and the distance between the origin and
 *                    the closest position.
 */
export function getClosest(origin, positions) {
    let closestPosition = positions.length > 0 ? positions[0] : [0, 0, 0];
    let closestDistance = 999;
    let distance = 999;

    positions.forEach(position => {
        distance = Math.hypot(origin[1] - position[1], origin[2] - position[2], origin[3] - position[3]);
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
 * @param {string} dateString - The date string to validate in the format "MM/DD/YYYY".
 * @returns {boolean} - True if the date is valid, false otherwise.
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
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};

/**
 * Converts a Roman numeral to an integer value.
 *
 * @param {string} str - The Roman numeral string to be converted.
 * @returns {number} - The integer representation of the given Roman numeral.
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
 * Plays a sound and sets cooldown
 * 
 * @param {Sound} sound - A sound ogg file from constants.js 
 * @param {Number} cd - Cooldown caused by sound play.
 */
let soundCD = false;
export function playSound(sound, cd) {
    if (soundCD === true) return;

    sound.play();
    soundCD = true;
    delay(() => soundCD = false, cd);
}
