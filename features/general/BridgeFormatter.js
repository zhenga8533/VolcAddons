import { AQUA, GOLD, GRAY, WHITE } from "../../utils/Constants";


if (Player.getName() === "Volcaronitee")
    register("chat", (_, player, msg, event) => {
        cancel(event);
        msg = msg.replace("replying", GRAY + "replying");
        ChatLib.chat(`${GOLD}Bridge > ${AQUA + player + WHITE}: ${msg}`);
    }).setCriteria("Guild > ${bridge}: ${player} » ${msg}");
