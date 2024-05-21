import settings from "../../utils/Settings";
import { COLOR_TABLE, DARK_GRAY} from "../../utils/Constants";
import { data, itemNBTs } from "../../utils/Data";
import { compressNBT, decompressNBT, parseTexture } from "../../utils/functions/misc";
import { registerWhen } from "../../utils/RegisterTils";
import { Overlay } from "../../utils/Overlay";


/**
 * Log item data as compressed NBT.
 */
let nameCache = ["T1", 0];
let itemsCache = [];

const cacheItems = register("guiMouseClick", () => {
    Client.scheduleTask(4, () => {
        const items = Player.getContainer().getItems();
        if (items.length < 54) return;
        itemsCache = items.slice(0, 54)
    });
}).unregister();

const saveCache = register("guiClosed", () => {
    if (nameCache[0] === "EC")
        itemNBTs.enderchests[nameCache[1]] = itemsCache.map(item => item === null ? null : compressNBT(item.getNBT().toObject()));
    else if (nameCache[0] === "BP")
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

        const containerCache = name.startsWith("Ender Chest") ? [itemNBTs.enderchests, "EC"] : 
            split[1] === "Backpack" ? [itemNBTs.backpacks, "BP"] : undefined;
        if (containerCache === undefined) return;
        
        const i = split[split[1] === "Backpack" ? split.length - 1 : 2][1] - 1;
        containerCache[0][i] = itemsCache.map(item => item === null ? null : compressNBT(item.getNBT().toObject()));
        nameCache = [containerCache[1], i];

        saveCache.register();
        cacheItems.register();
    });
});

/**
 * Render preview on container hover.
 */
let lastPreview = "0";
let previewItems = [];
const CONTAINER_PNGS = [new Image("container.png"), new Image("container-fs.png")];
new Overlay("containerPreview", data.CPL, "movePreview", "Preview", ["all"], "guiRender");

const preview = register("guiRender", () => {
    CONTAINER_PNGS[settings.containerPreview - 1].draw(data.CPL[0], data.CPL[1]);
    Renderer.drawString(DARK_GRAY + lastPreview.removeFormatting(), data.CPL[0] + 7, data.CPL[1] + 6);

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 9; j++) {
            let index = i * 9 + j;
            let item = previewItems[index];
            if (item === null) continue;

            let x = data.CPL[0] + 7.5 + j * 18;
            let y = data.CPL[1] + 17.5 + i * 18;
            
            // Draw rarity box
            if (index >= 9) {
                let color = COLOR_TABLE[item.getName().substring(0, 2)];
                if (color !== undefined) Renderer.drawRect(color, x, y, 16, 16);
            }

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
            if (nbt === null) return null;
            const item = new Item(net.minecraft.item.ItemStack.func_77949_a(NBT.parse(decompressNBT(nbt)).rawNBT));

            if (item.getUnlocalizedName() === "item.skull") {  // Fix skull textures not rendering
                const skullNBT = item.getNBT().getCompoundTag("tag").getCompoundTag("SkullOwner");
                const texture = skullNBT.getCompoundTag("Properties").getTagList("textures", 0).func_150305_b(0).func_74779_i("Value");
                const skull = parseTexture(texture);
                item.getNBT().getCompoundTag("tag").set("SkullOwner", skull);
            }

            return item;
        });

        preview.register();
        clear.register();
    }
}), () => settings.containerPreview !== 0);
