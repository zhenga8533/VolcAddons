import location from "../../utils/Location";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";

/**
 * Variables used to represent complete dance and current dance move.
 */
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

/**
 * Replaces Hypixel dance room subtitles with larger, permanent titles.
 */
registerWhen(
  register("renderTitle", (title, subtitle, event) => {
    if (title === "§aIt's happening!§r" || title === "§aKeep it up!§r") cancel(event);
    if (!dancing.includes(subtitle) || subtitle === last) return;

    const move = dancing.shift();
    Client.showTitle(move, `NEXT: ${dancing[0]}`, 0, 50, 0);
    last = subtitle;
    print(subtitle);
    cancel(event);
  }),
  () => location.getWorld() === "The Rift" && Settings.ddrHelper
);

/**
 * Resets dance if player fails.
 */
registerWhen(
  register("chat", () => {
    dancing = [...DANCES];
  }).setCriteria("You were${failure}!"),
  () => location.getWorld() === "The Rift" && Settings.ddrHelper
);
registerWhen(
  register("chat", () => {
    dancing = [...DANCES];
  }).setCriteria("You d${failure}!"),
  () => location.getWorld() === "The Rift" && Settings.ddrHelper
);
registerWhen(
  register("chat", () => {
    dancing = [...DANCES];
  }).setCriteria("You're ${failure}!"),
  () => location.getWorld() === "The Rift" && Settings.ddrHelper
);
