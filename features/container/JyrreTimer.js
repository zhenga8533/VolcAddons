import Settings from "../../utils/Settings";
import { NBTTagString } from "../../utils/Constants";
import { registerWhen } from "../../utils/RegisterTils";
import { formatTime } from "../../utils/functions/format";

/**
 * Adds time NBT tag to Jyrre bottles.
 */
registerWhen(
  register("preItemRender", (_, __, ___, gui) => {
    const item =
      Player.getContainer().getItems()[gui?.getSlotUnderMouse()?.field_75222_d];
    if (!item || !item.getName().endsWith("Bottle of Jyrre")) return;

    const itemTag = item.getNBT().getCompoundTag("tag");
    const loreTag = itemTag.getCompoundTag("display").getTagMap().get("Lore");

    // Check if time already in tooltip
    const list = new NBTTagList(loreTag);
    if (list.getStringTagAt(9).startsWith("§7☲")) list.removeTag(9);

    // Add time tag
    const seconds = itemTag
      .getCompoundTag("ExtraAttributes")
      .getInteger("bottle_of_jyrre_seconds");
    list.insertTag(
      9,
      new NBTTagString(`§7☲ Time: §b${formatTime(seconds, 0, 3)}`)
    );
  }),
  () => Settings.jyrreTimer
);
