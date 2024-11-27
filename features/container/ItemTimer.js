import { NBTTagString } from "../../utils/Constants";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { formatTime } from "../../utils/functions/format";

/**
 * Adds time NBT tag to Jyrre bottles.
 */
registerWhen(
  register("preItemRender", (_, __, ___, gui) => {
    const item = Player.getContainer().getItems()[gui?.getSlotUnderMouse()?.field_75222_d];
    const name = item?.getName();
    if (!item || (!name.endsWith("Bottle of Jyrre") && !name.endsWith("Dark Cacao Truffle"))) return;

    const itemTag = item.getNBT().getCompoundTag("tag");
    const loreTag = itemTag.getCompoundTag("display").getTagMap().get("Lore");

    // Check if time already in tooltip
    const list = new NBTTagList(loreTag);
    if (list.getStringTagAt(9).startsWith("§7☲")) list.removeTag(9);

    // Add time tag
    const ExtraAttributes = itemTag.getCompoundTag("ExtraAttributes");
    const seconds = item.getName().endsWith("Bottle of Jyrre")
      ? ExtraAttributes.getInteger("bottle_of_jyrre_seconds")
      : ExtraAttributes.getInteger("seconds_held");
    list.insertTag(9, new NBTTagString(`§7☲ Time: §b${formatTime(seconds, 0, 3)}`));
  }),
  () => Settings.itemTimer
);
