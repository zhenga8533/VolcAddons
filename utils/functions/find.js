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
}

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

/**
 * Recurse over an object to find the path of a key.
 * 
 * @param {Object} obj - JSON object to parse through.
 * @param {String} targetKey - Key to locate in object.
 * @returns {String} - Path string.
 */
export function findKeyPath(obj, targetKey) {
    if (typeof obj !== "object") return undefined;

    let result = undefined;

    for (let key in obj) {
        if (key !== targetKey) {
            result = findKeyPath(obj[key], targetKey);
            if (result !== undefined) {
                result = key + '.' + result;
                break;
            }
        } else {
            result = key;
            break;
        }
    }

    return result;
}
