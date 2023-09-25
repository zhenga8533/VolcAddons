import RenderLib from "../../../RenderLib";
import settings from "../../utils/settings";
import { AQUA, BOLD, DARK_AQUA, DARK_PURPLE, GOLD } from "../../utils/constants";
import { Overlay } from "../../utils/overlay";
import { getInParty } from "../../utils/party";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { getSlayerBoss } from "../combat/SlayerDetect";


/**
 * Variables used to track and display vampire boss attacks.
 */
const EntityArmorStand = Java.type("net.minecraft.entity.item.EntityArmorStand");
const vampireExample =
`${DARK_PURPLE}${BOLD}MANIA: ${AQUA}Dracule
${GOLD}${BOLD}TWINCLAWS: ${AQUA}Mihawk
${DARK_AQUA}${BOLD}ICHOR: ${AQUA}3,590,000,000`;
const vampireOverlay = new Overlay("vampireAttack", ["The Rift"], () => true, data.BL, "moveVamp", vampireExample);
let dracula = undefined;
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
        dracula = undefined;
        bossUUID = 0;
        mania = 0;
        return;
    }

    const stands = World.getWorld()
        .func_72839_b(player, player.func_174813_aQ().func_72314_b(16, 16, 16))
        .filter(entity => entity instanceof EntityArmorStand);

    // Boss Nametag Shit
    if (!bossUUID) {
        const spawn = stands.find(stand => stand.func_95999_t().includes('03:59'));
        if (spawn === undefined) return;
        bossUUID = spawn.getUniqueID();
    } else {
        const boss = stands.find(stand => stand.getUniqueID() === bossUUID);
        if (boss === undefined) return;
        dracula = boss;
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
                } else if (getInParty())
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
        if (ichorUUID) {
            const ichor = stands.find(stand => stand.getUUID() === ichorUUID);
            if (ichor === undefined) {
                ichorSpawn = false;
                ichorUUID = 0;
                return;
            }
            vampireOverlay.message += `${DARK_AQUA}${BOLD}ICHOR: ${ichor.getName()}\n`;
        } else {
            const ichor = stands.find(stand => stand.getName().includes('24.'));
            if (ichor === undefined) return;
            ichorUUID = ichor.getUUID();
        }
    }
}), () => getWorld() === "The Rift" && (settings.vampireAttack === true || settings.announceMania !== 0));

/**
 * Replaces Hypixel's impel subtitle with a flashy title.
 *
 * @param {string} title - Message used for larger title.
 * @param {string} subtitle - Message used for smaller subtitle.
 * @param {Object} event - Title render event.
 */
registerWhen(register("renderTitle", (title, subtitle, event) => {
    if (subtitle.includes("Impel")) {
        cancel(event);
        Client.Companion.showTitle(subtitle, "", 0, 20, 0);
    }
}), () => getWorld() === "The Rift" && settings.vampireImpel === true);

/**
 * Draws an ESP box around player boss and highlights when low.
 */
registerWhen(register("renderWorld", () => {
    if (dracula === undefined) return;
    RenderLib.drawEspBox(dracula.getX(), dracula.getY() - 2.5, dracula.getZ(), 1, 2, 1, 0, 0, 1, data.vision);
}), () => settings.vampireHitbox === true && getWorld() === "The Rift");

/**
 * Highlights vampire bosses with steakable HP.
 */
let vamps = [];
registerWhen(register("step", () => {
    vamps = [];
    
    const player = Player.asPlayerMP().getEntity();
    vamps = World.getWorld()?.func_72839_b(player, player.func_174813_aQ().func_72314_b(32, 32, 32))?.filter(entity => {
        entity instanceof EntityArmorStand && entity?.func_95999_t()?.includes("Bloodfiend §e§l")
    }) ?? [];
}).setFps(2), () => getWorld() === "The Rift" && settings.vampireHitbox === true);

/**
 * Render mob hitboxes
 */
registerWhen(register("renderWorld", () => {
    stands.forEach(stand => {
        const x = stand.field_70142_S;
        const y = stand.field_70137_T - 2;
        const z = stand.field_70136_U;

        const distance = Math.hypot(Player.getX() - x, Player.getY() - y, Player.getZ() - z).toFixed(0) + "m";
        Tessellator.drawString(`Medium Rare §b[${distance}]`, x, y + 3.5, z, 0xffffff, false);
        RenderLib.drawEspBox(x, y, z, 1, 2, 1, 0, 0, 1, data.vision);
        RenderLib.drawInnerEspBox(x, y, z, 1, 2, 1, 0, 0, 0.25, data.vision);
    });
}), () => getWorld() === "The Rift" && settings.vampireHitbox === true);
