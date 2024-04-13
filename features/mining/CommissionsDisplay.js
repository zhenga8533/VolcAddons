import settings from "../../utils/settings";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { Overlay } from "../../utils/overlay";
import { getClosest } from "../../utils/functions/find";
import { BOLD, GOLD, GREEN, UNDERLINE, YELLOW } from "../../utils/constants";


const GEMSTONE_WAYPOINTS = {
    "Citrine": [
        ["Citrine", 0xe4d00a, -51.5, 129.5, 410.5],
        ["Citrine", 0xe4d00a, -94.5, 146.5, 259.5],
        ["Citrine", 0xe4d00a, 38, 121.5, 387],
        ["Citrine", 0xe4d00a, -58, 146.5, 422]],
    "Aquamarine": [
        ["Aquamarine", 0x7fffd4, -1.5, 141.5, 437.5],
        ["Aquamarine", 0x7fffd4, 95.5, 155, 382.5],
        ["Aquamarine", 0x7fffd4, 51.5, 119.5, 302.5]],
    "Peridot": [
        ["Peridot", 0xb4c424, 91.5, 124.5, 397.5],
        ["Peridot", 0xb4c424, -76.5, 122.5, 281.5],
        ["Peridot", 0xb4c424, -62, 149.5, 300.5],
        ["Peridot", 0xb4c424, -73, 124.5, 458.5]],
    "Onyx": [
        ["Onyx", 0x000000, -68, 132.5, 407.5],
        ["Onyx", 0x000000, 79.5, 121.5, 411.5],
        ["Onyx", 0x000000, -6.5, 134.5, 386.5]],
    "Tungsten": [
        ["Tungsten", 0x808080, 37.5, 155, 329.5]],
    "Umber": [
        ["Umber", 0x917668, 32.5, 124.5, 359.5]],
    "Glacite": [
        ["Glacite", 0xa5f2f3, 4.5, 134.5, 390.5]]
};
let commissionWaypoints = [];

const commissionExample = 
`§r§9§lCommissions:§r
§r §r§fUmber Collector: §r§c0%§r
§r §r§fCorpse Looter: §r§c0%§r
§r §r§fScrap Collector: §r§c0%§r
§r §r§fCitrine Gemstone Collector: §r§c0%§r`;
const commissionOverlay = new Overlay("commissionsDisplay", ["Crystal Hollows", "Dwarven Mines", "Mineshaft"], () => true, data.CDL, "moveCommissions", commissionExample);

registerWhen(register("renderWorld", () => {
    commissionWaypoints.forEach(gem => {
        Tessellator.drawString(gem[0], gem[2], gem[3], gem[4], gem[1], true);
    });
}), () => (getWorld() === "Crystal Hollows" || getWorld() === "Dwarven Mines") && settings.commissionGemstones);

registerWhen(register("step", () => {
    if (!World.isLoaded()) return;
    const tab = TabList.getNames();
    let index = tab.findIndex(name => name === "§r§9§lCommissions:§r");
    if (index === -1) return;

    commissionOverlay.message = tab[index++] + '\n';
    commissionWaypoints = [];
    while (tab[index].startsWith("§r §r§f")) {
        // Set waypoints
        let comm = tab[index].removeFormatting().trim().split(' ')[0];
        if (comm in GEMSTONE_WAYPOINTS) {
            let commWaypoints = GEMSTONE_WAYPOINTS[comm];
            let closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], commWaypoints)[0];
            commissionWaypoints = commissionWaypoints.concat(commWaypoints.filter(wp => wp != closest));

            // Change style for closest waypoint
            let closestCopy = [...closest];
            closestCopy[0] = `${BOLD + UNDERLINE}${closestCopy[0]}`;
            commissionWaypoints.push(closestCopy);

            commissionOverlay.message += `${tab[index].replace("§f", GOLD)}\n`;
        } else commissionOverlay.message += `${tab[index]}\n`;

        // Set commission message
        index++;
    }
}).setFps(4),
() => (getWorld() === "Crystal Hollows" || getWorld() === "Dwarven Mines" || getWorld() === "Mineshaft") && (settings.commissionsDisplay || settings.commissionGemstones));


/**
 * Commission Complete Annoucne
 */
registerWhen(register("chat", (commission) => {
    Client.showTitle(GREEN + BOLD + commission, `${YELLOW}Commission Complete!`, 5, 25, 5);
}).setCriteria("${commission} Commission Complete! Visit the King to claim your rewards!"), () => settings.commissionAnnounce);
