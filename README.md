<p align="center">
    <a href="https://zhenga8533.github.io/VolcAddons/" target="_blank">
      <img width="69%" src="https://i.imgur.com/tue81fa.png" alt="VolcAddons Logo">
    </a>
</p>

<p align="center">
    </br>
    <img src="https://img.shields.io/github/v/release/zhenga8533/VolcAddons?style=flat-square" alt="GitHub release (latest by date)">
    <img src="https://img.shields.io/github/languages/code-size/zhenga8533/VolcAddons?style=flat-square" alt="Code Size">
    <img src="https://img.shields.io/github/license/zhenga8533/VolcAddons?style=flat-square" alt="License">
    <a href="https://github.com/zhenga8533/VolcAddons/releases/latest">
        <img src="https://img.shields.io/github/downloads/zhenga8533/VolcAddons/total?style=flat-square" alt="Downloads">
    </a>
    <img src="https://img.shields.io/github/last-commit/zhenga8533/VolcAddons?style=flat-square" alt="Last Commit">
    </br>
    <a href="https://raw.githubusercontent.com/zhenga8533/VolcAddons/main/forge/VolcAddons-1.1.jar">
        <img src="https://img.shields.io/badge/GitHub-Forge%20Download-blue?style=for-the-badge&logo=github">
    </a>
    <a href="https://discord.gg/ftxB4kG2tw">
        <img src="https://img.shields.io/discord/1136805313287299092?color=%237289DA&label=Discord&logo=discord&logoColor=white&style=for-the-badge" alt="Discord Server">
    </a>
</p>

## Table of Contents

