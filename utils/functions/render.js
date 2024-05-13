/**
 * Function to draw a box on the screen.
 * 
 * @param {Number} x - X-Coordinate of the box.
 * @param {Number} y - Y-Coordinate of the box.
 * @param {Number} z - Z-Index of the box.
 * @param {Number} width - Width of the box.
 * @param {Number} height - Height of the box.
 * @param {Object} rectColor - Renderer.color of the box.
 * @param {Object} borderColor - Renderer.color of the border.
 */
export function drawBox(x, y, z, width, height, rectColor, borderColor) {
    Renderer.translate(x, y, z);
    Renderer.drawRect(rectColor, 0, 0, width, height);

    // Draw Outline
    Renderer.retainTransforms(true);
    Renderer.translate(x, y, z + 1);
    Renderer.drawLine(borderColor, -1, -1, width, -1, 1);
    Renderer.drawLine(borderColor, -1, -1, -1, height, 1);
    Renderer.drawLine(borderColor, -1, height, width, height, 1);
    Renderer.drawLine(borderColor, width, -1, width, height, 1);
    Renderer.retainTransforms(false);
}
