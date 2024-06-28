/**
 * Color codes.
 */
export const BLACK = "§0";
export const DARK_BLUE = "§1";
export const DARK_GREEN = "§2";
export const DARK_AQUA = "§3";
export const DARK_RED = "§4";
export const DARK_PURPLE = "§5";
export const GOLD = "§6";
export const GRAY = "§7";
export const DARK_GRAY = "§8";
export const BLUE = "§9";
export const GREEN = "§a";
export const AQUA = "§b";
export const RED = "§c";
export const LIGHT_PURPLE = "§d";
export const YELLOW = "§e";
export const WHITE = "§f";

export const COLOR_TABLE = {
  "§0": Renderer.color(0, 0, 0, 200),
  "§1": Renderer.color(0, 0, 139, 200),
  "§2": Renderer.color(1, 50, 32, 200),
  "§3": Renderer.color(2, 41, 42, 200),
  "§4": Renderer.color(116, 57, 84, 200),
  "§5": Renderer.color(108, 57, 142, 200),
  "§6": Renderer.color(148, 122, 84, 200),
  "§7": Renderer.color(128, 128, 128, 200),
  "§8": Renderer.color(169, 169, 169, 200),
  "§9": Renderer.color(83, 89, 181, 200),
  "§a": Renderer.color(80, 145, 113, 200),
  "§b": Renderer.color(83, 154, 181, 200),
  "§c": Renderer.color(148, 89, 117, 200),
  "§d": Renderer.color(148, 89, 181, 200),
  "§e": Renderer.color(255, 255, 0, 200),
  "§f": Renderer.color(148, 154, 181, 200),
};

/**
 * Formatting codes.
 */
export const OBFUSCATED = "§k";
export const BOLD = "§l";
export const STRIKETHROUGH = "§m";
export const UNDERLINE = "§n";
export const ITALIC = "§o";
export const RESET = "§r";

/**
 * Sounds.
 */
export const AMOGUS = new Sound({ source: "amogus.ogg" });
export const MUSIC = new Sound({ source: "music.ogg" });

/**
 * Minecraft Class Constants
 */
export let SMA = Java.type("net.minecraft.entity.SharedMonsterAttributes");
export let NBTTagString = Java.type("net.minecraft.nbt.NBTTagString");
export const EntityWither = Java.type("net.minecraft.entity.boss.EntityWither");
export const EntityArmorStand = Java.type("net.minecraft.entity.item.EntityArmorStand");
export const PLAYER_CLASS = Java.type("net.minecraft.client.entity.EntityOtherPlayerMP").class;
export const WOLF_CLASS = Java.type("net.minecraft.entity.passive.EntityWolf").class;
export const GIANT_CLASS = Java.type("net.minecraft.entity.monster.EntityGiantZombie").class;
export const ZOMBIE_CLASS = Java.type("net.minecraft.entity.monster.EntityZombie").class;
export const SPIDER_CLASS = Java.type("net.minecraft.entity.monster.EntitySpider").class;
export const ENDERMAN_CLASS = Java.type("net.minecraft.entity.monster.EntityEnderman").class;
export const BLAZE_CLASS = Java.type("net.minecraft.entity.monster.EntityBlaze").class;
export const GOLEM_CLASS = Java.type("net.minecraft.entity.monster.EntityIronGolem").class;
export const GUARDIAN_CLASS = Java.type("net.minecraft.entity.monster.EntityGuardian").class;
export const GHAST_CLASS = Java.type("net.minecraft.entity.monster.EntityGhast").class;
export const CUBE_CLASS = Java.type("net.minecraft.entity.monster.EntityMagmaCube").class;
export const CHEST_CLASS = Java.type("net.minecraft.tileentity.TileEntityChest").class;
export const STAND_CLASS = EntityArmorStand.class;
export const WITHER_CLASS = EntityWither.class;

