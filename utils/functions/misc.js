import party from "../Party";
import { delay } from "../ThreadTils";

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
  delay(() => (soundCD = false), cd);
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
    const zoneLine =
      Scoreboard?.getLines()?.find((line) => line.getName().includes("⏣")) ??
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

/**
 * Compresses NBT object into a compressed string using Base64.
 *
 * @param {Object} nbtObject - NBT data object of an item to compress.
 * @returns {String} Compressed form of the NBT data as a string.
 */
export function compressNBT(nbtObject) {
  try {
    // Convert NBT object to JSON string
    const nbtString = JSON.stringify(nbtObject);
    const nbtBytes = new java.lang.String(nbtString).getBytes("UTF-8");
    const byteArrayOutputStream = new ByteArrayOutputStream();
    const compressor = new GzipCompressorOutputStream(byteArrayOutputStream);
    compressor.write(nbtBytes);

    // Close streams
    compressor.close();
    byteArrayOutputStream.close();

    // Get the compressed data as byte array
    const compressedData = byteArrayOutputStream.toByteArray();

    return java.util.Base64.getEncoder().encodeToString(compressedData);
  } catch (e) {
    console.error("Error compressing NBT: " + e);
    return null;
  }
}

/**
 * Decompresses given compressed NBT string using Base64.
 *
 * @param {String} compressedData - Compressed NBT string to decompress data from.
 * @returns {Object} Decompressed NBT data.
 */
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
    console.error("Error decompressing NBT: " + e);
    return null;
  }
}

/**
 * Parse a texture NBT string into an item.
 *
 * @param {String} nbt - Base64 encoded NBT string.
 * @returns {Item} Item with the texture.
 */
export function parseTexture(nbt) {
  const decoded = JSON.parse(FileLib.decodeBase64(nbt));

  // Stolen from Dalwyn ^_^
  const skullOwner = new NBTTagCompound(new net.minecraft.nbt.NBTTagCompound());
  const properties = new NBTTagCompound(new net.minecraft.nbt.NBTTagCompound());
  const textures = new NBTTagList(new net.minecraft.nbt.NBTTagList());
  const textureString = new NBTTagCompound(new net.minecraft.nbt.NBTTagCompound());

  const url = decoded.textures?.SKIN?.url?.split("/");
  const skin = url?.[url?.length - 1];
  const backup = Math.random().toString(36).substring(2, 12);
  skullOwner.setString("Id", decoded.profileId ?? skin ?? backup);
  skullOwner.setString("Name", (decoded.profileName + decoded.timestamp || skin) ?? backup);

  textureString.setString("Value", nbt);
  textures.appendTag(textureString);

  properties.set("textures", textures);
  skullOwner.set("Properties", properties);

  return skullOwner;
}

/**
 * Parse a container cache into an array of items.
 *
 * @param {String[]} cache - Cache of container items.
 * @returns {Item[]} Parsed items from the cache.
 */
export function parseContainerCache(cache) {
  return cache.map((nbt) => {
    if (nbt === null) return null;
    const parsedNBT = NBT.parse(decompressNBT(nbt)).rawNBT;
    const item = new Item(net.minecraft.item.ItemStack.func_77949_a(parsedNBT));
    try {
      const loreTag = parsedNBT.func_74775_l("tag").func_74775_l("display").field_74784_a.get("Lore");
      const lore = [item.getLore()[0]];
      if (loreTag !== null) {
        for (let i = 0; i < loreTag.func_74745_c(); i++) {
          lore.push(loreTag.func_150307_f(i));
        }
      }
      item.setLore(lore);
    } catch (e) {
      ChatLib.chat(e);
    }

    if (item.getUnlocalizedName() === "item.skull") {
      // Fix skull textures not rendering
      const skullNBT = item.getNBT().getCompoundTag("tag").getCompoundTag("SkullOwner");
      const texture = skullNBT
        .getCompoundTag("Properties")
        .getTagList("textures", 0)
        .func_150305_b(0)
        .func_74779_i("Value");
      const skull = parseTexture(texture);
      item.getNBT().getCompoundTag("tag").set("SkullOwner", skull);
    }

    return item;
  });
}
