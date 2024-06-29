import {
  AQUA,
  BLACK,
  BOLD,
  DARK_AQUA,
  DARK_GRAY,
  DARK_GREEN,
  DARK_PURPLE,
  DARK_RED,
  GOLD,
  GRAY,
  GREEN,
  LIGHT_PURPLE,
  NBTTagString,
  RED,
  WHITE,
  YELLOW,
} from "../../utils/Constants";
import { data } from "../../utils/Data";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { findClosest } from "../../utils/functions/find";
import { convertToTitleCase, formatNumber } from "../../utils/functions/format";
import { getAuction, getBazaar } from "./Economy";

const STACKING_ENCHANTS = new Set(["EXPERTISE", "COMPACT", "CULTIVATING", "CHAMPION", "HECATOMB", "TOXOPHILITE"]);

/**
 * This function calculates the value of enchantments on an item, taking into account
 * the provided enchantments, bazaar data, and enchantment type.
 *
 * @param {Object} enchantments - The enchantments object containing enchantment names and levels.
 * @param {Object} bazaar - The bazaar data containing enchantment value information.
 * @param {String} type - The type of value to calculate (e.g., "buy", "sell").
 * @returns {Number} - The calculated value of the enchantments on the item.
 */
function getEnchantmentValue(enchantments, bazaar, type) {
  let value = 0;
  Object.entries(enchantments ?? {}).forEach(([enchant, enchantlvl]) => {
    enchant = enchant.toUpperCase();

    if (enchant === "EFFICIENCY") {
      const multipler = 2 ** (enchantlvl - 6);
      value += multipler > 0 ? bazaar?.["SIL_EX"]?.[type] * multipler : 0;
      return;
    }

    if (STACKING_ENCHANTS.has(enchant)) enchantlvl = 1;
    value += bazaar?.[`ENCHANTMENT_${enchant}_${enchantlvl}`]?.[type] ?? 0;
  });

  return value;
}

/**
 * Variables used to represent item modifier data.
 */
const STAR_PLACEMENT = ["FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH"];
const GEMSTONE_SLOTS = {
  JADE: GREEN,
  AMBER: GOLD,
  TOPAZ: YELLOW,
  SAPPHIRE: AQUA,
  AMETHYST: DARK_PURPLE,
  RUBY: RED,
  JASPER: LIGHT_PURPLE,
  OPAL: WHITE,
  CITRINE: RED,
  AQUAMARINE: AQUA,
  PERIDOT: DARK_GREEN,
  ONYX: BLACK,
};
const MULTIUSE_SLOTS = new Set(["COMBAT", "DEFENSIVE", "MINING", "UNIVERSAL", "CHISEL"]);
const REFORGES = {
  coldfused: "ENTROPY_SUPPRESSOR",
  dirty: "DIRT_BOTTLE",
  fabled: "DRAGON_CLAW",
  gilded: "MIDAS_JEWEL",
  suspicious: "SUSPICIOUS_VIAL",
  aote_stone: "AOTE_STONE",
  withered: "WITHER_BLOOD",
  bulky: "BULKY_STONE",
  jerry_stone: "JERRY_STONE",
  fanged: "FULL_JAW_FANGING_KIT",
  precise: "OPTICAL_LENS",
  spiritual: "SPIRIT_STONE",
  headstrong: "SALMON_OPAL",
  candied: "CANDY_CORN",
  submerged: "DEEP_SEA_ORB",
  perfect: "DIAMOND_ATOM",
  reinforced: "RARE_DIAMOND",
  renowned: "DRAGON_HORN",
  spike: "DRAGON_SCALE",
  hyper: "END_STONE_GEODE",
  giant: "GIANT_TOOTH",
  jaded: "JADERALD",
  cubic: "MOLTEN_CUBE",
  necrotic: "NECROMANCER_BROOCH",
  empowered: "SADAN_BROOCH",
  ancient: "PRECURSOR_GEAR",
  undead: "PREMIUM_FLESH",
  loving: "RED_SCARF",
  RIDICULOUS: "red_nose",
  bustling: "SKYMART_BROCHURE",
  mossy: "OVERGROWN_GRASS",
  festive: "FROZEN_BUBBLE",
  glistening: "SHINY_PRISM",
  strengthened: "SEARING_STONE",
  waxed: "BLAZE_WAX",
  fortified: "METEOR_SHARD",
  rooted: "BURROWING_SPORES",
  blooming: "FLOWERING_BOUQUET",
  snowy: "TERRY_SNOWGLOBE",
  blood_soaked: "PRESUMED_GALLON_OF_RED_PAINT",
  greater_spook: "BOO_STONE",
  salty: "SALT_CUBE",
  treacherous: "RUSTY_ANCHOR",
  lucky: "LUCKY_DICE",
  stiff: "HARDENED_WOOD",
  chomp: "KUUDRA_MANDIBLE",
  pitchin: "PITCHIN_KOI",
  ambered: "AMBERED_MATERIAL",
  auspicious: "ROCK_GEMSTONE",
  fleet: "DIAMONITE",
  heated: "HOT_STUFF",
  magnetic: "LAPIS_CRYSTAL",
  mithraic: "PURE_MITHRIL",
  refined: "REFINED_AMBER",
  stellar: "PETRIFIED_STARFALL",
  fruitful: "ONYX",
  moil: "MOIL_LOG",
  toil: "TOIL_LOG",
  blessed: "BLESSED_FRUIT",
  earthy: "LARGE_WALNUT",
  blessed: "BLESSED_FRUIT",
  bountiful: "GOLDEN_BALL",
};
const KUUDRA_UPGRADES = {
  HOT: [150, 170, 190, 215, 240, 270, 300, 340, 390, 440, 500],
  BURNING: [800, 900, 1000, 1125, 1270, 1450, 1650, 1850, 2100, 2350, 2650],
  FIERY: [4500, 5000, 5600, 6300, 7000, 8000, 9000, 10200, 11500, 13000, 14500],
  INFERNAL: [
    25500, 30000, 35000, 41000, 48000, 56000, 65500, 76000, 89000, 105000, 120000, 140000, 165000, 192000, 225000,
    265000,
  ],
};

