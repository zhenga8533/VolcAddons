import { Overlay } from "../../utils/overlay";
import settings from "../../utils/settings";
import { data, registerWhen } from "../../utils/variables";


/**
 * Render armor pieces as icons
 */
const pieces = [null, null, null, null];
new Overlay("armorDisplay", ["all"], () => true, data.UL, "moveArmor", "", () => {
    let yDiff = -15 * data.UL[2];

    pieces.forEach(piece => {
        yDiff += 15 * data.UL[2];
        if (piece === null) return;

        // Draw icon
        piece.draw(data.UL[0], data.UL[1] + yDiff, data.UL[2]);

        // Draw cd/stars
        const size = piece.getStackSize();
        if (size > 1) Renderer.drawString(size, data.UL[0] -  Renderer.getStringWidth(size), data.UL[1] + yDiff);
    });

    return true;
});

/**
 * Get player armor pieces
 */
registerWhen(register("tick", () => {
    const armor = Player.armor;
    pieces[0] = armor.getHelmet();
    pieces[1] = armor.getChestplate();
    pieces[2] = armor.getLeggings();
    pieces[3] = armor.getBoots();
}), () => settings.armorDisplay);


/**
 * Render equipment pieces as icons
 */
let equipment = [null, null, null, null];
new Overlay("equipDisplay", ["all"], () => true, data.EQL, "moveEq", "", () => {
    let yDiff = -15 * data.EQL[2];

    equipment.forEach(piece => {
        yDiff += 15 * data.EQL[2];
        if (piece === null) return;

        // Draw icon
        piece.draw(data.EQL[0], data.EQL[1] + yDiff, data.EQL[2]);

        // Draw cd/stars
        const size = piece.getStackSize();
        if (size > 1) Renderer.drawString(size, data.EQL[0] -  Renderer.getStringWidth(size), data.EQL[1] + yDiff);
    });

    return true;
});

/**
 * Get player equipment pieces
 */
registerWhen(register("guiMouseClick", () => {
    Client.scheduleTask(1, () => {
        const container = Player.getContainer();
        if (container.getName() !== "Your Equipment and Stats") return;

        equipment = [
            container.getStackInSlot(10),
            container.getStackInSlot(19),
            container.getStackInSlot(28),
            container.getStackInSlot(37)
        ];
    });
}), () => settings.equipDisplay);
registerWhen(register("guiOpened", () => {
    Client.scheduleTask(1, () => {
        const container = Player.getContainer();
        if (container.getName() !== "Your Equipment and Stats") return;

        equipment = [
            container.getStackInSlot(10),
            container.getStackInSlot(19),
            container.getStackInSlot(28),
            container.getStackInSlot(37)
        ];
    });
}), () => settings.equipDisplay);
