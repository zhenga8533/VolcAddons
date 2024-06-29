import axios from "../../../axios";
import { AQUA, DARK_GRAY, GREEN, ITALIC, LOGO, RED } from "../../utils/Constants";
import { Json } from "../../utils/Json";
import { decode } from "../../utils/functions/misc";

const skins = new Json("skins.json", false).getData();
register("guiOpened", () => {
  Client.scheduleTask(2, () => {
    if (!Player.getContainer().getName().startsWith("Previous Fire Sales")) return;
    const items = Player.getContainer().getItems();

    for (let i = 1; i < 5; i++) {
      for (let j = 1; j < 8; j++) {
        let skin = items[i * 9 + j];
        if (skin === null) break;

        let skinID = skin.getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id");
        if (skinID.endsWith("RUNE") || skinID.startsWith("DYE") || skinID.endsWith("BARN_SKIN")) continue;

        if (!skins.includes(skinID)) skins.push(skinID);
      }
    }
  });
});

register("command", () => {
  if (skins.length === 0) {
    ChatLib.chat(`${LOGO + RED}Please open all Fire Sale menus first to register all valid skins!`);
    return;
  }

  axios
    .get(`https://sky.shiiyu.moe/api/v2/profile/${Player.getName()}`)
    .then((response) => {
      let missing = [...skins];

      function parseSkins(contents) {
        if (contents === undefined) return;

        let items = decode(contents);
        for (let i = 0; i < items.func_74745_c(); i++) {
          let nbt = new NBTTagCompound(items.func_150305_b(i)).getCompoundTag("tag").getCompoundTag("ExtraAttributes");

          let skin = nbt.getString("skin");
          if (skin) {
            let index = missing.indexOf(skin);
            if (index !== -1) missing.splice(index, 1);
          }

          let item = nbt.getString("id");
          if (item) {
            let index = missing.indexOf(item);
            if (index !== -1) missing.splice(index, 1);
          }
        }
      }

      const profiles = response.data.profiles;
      const player = profiles[Object.keys(profiles).find((prof) => profiles[prof].current)]?.raw;
      if (player === undefined) {
        ChatLib.chat(`${LOGO + RED}Error fetching player profile!`);
        return;
      }
      const inv = player.inventory;
      if (inv === undefined) {
        ChatLib.chat(`${LOGO + RED}Player inventory API is turned off!`);
        return;
      }

      // Inventroy values
      parseSkins(inv.inv_contents?.data);
      parseSkins(inv.inv_armor?.data);
      parseSkins(inv.equipment_contents?.data);

      // Storage values
      parseSkins(inv.wardrobe_contents?.data);
      parseSkins(inv.ender_chest_contents?.data);
      parseSkins(inv.personal_vault_contents?.data);

      // Backpack values
      const backpacks = inv.backpack_contents;
      const packs = backpacks === undefined ? 0 : Object.keys(backpacks).length;
      for (let i = 0; i < packs; i++) {
        let backpack = backpacks[i.toString()];
        parseSkins(backpack?.data);
      }

      const icons = inv.backpack_icons;
      const sacks = icons === undefined ? 0 : Object.keys(icons).length;
      for (let i = 0; i < sacks; i++) {
        let icon = icons[i.toString()];
        parseSkins(icon?.data);
      }

      // Pets values
      const pets = player.pets_data.pets;
      pets.forEach((pet) => {
        const skin = "PET_SKIN_" + pet.skin;
        let index = missing.indexOf(skin);
        if (index !== -1) missing.splice(index, 1);
      });

      const miss = missing.join(`\n ${DARK_GRAY}- ${AQUA}`);
      ChatLib.chat(
        `${LOGO + GREEN}\n${DARK_GRAY} - ${AQUA + miss}
${
  DARK_GRAY + ITALIC
}This takes a while between updates, also does not track Taylor, Museum, Barn, and Rune cosmetics...`
      );
    })
    .catch((err) => ChatLib.chat(err));
}).setName("missingSkins");