/**
 * Variables used to represent and display advanced item value.
 */
const valueExample = `&3&lItem: §dSussy Baka §6✪§6✪§6✪§6✪§6✪§c➊
- &bBase: &a+O
- &bMaster Stars: &a+Say
- &bRecomb: &a+Can
- &bRune: &a+You

- &6&lBooks:
   - &eHPB (10/10): &a+See
   - &eFPB (5/5): &a+By
   - &eSun Tzu: &a+The

- &6&lGemstones:
   - &bPerfect Sapphire Gem: &a+Dawn's
   - &fPerfect Upal Gem: &a+Early
   - &bPerfect Sapphire Gem: &a+Light

- &6&lEnchantments:
   - &2Buy Order Value: &a+What
   - &2Insta Buy Value: &a+So

- &6&lWither Scrolls:
   - &8Art Shield Scroll: &a+Proudly
   - &8Shadow Is An: &a+We
   - &8Explosion Scroll: &a+Hailed

&3Total Value: &aKATSU.`;
const valueOverlay = new Overlay("itemPrice", data.EL, "moveValue", valueExample, ["all"], "guiRender");
valueOverlay.setMessage("");

let savedValues = {};
/**
 * Calculates the complete value of given item.
 *
 * @param {Object} item - Item Object.
 * @returns {Number} - Total value of item.
 */
