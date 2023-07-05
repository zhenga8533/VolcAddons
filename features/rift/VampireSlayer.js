import RenderLib from "../../../RenderLib";
import settings from "../../settings";
import { AQUA, BOLD, DARK_AQUA, DARK_PURPLE, GOLD } from "../../utils/constants";
import { get3x3Stands } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import { getInParty } from "../../utils/party";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { getSlayerBoss } from "../misc/AnnouceMob";

// Impel
registerWhen(register("renderTitle", (title, subtitle, event) => {
    if (subtitle.includes("Impel")) {
        cancel(event);
        Client.Companion.showTitle(subtitle, "", 0, 20, 0);
    }
}), () => getWorld() == "The Rift" && settings.vampireImpel);

// Other Shit
const vampireExample =
`${DARK_PURPLE}${BOLD}MANIA: ${AQUA}Dracule
${GOLD}${BOLD}TWINCLAWS: ${AQUA}Mihawk
${DARK_AQUA}${BOLD}ICHOR: ${AQUA}3,590,000,000`;
const vampireOverlay = new Overlay("vampireAttack", ["The Rift"], data.BL, "moveVamp", vampireExample);
let dracula = undefined;
let bossUUID = 0;
let ichorUUID = 0;
let ichorSpawn = false;
let mania = 0;
let inMania = false;

registerWhen(register("tick", () => {
    vampireOverlay.message = "";
    if (!getSlayerBoss()) {
        dracula = undefined;
        bossUUID = 0;
        mania = 0;
        return;
    }

    const stands = get3x3Stands();

    // Boss Nametag Shit
    if (!bossUUID) {
        const spawn = stands.find(stand => stand.getName().includes('03:59'));
        if (spawn == undefined) return;
        bossUUID = spawn.getUUID();
    } else {
        const boss = stands.find(stand => stand.getUUID() == bossUUID);
        if (boss == undefined) return;
        dracula = boss;
        const name = boss.getName().split(" ");

        // Mania Detect
        const maniaIndex = name.indexOf("§5§lMANIA");
        if (maniaIndex != -1) {
            vampireOverlay.message += `${name[maniaIndex]}: ${name[maniaIndex + 1]}\n`;
            if (!inMania) {
                mania++;
                inMania = true;
                
                const pX = Math.round(Player.getX());
                const PY = Math.round(Player.getY());
                const PZ = Math.round(Player.getZ());
                if (settings.announceMania == 1) {
                    const id = (Math.random() + 1).toString(36).substring(6);
                    ChatLib.command(`ac x: ${pX}, y: ${PY}, z: ${PZ} | MANIA: ${mania}! @${id}`);
                } else if (getInParty())
                    ChatLib.command(`pc x: ${pX}, y: ${PY}, z: ${PZ} | MANIA: ${mania}!`);
            }
        } else inMania = false;

        // Twinclaw Detect
        const clawIndex = name.indexOf("§6§lTWINCLAWS");
        if (clawIndex != -1) vampireOverlay.message += `${name[clawIndex]}: ${name[clawIndex + 1]}\n`;

        // Ichor Detect
        const ichorIndex = name.indexOf("§3§lICHOR");
        if (ichorIndex != -1) ichorSpawn = true;
    }

    // Ichor Nametag Shit
    if (ichorSpawn) {
        if (ichorUUID) {
            const ichor = stands.find(stand => stand.getUUID() == ichorUUID);
            if (ichor == undefined) {
                ichorSpawn = false;
                ichorUUID = 0;
                return;
            }
            vampireOverlay.message += `${DARK_AQUA}${BOLD}ICHOR: ${ichor.getName()}\n`;
        } else {
            const ichor = stands.find(stand => stand.getName().includes('24.'));
            if (ichor == undefined) return;
            ichorUUID = ichor.getUUID();
        }
    }
}), () => getWorld() == "The Rift" && (settings.vampireAttack || settings.announceMania));

// ESP (and hitbox) for the boys
registerWhen(register("renderWorld", () => {
    if (dracula == undefined) return;
    RenderLib.drawEspBox(dracula.getX(), dracula.getY() - 2.5, dracula.getZ(), 1, 2, 1, 0, 0, 1, true);
}), () => settings.vampireHitbox);

let vamps = [];
export function getVamps() { return vamps };

registerWhen(register("tick", () => {
    if (vamps.length) vamps = [];
    const stands = get3x3Stands();
    let bosses = stands.filter(stand => stand.getName().includes("Bloodfiend §e§l"));
    vamps = bosses == undefined ? [] : bosses;
}), () => data.moblist.includes("vampire") && getWorld() == "The Rift");
