import settings from "../../utils/settings";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { Overlay } from "../../utils/overlay";


const GEMSTONE_WAYPOINTS = [
    ["Citrine", -51.5, 129.5, 410.5, 0xe4d00a],
    ["Citrine", -94.5, 146.5, 259.5, 0xe4d00a],
    ["Citrine", 38, 121.5, 386, 0xe4d00a],
    ["Citrine", -58, 146.5, 422, 0xe4d00a],
    ["Aquamarine", -1.5, 141.5, 437.5, 0x7fffd4],
    ["Aquamarine", 95.5, 155, 382.5, 0x7fffd4],
    ["Aquamarine", 51.5, 119.5, 302.5, 0x7fffd4],
    ["Peridot", 91.5, 124.5, 397.5, 0xb4c424],
    ["Peridot", -76.5, 122.5, 281.5, 0xb4c424],
    ["Peridot", -62, 149.5, 300.5, 0xb4c424],
    ["Peridot", -73, 124.5, 458.5, 0xb4c424],
    ["Onyx", -68, 132.5, 407.5, 0x000000],
    ["Onyx", 4.5, 134.5, 390.5, 0x000000],
    ["Onyx", 79.5, 121.5, 411.5, 0x000000],
    ["Tungsten", 37.5, 155, 329.5, 0x808080],
    ["Umber", 32.5, 124.5, 359.5, 0x635147]
];
let commissionWaypoints = [];

const commissionExample = 
`§r§9§lCommissions:§r
§r §r§fUmber Collector: §r§c0%§r
§r §r§fCorpse Looter: §r§c0%§r
§r §r§fScrap Collector: §r§c0%§r
§r §r§fCitrine Gemstone Collector: §r§c0%§r`;
const commissionOverlay = new Overlay("commissionsDisplay", ["Crystal Hollows", "Dwarven Mines"], () => true, data.CDL, "moveCommissions", commissionExample);

registerWhen(register("renderWorld", () => {
    (commissionWaypoints.length === 0 ? GEMSTONE_WAYPOINTS : commissionWaypoints).forEach(gem => {
        Tessellator.drawString(gem[0], gem[1], gem[2], gem[3], gem[4], true);
    });
}), () => (getWorld() === "Crystal Hollows" || getWorld() === "Dwarven Mines") && settings.commissionGemstones);

registerWhen(register("step", () => {
    if (!World.isLoaded()) return;
    const tab = TabList.getNames();
    let index = tab.findIndex(name => name === "§r§9§lCommissions:§r");
    if (index === -1) return;

    commissionOverlay.message = "";
    commissionWaypoints = [];
    while (tab[index] !== "§r") {
        // Set waypoints
        commissionWaypoints = commissionWaypoints.concat(GEMSTONE_WAYPOINTS.filter(gem => tab[index].startsWith(`§r §r§f${gem[0]}`)));

        // Set commission message
        commissionOverlay.message += `${tab[index]}\n`;
        index++;
    }
}).setFps(4), () => (getWorld() === "Crystal Hollows" || getWorld() === "Dwarven Mines") && (settings.commissionsDisplay || settings.commissionGemstones));
