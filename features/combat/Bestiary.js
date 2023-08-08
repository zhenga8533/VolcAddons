// Import required modules and constants
import request from "../../../requestV2";
import settings from "../../settings";
import { BOLD, GOLD, GREEN, LOGO, RED, WHITE } from "../../utils/constants";
import { getTime } from "../../utils/functions";
import { getPlayerUUID } from "../../utils/player";
import { delay } from "../../utils/thread";
import { data } from "../../utils/variables";


/**
 * Makes a PULL request to get bestiary data from the player's info using the Hypixel API.
 */
let bestiaryApi = undefined;
let valid = true;
export function updateBestiary() {
    // Make an API request to Hypixel API to get the player's bestiary data from their profile.
    request({
        url: `https://api.hypixel.net/skyblock/profile?key=${settings.apiKey}&profile=${data.profileId}`,
        json: true
    }).then((response) => {
        // Update the 'bestiary' variable with the bestiary data from the API response.
        bestiaryApi = response.profile.members[getPlayerUUID()].bestiary.kills;
    }).catch((error) => {
        // If there is an error, display the error message in the Minecraft chat.
        if (error.cause != "Invalid API key")
            delay(updateBestiary, 3000);
        else if (settings.apiKey && valid) {
            delay(() => ChatLib.chat(`${LOGO} ${RED}${error.cause}!`), 1000);
            valid = false;
        }
    });
}
register("worldLoad", () => {
    updateBestiary();
});

/**
 * Variable and class to track mob bestiary data.
 */
const killBrackets = [
    [20, 40, 60, 100, 200, 400, 800, 1400, 2000, 3000, 6000, 12000, 20000, 30000, 40000, 50000, 60000, 72000, 86000, 100000, 200000, 400000, 600000, 800000, 1000000],
    [5, 10, 15, 25, 50, 100, 200, 350, 500, 750, 1500, 3000, 5000, 7500, 10000, 12500, 15000, 18000, 21500, 25000, 50000, 100000, 150000, 200000, 250000],
    [4, 8, 12, 16, 20, 40, 80, 140, 200, 300, 600, 1200, 2000, 3000, 4000, 5000, 6000, 7200, 8600, 10000, 20000, 40000, 60000, 80000, 100000],
    [2, 4, 6, 10, 15, 20, 25, 35, 50, 75, 150, 300, 500, 750, 1000, 1350, 1650, 2000, 2500, 3000, 5000, 10000, 15000, 20000, 25000],
    [1, 2, 3, 5, 7, 10, 20, 25, 30, 60, 120, 200, 300, 400, 500, 600, 720, 860, 1000, 2000, 4000, 6000, 8000, 10000],
    [1, 2, 3, 5, 7, 9, 14, 17, 21, 25, 50, 80, 125, 175, 250, 325, 425, 525, 625, 750, 1500, 3000, 4500, 6000, 7500],
    [1, 2, 3, 5, 7, 9, 11, 14, 17, 20, 30, 40, 55, 75, 100, 150, 200, 275, 375, 500, 1000, 1500, 2000, 2500, 3000]
];

/**
 * Represents a Mob with multiple names and levels, used for tracking kills and progression.
 *
 * @class Mob
 * @param {Array} names - An array of names for the mob.
 * @param {Array} levels - An array of levels for the mob.
 * @param {number} bracket - The bracket number of the mob.
 * @param {number} maxLevel - The maximum level of the mob.
 * @param {number} time - The time required to kill the mob.
 */
class Mob {
    constructor(names, levels, bracket, maxLevel, time) {
        this.names = names;
        this.levels = levels;
        this.bracket = killBrackets[bracket - 1];
        this.maxLevel = maxLevel - 1;
        this.level = 0;
        this.kills = 0;
        this.next = 0;
        this.time = time;
    }

    /**
     * Updates the number of kills, current level, and time needed for the next kill.
     *
     * @memberof Mob
     */
    updateKills() {
        // Calculate total kills by iterating through all the names and levels
        this.names.forEach(name => {
            this.levels.forEach(level => {
                let kills = bestiaryApi[`${name}_${level}`] || 0;
                this.kills += kills;
            });
        });

        // Determine the current level based on the kill count and bracket
        for (let i = this.bracket.length - 1; i >= 0; i--) {
            if (this.kills > this.bracket[i]) {
                this.level = i;
                break;
            }
        }

        // Calculate the number of kills needed for the next level and the time required for it
        this.next = Math.max(this.bracket[Math.min(this.level + 1, this.maxLevel - 1)] - this.kills, 0);
        this.nextTime = this.next * this.time;
    }
}

