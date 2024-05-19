import renderBeaconBeam from "../../BeaconBeam";
import RenderLib from "../../RenderLib/index";
import { DARK_GRAY, GOLD, YELLOW } from "./constants";


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

    /**
     * Creates a new waypoint.
     * 
     * @param {Number[]} color - RGB color of the waypoint.
     */
    constructor(color) {
        waypoints.push(this);
        this.#color = color;
        this.#waypoints = [];
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
            const rY2 = pY + pEye + (y + 1 + (20 * distance / 300) - (10 * distance / 300) - (pY + pEye)) / (distance / renderDistance);
            const rZ = pZ + (z + 0.5 - pZ) / (distance / renderDistance);

            // Render the waypoint
            RenderLib.drawEspBox(x + 0.5, y, z + 0.5, 1, 1, ...this.#color, 1, true);
            RenderLib.drawInnerEspBox(x + 0.5, y, z + 0.5, 1, 1, ...this.#color, 0.25, true);
            Tessellator.drawString(GOLD + waypoint[0], rX, rY1, rZ, 0, true, distance / 300, false)
            Tessellator.drawString(`${DARK_GRAY}[${YELLOW + Math.round(distance)}m${DARK_GRAY}]`, rX, rY2, rZ, 0, false, distance / 300, false)
            renderBeaconBeam(x, y, z, ...this.#color, 0.5, false);
        });
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
     * Clears the list of waypoints.
     */
    clear() {
        this.#waypoints = [];
    }
}
