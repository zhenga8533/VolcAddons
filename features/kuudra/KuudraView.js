import axios from "../../../axios";
import {
  AQUA,
  BOLD,
  DARK_AQUA,
  DARK_GRAY,
  DARK_PURPLE,
  DARK_RED,
  GOLD,
  GRAY,
  LOGO,
  RED,
  WHITE,
  YELLOW,
} from "../../utils/Constants";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { convertToTitleCase, formatNumber } from "../../utils/functions/format";
import { decode } from "../../utils/functions/misc";

/**
 * Checks if given inventory contains any required gear to print out.
 *
 * @param {String} inv - Inventory NBT data.
 * @param {String} type - Inventory name.
 * @param {Array[]} aurora - Tracked aurora armor pieces [tier, stars, message]
 * @param {Array[]} terror - Tracked terror armor pieces [tier, stars, message]
 * @returns
 */
function containsGoods(inv, type, aurora, terror, dominance, lifeline) {
  if (inv === undefined) {
    ChatLib.chat(`${DARK_GRAY}- ${RED + type} API is OFF!`);
    return;
  }

  // Goods to be contained
  const GOODS = new Set(["NECRON_BLADE", "HYPERION", "VALKYRIE", "ASTRAEA", "SCYLLA", "TERMINATOR"]);
  const TIERS = ["HOT", "BURNING", "FIERY", "INFERNAL"];
  const PIECE = ["HELMET", "CHESTPLATE", "LEGGINGS", "BOOTS"];
  const EQUIP = ["NECKLACE", "CLOAK", "BELT", "GAUNTLET", "GLOVES"];

  // Decode inventory NBT
  let items = decode(inv);

  // Loop through inventory data
  for (let i = 0; i < items.func_74745_c(); i++) {
    // Get item data
    let nbt = new NBTTagCompound(items.func_150305_b(i));
    let tag = nbt.getCompoundTag("tag");
    if (tag.hasNoTags()) continue;
    let extraAttributes = tag.getCompoundTag("ExtraAttributes");
    let attributes = extraAttributes.getCompoundTag("attributes").toObject();
    let id = extraAttributes.getString("id");
    let args = id.split("_");
    let display = tag.getCompoundTag("display");
    let name = display.getString("Name");

    // Check if item is a good one :)
    if (GOODS.has(id) || (id === "RAGNAROCK_AXE" && extraAttributes.getInteger("rarity_upgrades") === 1)) {
      let data = name;
      let lore = display.toObject()["Lore"];
      lore.forEach((line) => (data += `\n${line}`));
      new TextComponent(`${DARK_GRAY}- ${name}`).setHoverValue(data).chat();
    } else if (args[1] === "AURORA" || args[1] === "TERROR") {
      let type = args[1] === "AURORA" ? aurora : terror;
      let piece = type[PIECE.indexOf(args[2])];
      let tier = TIERS.indexOf(args[0]);
      let level = extraAttributes.getInteger("upgrade_level");
      if (tier > piece[0] || (tier === piece[0] && level > piece[1])) {
        piece[0] = tier;
        piece[1] = level;

        // Get attribute and add to name
        let attributeTitle = Object.entries(attributes)
          .map(([key, value]) => {
            const abbreviation = key
              .split("_")
              .map((word) => word.charAt(0).toUpperCase())
              .join("");
            return abbreviation + value;
          })
          .join(", ");
        piece[2] = `${GRAY}[${attributeTitle}] ${name}`;
      }

      // Update dom/lifeline on terror
      if (args[1] === "TERROR") {
        piece[3] = Math.max(piece[3], attributes?.dominance ?? 0);
        piece[4] = Math.max(piece[3], attributes?.lifeline ?? 0);
      }
    } else if (args.length !== 0) {
      // Check for dominance/lifeline equip
      let slot = Math.min(Math.max(EQUIP.indexOf(args[0]), EQUIP.indexOf(args[args.length - 1])), 3);
      if (slot === -1) continue;
      let dom = attributes?.dominance;
      let ll = attributes?.lifeline;

      // Update equip
      function setEquip(equip, type, newLevel) {
        if (newLevel > equip[0]) {
          equip[0] = newLevel;
          equip[1] = `${GRAY}[${type + newLevel}] ${name}`;
        }
      }
      if (dom !== undefined) setEquip(dominance[slot], "D", dom);
      if (ll !== undefined) setEquip(lifeline[slot], "LL", ll);
    }
  }
}

