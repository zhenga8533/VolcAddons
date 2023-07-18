import settings from "../../settings";
import { get3x3Stands } from "../../utils/functions";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";

const damaged = [];

function postDamage(arr) {
    arr.forEach(damage => {
        num = damage.getName();
        if (!damaged.includes(num)) {
            ChatLib.chat(num);
            damaged.push(num);
            delay(() => damaged.shift(), 1000);
        }
    });
}

registerWhen(register("step", () => {
    const stands = get3x3Stands();
    const damage = stands.filter(stand => stand.getName().includes(","));

    postDamage(damage);
}).setFps(2), () => settings.damageTracker);
