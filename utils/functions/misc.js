import party from "../party";
import { delay } from "../thread";


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
export function announceMob(chat, mob, x, y, z, area) {
    if ((chat === 2 && !party.getIn()) || chat === 0) return;
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);
    if (area === undefined) {
        const zoneLine = Scoreboard?.getLines()?.find((line) => line.getName().includes("⏣")) ??
            Scoreboard?.getLines()?.find((line) => line.getName().includes("ф"));
        area = zoneLine === undefined ? "None" : zoneLine.getName().removeFormatting();
    }
    
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

const GzipCompressorOutputStream = Java.type("org.apache.commons.compress.compressors.gzip.GzipCompressorOutputStream");
const GzipCompressorInputStream = Java.type("org.apache.commons.compress.compressors.gzip.GzipCompressorInputStream");
const ByteArrayOutputStream = Java.type("java.io.ByteArrayOutputStream");
const ByteArrayInputStream = Java.type("java.io.ByteArrayInputStream");
const IOUtils = Java.type("org.apache.commons.io.IOUtils");

export function compressNBT(nbtObject) {
    try {
        // Convert NBT object to JSON string
        const nbtString = JSON.stringify(nbtObject);

        // Convert string to byte array
        const nbtBytes = new java.lang.String(nbtString).getBytes("UTF-8");

        // Compress using GzipCompressorOutputStream
        const byteArrayOutputStream = new ByteArrayOutputStream();
        const compressor = new GzipCompressorOutputStream(byteArrayOutputStream);

        // Write uncompressed data to compressor
        compressor.write(nbtBytes);

        // Close streams
        compressor.close();
        byteArrayOutputStream.close();

        // Get the compressed data as byte array
        const compressedData = byteArrayOutputStream.toByteArray();

        // Return compressed data as base64 encoded string
        return java.util.Base64.getEncoder().encodeToString(compressedData);
    } catch (e) {
        print("Error compressing NBT: " + e);
        return null;
    }
}

export function decompressNBT(compressedData) {
    try {
        // Decode base64 string to byte array
        const compressedBytes = java.util.Base64.getDecoder().decode(compressedData);
        const byteArrayInputStream = new ByteArrayInputStream(compressedBytes);
        const decompressor = new GzipCompressorInputStream(byteArrayInputStream);
        const byteArrayOutputStream = new ByteArrayOutputStream();
        IOUtils.copy(decompressor, byteArrayOutputStream);

        // Close streams
        decompressor.close();
        byteArrayInputStream.close();
        byteArrayOutputStream.close();

        // Get the decompressed data as byte array
        const decompressedBytes = byteArrayOutputStream.toByteArray();
        const decompressedString = new java.lang.String(decompressedBytes, "UTF-8");
        const nbtObject = JSON.parse(decompressedString);

        return nbtObject;
    } catch (e) {
        print("Error decompressing NBT: " + e);
        return null;
    }
}
