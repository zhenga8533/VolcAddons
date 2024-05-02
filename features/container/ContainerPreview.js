import { itemNBTs } from "../../utils/data";
import { compressNBT, decompressNBT } from "../../utils/functions/misc";
import { registerWhen } from "../../utils/register";
import settings from "../../utils/settings";


/**
 * Log item data as compressed NBT.
 */
registerWhen(register("guiMouseClick", () => {
    Client.scheduleTask(1, () => {
        const name = Player.getContainer().getName();
        const split = name.split(' ');
        const items = Player.getContainer().getItems().slice(0, 54);

        if (name.startsWith("Ender Chest")) {
            const i = parseInt(split[2][1]) - 1;
            itemNBTs.enderchests[i] = items.map(item => item === null ? null : compressNBT(item.getNBT().toObject()));
        } else if (split[1].startsWith("Backpack")) {
            const i = parseInt(split[split.length - 1].replace(/\D/g, "")) - 1;
            itemNBTs.backpacks[i] = items.map(item => item === null ? null : compressNBT(item.getNBT().toObject()));
        }
    });
}), () => settings.containerPreview);

registerWhen(register("guiOpened", () => {
    Client.scheduleTask(1, () => {
        const name = Player.getContainer().getName();
        const split = name.split(' ');
        const items = Player.getContainer().getItems().slice(0, 54);

        if (name.startsWith("Ender Chest")) {
            const i = parseInt(split[2][1]) - 1;
            itemNBTs.enderchests[i] = items.map(item => item === null ? null : compressNBT(item.getNBT().toObject()));
        } else if (split[1].startsWith("Backpack")) {
            const i = parseInt(split[split.length - 1].replace(/\D/g, "")) - 1;
            itemNBTs.backpacks[i] = items.map(item => item === null ? null : compressNBT(item.getNBT().toObject()));
        }
    });
}), () => settings.containerPreview);

/**
 * Render preview on container hover.
 */
let lastPreview = 0;
let previewItems = [];
const CONTAINER_PNG = new Image("container.png");

const preview = register("guiRender", () => {
    CONTAINER_PNG.draw(575, 160);
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 9; j++) {
            let item = previewItems[i * 9 + j];
            if (item === null) continue;
            item.draw(582.5 + j * 18, 177.5 + i * 18, 1);
        }
    }
}).unregister();

const clear = register("guiClosed", () => {
    previewItems = [];
    lastPreview = 0;
    preview.unregister();
    clear.unregister();
}).unregister();

registerWhen(register("itemTooltip", (_, item) => {
    const name = item.getName();

    if (name.startsWith("§aEnder Chest Page") || name.startsWith("§6Backpack Slot")) {
        const split = name.split(' ');
        const i = parseInt(split[split.length - 1]) - 1;
        if (lastPreview === name + i) return;

        lastPreview = name + i;
        previewItems = itemNBTs[name.startsWith("§a") ? "enderchests" : "backpacks"][i].map(nbt => {
            return nbt === null ? null :
                new Item(net.minecraft.item.ItemStack.func_77949_a(NBT.parse(decompressNBT(nbt)).rawNBT))
        });

        preview.register();
        clear.register();
    } else {
        previewItems = [];
        lastPreview = 0;
        preview.unregister();
        clear.unregister();
    }
}), () => settings.containerPreview);