export function getItemValue(item, save = true) {
  // Get Item statistics
  if (item === null) return 0;
  const nbt = item?.getNBT() ?? item;
  const itemTag = nbt?.getCompoundTag("tag")?.toObject();
  const itemName = itemTag?.display?.Name;
  const itemData = itemTag?.ExtraAttributes;
  const itemID = itemData?.id;

  // Check for early return
  if (itemName?.startsWith("§6") && itemName?.endsWith(" coins"))
    return parseInt(tag?.display?.Lore[4]?.removeFormatting()?.replace(/[^0-9]/g, "")) ?? 0;
  if (itemID === undefined) return 0;

  // Get remaining statistics
  const amount = item?.getStackSize() ?? 1;
  const itemUUID = (itemData?.uuid || item?.getName()) + amount;

  // Check if value is already calculated
  if (itemUUID !== undefined) {
    const saved = savedValues?.[itemUUID]?.[0];
    if (saved !== undefined) return saved;
  }

  // Start Price Checking
  const auction = getAuction();
  const bazaar = getBazaar();
  let auctionItem = auction?.[itemID];
  let value = (auctionItem?.lbin ?? 0) * amount;

  // Base Value
  let valueMessage = `${DARK_AQUA + BOLD}Item: ${itemName}`;
  if (amount !== 1 && save) valueMessage += ` ${GRAY}x${amount}\n`;
  else if (save) valueMessage += `\n`;

  // Check for Edge Cases
  if (value === 0) {
    const partsID = itemID.split("_");
    const pieceTier = partsID[0];
    if (pieceTier in KUUDRA_UPGRADES) {
      // Kuudra Piece Upgrade Value
      const formatID = partsID.slice(1).join("_");
      auctionItem = auction?.[formatID];
      value = (auctionItem?.lbin ?? 0) * amount;
      if (save) valueMessage += `- ${AQUA}Base: ${GREEN}+${formatNumber(value)}\n`;

      let crimsonEssence = 0;
      const upgrades = Object.keys(KUUDRA_UPGRADES);
      const upgradeTier = upgrades.indexOf(pieceTier);

      for (let i = 0; i <= upgradeTier; i++) {
        const upgradeArray = KUUDRA_UPGRADES[upgrades[i]];
        const crimsonStars = i === upgradeTier ? itemData?.upgrade_level || 0 : 10;

        crimsonEssence += upgradeArray.slice(0, crimsonStars + 1).reduce((acc, value) => acc + value, 0);
      }
      const crimsonValue = crimsonEssence * (bazaar?.ESSENCE_CRIMSON?.[Settings.priceType] ?? 1);
      value += crimsonValue;
      if (save) valueMessage += `- ${AQUA}Essence Upgrades: ${GREEN}+${formatNumber(crimsonValue)}\n`;
    } else {
      if (itemID === "PET") {
        // Pet Value
        const petInfo = JSON.parse(itemData?.petInfo);
        const petName = `${petInfo?.tier}_${petInfo?.type}`;
        const petAuction = auction?.[petName];
        if (petAuction === undefined) return 0;

        const petLevel = itemName.split("]")[0].split(" ")[1];
        const petLevels = Object.keys(auction?.[`${petName}`]?.levels);
        const closestLevel = findClosest(petLevel, petLevels);
        value = petAuction?.levels?.[closestLevel]?.lbin ?? petAuction?.lbin ?? 0;

        valueMessage += `- ${AQUA}Base: ${GREEN}+${formatNumber(value)}\n`;
        const skinValue = auction["PET_SKIN_" + petInfo.skin]?.lbin ?? 0;
        value += skinValue;

        if (skinValue !== 0 && save) valueMessage += `- ${AQUA}Skin: ${GREEN}+${formatNumber(skinValue)}\n`;
        if (save) {
          valueMessage += `\n${GOLD}Total Value: ${YELLOW + formatNumber(value)}`;
          savedValues[itemUUID] = [value, valueMessage];
        }
      } else if (itemID === "ENCHANTED_BOOK") {
        // Enchantment Value
        value = getEnchantmentValue(itemData?.enchantments, bazaar, 0);
        if (save) {
          valueMessage += `- ${AQUA}Base: ${GREEN}+${formatNumber(value)}`;
          savedValues[itemUUID] = [value, valueMessage];
        }
      } else {
        // Bazaar Value
        value = (bazaar?.[itemID]?.[Settings.priceType] ?? 0) * amount;
        const order = (bazaar?.[itemID]?.[0] ?? 0) * amount;
        const insta = (bazaar?.[itemID]?.[1] ?? 0) * amount;
        if (order !== 0 || (insta !== 0 && save)) {
          if (save) {
            valueMessage += `- ${AQUA}Insta Sell: ${GREEN}+${formatNumber(order)}\n`;
            valueMessage += `- ${AQUA}Sell Offer: ${GREEN}+${formatNumber(insta)}`;
            savedValues[itemUUID] = [value, valueMessage];
          }
        }
      }
      return value;
    }
  }
  if (save) valueMessage += `- ${AQUA}Base: ${GREEN}+${formatNumber(value)}\n`;

  // Skin Value
  const skinValue = auction?.[itemData.skin]?.lbin ?? 0;
  if (skinValue !== 0) {
    value += skinValue;
    if (save) valueMessage += `- ${AQUA}Skin: ${GREEN}+${formatNumber(skinValue)}\n`;
  }

  // Reforge Value
  const reforgeValue = bazaar?.[REFORGES?.[itemData?.modifier]]?.[Settings.priceType] ?? 0;
  if (reforgeValue !== 0) {
    value += reforgeValue;
    if (save) valueMessage += `- ${AQUA}Reforge: ${GREEN}+${formatNumber(reforgeValue)}\n`;
  }
  // Master Star Values
  if (itemTag?.display?.Lore?.find((line) => line.includes("DUNGEON")) !== undefined) {
    let starValue = 0;
    const upgrade_level = itemData?.upgrade_level ?? itemData?.dungeon_item_level ?? 0;
    for (let i = 0; i < Math.max(upgrade_level - 5, 0); i++)
      starValue += bazaar?.[`${STAR_PLACEMENT[i]}_MASTER_STAR`]?.[Settings.priceType] ?? 0;
    if (starValue !== 0) {
      value += starValue;
      if (save) valueMessage += `- ${AQUA}Master Stars: ${GREEN}+${formatNumber(starValue)}\n`;
    }
  }
  // Recomb Value
  const recombValue =
    itemData?.rarity_upgrades === undefined ? 0 : bazaar?.RECOMBOBULATOR_3000?.[Settings.priceType] ?? 0;
  if (recombValue !== 0) {
    value += recombValue;
    if (save) valueMessage += `- ${AQUA}Recomb: ${GREEN}+${formatNumber(recombValue)}\n`;
  }
  // Dye Value
  const dyeValue = auction?.[itemData?.dye_item]?.lbin ?? 0;
  if (dyeValue !== 0) {
    value += dyeValue;
    if (save) valueMessage += `- ${AQUA}Dye: ${GREEN}+${formatNumber(dyeValue)}\n`;
  }
  // Rune Value
  const runes = itemData?.runes;
  if (runes !== undefined) {
    const [runeKey, runeLevel] = Object.entries(runes)[0];
    const runeValue = auction[`${runeKey}_${runeLevel}`]?.lbin ?? 0;
    if (runeValue !== 0) {
      if (save) valueMessage += `- ${AQUA}Rune: ${GREEN}+${formatNumber(runeValue)}\n`;
      value += runeValue;
    }
  }

  // Potato Book Values
  const potatoCount = itemData?.hot_potato_count ?? 0;
  if (potatoCount !== 0) {
    // Get hot value
    const hotPotatoCount = Math.min(potatoCount, 10);
    const hotPotatoValue = hotPotatoCount * (bazaar?.HOT_POTATO_BOOK?.[Settings.priceType] ?? 0);
    if (save) valueMessage += `\n- ${GOLD + BOLD}Books:\n`;
    if (save) valueMessage += `   - ${YELLOW}HPB (${hotPotatoCount}/10): ${GREEN}+${formatNumber(hotPotatoValue)}\n`;

    // Get fuming value
    const fumingPotatoCount = Math.max(potatoCount - 10, 0);
    const fumingPotatoValue = fumingPotatoCount * (bazaar?.FUMING_POTATO_BOOK?.[Settings.priceType] ?? 0);
    if (fumingPotatoValue !== 0 && save)
      if (save)
        valueMessage += `   - ${YELLOW}FPB (${fumingPotatoCount}/5): ${GREEN}+${formatNumber(fumingPotatoValue)}\n`;
    value += hotPotatoValue + fumingPotatoValue;
  }
  // Art of War Value
  const tzuValue = itemData?.art_of_war_count === undefined ? 0 : bazaar?.THE_ART_OF_WAR?.[Settings.priceType];
  if (tzuValue !== 0) {
    value += tzuValue;
    if (save) valueMessage += `   - ${YELLOW}Sun Tzu: ${GREEN}+${formatNumber(tzuValue)}\n`;
  }
  // Art of Peace Value
  const peaceValue = itemData?.artOfPeaceApplied === undefined ? 0 : bazaar?.THE_ART_OF_PEACE?.[Settings.priceType];
  if (peaceValue !== 0) {
    value += peaceValue;
    if (save) valueMessage += `   - ${YELLOW}Moon Tzu: ${GREEN}+${formatNumber(peaceValue)}\n`;
  }

  // Drill Part Values
  const tankPart = itemData?.drill_part_fuel_tank;
  const enginePart = itemData?.drill_part_engine;
  const modulePart = itemData?.drill_part_upgrade_module;
  if (tankPart !== undefined || enginePart !== undefined || modulePart !== undefined) {
    if (save) valueMessage += `\n- ${GOLD + BOLD}Drill Parts:\n`;
    const tankValue = tankPart === undefined ? 0 : auction?.[tankPart.toUpperCase()]?.lbin ?? 0;
    const engineValue = enginePart === undefined ? 0 : auction?.[enginePart.toUpperCase()]?.lbin ?? 0;
    const moduleValue = modulePart === undefined ? 0 : auction?.[modulePart.toUpperCase()]?.lbin ?? 0;

    if (save) {
      if (tankValue !== 0)
        valueMessage += `   - ${AQUA + convertToTitleCase(tankPart)}: ${GREEN}+${formatNumber(tankValue)}\n`;
      if (engineValue !== 0)
        valueMessage += `   - ${AQUA + convertToTitleCase(enginePart)}: ${GREEN}+${formatNumber(engineValue)}\n`;
      if (moduleValue !== 0)
        valueMessage += `   - ${AQUA + convertToTitleCase(modulePart)}: ${GREEN}+${formatNumber(moduleValue)}\n`;
    }
  }

  // Gem Values
  const gemsKeys = Object.keys(itemData?.gems ?? {});
  const powerScroll = itemData?.power_ability_scroll;
  if (gemsKeys.length !== 0 || powerScroll) {
    if (save) valueMessage += `\n- ${GOLD + BOLD}Gemstones:\n`;

    if (powerScroll) {
      const powerScrollValue = auction?.[powerScroll]?.lbin ?? 0;
      const scrollColor = GEMSTONE_SLOTS?.[powerScroll.split("_")[0]] ?? WHITE;
      if (save)
        valueMessage += `   - ${scrollColor + convertToTitleCase(powerScroll)}: ${GREEN}+${formatNumber(
          powerScrollValue
        )}\n`;
      value += powerScrollValue;
    }
  }

  gemsKeys.forEach((gemstone) => {
    const gemstoneData = itemData.gems[gemstone];
    const gemstoneTier = gemstoneData?.quality ?? gemstoneData;
    const gemstoneType = gemstone.split("_");

    let gemstoneValue = 0;
    let gemstoneName = "";
    if (gemstoneType[0] in GEMSTONE_SLOTS) {
      gemstoneName = `${gemstoneTier}_${gemstoneType?.[0]}_GEM`;
      gemstoneColor = GEMSTONE_SLOTS[gemstoneType[0]];
      gemstoneValue = bazaar?.[gemstoneName]?.[Settings.priceType] ?? 0;
    } else if (MULTIUSE_SLOTS.has(gemstoneType?.[0]) && gemstoneType?.[gemstoneType.length - 1] !== "gem") {
      gemstoneName = `${gemstoneTier}_${itemData.gems?.[gemstone + "_gem"]}_GEM`;
      gemstoneColor = GEMSTONE_SLOTS[itemData.gems?.[gemstone + "_gem"]];
      gemstoneValue = bazaar?.[gemstoneName]?.[Settings.priceType] ?? 0;
    }

    if (gemstoneValue !== 0) {
      value += gemstoneValue;
      if (save)
        valueMessage += `   - ${gemstoneColor + convertToTitleCase(gemstoneName)}: ${GREEN}+${formatNumber(
          gemstoneValue
        )}\n`;
    }
  });

  // Enchantment Values
  const enchantOrderValue = getEnchantmentValue(itemData?.enchantments, bazaar, 0);
  const enchantInstaValue = getEnchantmentValue(itemData?.enchantments, bazaar, 1);
  if (enchantOrderValue !== 0) {
    value += enchantOrderValue;
    if (save) {
      valueMessage += `\n- ${GOLD + BOLD}Enchantments:\n`;
      valueMessage += `   - ${DARK_GREEN}Buy Order Value: ${GREEN}+${formatNumber(enchantOrderValue)}\n`;
      valueMessage += `   - ${DARK_GREEN}Insta Buy Value: ${GREEN}+${formatNumber(enchantInstaValue)}\n`;
    }
  }

  // Wither Impact Scroll Values
  const witherScrolls = itemData?.ability_scroll ?? [];
  if (witherScrolls.length !== 0 && save) valueMessage += `\n- ${GOLD + BOLD}Wither Scrolls:\n`;
  witherScrolls.forEach((scroll) => {
    const scrollValue = bazaar?.[scroll]?.[Settings.priceType];
    if (scrollValue !== 0) {
      if (save)
        valueMessage += `   - ${DARK_GRAY + convertToTitleCase(scroll)}: ${GREEN}+${formatNumber(scrollValue)}\n`;
      value += scrollValue;
    }
  });

  // Attribute Values
  const attributes = Object.keys(itemData?.attributes ?? {}).sort();
  let attributesValue = 0;
  let comboCalc = true;
  let doubleCalc = false;
  let attributeMessage = "";
  if (attributes.length && save) valueMessage += `\n- ${GOLD + BOLD}Attributes:\n`;
  attributes.forEach((attribute) => {
    // Get attribute data
    const attributeLevel = itemData?.attributes[attribute];
    const attributeCount = 2 ** (attributeLevel - 1);
    const attributePiece = auctionItem?.attributes?.[attribute]?.lbin ?? 0;
    const attributeValue =
      Math.min(attributePiece, auction?.ATTRIBUTE_SHARD?.attributes?.[attribute]?.lbin ?? attributePiece) *
      attributeCount;

    // Check if valid attribute to calc
    if (!data.attributelist.includes(attribute)) {
      attributeMessage += `   - ${RED + convertToTitleCase(attribute)} ${attributeLevel}: ${DARK_RED}Nullified\n`;
      comboCalc = false;
      return;
    }

    // Add value and message based on calced values
    if (attributeLevel > 5 || !Settings.singleAttribute) {
      attributesValue += attributeValue;
      attributeMessage += `   - ${RED + convertToTitleCase(attribute)} ${attributeLevel}: ${GREEN}+${formatNumber(
        attributeValue
      )}\n`;
      doubleCalc = true;
    } else if (attributeValue > attributesValue && !doubleCalc) {
      attributeMessage = attributeMessage.replace(/(\+[^\n]+)/, `${DARK_RED}Nullified`);
      attributeMessage += `   - ${RED + convertToTitleCase(attribute)} ${attributeLevel}: ${GREEN}+${formatNumber(
        attributeValue
      )}\n`;
      attributesValue = attributeValue;
    } else attributeMessage += `   - ${RED + convertToTitleCase(attribute)} ${attributeLevel}: ${DARK_RED}Nullified\n`;
  });

  // Attribute combo value
  const comboValue = auctionItem?.attribute_combos?.[attributes.join(" ")]?.lbin ?? 0;
  if (comboCalc && comboValue >= Settings.minGR * 1_000_000 && Settings.minGR !== 0) {
    if (doubleCalc) {
      attributeMessage += `   - ${RED}Go(o)d Roll: ${GREEN}+${formatNumber(comboValue)}\n`;
      attributesValue += comboValue;
    } else if (comboValue > attributesValue) {
      attributeMessage = `   - ${RED}Go(o)d Roll: ${GREEN}+${formatNumber(comboValue)}\n`;
      attributesValue = comboValue;
    }
  }
  // Final values
  if (save) valueMessage += attributeMessage;
  value += attributesValue;

  // Total Value
  if (save) valueMessage += `\n${GOLD}Total Value: ${YELLOW + formatNumber(value)}`;

  if (save) savedValues[itemUUID] = [value, valueMessage];
  return value;
}

