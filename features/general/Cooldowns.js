import { data, registerWhen } from "../../utils/variables";

registerWhen(register("actionBar", (before, ability, after) => {
    if (!(ability in data.cooldownlist)) return;

    ChatLib.chat(ability);
}).setCriteria("${before}Mana (${ability})${after}"), () => true);