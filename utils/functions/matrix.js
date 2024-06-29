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
    return arr.map((row) => row.slice().reverse());
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

/**
 * Checks if a player is looking away from a target point.
 * @param {number} x_p - The x-coordinate of the player's position.
 * @param {number} y_p - The y-coordinate of the player's position.
 * @param {number} z_p - The z-coordinate of the player's position.
 * @param {number} yaw_p - The yaw angle (in degrees) of the player's direction.
 * @param {number} x_target - The x-coordinate of the target point.
 * @param {number} y_target - The y-coordinate of the target point.
 * @param {number} z_target - The z-coordinate of the target point.
 * @returns {boolean} - True if the player is looking away from the target point, false otherwise.
 */
export function isLookingAway(x_p, y_p, z_p, yaw_p, x_target, y_target, z_target) {
  const dir_x = -Math.sin((yaw_p * Math.PI) / 180);
  const dir_z = Math.cos((yaw_p * Math.PI) / 180);

  const target_vec_x = x_target - x_p;
  const target_vec_y = y_target - y_p;
  const target_vec_z = z_target - z_p;
  const dot_product = target_vec_x * dir_x + target_vec_y * 0 + target_vec_z * dir_z;

  return dot_product < 0;
}
