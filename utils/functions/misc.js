/**
 * Circular Imports :)
 */
import { delay } from "../thread.js";
import { getInParty } from "../party.js";


/**
 * Returns a random index in array.
 * 
 * @param {Type[]} arr - Array to find the random index of.
 * @returns {Number} Random number from 0 to arr.length - 1
 */
export function randIndex(arr) {
    return Math.floor(Math.random() * (arr.length - 1));
}

let soundCD = false;
/**
 * Plays a sound and sets cooldown
 * 
 * @param {Sound} sound - A sound ogg file from constants.js 
 * @param {Number} cd - Cooldown caused by sound play.
 */
export function playSound(sound, cd) {
    if (soundCD) return;

    sound?.play();
    soundCD = true;
    delay(() => soundCD = false, cd);
}

/**
 * Tracks chat for any powder gain messages.
 *
 * @param {Boolean} toAll - /ac if true, /pc if false.
 * @param {String} mob - Name of the mob.
 * @param {Number} x - X coordinate.
 * @param {Number} y - Y coordinate.
 * @param {Number} z - Z coordinate.
 */
export function announceMob(chat, mob, x, y ,z) {
    if ((chat === 2 && !getInParty()) || chat === 0) return;
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);
    const zoneLine = Scoreboard?.getLines()?.find((line) => line.getName().includes("⏣")) ??
        Scoreboard?.getLines()?.find((line) => line.getName().includes("ф"));
    const area = zoneLine === undefined ? "None" : zoneLine.getName().removeFormatting();
    
    const id = chat === 2 ? "" : ` @${(Math.random() + 1).toString(36).substring(2)}`;
    const CHATS = ["OFF", "ac", "pc", `msg ${Player.getName()}`];
    ChatLib.command(`${CHATS[chat]} x: ${x}, y: ${y}, z: ${z} | ${mob} spawned at [${area} ]!${id}`);
}

const decoder = java.util.Base64.getDecoder();
const compressor = net.minecraft.nbt.CompressedStreamTools;
/**
 * Decode Hypixel item NBT bytes
 * Credit to https://www.chattriggers.com/modules/v/SBInvSee for decoding!
 * 
 * @param {String} bytes - Encoded hypixel item data.
 * @returns {String} Decoded NBT data.
 */
export function decode(bytes) {
    const bytearray = decoder.decode(bytes);
    const inputstream = new java.io.ByteArrayInputStream(bytearray);
    const nbt = compressor.func_74796_a(inputstream);
    return nbt.func_150295_c("i", 10);
}
