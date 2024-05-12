import settings from "../../utils/settings";
import { romanToNum, unformatNumber } from "../../utils/functions/format";
import { registerWhen } from "../../utils/register";
import { Overlay } from "../../utils/overlay";
import { data } from "../../utils/data";


/**
 * Parse bestiary level inventory
 * [ [levels], [completed] ]
 */
const bestiaryData = [[], []];

/**
 * Trigger to record and track bestiary menu levels.
 */
const setLevels = register("guiRender", () => {
    const container = Player.getContainer();

    if (bestiaryData[0].length === 0) {
        rows: for (let i = 1; i < 5; i++) {
            for (let j = 1; j < 8; j++) {
                let index = i*9 + j;
                let item = container.getStackInSlot(index);
                if (item === null || item.getRegistryName() === "minecraft:stained_glass_pane") break rows;
                
                let lore = item.getLore();
                let completed = lore[lore.length - 4] === "§5§o§7Overall Progress: §b100% §7(§c§lMAX!§7)";
                bestiaryData[1].push(completed);
                bestiaryData[0].push(completed ? 1 : romanToNum(item.getName().split(' ').pop()));
            }
        }
    }

    bestiaryData[0].forEach((level, i) => {
        let index = 2*parseInt(i/7) + 10 + i;
        let item = container.getStackInSlot(index);
        item.setStackSize(isNaN(level) ? 0 : level);
    })
}).unregister();

/**
 * Trigger to highlight uncompleted bestiary milestones in red.
 */
const setHighlight = register('guiRender', () => {
    bestiaryData[1].forEach((complete, i) => {
        // Credit to https://www.chattriggers.com/modules/v/ExperimentationTable
        if (complete) return;
        let index = 2*parseInt(i/7) + 10 + i
        const x = index % 9;
        const y = Math.floor(index / 9);
        const renderX = Renderer.screen.getWidth() / 2 + ((x - 4) * 18);
        const renderY = (Renderer.screen.getHeight() + 10) / 2 + ((y - Player.getContainer().getSize() / 18) * 18);
    
        Renderer.translate(0, 0, 100);
        Renderer.drawRect(Renderer.color(255, 87, 51, 128), renderX - 9, renderY - 9, 17, 17);
    })
}).unregister();

/**
 * Register/unregister bestiary stack size
 */
registerWhen(register("guiOpened", () => {
    Client.scheduleTask(1, () => {
        const containerName = Player.getContainer().getName();
        if ((!containerName.includes("Bestiary ➜") && !containerName.startsWith("Fishing ➜"))) return;
        setLevels.register();
        setHighlight.register();
    });
}), () => settings.bestiaryGUI);
registerWhen(register("guiClosed", () => {
    setLevels.unregister();
    setHighlight.unregister();
    bestiaryData[0] = [];
    bestiaryData[1] = [];
}), () => settings.bestiaryGUI);


/**
 * Bestiary widget tracker.
 * 
 * Fetched using:
register("guiOpened", () => {
    Client.scheduleTask(1, () => {
        const containerName = Player.getContainer().getName();
        if ((!containerName.includes("Bestiary ➜") && !containerName.startsWith("Fishing ➜"))) return;
        
        const items = Player.getContainer().getItems();
        let message = "";
        for (let i = 1; i < 5; i++) {
            for (let j = 1; j < 8; j++) {
                let index = i * 9 + j;
                let item = items[index];
                if (item === null || item.getRegistryName() === "minecraft:stained_glass_pane") break;
                
                let name = item.getName().removeFormatting().split(' ').slice(0, -1).join(' ');
                let lore = item.getLore();
                let ind = lore.findIndex(line => line.startsWith("§5§o§7Overall Progress: §b"));
                let max = unformatNumber(lore[ind + 1].removeFormatting().split('/')[1]);
                message += `"${name}": ${max}, `;
            }
        }
        if (message !== "") print(message);
    });
});
 */
