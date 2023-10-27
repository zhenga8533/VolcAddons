import { Overlay } from "../../utils/overlay";
import { data } from "../../utils/variables";


/**
 * Render armor pieces as icons
 */
const pieces = [null, null, null, null];
new Overlay("armorDisplay", ["all"], () => true, data.GL, "moveArmor", "", () => {
    let yDiff = -14 * data.GL[2];

    pieces.forEach(piece => {
        yDiff += 14 * data.GL[2];
        if (piece === null) return;

        // Draw icon
        piece.draw(data.GL[0], data.GL[1] + yDiff, data.GL[2]);

        // Draw cd/stars
        const size = piece.getStackSize();
        if (size > 1) Renderer.drawString(size, data.GL[0] -  Renderer.getStringWidth(size), data.GL[1] + yDiff);
    });

    return true;
});

/**
 * Get player armor pieces
 */
register("tick", () => {
    const armor = Player.armor;
    pieces[0] = armor.getHelmet();
    pieces[1] = armor.getChestplate();
    pieces[2] = armor.getLeggings();
    pieces[3] = armor.getBoots();
});