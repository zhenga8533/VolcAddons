import renderBeaconBeam from "../../BeaconBeam";
import RenderLib from "../../RenderLib/index";
import { DARK_GRAY, DARK_GREEN, DARK_RED, GOLD, GREEN, RED, YELLOW } from "./Constants";
import { data } from "./Data";
import Settings from "./Settings";

/**
 * General utility for rendering waypoints.
 */
const waypoints = [];

register("renderWorld", (pt) => {
  const pX = Player.getRenderX();
  const pY = Player.getRenderY();
  const pZ = Player.getRenderZ();
  const pEye = Player.asPlayerMP().getEyeHeight();

  waypoints.forEach((waypoint) => {
    waypoint.draw(pX, pY, pZ, pEye, pt);
  });
});

register("worldUnload", () => {
  waypoints.forEach((waypoint) => waypoint.clear());
});

register("guiClosed", (event) => {
  if (!event.toString().startsWith("gg.essential.vigilance.gui.SettingsGui")) return;
  waypoints.forEach((waypoint) => waypoint.clear());
});

export default class Waypoint {
  #color;
  #waypoints;
  #type;
  #box;
  #beam;
  #rounded;

  /**
   * Creates a new waypoint.
   *
   * @param {Number[]} color - RGB color of the waypoint.
   * @param {Number} type - 0 for default, 1 for simple, 2 for entity, or 3 for simple entity.
   * @param {Boolean} box - Whether or not to render the waypoint box.
   * @param {Boolean} beam - Whether or not to render the beacon beam.
   * @param {Boolean} rounded - Whether or not to round the waypoint coordinates.
   * @returns {Waypoint} The new waypoint.
   */
  constructor(color = [1, 1, 1], type = 0, box = true, beam = true, rounded = true) {
    waypoints.push(this);
    this.#waypoints = [];
    this.#color = color;
    this.#type = type;
    this.#box = box;
    this.#beam = beam;
    this.#rounded = rounded;
  }