const MAX_BESTIARY = {
    "Creeper": 200, "Enderman": 200, "Skeleton": 200, "Slime": 200, "Spider": 200, "Witch": 200, "Zombie": 200,  // Your Island
    "Crypt Ghoul": 40000, "Golden Ghoul": 4000, "Graveyard Zombie": 200, "Old Wolf": 4000, "Wolf": 40000, "Zombie Villager": 1000,  // Hub
    "Chicken": 200, "Cow": 200, "Mushroom Cow": 200, "Pig": 200, "Rabbit": 200, "Sheep": 200,  // The Farming Isles
    "Beetle": 250, "Cricket": 250, "Earthworm": 250, "Fly": 250, "Locust": 250, "Mite": 250, "Mosquito": 250, "Moth": 250, "Rat": 250, "Slug": 250,  // Garden
    "Arachne": 500, "Arachne's Brood": 1000, "Arachne's Keeper": 400, "Broodmother": 400, "Dasher Spider": 10000, "Gravel Skeleton": 4000, "Rain Slime": 1000,  // Spider's Den
    "Silverfish": 10000, "Spider Jockey": 4000, "Splitter Spider": 10000, "Voracious Spider": 10000, "Weaver Spider": 10000, 
    "Dragon": 1000, "Enderman": 25000, "Endermite": 10000, "Endstone Protector": 500, "Obsidian Defender": 10000, "Voidling Extremist": 4000,  // The End
    "Voidling Fanatic": 25000, "Watcher": 10000, "Zealot": 25000, 
    "Ashfang": 1000, "Barbarian Duke X": 1000, "Bladesoul": 1000, "Blaze": 3000, "Flaming Spider": 10000, "Flare": 100000, "Ghast": 3000, "Kada Knight": 3000,  // Crimson Isle
    "Mage Outlaw": 1000, "Magma Boss": 1000, "Magma Cube": 10000, "Magma Cube Rider": 3000, "Matcho": 400, "Millenia-Aged Blaze": 4000, "Mushroom Bull": 10000, 
    "Smoldering Blaze": 25000, "Tentacle": 1000, "Vanquisher": 1000, "Wither Skeleton": 3000, "Wither Spectre": 10000, 
    "Emerald Slime": 3000, "Lapis Zombie": 3000, "Miner Skeleton": 3000, "Miner Zombie": 3000, "Redstone Pigman": 3000, "Sneaky Creeper": 300, 
    "Diamond Goblin": 100, "Ghost": 250000, "Glacite Bowman": 1000, "Glacite Caver": 1000, "Glacite Mage": 1000, "Glacite Mutt": 1000, "Glacite Walker": 10000,  // Dwarven Mines
    "Goblin": 25000, "Goblin Raiders": 1000, "Golden Goblin": 400, "Powder Ghast": 200, "Star Sentry": 1000, "Treasure Hoarder": 4000, 
    "Automaton": 10000, "Bal": 250, "Butterfly": 1000, "Grunt": 4000, "Key Guardian": 250, "Sludge": 10000, "Thyst": 4000, "Worm": 400, "Yog": 4000,  // Crystal Hollows
    "Howling Spirit": 10000, "Pack Spirit": 10000, "Soul of the Alpha": 1000,  // The Park
    "Crazy Witch": 750, "Headless Horseman": 500, "Phantom Spirit": 750, "Scary Jerry": 750, "Trick or Treater": 750, "Wither Gourd": 750, "Wraith": 750,  // Spoopy Festival
    "Angry Archaeologist": 3000, "Bat": 1000, "Cellar Spider": 1000, "Crypt Dreadlord": 25000, "Crypt Lurker": 25000, "Crypt Souleater": 25000, "Fels": 10000,  // Catacombs
    "Golem": 1000, "King Midas": 750, "Lonely Spider": 25000, "Lost Adventurer": 3000, "Mimic": 1000, "Scared Skeleton": 4000, "Shadow Assassin": 3000, 
    "Skeleton Grunt": 4000, "Skeleton Lord": 1000, "Skeleton Master": 25000, "Skeleton Soldier": 40000, "Skeletor": 10000, "Sniper": 4000, "Super Archer": 10000, 
    "Super Tank Zombie": 25000, "Tank Zombie": 4000, "Terracotta": 40000, "Undead": 10000, "Undead Skeleton": 25000, "Wither Guard": 10000, "Wither Husk": 10000, 
    "Wither Miner": 25000, "Withermancer": 25000, "Zombie Commander": 3000, "Zombie Grunt": 4000, "Zombie Knight": 10000, "Zombie Lord": 1000, "Zombie Soldier": 40000, 
    "Abyssal Miner": 250, "Agarimoo": 4000, "Carrot King": 400, "Catfish": 1000, "Deep Sea Protector": 1000, "Guardian Defender": 1000, "Night Squid": 1000,  // Fishing
    "Oasis Rabbit": 300, "Oasis Sheep": 300, "Poisoned Water Worm": 1000, "Rider of the Deep": 4000, "Sea Archer": 4000, "Sea Guardian": 4000, "Sea Leech": 1000, 
    "Sea Walker": 4000, "Sea Witch": 4000, "Squid": 10000, "The Sea Emperor": 100, "Water Hydra": 400, "Water Worm": 1000, 
    "Fire Eel": 1000, "Flaming Worm": 4000, "Lava Blaze": 1000, "Lava Flame": 1000, "Lava Leech": 4000, "Lava Pigman": 1000, "Lord Jawbus": 250, "Magma Slug": 10000,  // Lava
    "Moogma": 4000, "Plhlegblast": 7, "Pyroclastic Worm": 4000, "Taurus": 1000, "Thunder": 400, 
    "Grim Reaper": 100, "Nightmare": 1000, "Phantom Fisher": 250, "Scarecrow": 4000, "Werewolf": 1000,  // Spooky Festival
    "Blue Shark": 1000, "Great White Shark": 400, "Nurse Shark": 4000, "Tiger Shark": 1000,  // Fishing Festival
    "Frosty": 4000, "Frozen Steve": 4000, "Grinch": 250, "Nutcracker": 400, "Reindrake": 100, "Yeti": 250,  // Winter
    "Gaia Construct": 3000, "Minos Champion": 1000, "Minos Hunter": 1000, "Minos Inquisitor": 500, "Minotaur": 3000, "Siamese Lynx": 3000,  // Mythological Ritual
    "Blue Jerry": 30, "Golden Jerry": 20, "Green Jerry": 75, "Purple Jerry": 25,  // Jerry
    "Blazing Golem": 300, "Blight": 10000, "Dropship": 300, "Explosive Imp": 3000, "Inferno Magma Cube": 10000, "Kuudra Berserker": 10000, "Kuudra Follower": 25000,  // Kuudra
    "Kuudra Knocker": 10000, "Kuudra Landmine": 10000, "Kuudra Slasher": 30, "Magma Follower": 30, "Wandering Blaze": 3000, "Wither Sentry": 75,     
};

const bestiaryExample = `TEST`;
const bestiaryOverlay = new Overlay("bestiaryCounter", data.BEL, "moveBe", bestiaryExample);

const beCounter = {};
let beTime = 0;

register("step", () => {
    if (!World.isLoaded()) return;

    const tablist = TabList.getNames();
    let index = tablist.findIndex(name => name.startsWith("§r§6§lBestiary:§r")) + 1;
    if (index === 0) return;

    // Update bestiary data using widget
    while (tablist[index].startsWith("§r ") && !tablist[index].endsWith("§r§3§lInfo§r")) {
        let beData = tablist[index++].removeFormatting().trim().split(' ');
        let levelData = beData[beData.length - 1];
        if (levelData === "MAX") continue;

        let name = beData.slice(0, -2).join(' ');
        let count = levelData.split('/');
        let now = unformatNumber(count[0]);
        let next = unformatNumber(count[1]);

        if (beCounter.hasOwnProperty(name)) beCounter[name][1] = now;
        else beCounter[name] = [now, now];
    }

    // Set overlay message
    Object.keys(beCounter).forEach(name => {
        
    });
}).setFps(1);
