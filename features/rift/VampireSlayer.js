import settings from "../../utils/settings";
import { AQUA, BOLD, DARK_AQUA, DARK_PURPLE, EntityArmorStand, GOLD, PLAYER_CLASS, SMA } from "../../utils/constants";
import { Overlay } from "../../utils/overlay";
import { getInParty } from "../../utils/party";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { getSlayerBoss } from "../combat/SlayerDetect";
import { renderEntities } from "../../utils/waypoints";



/**
 * Variables used to track and display vampire boss attacks.
 */
const vampireExample =
`${DARK_PURPLE + BOLD}MANIA: ${AQUA}Dracule
${GOLD + BOLD}TWINCLAWS: ${AQUA}Mihawk
${DARK_AQUA + BOLD}ICHOR: ${AQUA}3,590,000,000`;
const vampireOverlay = new Overlay("vampireAttack", ["The Rift"], () => true, data.BL, "moveVamp", vampireExample);
let bossUUID = 0;
let ichorUUID = 0;
let ichorSpawn = false;
let mania = 0;
let inMania = false;

/**
 * Tracks player boss on spawn and updates vampire attack overlay every tick.
 */
registerWhen(register("tick", () => {
    vampireOverlay.message = "";
    if (!getSlayerBoss()) {
        bossUUID = 0;
        mania = 0;
        return;
    }

    const player = Player.asPlayerMP().getEntity();
    const stands = World.getWorld()
        .func_72839_b(player, player.func_174813_aQ().func_72314_b(16, 16, 16))
        .filter(entity => entity instanceof EntityArmorStand);

    // Boss Nametag Shit
    if (!bossUUID) {
        const spawn = stands.find(stand => stand.func_95999_t().includes('03:59'));
        if (spawn === undefined) return;
        bossUUID = spawn.persistentID;
    } else {
        const boss = stands.find(stand => stand.persistentID === bossUUID);
        if (boss === undefined) return;
        const name = boss.func_95999_t().split(" ");

        // Mania Detect
        const maniaIndex = name.indexOf("§5§lMANIA");
        if (maniaIndex !== -1) {
            vampireOverlay.message += `${name[maniaIndex]}: ${name[maniaIndex + 1]}\n`;
            if (!inMania) {
                mania++;
                inMania = true;
                
                const pX = Math.round(Player.getX());
                const PY = Math.round(Player.getY());
                const PZ = Math.round(Player.getZ());
                if (settings.announceMania === 1) {
                    const id = (Math.random() + 1).toString(36).substring(6);
                    ChatLib.command(`ac x: ${pX}, y: ${PY}, z: ${PZ} | MANIA: ${mania}! @${id}`);
                } else if (getInParty() && settings.announceMania === 2)
                    ChatLib.command(`pc x: ${pX}, y: ${PY}, z: ${PZ} | MANIA: ${mania}!`);
            }
        } else inMania = false;

        // Twinclaw Detect
        const clawIndex = name.indexOf("§6§lTWINCLAWS");
        if (clawIndex !== -1) vampireOverlay.message += `${name[clawIndex]}: ${name[clawIndex + 1]}\n`;

        // Ichor Detect
        const ichorIndex = name.indexOf("§3§lICHOR");
        if (ichorIndex !== -1) ichorSpawn = true;
    }

    // Ichor Nametag Shit
    if (ichorSpawn) {
        if (ichorUUID !== 0) {
            const ichor = stands.find(stand => stand.persistentID === ichorUUID);
            if (ichor === undefined) {
                ichorSpawn = false;
                ichorUUID = 0;
                return;
            }
            vampireOverlay.message += `${DARK_AQUA + BOLD}ICHOR: ${ichor.func_95999_t()}\n`;
        } else {
            const ichor = stands.find(stand => stand.func_95999_t().includes('24.'));
            if (ichor === undefined) return;
            ichorUUID = ichor.persistentID;
        }
    }
}), () => getWorld() === "The Rift" && (settings.vampireAttack || settings.announceMania !== 0));

/**
 * Replaces Hypixel's impel subtitle with a flashy title.
 */
registerWhen(register("renderTitle", (title, subtitle, event) => {
    if (subtitle.includes("Impel")) {
        cancel(event);
        Client.showTitle(subtitle, "", 0, 20, 0);
    }
}), () => getWorld() === "The Rift" && settings.vampireImpel);

/**
 * Highlights vampire bosses with steakable HP.
 */
const VAMP_HP = new Set([625, 1100, 1800, 2400, 3000]);
let dracula = [];
let vamps = [];

registerWhen(register("step", () => {
    dracula = World.getAllEntitiesOfType(PLAYER_CLASS).filter(entity => 
        VAMP_HP.has(entity.getEntity().func_110148_a(SMA.field_111267_a).func_111125_b())
    );

    vamps = World.getAllEntitiesOfType(PLAYER_CLASS).filter(entity => {
        entity = entity.getEntity();
        const max = entity.func_110148_a(SMA.field_111267_a).func_111125_b();
        return max > 210 && entity.func_110143_aJ() / max <= 0.2;
    });
}).setFps(2), () => getWorld() === "The Rift" && settings.vampireHitbox);

/**
 * Render boxx hitboxes
 */
registerWhen(register("renderWorld", (pt) => {
    renderEntities(dracula, 1, 0, 0, pt, undefined, false);
    renderEntities(vamps, 1, 0, 0, pt);
}), () => getWorld() === "The Rift" && settings.vampireHitbox);
