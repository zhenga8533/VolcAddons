import settings from "../../settings";
import { BOLD, GOLD, WHITE } from "../../utils/constants";
import { announceMob } from "../../utils/functions";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { updateInqCounter } from "../hub/InquisitorCounter";


/**
 * Inquisitor alert variables.
 */
const EntityPlayerMP = Java.type("net.minecraft.client.entity.EntityOtherPlayerMP");
let inquisitor = undefined;

/**
 * Announce inquisitor spawn on chat message appears.
 */
registerWhen(register("chat", () => {
    entities = World.getAllEntitiesOfType(EntityPlayerMP.class);
    inquisitor = entities.find((entity) => entity.getName().equals("Minos Inquisitor"));

    updateInqCounter(inquisitor != undefined);
    if (inquisitor != undefined && settings.inqAlert)
        announceMob(settings.inqAlert == 1, "Minos Inquisitor", inquisitor.getX(), inquisitor.getY(), inquisitor.getZ());
}).setCriteria("${wow}! You dug out a Minos Champion!"), () => getWorld() === "Hub" && (settings.inqAlert || settings.inqCounter));

/**
 * Tracks world for any inquisitors near player.
 */
let inquisitors = [];
export function getInquisitors() { return inquisitors };
registerWhen(register("tick", () => {
    inquisitors = [];

    entities = World.getAllEntitiesOfType(EntityPlayerMP.class);
    inqs = entities.filter((entity) => entity.getName().equals("Minos Inquisitor"));

    if (inqs.length > 0) {
        Client.Companion.showTitle(`${GOLD}${BOLD}INQUISITOR ${WHITE}DETECTED!`, "", 0, 25, 5);
        if (data.moblist.includes("inquisitor"))
            inqs.forEach(inq => { inquisitors.push(inq) });
    }
}), () => getWorld() === "Hub" && settings.detectInq);
