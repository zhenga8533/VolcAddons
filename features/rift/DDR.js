import settings from "../../settings";
import { data, registerWhen } from "../../utils/variables";

last = "";
const DANCES = [
    "§bMove!§r",
    "§cMove!§r",
    "§dMove!§r",
    "§aMove!§r",
    "§5Sneak!§r",
    "§eStand!§r",
    "§5Sneak!§r",
    "§eStand!§r",
    "§5Sneak!§r",
    "§eStand!§r",
    "§5Sneak!§r",
    "§eStand!§r",
    "§5Sneak!§8 and §bJump!§r",
    "§eStand!§8 and §bJump!§r",
    "§5Sneak!§8 and §cDon't jump!§r",
    "§eStand!§8 and §cDon't jump!§r",
    "§5Sneak!§8 and §bJump!§r",
    "§eStand!§8 and §bJump!§r",
    "§5Sneak!§8 and §cDon't jump!§r",
    "§eStand!§8 and §cDon't jump!§r",
    "§5Sneak!§8 and §bJump!§r",
    "§eStand!§8 and §bJump!§r",
    "§5Sneak!§8 and §cDon't jump!§r",
    "§eStand!§8 and §cDon't jump!§r",
    "§5Sneak!§8 and §bJump!§r",
    "§eStand!§8 and §bJump!§r",
    "§5Sneak!§8 and §cDon't jump!§r",
    "§eStand!§8 and §cDon't jump!§r",
    "§5Sneak!§8 and §bJump!§r",
    "§eStand!§8 and §bJump!§r",
    "§5Sneak!§8 and §cDon't jump!§r",
    "§eStand!§8 and §cDon't jump!§r",
    "§5Sneak!§8 and §bJump!§8 and §aPunch!§r",
    "§aPunch!§r",
    "§eStand!§8 and §bJump!§8 and §aPunch!§r",
    "§aPunch!§r",
    "§5Sneak!§8 and §cDon't jump!§8 and §aPunch!§r",
    "§aPunch!§r",
    "§eStand!§8 and §cDon't jump!§8 and §aPunch!§r",
    "§aPunch!§r",
    "§5Sneak!§8 and §bJump!§8 and §aPunch!§r",
    "§aPunch!§r",
    "§eStand!§8 and §bJump!§8 and §aPunch!§r",
    "§aPunch!§r",
    "§5Sneak!§8 and §cDon't jump!§8 and §aPunch!§r",
    "§aPunch!§r",
    "§eStand!§8 and §cDon't jump!§8 and §aPunch!§r",
    "§aPunch!§r",
    "§5Sneak!§8 and §bJump!§8 and §aPunch!§r",
    "§aPunch!§r",
    "§eStand!§8 and §bJump!§8 and §aPunch!§r",
    "§aPunch!§r",
    "§5Sneak!§8 and §cDon't jump!§8 and §aPunch!§r",
    "§aPunch!§r",
    "§eStand!§8 and §cDon't jump!§8 and §aPunch!§r",
    "§aPunch!§r",
    "§5Sneak!§8 and §bJump!§8 and §aPunch!§r",
    "§aPunch!§r",
    "§eStand!§8 and §bJump!§8 and §aPunch!§r",
    "§aPunch!§r",
    "§5Sneak!§8 and §cDon't jump!§8 and §aPunch!§r",
    "§aPunch!§r",
    "§eStand!§8 and §cDon't jump!§8 and §aPunch!§r",
    "§aPunch!§r",
    "§6↑, ↑, ↓, ↓, ←, →, ←, →, B, A§r",
];
let dancing = [...DANCES];

registerWhen(register("renderTitle", (title, subtitle, event) => {
    if (title == "§aIt's happening!§r" || title == "§aKeep it up!§r") cancel(event);
    if (!dancing.includes(subtitle) || subtitle == last) return;

    const move = dancing.shift();
    Client.Companion.showTitle(move, `NEXT: ${dancing[0]}`, 0, 50, 0);
    last = subtitle;
    print(subtitle);
    cancel(event);
}), () => data.world == "rift" && settings.ddrHelper);

registerWhen(register("chat", () => { dancing = [...DANCES] }).setCriteria("You were${failure}!"), () => data.world == "rift");
registerWhen(register("chat", () => { dancing = [...DANCES] }).setCriteria("You d${failure}!"), () => data.world == "rift");
registerWhen(register("chat", () => { dancing = [...DANCES] }).setCriteria("You're ${failure}!"), () => data.world == "rift");