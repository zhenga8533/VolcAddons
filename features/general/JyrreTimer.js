import settings from "../../utils/settings";
import { NBTTagString } from "../../utils/constants";
import { registerWhen } from "../../utils/variables";
import { getTime } from "../../utils/functions/format";

/**
 * Adds time NBT tag to Jyrre bottles.
 */
registerWhen(register("itemTooltip", (_, item) => {
    if (!item.getName().endsWith("Bottle of Jyrre")) return;
    
    const itemTag = item.getNBT().getCompoundTag("tag");
    const loreTag = itemTag.getCompoundTag("display").getTagMap().get("Lore");

    // Check if time already in tooltip
    const list = new NBTTagList(loreTag);
    if (list.getStringTagAt(9).startsWith("§b☲")) list.removeTag(9);
    
    const seconds = itemTag.getCompoundTag("ExtraAttributes").getInteger("bottle_of_jyrre_seconds");
    list.insertTag(9, new NBTTagString(`§b☲ Time: ${getTime(seconds)}`));
}), () => settings.jyrreTimer);