/**
 * Adds enchantment value tag onto item over all items hovered over.
 */
registerWhen(
  register("preItemRender", (_, __, ___, gui) => {
    // Check item data to cancel lore append.
    const item = Player.getContainer().getItems()[gui?.getSlotUnderMouse()?.field_75222_d];
    if (!item) return;

    const itemTag = item.getNBT().getCompoundTag("tag");
    const loreTag = itemTag.getCompoundTag("display").getTagMap().get("Lore");
    const itemUUID =
      (itemTag.getCompoundTag("ExtraAttributes").getString("uuid") || item.getName()) + item.getStackSize();
    if (loreTag === null) return;

    // Check if value already in tooltip
    const list = new NBTTagList(loreTag);
    for (let i = 0; i < list.getTagCount(); i++) {
      if (list.getStringTagAt(i).startsWith("§3§lItem Value:")) {
        valueOverlay.setMessage(savedValues?.[itemUUID]?.[1] ?? "");
        return;
      }
    }

    // Add to item lore.
    const value = getItemValue(item);
    valueOverlay.setMessage(savedValues?.[itemUUID]?.[1] ?? "");
    if (value !== 0 && (Settings.itemPrice === 2 || Settings.itemPrice === 3)) {
      list.appendTag(new NBTTagString(""));
      list.appendTag(new NBTTagString(`§3§lItem Value: §6${formatNumber(value)}`));
    }
  }),
  () => Settings.itemPrice !== 0
);

/**
 * Reset data on data transfers.
 */
register("guiClosed", () => {
  valueOverlay.setMessage("");
});
register("worldUnload", () => {
  savedValues = {};
});
