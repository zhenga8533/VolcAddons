import settings from "../../utils/settings";
import { registerWhen } from "../../utils/register";
import { Overlay } from "../../utils/overlay";
import { data, itemNBTs } from "../../utils/data";
import { compressNBT, decompressNBT } from "../../utils/functions/misc";


/**
 * Render armor pieces as icons
 */
const barrier = new Item("minecraft:barrier");
const pieces = [null, null, null, null];
new Overlay("armorDisplay", data.UL, "moveArmor", "Armor", ["all"], "renderOverlay", () => {
    let yDiff = -15 * data.UL[2];

    pieces.forEach(piece => {
        yDiff += 15 * data.UL[2];
        if (piece === null) {
            barrier.draw(data.UL[0], data.UL[1] + yDiff, data.UL[2]);
            return;
        }

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
let equipment = itemNBTs.equip.map(nbt => {
    return nbt === null ? null :
        new Item(net.minecraft.item.ItemStack.func_77949_a(NBT.parse(decompressNBT(nbt)).rawNBT))
});
new Overlay("equipDisplay", data.EQL, "moveEq", "Equip", ["all"], "renderOverlay", () => {
    let yDiff = -15 * data.EQL[2];

    equipment.forEach(piece => {
        yDiff += 15 * data.EQL[2];
        if (piece === null) {
            barrier.draw(data.UL[0], data.UL[1] + yDiff, data.UL[2]);
            return;
        }

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

/**
 * Persistant armor and equip.
 */
register("gameUnload", () => {
    itemNBTs.armor = pieces.map(piece => piece === null ? null : compressNBT(piece.getNBT().toObject()));
    itemNBTs.equip = equipment.map(piece => piece === null ? null : compressNBT(piece.getNBT().toObject()));
}).setPriority(Priority.HIGHEST);;
