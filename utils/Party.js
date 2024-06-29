import { data } from "./Data";
import { getPlayerName } from "./functions/player";

class Party {
  #in = false;
  #leader = false;
  #members = new Set();

  constructor() {
    // --- PERSISTENT PARTY DATA ---
    if (data.party.updated - Date.now() < 300_000) {
      this.#in = data.party.in;
      this.#leader = data.party.leader;
      this.#members = new Set(data.party.members);
    }

    register("gameUnload", () => {
      data.party.in = this.#in;
      data.party.leader = this.#leader;
      data.party.members = [...this.#members];
      data.party.updated = Date.now();
    }).setPriority(Priority.HIGHEST);

    // --- TRACK EMPTY PARTY ---
    register("chat", () => {
      this.#in = false;
      this.#leader = false;
      this.#members.clear();
    }).setCriteria("${player} has disbanded the party!");

    register("chat", () => {
      this.#in = false;
      this.#leader = false;
      this.#members.clear();
    }).setCriteria("The party was disbanded because all invites expired and the party was empty.");

    register("chat", () => {
      this.#in = false;
      this.#leader = false;
      this.#members.clear();
    }).setCriteria("You left the party.");

    register("chat", () => {
      this.#in = false;
      this.#leader = false;
      this.#members.clear();
    }).setCriteria("You are not in a party right now.");

    // --- TRACK PARTY LEADER ---
    register("chat", (player1) => {
      this.#leader = Player.getName() === getPlayerName(player1);
      this.#in = true;
    }).setCriteria("The party was transferred to ${player1} by ${player2}");

    register("chat", (player1) => {
      this.#leader = Player.getName() === getPlayerName(player1);
      this.#in = true;
    }).setCriteria("The party was transferred to ${player1} because ${player2} left");

    register("chat", (_, player2) => {
      this.#leader = Player.getName() === getPlayerName(player2);
      this.#in = true;
    }).setCriteria("${player1} has promoted ${player2} to Party Leader");

    register("chat", (player1) => {
      this.#leader = Player.getName() === getPlayerName(player1);
      this.#in = true;
    }).setCriteria("${player1} invited ${player2} to the party! They have 60 seconds to accept.");

    // --- TRACK PARTY INTERACTIONS ---
    register("chat", (player) => {
      this.#leader = false;
      this.#in = true;
    }).setCriteria("You have joined ${player}'s party!");

    register("chat", () => {
      this.#leader = false;
      this.#in = false;
      this.#members.clear();
    }).setCriteria("You have been kicked from the party by ${player}");

    // --- CONTROL FOR GAME/CT RS ---
    register("chat", (leader, event) => {
      this.#in = true;
      const player = getPlayerName(leader);
      this.#leader = Player.getName() === player;

      if (player === Player.getName()) return;
      this.#members.add(player);
    }).setCriteria("Party Leader: ${leader} ●");

    register("chat", (members) => {
      this.#in = true;
      members.split(" ● ").forEach((member) => {
        const name = getPlayerName(member);
        if (name === Player.getName()) return;
        this.#members.add(name);
      });
    }).setCriteria("Party Moderators: ${members} ● ");

    register("chat", (members) => {
      this.#in = true;
      members.split(" ● ").forEach((member) => {
        const name = getPlayerName(member);
        if (name === Player.getName()) return;
        this.#members.add(name);
      });
    }).setCriteria("Party Members: ${members} ● ");

    register("chat", (player) => {
      this.#in = true;
      const name = getPlayerName(player);
      if (name === Player.getName()) return;
      this.#members.delete(name);
    }).setCriteria("${player} has been removed from the party.");
  }

  /**
   * Returns Party.#in
   *
   * @returns {Boolean} - True if in party, otherwise false.
   */
  getIn() {
    return this.#in;
  }

  /**
   * Returns Party.#in && Party.#leader
   *
   * @returns {Boolean} - True if leader of party, otherwise false.
   */
  getLeader() {
    return this.#in && this.#leader;
  }

  /**
   * Returns Party.#members
   *
   * @returns {Set} - Set object of all party members.
   */
  getMembers() {
    return this.#members;
  }
}
export default new Party();
