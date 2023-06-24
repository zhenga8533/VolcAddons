import { delay } from "./thread";
import { data, setRegisters } from "./variables";

// World
const LOCATIONS = {
    "hub": [
        "AuctionHouse", "Bank", "BazaarAlley", "Blacksmith", "BuildersHouse", "CanvasRoom", "CatacombsEntrance", "Colosseum", "ColosseumArena",
        "CommunityCenter", "CoalMine", "ElectionRoom", "Farm", "Farmhouse", "FashionShop", "FishermansHut", "FlowerHouse", "Forest", "Graveyard",
        "Hexatorum", "HighLevel", "Library", "Mountain", "Ruins", "Tavern", "Thaumaturgist", "Village", "Wilderness"],
    "garden": [
        "TheGarden", "Plot1", "Plot2", "Plot3", "Plot4", "Plot5", "Plot6", "Plot7", "Plot8", "Plot9", "Plot10", "Plot11", "Plot12", "Plot13",
        "Plot14", "Plot15", "Plot16", "Plot17", "Plot18", "Plot19", "Plot20", "Plot21", "Plot22", "Plot23", "Plot24", "GardenPlot"],
    "crimson_isle": [
        "Stronghold", "CrimsonIsle", "CrimsonFields", "BlazingVolcano", "OdgersHut", "PlhlegblastPool", "MagmaChamber", "AurasLab", "MatriarchsLair",
        "BellyoftheBeast", "Dojo", "BurningDesert", "MysticMarsh", "BarbarianOutpost", "MageOutpost", "Dragontail", "ChiefsHut",
        "DragontailBlacksmith", "DragontailTownsquare", "DragontailAuctionHous", "DragontailBazaar", "DragontailBank", "MinionShop", "TheDukedom",
        "TheBastion", "Scarleton", "CommunityCenter", "ThroneRoom", "MageCouncil", "ScarletonPlaza", "ScarletonMinionShop",
        "ScarletonAuctionHouse", "ScarletonBazaar", "ScarletonBank", "ScarletonBlacksmith", "IgrupansHouse", "IgrupansChickenCoop", "Cathedral",
        "Courtyard", "TheWasteland", "RuinsofAshfang", "ForgottenSkull", "SmolderingTomb"],
    "rift": [
        "WyldWoods", "EnigmasCrib", "BrokenCage", "ShiftedTavern", "Pumpgrotto", "TheBastion", "Otherside", "BlackLagoon", "LagoonCave",
        "LagoonHut", "LeechesLair", "AroundColosseum", "RiftGallaryEntrance", "RiftGallary", "WestVillage", "DolpinTrainer", "CakeHouse",
        "InfestedHouse", "Mirrorverse", "Dreadfarm", "GreatBeanstalk", "VillagePlaza", "Taylors", "LonelyTerrace", "MurderHouse", "BookinaBook",
        "HalfEatenCave", "BarterBankShow", "BarryCenter", "BarryHQ", "DéjàVuAlley", "LivingCave", "LivingStillness", "Colosseum", "BarrierStreet",
        "PhotonPathway", "StillgoreChâteau", "Oubliette", "FairylosopherTower"],
    "kuudra": ["KuudrasHollowT5", "KuudrasHollowT1", "KuudrasHollowT2", "KuudrasHollowT3", "KuudrasHollowT4"]
}
let noFind = 0;

export function findZone() {
    let zoneLine = Scoreboard.getLines().find((line) => line.getName().includes("⏣"));
    // Rift different symbol zzz
    if (zoneLine == undefined) zoneLine = Scoreboard.getLines().find((line) => line.getName().includes("ф"));
    return zoneLine == undefined ? "None" : zoneLine.getName().removeFormatting()
}
function setWorld(world) {
    // Check for Kuudra (shows as instanced)
    if (world == "instanced") {
        worldLine = findZone().replace(/\W/g, '');;

        if (worldLine.includes("Kuudra")) {
            world = "kuudra";
            data.tier = parseInt(worldLine.slice(-1));
        }
    }

    data.world = world;
    setRegisters();
}
function findWorld() {
    const title = Scoreboard.getTitle();
    // In case not in SB (no infinite loop)
    if (!title.length || !title.removeFormatting().includes("SKYBLOCK")) noFind++;
    if (noFind == 20) return;

    // Get scoreboard line with world name
    worldLine = findZone().replace(/\W/g, '');

    delay(() => {
        if (worldLine.includes("None"))
            findWorld();
        else {
            for (let location in LOCATIONS) {
                if (LOCATIONS[location].includes(worldLine)) {
                    setWorld(location);
                    break;
                }
            }
        }
    }, 1000);
}

// World trigger
register("worldLoad", () => { // IF DULKIR
    noFind = 0;
    findWorld();
});
register("chat", (data) => { // WORKS IF NO DULKIR
    // Example Object: {"server":"mini37CE","gametype":"SKYBLOCK","mode":"crimson_isle","map":"Crimson Isle"}
    try {
        data = JSON.parse(`{${data}}`);
        if (data.gametype != "SKYBLOCK") return;

        setWorld(data.mode);
    } catch (err) {
        print(err);
    }
}).setCriteria("{${data}}");
