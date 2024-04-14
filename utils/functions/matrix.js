/**
 * Generates all possible formations of a 2D array including rotations and flips.
 * @param {Array} array - The 2D array for which formations are generated.
 * @returns {Array} - An array containing all formations (including rotations and flips) of the input array.
 */
export function getAllFormations(array) {
    const formations = [];

    // Function to rotate a 2D array by 90 degrees
    function rotate90Degrees(arr) {
        const rows = arr.length;
        const cols = arr[0].length;
        const rotated = [];
        for (let i = 0; i < cols; i++) {
            rotated.push([]);
            for (let j = rows - 1; j >= 0; j--) {
                rotated[i].push(arr[j][i]);
            }
        }
        return rotated;
    }

    // Function to flip a 2D array horizontally
    function flipHorizontally(arr) {
        return arr.map(row => row.slice().reverse());
    }

    // Generate all formations
    let current = array;
    for (let i = 0; i < 4; i++) {
        formations.push(current);
        formations.push(flipHorizontally(current));
        current = rotate90Degrees(current);
    }

    return formations;
}

/**
 * Creates a matrix of the specified size filled with zeros.
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in the matrix.
 * @returns {Array} - A 2D array representing the matrix.
 */
export function createMatrix(rows, cols) {
    const array = [];
    for (let i = 0; i < rows; i++) {
        array.push(Array(cols).fill(0));
    }
    return array;
}