export const InventoryBasic = Java.type("net.minecraft.inventory.InventoryBasic");
export const GuiInventory = Java.type("net.minecraft.client.gui.inventory.GuiInventory");
export const GuiChest = Java.type("net.minecraft.client.gui.inventory.GuiChest");
export const GuiTextField = Java.type("net.minecraft.client.gui.GuiTextField");

/**
 * Java Class Constants
 */
export const Toolkit = Java.type("java.awt.Toolkit");
export const DataFlavor = Java.type("java.awt.datatransfer.DataFlavor");

/**
 * VolcAddons setting constants.
 */
export const HEADER = `${GRAY}[${GOLD}VolcAddons${GRAY}] ${YELLOW}v${
  JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version
}
${WHITE}Made By Volcaronitee
`;
export const LOGO = `${GRAY}[${GOLD}VolcAddons${GRAY}] `;

/**
 * Button presets. compact this please
 */
export const BUTTON_PRESETS = {
  inv: {
    inv13: ["inv1", 3, "auction", "golden_horse_armor"],
    inv40: ["inv4", 0, "sacks", "chest"],
    inv41: ["inv4", 1, "fishingbag", "fish"],
    inv42: ["inv4", 2, "potionbag", "potion"],
    inv43: ["inv4", 3, "quiver", "arrow"],
    inv44: ["inv4", 4, "accessorybag", "redstone_block"],
    inv14: ["inv1", 4, "bazaar", "gold_ingot"],
    inv10: ["inv1", 0, "hex", "book"],
    inv12: ["inv1", 2, "anvil", "anvil"],
    inv11: ["inv1", 1, "et", "enchanting_table"],
  },
};

/**
 * Reforge names and categories.
 */
export const REFORGES = {
  weapon: new Set([
    "Epic",
    "Fair",
    "Fast",
    "Gentle",
    "Heroic",
    "Legendary",
    "odd",
    "Sharp",
    "Spicy",
    "Coldfused",
    "Dirty",
    "Fabled",
    "Gilded",
    "Suspicious",
    "Warped",
    "Withered",
    "Bulky",
    "Fanged",
    "Awkward",
    "Deadly",
    "Fine",
    "Grand",
    "Hasty",
    "Neat",
    "Rapid",
    "Rich",
    "Unreal",
    "Precise",
    "Spiritual",
    "Headstrong",
    "Great",
    "Rugged",
    "Lush",
    "Lumberjacks",
    "Double-Bit",
    "Moil",
    "Toil",
    "Blessed",
    "Earthy",
  ]),
  armor: new Set([
    "Clean",
    "Fierce",
    "Heavy",
    "Light",
    "Mythic",
    "Pure",
    "Titanic",
    "Smart",
    "Wise",
    "Candied",
    "Submerged",
    "Perfect",
    "Reinforced",
    "Renowned",
    "Spiked",
    "Hyper",
    "Giant",
    "Jaded",
    "Cubic",
    "Necrotic",
    "Empowered",
    "Ancient",
    "Undead",
    "Loving",
    "Ridiculous",
    "Bustling",
    "Mossy",
    "Festive",
    "Very",
    "Highly",
    "Extremely",
    "Not so",
    "Thicc",
    "Absolutely",
    "Even More",
  ]),
  misc: new Set([
    "Glistening",
    "Strengthened",
    "Waxed",
    "Fortified",
    "Rooted",
    "Blooming",
    "Snowy",
    "Blood-Soaked",
    "Salty",
    "Treacherous",
    "Lucky",
    "Stiff",
    "Dirty",
    "Chomp",
    "Pitchin",
    "Ambered",
    "Auspicious",
    "Fleet",
    "Heated",
    "Magnetic",
    "Mithraic",
    "Refined",
    "Stellar",
    "Fruitful",
    "Robust",
    "Zooming",
    "Peasants",
    "Green Thumb",
    "Blessed",
    "Bountiful",
    "Lvl",
  ]),
};
