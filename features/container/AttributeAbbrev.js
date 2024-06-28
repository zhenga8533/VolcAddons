import { AQUA } from "../../utils/Constants";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";

registerWhen(
  register("renderItemIntoGui", (item, x, y) => {
    const attributes = item
      ?.getNBT()
      ?.getCompoundTag("tag")
      ?.getCompoundTag("ExtraAttributes")
      ?.getCompoundTag("attributes");
    if (attributes.hasNoTags()) return;

    let overlay = "";
    attributes.getKeySet().forEach((key) => {
      const words = key.split("_");
      let abbreviation = "";
      for (let i = 0; i < words.length; i++) {
        abbreviation += words[i][0].toUpperCase();
      }
      overlay += AQUA + abbreviation + "\n";
    });

    Renderer.scale(0.8, 0.8);
    Renderer.translate(0, 0, 275);
    Renderer.drawString(overlay, x * 1.25 + 1, y * 1.25 + 1);
  }),
  () => Settings.attributeAbbrev
);