  /**
   * Draws the waypoints on the screen.
   *
   * @param {Number} pX - Player's x position.
   * @param {Number} pY - Player's y position.
   * @param {Number} pZ - Player's z position.
   * @param {Number} pEye - Player's eye height.
   * @param {Number} pt - Partial tick.
   */
  draw(pX, pY, pZ, pEye, pt) {
    if (this.#type > 1) {
      this.highlight(pt);
      return;
    }

    this.#waypoints.forEach((waypoint) => {
      const n = waypoint.length;
      const title = waypoint[n - 4];

      // Calculate the position of the waypoint
      let x = parseFloat(this.#rounded ? Math.round(waypoint[n - 3]) : waypoint[n - 3]) - 0.5;
      let y = parseFloat(this.#rounded ? Math.round(waypoint[n - 2]) : waypoint[n - 2]);
      let z = parseFloat(this.#rounded ? Math.round(waypoint[n - 1]) : waypoint[n - 1]) - 0.5;
      const color = waypoint.length < 6 && !isNaN(waypoint[2]) ? this.#color : waypoint.slice(0, 3);

      // Calculate the render distance of the waypoint
      const distance = Math.hypot(pX - x, pY - y, pZ - z);
      const renderDistance = Math.min(distance, 50);
      const distanceColor =
        distance < 10
          ? GREEN
          : distance < 25
          ? DARK_GREEN
          : distance < 50
          ? YELLOW
          : distance < 100
          ? GOLD
          : distance < 200
          ? RED
          : DARK_RED;

      // Credit: https://github.com/Soopyboo32/SoopyV2/blob/master/src/utils/renderUtils.js
      const rX = pX + (x - pX) / (distance / renderDistance);
      const rY1 = pY + pEye + (y + 1 + (20 * distance) / 300 - (pY + pEye)) / (distance / renderDistance);
      const rY2 =
        pY + pEye + (y + 1 + (20 * distance) / 300 - (10 * distance) / 300 - (pY + pEye)) / (distance / renderDistance);
      const rZ = pZ + (z - pZ) / (distance / renderDistance);

      // Render waypoint box
      if (this.#box) {
        RenderLib.drawEspBox(rX, distance > 50 ? rY1 : y, rZ, 1, 1, ...color, 1, data.vision || this.#type === 0);
        RenderLib.drawInnerEspBox(
          rX,
          distance > 50 ? rY1 : y,
          rZ,
          1,
          1,
          ...color,
          0.25,
          data.vision || this.#type === 0
        );
      }

      // Render waypoint text
      if (this.#type === 0) {
        Tessellator.drawString(GOLD + title, rX, rY1, rZ);
        Tessellator.drawString(`${DARK_GRAY}[${distanceColor + Math.round(distance)}m${DARK_GRAY}]`, rX, rY2, rZ);
      }

      // Render beacon beam
      if (this.#beam) renderBeaconBeam(rX - 0.5, distance > 50 ? rY1 : y, rZ - 0.5, ...color, 0.5, false);
    });
  }

  /**
   * Highlights the waypoints on the screen. Typically used for entities.
   *
   * @param {Number} pt - Partial tick.
   */
  highlight(pt) {
    this.#waypoints.forEach((waypoint) => {
      // Get the title and entity of the waypoint
      const title = waypoint[0];
      const entity = waypoint[1]?.getEntity() ?? waypoint[1];
      const x = entity.field_70165_t * pt - entity.field_70142_S * (pt - 1);
      const y = entity.field_70163_u * pt - entity.field_70137_T * (pt - 1);
      const z = entity.field_70161_v * pt - entity.field_70136_U * (pt - 1);
      const width = entity.field_70130_N;
      const height = entity.field_70131_O;

      // Render the entity box
      RenderLib.drawEspBox(x, y, z, width, height, ...this.#color, 1, data.vision);
      if (this.#box)
        RenderLib.drawInnerEspBox(
          x,
          y,
          z,
          width,
          height,
          ...this.#color,
          Settings.hitboxColor.alpha / 510,
          data.vision
        );
      if (title !== undefined && data.vision) {
        let text = "";
        if (this.#type === 2) {
          const distance = Player.asPlayerMP().distanceTo(entity);
          const distanceColor =
            distance < 10
              ? GREEN
              : distance < 25
              ? DARK_GREEN
              : distance < 50
              ? YELLOW
              : distance < 100
              ? GOLD
              : distance < 200
              ? RED
              : DARK_RED;
          text = `${DARK_GRAY}[${distanceColor + Math.round(distance)}m${DARK_GRAY}]`;
        }
        Tessellator.drawString(text, x, y + height + 1, z, 0xffffff, true);
      }
    });
  }

  /**
   * Clears the list of waypoints.
   */
  clear() {
    this.#waypoints = [];
  }

  /**
   * Sets if the waypoint should render a box or not.
   */
  setBox(box) {
    this.#box = box;
  }

  /**
   * Sets the color of the waypoint.
   */
  setColor(color) {
    this.#color = color;
  }

  /**
   * Adds a waypoint to the list.
   *
   * @param {Number[]} waypoint - The waypoint to add.
   */
  push(waypoint) {
    this.#waypoints.push(waypoint);
  }

  /**
   * Finds the closest waypoint to the given coordinate.
   *
   * @param {Numer[]} coord - The coordinate to find the closest waypoint to.
   * @returns {Number[]} The closest waypoint to the given coordinate.
   */
  getClosest(coord) {
    const n = coord.length;
    let closest = [null, Infinity];

    this.#waypoints.forEach((waypoint) => {
      const m = waypoint.length;
      const dX = waypoint[m - 3] - coord[n - 3];
      const dY = waypoint[m - 2] - coord[n - 2];
      const dZ = waypoint[m - 1] - coord[n - 1];
      const distance = Math.hypot(dX, dY, dZ);
      if (distance < closest[1]) closest = [waypoint, distance];
    });
    return closest;
  }

  /**
   * Gets the list of waypoints.
   *
   * @returns {Number[]} The list of waypoints.
   */
  getWaypoints() {
    return this.#waypoints;
  }

  /**
   * Deletes the waypoint.
   */
  delete() {
    waypoints.splice(waypoints.indexOf(this), 1);
  }
}
