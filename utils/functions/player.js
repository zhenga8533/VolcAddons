/**
 * Strips rank and tags off player name.
 *
 * @param {String} player - Player name with rank and tags.
 * @returns {String} Base player ign.
 */
export function getPlayerName(player) {
  let name = player.replace(/[^a-zA-Z0-9[\]_ ]/g, "");
  let nameIndex = name.indexOf("]");

  while (nameIndex !== -1) {
    name = name.substring(nameIndex + 2);
    nameIndex = name.indexOf("]");
  }

  return name.split(" ")[0];
}

/**
 * Extracts and returns the guild name from a player's name string.
 *
 * @param {String} player - Player's name, possibly with guild tags and ranks.
 * @returns {String} - Extracted guild name from the player's name.
 */
export function getGuildName(player) {
  let name = player.replace(/[^a-zA-Z0-9[\]_ ]/g, "");
  let rankIndex = name.indexOf("] ");
  if (rankIndex !== -1) name = name.substring(name.indexOf("] ") + 2);
  name = name.substring(0, name.indexOf("[") - 1);

  return name;
}

/**
 * Returns True if entity is player otherwise False.
 *
 * @param {Entity} entity - OtherPlayerMP Minecraft Entity.
 * @returns {Boolean} - Whether or not player is human.
 */
export function isPlayer(entity) {
  return World.getPlayerByName(entity.getName())?.getPing() === 1;
}