/**
 * Parse user API data and search for relevant Kuudra items.
 *
 * @param {String} name - Username ign to get Kuudra data of.
 */
function kuudraView(name) {
  if (name === undefined) {
    ChatLib.chat(`${LOGO + RED}Couldn't find any profile with name undefined...`);
    ChatLib.chat(`${LOGO + RED}Please input as: ${WHITE}/kv [ign]`);
    return;
  }

  // Call Hypixel API
  new Message(`${LOGO + YELLOW}Fetching API data...`).setChatLineId(3745).chat();
  axios
    .get(`https://sky.shiiyu.moe/api/v2/profile/${name}`)
    .then((response) => {
      ChatLib.clearChat(3745);

      // Check if player profile exists
      if (response.data.error !== undefined) {
        ChatLib.chat(`${LOGO + RED}Couldn't find any profile with name ${name}...`);
        return;
      }

      const profiles = response.data.profiles;
      const selected = Object.keys(profiles).find((key) => profiles[key].current);
      const data = profiles[selected].raw;
      ChatLib.chat(`\n${LOGO + DARK_RED + BOLD + name}'s Kuudra View:\n`);

      // Loop through inventory to check gear.
      ChatLib.chat(`${DARK_AQUA + BOLD}Gear:`);
      const inventory = data?.inventory;
      // Armor pieces [tier, stars, name, dom, ll]
      const aurora = [
        [-1, -1, `${RED}Headless`],
        [-1, -1, `${RED}Heartless`],
        [-1, -1, `${RED}Pantsgrab`],
        [-1, -1, `${RED}Socksless`],
      ];
      const terror = [
        [-1, -1, `${RED}Headless`, 0, 0],
        [-1, -1, `${RED}Heartless`, 0, 0],
        [-1, -1, `${RED}Pantsgrab`, 0, 0],
        [-1, -1, `${RED}Socksless`, 0, 0],
      ];
      // Equip pieces [attribute level, name]
      const dominance = [
        [0, `${RED}Neckless`],
        [0, `${RED}Cloakless`],
        [0, `${RED}Fatherless`],
        [0, `${RED}Handless`],
      ];
      const lifeline = [
        [0, `${RED}Neckless`],
        [0, `${RED}Cloakless`],
        [0, `${RED}Fatherless`],
        [0, `${RED}Handless`],
      ];
      if (inventory === undefined) ChatLib.chat(`${DARK_GRAY}- ${RED}Inventory API is OFF!`);
      else {
        containsGoods(inventory?.inv_contents?.data, "Inventory", aurora, terror, dominance, lifeline);
        containsGoods(inventory?.inv_armor?.data, "Armor", aurora, terror, dominance, lifeline);
        containsGoods(inventory?.equipment_contents?.data, "Equipment", aurora, terror, dominance, lifeline);
        containsGoods(inventory?.ender_chest_contents?.data, "Ender Chest", aurora, terror, dominance, lifeline);
        containsGoods(inventory?.wardrobe_contents?.data, "Wardrobe", aurora, terror, dominance, lifeline);

        // Loop over backpacks
        const backpacks = inventory.backpack_contents;
        const packs = backpacks === undefined ? 0 : Object.keys(backpacks).length;
        for (let i = 0; i < packs; i++) {
          containsGoods(backpacks[i.toString()]?.data, "Backpack", aurora, terror, dominance, lifeline);
        }
        if (packs === 0) ChatLib.chat(`${DARK_GRAY}- ${RED}Backpack API is OFF!`);

        // Chat out Aurora/Terror pieces in one message
        ChatLib.chat(`${DARK_AQUA + BOLD}Armor:`);
        new TextComponent(`${DARK_GRAY}- ${DARK_PURPLE}Aurora Pieces`)
          .setHoverValue(`${DARK_PURPLE}Aurora Pieces\n${aurora.map((inner) => inner[2]).join("\n")}`)
          .chat();
        new TextComponent(`${DARK_GRAY}- ${DARK_PURPLE}Terror Pieces`)
          .setHoverValue(`${DARK_PURPLE}Terror Pieces\n${terror.map((inner) => inner[2]).join("\n")}`)
          .chat();

        // Equip pieces
        const totalDom =
          dominance.reduce((sum, innerArray) => sum + (innerArray.length > 0 ? innerArray[0] : 0), 0) +
          terror.reduce((sum, innerArray) => sum + (innerArray.length > 0 ? innerArray[3] : 0), 0);
        const totolLL =
          lifeline.reduce((sum, innerArray) => sum + (innerArray.length > 0 ? innerArray[0] : 0), 0) +
          terror.reduce((sum, innerArray) => sum + (innerArray.length > 0 ? innerArray[4] : 0), 0);
        new TextComponent(`${DARK_GRAY}- ${DARK_PURPLE}Dominance Equips ${GRAY}[Total: ${totalDom}]`)
          .setHoverValue(`${DARK_PURPLE}Dominance Equips\n${dominance.map((inner) => inner[1]).join("\n")}`)
          .chat();
        new TextComponent(`${DARK_GRAY}- ${DARK_PURPLE}Lifeline Equips ${GRAY}[Total: ${totolLL}]`)
          .setHoverValue(`${DARK_PURPLE}Lifeline Equips\n${lifeline.map((inner) => inner[1]).join("\n")}`)
          .chat();
      }

      // Check for accessory power
      ChatLib.chat(`${DARK_AQUA + BOLD}Misc:`);
      ChatLib.chat(
        `${DARK_GRAY}- ${AQUA}Magical Power: ${
          WHITE + (data?.accessory_bag_storage?.highest_magical_power ?? RED + "I NEED MORE POWER.")
        }`
      );

      // Check for Gdrag
      const pets = data?.pets_data?.pets;
      let gdrag = [`${RED}Not found!`];
      pets.forEach((pet) => {
        if (pet.type !== "GOLDEN_DRAGON") return;

        if (pet.exp >= 210_255_385) {
          gdrag[0] = `${GRAY}[Lvl 200] ${GOLD}Golden Dragon`;
          gdrag.push(convertToTitleCase(pet.heldItem));
        } else if (gdrag[0].startsWith(RED)) gdrag[0] = `${GRAY}[Lvl ${RED}< 200] ${GOLD}Golden Dragon`;
      });
      new TextComponent(`${DARK_GRAY}- ${AQUA}GDrag: ${gdrag[0]}`).setHoverValue(gdrag.join("\n")).chat();

      // Bank
      let money = data?.currencies?.bank ?? 0;
      if (money === 0) ChatLib.chat(`${DARK_GRAY}- ${RED}Bank API is OFF!`);
      else {
        money += data?.currencies?.coin_purse ?? 0;
        ChatLib.chat(`${DARK_GRAY}- ${AQUA}Bank: ${WHITE + formatNumber(money)}`);
      }

      // Check completions
      const tiers = data?.nether_island_player_data?.kuudra_completed_tiers;
      if (tiers !== undefined) {
        let completions = `${DARK_GRAY}- ${AQUA}Completions: `;
        const tiers_key = Object.keys(tiers);
        if (tiers_key.length === 0) completions += `${RED}None........`;

        tiers_key.forEach((tier) => {
          if (tier.startsWith("highest")) return;
          completions += `${WHITE + tiers[tier]} ${GRAY}| `;
        });
        ChatLib.chat(completions.slice(0, -5));
      } else ChatLib.chat(`${DARK_GRAY}- ${AQUA}Completions: ${RED}None...`);

      // Reputation
      const barb = data?.nether_island_player_data?.barbarians_reputation ?? 0;
      const mage = data?.nether_island_player_data?.mages_reputation ?? 0;
      ChatLib.chat(`${DARK_GRAY}- ${AQUA}Reputation: ${RED + barb} ${GRAY}| ${DARK_PURPLE + mage}`);
    })
    .catch((err) => ChatLib.chat(LOGO + DARK_RED + (err.cause ?? err)));
}

/**
 * /kv command to display useful information for Kuudar.
 */
register("command", (name) => {
  kuudraView(name);
})
  .setName("kv", true)
  .setAliases("kuudraView");

/**
 * Auto /kv on party finder join.
 */
registerWhen(
  register("chat", (player) => {
    if (player === Player.getName()) return;

    kuudraView(player);
  }).setCriteria("Party Finder > ${player} joined the group! (${combat})"),
  () => Settings.autoKV
);
