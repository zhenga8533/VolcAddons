import { request } from "../../requestV2";

class Mayor {
  #mayor = undefined;
  #perks = new Set([]);

  constructor() {
    register("worldLoad", () => {
      request({
        url: "https://api.hypixel.net/v2/resources/skyblock/election",
        json: true,
      })
        .then((response) => {
          this.#mayor = response.mayor.name;
          this.#perks = new Set([...response.mayor.perks.map((perk) => perk.name)]);
        })
        .catch((err) => console.error(`VolcAddons: ${err.cause ?? err}`));
    });
  }

  getMayor() {
    return this.#mayor;
  }

  getPerks() {
    return this.#perks;
  }
}
export default new Mayor();