/**
 * Variable used to store and display player bestiary values using API.
 * "Mob Name": [[entities], [levels], bracket, max level, player kills]
 */
const bestiary = {
    // Your Island
    "Creeper": new Mob(["creeper"], [1], 1, 5, 5),
    "Enderman": new Mob(["enderman"], [1, 15], 1, 5, 5),
    "Skeleton": new Mob(["skeleton"], [1, 15], 1, 5, 5),
    "Slime": new Mob(["slime"], [1], 1, 5, 5),
    "Spider": new Mob(["spider"], [1, 15], 1, 5, 5),
    "Witch": new Mob(["witch"], [1, 15], 1, 5, 60),
    "Zombie": new Mob(["zombie"], [1, 15], 1, 5, 5),
    // Hub
    "Crypt Ghoul": new Mob(["unburried_zombie"], [30], 1, 15, 0.5),
    "Golden Ghoul": new Mob(["unburried_zombie"], [60], 3, 15, 5),
    "Graveyard Zombie": new Mob(["graveyard_zombie"], [1], 1, 5, 0.5),
    "Old Wolf": new Mob(["old_wolf"], [50], 3, 15, 10),
    "Wolf": new Mob(["ruin_wolf"], [15], 1, 15, 0.5),
    "Zombie Villager": new Mob(["zombie_villager"], [1], 4, 15, 1),
    // The Farming Islands
    "Chicken": new Mob(["farming_chicken"], [1], 1, 5, 0.5),
    "Cow": new Mob(["farming_cow"], [1], 1, 5, 0.5),
    "Mushroom Cow": new Mob(["mushroom_cow"], [1], 1, 5, 3),
    "Pig": new Mob(["farming_pig"], [1], 1, 5, 0.5),
    "Rabbit": new Mob(["farming_rabbit"], [1], 1, 5, 3),
    "Sheep": new Mob(["farming_sheep"], [1], 1, 5, 3),
    // Spider's Den
    "Arachne": new Mob(["arachne"], [300, 500], 7, 20, 30),
    "Arachne's Brood": new Mob(["arachne_brood"], [100, 200], 4, 15, 3),
    "Arachne's Keeper": new Mob(["arachne_keeper"], [100], 5, 15, 30),
    "Brood Mother": new Mob(["brood_mother_spider"], [12], 5, 15, 60),
    "Dasher Spider": new Mob(["dasher_spider"], [4, 42, 45, 50], 2, 15, 1),
    "Gravel Skeleton": new Mob(["respawning_skeleton"], [2], 3, 15, 1),
    "Rain Slime": new Mob(["random_slime"], [8], 4, 15, 5),
    "Silverfish": new Mob(["jockey_shot_silverfish", "splitter_spider_silverfish"], [2, 3, 42, 45, 50], 1, 15, 1),
    "Spider Jockey": new Mob(["spider_jockey"], [3, 42], 2, 15, 1),
    "Splitter Spider": new Mob(["splitter_spider"], [4, 42, 45, 50], 2, 15, 1),
    "Voracious Spider": new Mob(["voracious_spider"], [10, 42, 45, 50], 1, 15, 1),
    "Weaver Spider": new Mob(["weaver_spider"], [3, 42, 45, 50], 2, 15, 1),
    // The End
    "Dragon": new Mob(["unstable_dragon", "strong_dragon", "superior_dragon", "wise_dragon", "young_dragon", "old_dragon", "protector_dragon"], [100], 5, 20, 45),
    "Enderman": new Mob(["enderman"], [42, 45, 50], 4, 25, 0.5),
    "Endermite": new Mob(["endermite", "nest_endermite"], [37, 40, 50], 5, 25, 5),
    "Endstone Protector": new Mob(["corrupted_protector"], [100], 7, 20, 120),
    "Obsidian Defender": new Mob(["obsidian_wither"], [55], 4, 25, 2),
    "Voidling Extremist": new Mob(["voidling_extremist"], [100], 3, 15, 6),
    "Voidling Fanatic": new Mob(["voidling_fanatic"], [85], 4, 25, 1.5),
    "Watcher": new Mob(["watcher"], [55], 4, 25, 2),
    "Zealot": new Mob(["zealot_enderman", "zealot_bruiser"], [55, 100], 3, 25, 3),
    // Crimson Isle
    "Ashfang": new Mob(["ashfang"], [200], 5, 20, 90),
    "Barbarian Duke X": new Mob(["barbarian_duke_x"], [200], 5, 20, 45),
    "Bladesoul": new Mob(["bladesoul"], [200], 5, 20, 45),
    "Blaze": new Mob(["blaze", "bezal", "mutated_blaze"], [25, 70, 80, 70], 4, 20, 3),
    "Flaming Spider": new Mob(["flaming_spider"], [80], 3, 20, 3),
    "Flare": new Mob(["flare"], [90], 1, 20, 0.5),
    "Ghast": new Mob(["ghast", "dive_ghast"], [85, 90], 4, 20, 4),
    "Mage Outlaw": new Mob(["mage_outlaw"], [200], 5, 20, 45),
    "Magma Boss": new Mob(["magma_boss"], [500], 5, 20, 90),
    "Magma Cube": new Mob(["magma_cube", "pack_magma_cube"], [75, 90], 3, 20, 2),
    "Matcho": new Mob(["matcho"], [100], 5, 15, 30),
    "Millenia-Aged Blaze": new Mob(["old_blaze"], [110], 3, 15, 10),
    "Mushroom Bull": new Mob(["charging_mushroom_cow"], [80], 3, 20, 1),
    "Pigman": new Mob(["magma_cube_rider", "kada_knight"], [90], 3, 20, 2),
    "Smoldering Blaze": new Mob(["smoldering_blaze"], [95], 2, 20, 2),
    "Tentacle": new Mob(["tentacle", "hellwisp"], [1, 100], 5, 20, 15),
    "Vanquisher": new Mob(["vanquisher"], [100], 5, 20, 180),
    "Wither Skeleton": new Mob(["wither_skeleton"], [70], 3, 20, 3),
    "Wither Spectre": new Mob(["wither_spectre"], [70], 3, 20, 1.5),
    // Deep Cavern
    "Emerald Slime": new Mob(["emerald_slime"], [5, 10, 15], 1, 10, 1),
    "Lapis Zombie": new Mob(["lapis_zombie"], [7], 1, 10, 1),
    "Miner Skeleton": new Mob(["diamond_skeleton"], [15, 20], 1, 10, 1),
    "Miner Zombie": new Mob(["diamond_zombie"], [15, 20], 1, 10, 1),
    "Redstone Pigman": new Mob(["redstone_pigman"], [10], 1, 10, 1),
    "Creeper": new Mob(["invisible_creeper"], [3], 3, 10, 2),
    // Dwarven Mines
    "Ghost": new Mob(["caverns_ghost"], [250], 2, 25, 0.5),
    "Goblin": new Mob(["goblin_weakling_melee", "goblin_weakling_bow", "goblin_creepertamer", "goblin_battler", "goblin_knife_thrower", "goblin_flamethrower", "goblin_murderlover"], [25, 40, 50, 70, 100, 200], 2, 20, 0.5),
    "Goblin Raider": new Mob(["goblin_weakling_melee", "goblin_weakling_bow", "goblin_creepertamer", "goblin_creeper", "goblin_battler", "goblin_murderlover", "goblin_golem"], [5, 20, 60, 90, 150], 4, 15, 5),
    "Golden Goblin": new Mob(["goblin"], [50], 5, 15, 15),
    "Ice Walker": new Mob(["ice_walker"], [45], 2, 15, 3),
    "Powder Ghast": new Mob(["powder_ghast"], [1], 1, 5, 180),
    "Star Sentry": new Mob(["crystal_sentry"], [50], 4, 15, 30),
    "Treasure Hoarder": new Mob(["treasure_hoarder"], [70], 3, 15, 5),
    // Crystal Hollows
    "Automaton": new Mob(["automaton"], [100, 150], 2, 15, 2),
    "Bal": new Mob(["bal_boss"], [100], 6, 15, 90),
    "Butterfly": new Mob(["butterfly"], [100], 4, 15, 15),
    "Grunt": new Mob(["team_treasurite_grunt", "team_treasurite_viper", "team_treasurite_wendy", "team_treasurite_sebastian", "team_treasurite_corleone"], [50, 100, 200], 3, 15, 5),
    "Key Guardian": new Mob(["key_guardian"], [100], 6, 15, 45),
    "Sludge": new Mob(["sludge"], [5, 10, 100], 3, 15, 3),
    "Thyst": new Mob(["thyst"], [20], 3, 15, 5),
    "Worm": new Mob(["worm", "scatha"], [5, 10], 5, 15, 60),
    "Yog": new Mob(["yog"], [100], 3, 15, 15),
    // The Park
    "Howling Spirit": new Mob(["howling_spirit"], [35], 2, 15, 2),
    "Pack Spirit": new Mob(["pack_spirit"], [30], 2, 15, 2),
    "Soul of the Alpha": new Mob(["soul_of_the_alpha"], [55], 4, 15, 6),
    // Spooky Festival
    "Crazy Witch": new Mob(["batty_witch"], [60], 2, 10, 10),
    "Headless Horseman": new Mob(["horseman_horse"], [100], 7, 20, 30),
    "Phantom Spirit": new Mob(["phantom_spirit"], [35], 2, 10, 10),
    "Scary Jerry": new Mob(["scary_jerry"], [30], 2, 10, 10),
    "Trick or Treater": new Mob(["trick_or_treater"], [30], 2, 10, 10),
    "Wither Gourd": new Mob(["wither_gourd"], [40], 2, 10, 10),
    "Wraith": new Mob(["wraith"], [50], 2, 10, 10),
    // The Catacombs
    "Angry Archeologist": new Mob(["diamond_guy", "master_diamond_guy"], [80, 90, 100, 110, 120, 130, 140, 150, 160, 170], 5, 25, 30),
    "Bat": new Mob(["dungeon_secret_bat"], [1], 4, 15, 180),
    "Cellar Spider": new Mob(["cellar_spider", "master_cellar_spider"], [45, 65, 75, 85, 95, 105, 115, 125], 4, 15, 60),
    "Crypt Dreadlord": new Mob(["crypt_dreadlord", "master_cryptdreadlord"], [47, 67, 77, 87, 97, 107, 117, 127], 4, 25, 5),
    "Crypt Lurker": new Mob(["crypt_lurker", "master_crypt_lurker"], [41, 61, 71, 81, 91, 101, 111, 121], 4, 25, 5),
    "Crypt Souleater": new Mob(["crypt_souleater", "master_crypt_souleater"], [45, 65, 75, 85, 95, 105, 115, 125], 4, 25, 5),
    "Fels": new Mob(["tentaclees", "master_tentaclees"], [90, 100, 110], 4, 25, 10),
    "Golem": new Mob(["sadan_golem", "master_sadan_golem"], [1], 4, 15, 45),
    "King Midas": new Mob(["king_midas", "master_king_midas"], [130, 140, 150, 160, 170], 5, 10, 600),
    "Lonely Spider": new Mob(["lonely_spider", "master_lonely_spider"], [35, 55, 65, 75, 85, 95, 105, 115], 4, 25, 15),
    "Lost Adventurer": new Mob(["lost_adventurer", "master_lost_adventurer"], [80, 85, 90, 100, 110, 120, 130, 140, 150, 160], 5, 25, 30),
    "Mimic": new Mob(["mimic", "master_mimic"], [115, 125], 4, 15, 300),
    "Scared Skeleton": new Mob(["scared_skeleton", "master_scared_skeleton"], [42, 60, 62, 70, 72], 3, 15, 5),
    "Shadow Assassin": new Mob(["shadow_assassin", "master_shadow_assassin"], [120, 130, 140, 150, 160, 170, 171], 5, 25, 30),
    "Skeleton Grunt": new Mob(["skeleton_grunt", "master_skeleton_grunt"], [40, 60, 70, 80], 3, 15, 5),
    "Skeleton Lord": new Mob(["skeleton_lord", "master_skeleton_lord"], [150], 5, 20, 10),
    "Skeleton Master": new Mob(["skeleton_master", "master_skeleton_master"], [78, 88, 98, 108, 118, 128], 4, 25, 5),
    "Skeleton Soldier": new Mob(["skeleton_soldier", "master_skeleton_soldier"], [66, 76, 86, 96, 106, 116, 126], 1, 15, 5),
    "Skeletor": new Mob(["skeletor", "skeletor_prime", "master_skeletor", "master_skeletor_prime"], [80, 90, 100, 110], 5, 25, 5),
    "Sniper": new Mob(["sniper_skeleton", "master_sniper_skeleton"], [43, 63, 73, 83, 93, 103, 113, 123], 3, 15, 60),
    "Super Archer": new Mob(["super_archer", "master_super_archer"], [90, 100, 110, 120], 5, 25, 30),
    "Super Tank Zombie": new Mob(["super_tank_zombie", "master_super_tank_zombie"], [90, 100, 110, 120], 4, 25, 5),
    "Tank Zombie": new Mob(["crypt_tank_zombie", "master_crypt_tank_zombie"], [40, 60, 70, 80, 90], 3, 15, 5),
    "Terracotta": new Mob(["sadan_statue", "master_sadan_statue"], [1], 1, 15, 3),
    "Undead": new Mob(["watcher_summon_undead", "master_watcher_summon_undead"], [1, 2, 3, 4, 5, 6, 7, 8], 2, 15, 10),
    "Undead Skeleton": new Mob(["dungeon_respawning_skeleton", "master_dungeon_respawning_skeleton"], [40, 60, 61, 70, 71, 80, 81, 90, 91, 100, 101, 110, 111, 120], 4, 25, 5),
    "Wither Guard": new Mob(["wither_guard", "master_wither_guard"], [100], 5, 25, 5),
    "Wither Husk": new Mob(["master_wither_husk"], [100], 5, 25, 5),
    "Wither Miner": new Mob(["wither_miner", "master_wither_miner"], [100], 4, 25, 5),
    "Withermancer": new Mob(["crypt_witherskeleton", "master_crypt_witherskeleton"], [90, 100, 110, 120], 4, 25, 5),
    "Zombie Commander": new Mob(["zombie_commander", "master_zombie_commander"], [110, 120], 4, 20, 15),
    "Zombie Grunt": new Mob(["zombie_grunt", "master_zombie_grunt"], [40, 60, 70], 3, 15, 5),
    "Zombie Knight": new Mob(["zombie_knight", "master_zombie_knight"], [86, 96, 106, 116, 126], 4, 25, 5),
    "Zombie Lord": new Mob(["zombie_lord", "master_zombie_lord"], [150], 5, 20, 15),
    "Zombie Soldier": new Mob(["zombie_soldier", "master_zombie_soldier"], [83, 93, 103, 113, 123], 1, 15, 5),
    // Fishing
    "Squid": new Mob(["pond_squid"], [1], 2, 15, 7),
    "Night Squid": new Mob(["night_squid"], [6], 4, 15, 20),
    "Sea Walker": new Mob(["sea_walker"], [4], 3, 15, 20),
    "Sea Guardian": new Mob(["sea_guardian"], [10], 3, 15, 20),
    "Sea Witch": new Mob(["sea_witch"], [15], 3, 15, 20),
    "Sea Archer": new Mob(["sea_archer"], [15], 3, 15, 20),
    "Rider of the Deep": new Mob(["zombie_deep"], [20], 3, 15, 20),
    "Catfish": new Mob(["catfish"], [23], 4, 15, 20),
    "Carrot King": new Mob(["carrot_king"], [25], 5, 15, 30),
    "Sea Leech": new Mob(["sea_leech"], [30], 4, 15, 20),
    "Guardian Defender": new Mob(["guardian_defender"], [45], 4, 15, 20),
    "Deep Sea Protector": new Mob(["deep_sea_protector"], [60], 4, 15, 20),
    "Water Hydra": new Mob(["water_hydra"], [100], 5, 15, 180),
    "The Sea Emperor": new Mob(["skeleton_emperor"], [150], 7, 15, 300),
    "Oasis Rabbit": new Mob(["oasis_rabbit"], [10], 4, 10, 15),
    "Oasis Sheep": new Mob(["oasis_sheep"], [10], 4, 10, 15),
    "Water Worm": new Mob(["water_worm"], [20], 4, 15, 20),
    "Poisoned Water Worm": new Mob(["poisoned_water_worm"], [25], 4, 15, 20),
    "Zombie Miner": new Mob(["zombie_miner"], [150], 6, 15, 60),
    "Scarecrow": new Mob(["scarecrow"], [9], 3, 15, 15),
    "Nightmare": new Mob(["nightmare"], [24], 4, 15, 15),
    "Werewolf": new Mob(["werewolf"], [50], 4, 15, 30),
    "Phantom Fisherman": new Mob(["phantom_fisherman"], [160], 6, 15, 60),
    "Grim Reaper": new Mob(["grim_reaper"], [190], 7, 15, 300),
    "Frozen Steve": new Mob(["frozen_steve"], [7], 3, 15, 15),
    "Frosty The Snowman": new Mob(["frosty_the_snowman"], [13], 3, 15, 15),
    "Grinch": new Mob(["grinch"], [21], 6, 15, 120),
    "Yeti": new Mob(["yeti"], [175], 6, 15, 300),
    "Nutcracker": new Mob(["nutcracker"], [50], 5, 15, 15),
    "Reindrake": new Mob(["reindrake"], [100], 7, 15, 1800),
    "Nurse Shark": new Mob(["nurse_shark"], [6], 3, 15, 15),
    "Blue Shark": new Mob(["blue_shark"], [20], 4, 15, 30),
    "Tiger Shark": new Mob(["tiger_shark"], [50], 4, 15, 45),
    "Great White Shark": new Mob(["great_white_shark"], [180], 5, 15, 90),
    "Plhlegblast": new Mob(["pond_squid"], [300], 7, 5, 1800),
    "Magma Slug": new Mob(["magma_slug"], [200], 2, 15, 15),
    "Moogma": new Mob(["moogma"], [210], 3, 15, 15),
    "Lava Leech": new Mob(["lava_leech"], [220], 3, 15, 15),
    "Pyroclastic Worm": new Mob(["pyroclastic_worm"], [240], 3, 15, 15),
    "Lava Flame": new Mob(["lava_flame"], [230], 4, 15, 15),
    "Fire Eel": new Mob(["fire_eel"], [240], 4, 15, 15),
    "Taurus": new Mob(["pig_rider"], [250], 4, 15, 15),
    "Thunder": new Mob(["thunder"], [400], 5, 15, 300),
    "Lord Jawbus": new Mob(["lord_jawbus"], [600], 6, 15, 600),
    "Flaming Worm": new Mob(["flaming_worm"], [50], 3, 15, 10),
    "Lava Blaze": new Mob(["lava_blaze"], [100], 4, 15, 10),
    "Lava Pigman": new Mob(["lava_pigman"], [100], 4, 15, 10),
    "Agarimoo": new Mob(["agarimoo"], [35], 3, 15, 15),
    // Mythological Creatures
    "Gaia Construct": new Mob(["gaia_construct"], [140, 260], 4, 20, 20),
    "Minos Champion": new Mob(["minos_champion"], [175, 310], 5, 20, 20),
    "Minos Hunter": new Mob(["minos_hunter"], [15, 60, 125], 5, 20, 20),
    "Minos Inquisitor": new Mob(["minos_inquisitor"], [750], 7, 20, 300),
    "Minotaur": new Mob(["minotaur"], [45, 120, 210], 4, 20, 20),
    "Siamese Lynx": new Mob(["siamese_lynx"], [25, 85, 155], 4, 20, 20),
    // Jerry
    "Blue Jerry": new Mob(["mayor_jerry_blue"], [2], 5, 10, 1440),
    "Golden Jerry": new Mob(["mayor_jerry_golden"], [5], 7, 10, 7200),
    "Green Jerry": new Mob(["mayor_jerry_green"], [1], 4, 10, 720),
    "Purple Jerry": new Mob(["mayor_jerry_purple"], [3], 6, 10, 2880),
    // Kuudra
    "Blazing Golem": new Mob(["blazing_golem"], [100, 200, 300, 400, 500], 3, 10, 30),
    "Blight": new Mob(["blight"], [100, 200, 300, 400, 500], 3, 20, 15),
    "Dropship": new Mob(["dropship"], [100, 200, 300, 400, 500], 3, 10, 30),
    "Explosive Imp": new Mob(["explosive_imp"], [100, 200, 300, 400, 500], 3, 20, 30),
    "Inferno Magma Cube": new Mob(["inferno_magma_cube"], [100, 200, 300, 400, 500], 3, 20, 15),
    "Kuudra Berserker": new Mob(["kuudra_berserker"], [100, 200, 300, 400, 500], 3, 20, 15),
    "Kuudra Follower": new Mob(["kuudra_follower"], [100, 200, 300, 400, 500], 2, 20, 15),
    "Kuudra Knocker": new Mob(["kuudra_knocker"], [100, 200, 300, 400, 500], 3, 20, 15),
    "Kuudra Landmine": new Mob(["kuudra_landmine"], [100, 200, 300, 400, 500], 3, 20, 15),
    "Kuudra Slasher": new Mob(["kuudra_slasher"], [100, 200, 300, 400, 500], 5, 10, 60),
    "Magma Follower": new Mob(["magma_follower"], [100, 200, 300, 400, 500], 5, 10, 30),
    "Wandering Blaze": new Mob(["wandering_blaze"], [100, 200, 300, 400, 500], 4, 20, 15),
    "Wither Sentry": new Mob(["wither_sentry"], [100, 200, 300, 400, 500], 4, 10, 30),
}
register("worldLoad", () => {
    delay(() => {
        Object.keys(bestiary).forEach(key => {
            bestiary[key].updateKills();
        });
    }, 1000);
});