- [Website](#website)
- [Setup](#setup)
- [Commands](#commands)
- [Features](#features)
  </br>

## Website

You can also view this page on the VolcAddons [website](https://zhenga8533.github.io/VolcAddons/).

## Setup

### <u>Before Installation:</u>

1. **Install Forge:** Ensure that you have [Forge](https://files.minecraftforge.net/net/minecraftforge/forge/index_1.8.9.html) installed to enable mod compatibility.

2. **Install ChatTriggers:** You'll need [ChatTriggers](https://www.chattriggers.com) installed for advanced in-game functionality.

3. **Choices:** Choose one of the two options below to follow.

### <u>Forge Installation:</u>

1. **Download:** Download the [VolcAddons-1.1.jar](https://raw.githubusercontent.com/zhenga8533/VolcAddons/main/forge/VolcAddons-1.1.jar) file.

2. **Integration:** Drag into Minecraft mods folder (NOT the CT modules folder).

3. **El Fin v1:** You should be good to go! The mod will alert you if there is ever a new release in which you can just run `/updateva`!

### <u>Manual Installation:</u>

1. **Download:** Get the zip file, available either on our [Discord server](https://discord.gg/ftxB4kG2tw) or through [GitHub Releases](https://github.com/zhenga8533/VolcAddons/releases).

2. **Unzip:** Extract the downloaded zip file. You should now see a folder named "VolcAddons".

3. **Accessing ChatTriggers:** Launch Minecraft and enter the command `/ct files` (you can also find this by going into ChatTriggers through the Minecraft configs path)

4. **Integration:** Return to the unzipped folder.

5. **Module Replacement:** Drag the VolcAddons folder into the "modules" folder.

6. **Confirmation:** If a pop-up appears, select "replace".

7. **El Fin v2:** Now just type `/ct load` and your job is done!

After you finish installing, go check out some other useful SkyBlock mods: https://sbmw.ca/mod-lists/skyblock-mod-list/!
</br>

## Commands

### <u>General Commands</u>

- **Settings**
  - `/va gui`: Allows user to move all active GUI locations.
  - `/va help`: Prints out the command help menu in game chat.
  - `/va settings`: Opens the settings' menu.
  - `/va toggles`: Opens the setting toggles' menu.
  - `/va version`: Checks if you are currently on latest version and prints out changelog.
- **Waypoints**
  - `/va cat`: Controls Montezuma Soul Piece location waypoints.
  - `/va enigma`: Controls Enigma Soul location waypoints.
  - `/va npc`: Creates waypoints to user inputted rift NPCs.
  - `/va zone`: Creates waypoints to user inputted rift locations.
  - `/va waypoint`: Creates waypoints to user inputted coordinates.
- **Lists**
  - `/va cd`: Tracks the cooldown of items using user inputted times.
  - `/va blacklist`: Block users from using leader/party commands.
  - `/va emotelist`: Set words to replace in user sent messages.
  - `/va warplist`: Set locations in which Diana burrow warp uses.
  - `/va whitelist`: Set player party invites to auto join.
- **Economy**
  - `/va attribute`: Various calculations that deal with attribute values.
  - `/va calc`: Various calculations that deal with general economical values.
  - `/va nw`: Calculates the networth of a SkyBlock profile using custom API.
- **Misc**
  - `/va splits`: Prints out Kuudra splits' stats.
  - `/sk`: Opens the SkyCrypt profile of inputted user.

### <u>Feature Commands</u>

- **Stats**
  - `/va stats`: Prints out SkyBlock tab stats.
  - `/va pet`: Prints out current pet.
  - `/va pt`: Prints out daily playtime.
  - `/va sf`: Prints out current soulflow _(requires accessory in inventory)_.
- **Status**
  - `/va fps`: Prints out client's FPS.
  - `/va tps`: Prints out server's TPS.
  - `/va ping`: Prints out client's ping.
  - `/va pitch`: Prints out player's exact pitch.
  - `/va yaw`: Prints out player's exact yaw.
- **Leader** _(Used in party chat)_
  - `?<allinv, allinv>`: Toggles party all invite.
  - `?invite [ign]`: Invites a player to the party.
  - `?demote`: Demotes the sender.
  - `?promote`: Promotes the sender.
  - `?<f, m, t>[1-7]`: Runs the specified join instance command.
  - `?stream [num]`: Runs the stream command to open the party.
  - `?transfer`: Transfers the party to sender.
  - `?warp`: Warps party into lobby.
- **Party** _(Used in party chat)_ - `?8ball`: Calls upon the Magic 8 Ball. - `?<coin, flip, coinflip, cf>`: Flips a coin. - `?<coords, xyz>`: Sends coordinates of players in patcher format. - `?<dice, roll>`: Rolls a 6 sided dice. - `?<fps, ping, tps>`: Sends specified stat to party. - `?help`: Prints out all party commands to chat. - `?<limbo, lobby, l>`: Forces users to go into main lobby. - `?rps`: Jan, ken, pon. - `?<w, waifu, women>`: I am very quirky.
  </br>

## Features

### <u>General Features</u>

- **General**
  - Armor Display (`/moveArmor`)
  - Equipment Display
  - Remove Selfie Mode
  - Render Waypoint
  - Skill Tracker (`/moveSkills`, `/resetSkills`)
- **Inventory**
  - Searchbar (`/moveSearch`)
  - Slot Binding (`/resetBinds`, `/saveBinds`, `/loadBinds`)
- **Server**
  - Hide Far Entities
  - Hide Close Players
  - Hide All Particles
  - Server Alert
  - Server Status (`/moveStatus`)
  - SkyBlock Stats Display (`/moveStats`)
- **Timer**
  - Item Cooldown Alert (`/va cd`)
  - Reminder Text
  - Reminder Time
- **Yapping**
  - Autocorrect Commands
  - Custom Emotes (`/va emote`)
  - Discord Webhook
  - Image Viewer

### <u>Party Features</u>

- **General**
  - Anti Ghost Party
  - Auto Join Reparty
  - Auto Transfer
  - Guild Join Message
  - Party Join Message
  - Server Kick Announce
  - Whitelist Rejoin (`/va wl`)
- **Party Commands**
  - Leader Chat Commands (`/va bl`)
  - Party Chat Commands

### <u>Economy Features</u>

- **General**
  - Bits Alert
  - Coin Tracker (`/moveCoins`, `/resetCoins`)
- **Pricing**
  - Container Value (`/moveContainer`)
  - Item Price (`/moveValue`)

### <u>Combat Features</u>

- **Bestiary**
  - Bestiary GUI
  - Broodmother Detect (`/moveBrood`)
  - Kill Counter (`/moveKills`, `/resetKills`)
- **General**
  - Combo Display (`/moveCombo`)
  - Damage Tracker
  - Low Health Alert
  - Ragnarok Detection
- **Gyrokinetic Wand**
  - Cell Alignment Alert
  - Cell Alignment Timer (`/moveGyro`)
- **Slayer**
  - Boss Announce
  - Miniboss Announce
  - Boss Highlight
  - Miniboss Highlight
  - Slayer Spawn Warning

### <u>Mining Features</u>

- **Crystal Hollows**
  - Wishing Compass Locator
- **Jinx**
  - 2x Powder Alert
  - Powder Chest Detect (`/moveChest`)
  - Powder Chest Hider
  - Powder Tracker (`/movePowder`, `/resetPowder`)

### <u>Farming Features</u>

- **General**
  - Jacob Reward Highlight
  - Farming Discord Webhook
- **Garden**
  - Composter Display (`/moveCompost`)
  - Garden Warp Override
  - Garden Visitor Display (`/moveVisitors`)
  - Next Visitor Display (`/moveNext`)
- **Pests**
  - Infestation Alert
  - Pest Alert
  - Plot Highlight
  - Pesthunter Display (`/movePest`)
  - Spray Display (`moveSpray`)

### <u>Event Features</u>

- **Great Spook**
  - Math Teacher Solver
  - Primal Fear Alert
  - Primal Feat Highlight
- **Inquisitor**
  - Inquisitor Detect
  - Inquisitor Announce
  - Inquisitor Counter (`moveInq`, `/resetInq`)
- **Mythological Ritual**
  - Diana Waypoint
  - Diana Warp (`/va warplist`)
  - Burrow Detection

### <u>Crimson Isles</u>

- **Fishing**
  - Golden Fish Timer (`/moveGolden`)
  - Mythic Creature Announce
  - Mythic Creature Detect
  - Trophy Fish Counter (`/moveTrophy`, `/resetTrophy`)
- **Vanquisher**
  - Vanquisher Announce
  - Vanquisher Auto-Warp
  - Vanquisher Counter (`/moveCounter`, `/resetCounter`)
  - Vanquisher Detect (`/moveVanq`)

### <u>Dungeons</u>

- **Star Detect**
  - Star Mob Highlight

### <u>Kuudra</u>

- **General**
  - Crate Waypoints
  - Kuudra Alerts
  - Kuudra HP Display
  - Kuudra Spawn Announce
  - Kuudra Splits (`/moveSplits`, `/va splits`)
  - Supply Pile Highlight
- **Profit**
  - Kuudra Profit Display (`/moveKP`)
  - Kuudra Profit Tracker (`/moveKPT`, `/resetKPT`)

### <u>Rift</u>

- **General**
  - DDR Helper
  - Enigma Soul Waypoint
  - Montezuma Soul Waypoint
- **Vampire**
  - Announce Mania Phase
  - Effigy Waypoint
  - Enlarge Impel Message
  - Vampire Attack Display (`/moveVamp`)
  - Vampire Hitbox
