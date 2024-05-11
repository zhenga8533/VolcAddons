import settings from "../../utils/settings";
import { COLOR_TABLE} from "../../utils/constants";
import { data, itemNBTs } from "../../utils/data";
import { compressNBT, decompressNBT } from "../../utils/functions/misc";
import { registerWhen } from "../../utils/register";
import { Overlay } from "../../utils/overlay";


/**
 * Log item data as compressed NBT.
 */
let nameCache = ["T1", 0];
let itemsCache = [];
const cacheItems = register("guiMouseClick", () => {
    Client.scheduleTask(1, () => itemsCache = Player.getContainer().getItems().slice(0, 54));
}).unregister();

const saveCache = register("guiClosed", () => {
    if (nameCache[0] === "EC")
        itemNBTs.enderchests[nameCache[1]] = itemsCache.map(item => item === null ? null : compressNBT(item.getNBT().toObject()));
    else if (nameCache[1] === "BP")
        itemNBTs.backpacks[nameCache[1]] = itemsCache.map(item => item === null ? null : compressNBT(item.getNBT().toObject()));

    saveCache.unregister();
    cacheItems.unregister();
    itemsCache = [];
}).unregister();

register("guiOpened", () => {
    Client.scheduleTask(1, () => {
        const name = Player.getContainer().getName();
        const split = name.split(' ');
        itemsCache = Player.getContainer().getItems().slice(0, 54);

        const continaerCache = name.startsWith("Ender Chest") ? [itemNBTs.enderchests, "EC"] : 
            name.startsWith("Backpack") ? [itemNBTs.backpacks, "BP"] : undefined;
        if (continaerCache === undefined) return;
        
        const i = parseInt(split[2][1]) - 1;
        continaerCache[0][i] = itemsCache.map(item => item === null ? null : compressNBT(item.getNBT().toObject()));
        nameCache = [continaerCache[1], i];

        saveCache.register();
        cacheItems.register();
    });
});

/**
 * Render preview on container hover.
 */
let lastPreview = "0";
let previewItems = [];
const CONTAINER_PNG = new Image("container.png");
new Overlay("containerPreview", data.CPL, "movePreview", "Preview", ["all"], "guiRender");

const preview = register("guiRender", () => {
    CONTAINER_PNG.draw(data.CPL[0], data.CPL[1]);
    Renderer.drawString(lastPreview, data.CPL[0] + 5, data.CPL[1] + 5, true);

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 9; j++) {
            let item = previewItems[i * 9 + j];
            if (item === null) continue;

            let x = data.CPL[0] + 7.5 + j * 18;
            let y = data.CPL[1] + 17.5 + i * 18;
            
            // Draw rarity box
            let color = COLOR_TABLE[item.getName().substring(0, 2)];
            if (color !== undefined) Renderer.drawRect(Renderer.color(...color, 128), x, y, 17, 17);

            // Draw item and size
            item.draw(x, y, 1);
            let size = item.getStackSize();
            if (size !== 1) {
                Renderer.translate(0, 0, 999);
                Renderer.drawString(size, x - Renderer.getStringWidth(size) + 17, y + 9, true);
            }
        }
    }
}).unregister();

const clear = register("guiClosed", () => {
    previewItems = [];
    lastPreview = "0";
    preview.unregister();
    clear.unregister();
}).unregister();

registerWhen(register("itemTooltip", (_, item) => {
    const name = item.getName();

    if (name.startsWith("§aEnder Chest Page") || name.startsWith("§6Backpack Slot")) {
        const split = name.split(' ');
        const i = parseInt(split[split.length - 1]) - 1;
        if (lastPreview === name) return;

        lastPreview = name;
        previewItems = itemNBTs[name.startsWith("§a") ? "enderchests" : "backpacks"][i].map(nbt => {
            return nbt === null ? null :
                new Item(net.minecraft.item.ItemStack.func_77949_a(NBT.parse(decompressNBT(nbt)).rawNBT))
        });

        preview.register();
        clear.register();
    } else {
        previewItems = [];
        lastPreview = "0";
        preview.unregister();
        clear.unregister();
    }
}), () => settings.containerPreview);
