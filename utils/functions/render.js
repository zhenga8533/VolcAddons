import { COLOR_TABLE, DARK_GRAY } from "../Constants";


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
    Renderer.drawLine(borderColor, -1, -1, width + 1, -1, 1);
    Renderer.drawLine(borderColor, -1, -1, -1, height + 1, 1);
    Renderer.drawLine(borderColor, -1, height + 1, width + 1, height + 1, 1);
    Renderer.drawLine(borderColor, width + 1, -1, width + 1, height + 1, 1);
    Renderer.retainTransforms(false);
}


const BORDER_COLOR = Renderer.color(128, 128, 128, 128);
/**
 * Function to draw a box on the screen.
 * 
 * @param {Number} hx - X-Coordinate of the box.
 * @param {Number} hy - Y-Coordinate of the box.
 * @param {String[]} lore - Array of strings to draw.
 */
export function drawLore(hx, hy, lore) {
    lore = lore.slice(1);
    if (lore.length === 0) return;

    const width = lore.reduce((max, line) => Math.max(max, Renderer.getStringWidth(line)), 0);
    const height = lore.length * 9 + 4;
    const x = hx + 18 + width > Renderer.screen.getWidth() ? Renderer.screen.getWidth() - width - 10 : hx + 8;
    const y = hy - 14 + height > Renderer.screen.getHeight() ? Renderer.screen.getHeight() - height - 2 : hy - 16;

    drawBox(x + 2, y, 999, width + 6, height, Renderer.BLACK, BORDER_COLOR);
    Renderer.translate(0, 0, 999);
    Renderer.drawString(lore.join('\n'), x + 5, y + 2);
}

/**
 * Function to draw a container on the screen.
 * 
 * @param {Number} bX - X-Coordinate of the container.
 * @param {Number} bY - Y-Coordinate of the container.
 * @param {String} title - Title of the container.
 * @param {Image} bg - Background image to draw.
 * @param {Item[]} items - Array of items to draw.
 * @param {Number} mX - X-Coordinate of the mouse.
 * @param {Number} mY - Y-Coordinate of the mouse.
 */
export function drawContainer(bX, bY, title, bg, items, mX, mY) {
    bg.draw(bX, bY);
    Renderer.drawString(DARK_GRAY + title, bX + 7, bY + 6);

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 9; j++) {
            let index = i * 9 + j;
            let item = items[index];
            if (!item) continue;

            let x = bX + 7.5 + j * 18;
            let y = bY + 17.5 + i * 18;
            
            // Draw rarity box
            if (index >= 9) {
                let color = COLOR_TABLE[item.getName().substring(0, 2)];
                if (color !== undefined) Renderer.drawRect(color, x, y, 16, 16);
            }

            // Draw item and size
            item.draw(x, y, 1);
            let size = item.getStackSize();
            if (size !== 1) {
                Renderer.translate(0, 0, 500);
                Renderer.drawString(size, x - Renderer.getStringWidth(size) + 17, y + 9, true);
            }

            // Draw lore if hovered
            if (mX >= x && mX <= x + 16 && mY >= y && mY <= y + 16) {
                drawLore(mX, mY, item.getLore());
            }
        }
    }
}