/**
 * Sorts and filters the bestiary based on the provided criteria and amount.
 *
 * @param {String} val - The criteria to sort and filter the bestiary. Possible values: "bracket" or any valid property name in the bestiary object.
 * @param {number} amount - The number of entries to include in the final sorted bestiary.
 */
function sortBestiary(val, amount) {
    // Filtering the bestiary based on the provided criteria and amount
    const filteredBestiary = Object.entries(bestiary).filter(([key, value]) =>
        val === "bracket"
            ? value.bracket === killBrackets[amount - 1] && value.next !== 0
            : value.next !== 0
    );

    // Sorting the filtered bestiary in descending order based on the provided criteria
    const sortedBestiary = filteredBestiary.sort((a, b) =>
        b[1][val === "bracket" ? "next" : val] - a[1][val === "bracket" ? "next" : val]
    ).slice(val === "bracket" ? -10 : -amount).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
    }, {});

    // Displaying the sorted bestiary information in chat
    ChatLib.chat(`\n${LOGO} ${WHITE}${BOLD}Leftover Bestiary: `);
    Object.keys(sortedBestiary).forEach((key) => {
        ChatLib.chat(`${GOLD}${BOLD}${key}: ${GREEN}Needs ${RED}${sortedBestiary[key].next} ${GREEN}kills! (${RED}${getTime(sortedBestiary[key].nextTime)}${GREEN})`);
    });
}
  
/**
 * Gets the bestiary information based on the provided arguments and displays the result in chat.
 *
 * @param {Array} args - An array of arguments containing information about the bestiary query.
 */
export function getBestiary(args) {
    switch(args[1]) {
        case "kills":
        case "kill":
            sortBestiary("next", args[2] || 10);
            break;
        case "time":
            sortBestiary("nextTime", args[2] || 10);
            break;
        case "bracket" :
            if (!isNaN(args[2]) && args[2] >= 1 && args[2] <= 7) {
                sortBestiary("bracket", args[2]);
                break;
            }
        default:
            const key = args.slice(1).map(item => item.charAt(0).toUpperCase() + item.slice(1)).join(' ');
            const mob = bestiary[key];
            if (mob === undefined)
                ChatLib.chat(`${LOGO} ${RED}Please input as /va be <mobName OR bracket [1-7] OR <kill, time> [amount]>!`);
            else
                ChatLib.chat(`${LOGO} ${GOLD}${BOLD}${key}: ${GREEN}Needs ${RED}${mob.next} ${GREEN}kills! (${RED}${getTime(mob.nextTime)}${GREEN})`);
            break;
    }
}
