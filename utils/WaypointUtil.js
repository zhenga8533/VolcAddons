import renderBeaconBeam from "../../BeaconBeam";
import RenderLib from "../../RenderLib/index";
import { DARK_GRAY, GOLD, YELLOW } from "./constants";
import { data } from "./data";


const waypoints = [];

register("renderWorld", () => {
    const pX = Player.getRenderX();
    const pY = Player.getRenderY();
    const pZ = Player.getRenderZ();
    const pEye = Player.asPlayerMP().getEyeHeight();

    waypoints.forEach(waypoint => {
        waypoint.draw(pX, pY, pZ, pEye);
    });
});

export class Waypoint {
    #color;
    #waypoints;
    #simple;

    /**
     * Creates a new waypoint.
     * 
     * @param {Number[]} color - RGB color of the waypoint.
     */
    constructor(color, simple=false) {
        waypoints.push(this);
        this.#color = color;
        this.#waypoints = [];
        this.#simple = simple;
    }

    /**
     * Draws the waypoints on the screen.
     * 
     * @param {Number} pX - Player's x position.
     * @param {Number} pY - Player's y position.
     * @param {Number} pZ - Player's z position.
     * @param {Number} pEye - Player's eye height.
     */
    draw(pX, pY, pZ, pEye){
        this.#waypoints.forEach(waypoint => {
            // Calculate the distance between the player and the waypoint
            const n = waypoint.length;
            const x = Math.round(waypoint[n - 3]);
            const y = Math.round(waypoint[n - 2]);
            const z = Math.round(waypoint[n - 1]);
            const distance = Math.hypot(pX - x, pY - y, pZ - z);
            const renderDistance = Math.min(distance, 50);

            // Credit: https://github.com/Soopyboo32/SoopyV2/blob/master/src/utils/renderUtils.js
            const rX = pX + (x + 0.5 - pX) / (distance / renderDistance);
            const rY1 = pY + pEye + (y + 1 + (20 * distance / 300) - (pY + pEye)) / (distance / renderDistance);
            const rY2 = pY + pEye + (y + 1 + (20 * distance / 300) - (11 * distance / 300) - (pY + pEye)) / (distance / renderDistance);
            const rZ = pZ + (z + 0.5 - pZ) / (distance / renderDistance);

            // Render the waypoint
            RenderLib.drawEspBox(x + 0.5, y, z + 0.5, 1, 1, ...this.#color, 1, data.vision || !this.#simple);
            RenderLib.drawInnerEspBox(x + 0.5, y, z + 0.5, 1, 1, ...this.#color, 0.25, data.vision || !this.#simple);
            if (!this.#simple) {
                Tessellator.drawString(GOLD + waypoint[0], rX, rY1, rZ);
                Tessellator.drawString(`${DARK_GRAY}[${YELLOW + Math.round(distance)}m${DARK_GRAY}]`, rX, rY2, rZ);
                renderBeaconBeam(x, y, z, ...this.#color, 0.5, false);
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
     * Finds the closest waypoint to the given coordinate.
     * 
     * @param {Numer[]} coord - The coordinate to find the closest waypoint to.
     * @returns {Number[]} The closest waypoint to the given coordinate.
     */
    getClosest(coord) {
        const n = coord.length;
        let closest = [null, Infinity];

        this.#waypoints.forEach(waypoint => {
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
     * @returns {Number} The number of waypoints in the list.
     */
    getLength() {
        return this.#waypoints.length;
    }

    getWaypoints() {
        return this.#waypoints;
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
     * Sets the list of waypoints.
     * 
     * @param {Type[]} arr - The list of waypoints to set.
     */
    set(arr) {
        this.#waypoints = arr;
    }
}
