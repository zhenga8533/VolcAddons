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

  positions.forEach((position) => {
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
 * @param {Number} i - Slot index.
 * @returns {Number[]} - [x, y] coords.
 */
export function getSlotCoords(i) {
  if (i >= Player.getContainer().getSize()) return [0, 0];
  const gui = Client.currentGui.get();
  const slot = gui.field_147002_h?.func_75139_a(i);
  const x = slot.field_75223_e + gui?.getGuiLeft() ?? 0;
  const y = slot.field_75221_f + gui?.getGuiTop() ?? 0;

  return [x, y];
}

/**
 * Get the closest value from an array to a given value.
 *
 * @param {Type} value - Value to compare
 * @param {Type[]} array - Array to compare against
 * @returns {Type} - Closest value from array
 */
export function findClosest(value, array) {
  return array.reduce((prev, curr) => (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev));
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
        result = key + "." + result;
        break;
      }
    } else {
      result = key;
      break;
    }
  }

  return result;
}
