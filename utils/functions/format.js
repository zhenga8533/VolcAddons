import { REFORGES } from "../constants.js";


/**
 * Converts seconds to XXdXXhrXXmXXs format.
 * 
 * @param {Number} seconds - Total number of seconds to convert.
 * @returns {String} Formatted time in XXhrXXmXXs format.
 */
export function getTime(seconds, fixed=0) {
    const days = Math.floor(seconds / 86400); // 86400 seconds in a day
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const timeString = [
        days > 0 ? `${days}d` : '',
        hours > 0 || days > 0 ? `${hours}hr` : '',
        `${minutes < 10 && (hours > 0 || days > 0) ? '0' : ''}${minutes > 0 || hours > 0 || days > 0 ? minutes + 'm' : ''}`,
        `${remainingSeconds < 10 && (hours > 0 || minutes > 0 || days > 0) ? '0' : ''}${remainingSeconds.toFixed(hours > 0 || minutes > 0 || days > 0 ? 0 : fixed)}s`
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
