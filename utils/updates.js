import axios from "../../axios";
import { BOLD, GOLD, GREEN, LOGO, WHITE, GRAY, DARK_RED } from "./constants";


/**
 * Retrieves the current version of the addon from the metadata.json file.
 * 
 * @returns {string|null} The current version, or null if reading the version fails.
 */
function getCurrentVersion() {
    try {
        const metadataJson = FileLib.read("VolcAddons", "metadata.json");
        const metadata = JSON.parse(metadataJson);
        return metadata.version;
    } catch(err) { ChatLib.chat(LOGO + DARK_RED + (err.cause ?? err)) }
}

/**
 * If version1 < version 2 return true else false.
 * 
 * @param {String} version1 - Version X.X.X numero 1
 * @param {String} version2 - Version X.x.x numero 2
 * @returns 
 */
function compareVersions(version1, version2) {
    const parts1 = version1.split('.').map(Number);
    const parts2 = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        let part1 = parts1[i] || 0;
        let part2 = parts2[i] || 0;

        if (part1 < part2)
            return true;
        else if (part1 > part2)
            return false;
    }

    return false; // Both versions are equal
}

/**
 * Fetches the latest release version from the GitHub repository and notifies the user if a new release is available.
 */
export function getLatestReleaseVersion() {
    const releasesUrl = `https://api.github.com/repos/zhenga8533/VolcAddons/releases`;

    // Fetch the releases from the GitHub API using Axios
    axios.get(releasesUrl).then(response => {
        const releases = response.data;

        // Check if the response contains an array of releases
        if (!Array.isArray(releases) || releases.length === 0) {
            console.log("No releases found for the repository.");
            return;
        }

        // Get the latest release from the array
        const latestRelease = releases[0];
        if (!latestRelease.tag_name) {
            console.log("Unable to find the latest release tag.");
            return;
        }

        // Extract the version number from the latest release tag
        const latestVersion = latestRelease.tag_name.replace('v', '');
        const currentVersion = getCurrentVersion();

        // Compare the current version with the latest version and notify the user if an update is available
        if (currentVersion && compareVersions(currentVersion, latestVersion)) {
            const downloadLink = latestRelease.html_url;
            ChatLib.chat(`\n${LOGO + GOLD + BOLD}NEW RELEASE: ${WHITE + BOLD}v${latestVersion}`);
            ChatLib.chat(`${GREEN}Download the new version here: ${downloadLink}`);
            ChatLib.chat(`${GREEN}OR install using the forge installer: https://raw.githubusercontent.com/zhenga8533/VolcAddons/main/forge/VolcAddons-1.0.jar\n`);
        } else {
            ChatLib.chat(`\n${LOGO + GREEN + BOLD}You are on the latest version (${WHITE + BOLD}v${currentVersion + GREEN + BOLD})!\n`);
            ChatLib.chat(`${GRAY + BOLD}Changelog:`);
            JSON.parse(FileLib.read("VolcAddons", "changelog.json")).forEach(change => {
                ChatLib.chat(change);
            });
            ChatLib.chat("");
        }
    }).catch(err => ChatLib.chat(LOGO + DARK_RED + (err.cause ?? err)));
}
