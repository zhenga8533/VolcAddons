// Import required dependencies and constants
import axios from "../../axios";
import { delay } from "./thread";
const { BOLD, GOLD, GREEN, LOGO, WHITE } = require('./constants');

/**
 * Retrieves the current version of the addon from the metadata.json file.
 * @returns {string|null} The current version, or null if reading the version fails.
 */
function getCurrentVersion() {
    try {
        const metadataJson = FileLib.read("VolcAddons", "metadata.json");
        const metadata = JSON.parse(metadataJson);
        return metadata.version;
    } catch (error) {
        console.error('Failed to read current version:', error);
        return null;
    }
}

/**
 * Fetches the latest release version from the GitHub repository and notifies the user if a new release is available.
 */
function getLatestReleaseVersion() {
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
        if (currentVersion && currentVersion !== latestVersion) {
            const downloadLink = latestRelease.html_url;
            ChatLib.chat(`\n${LOGO} ${GOLD}${BOLD}NEW RELEASE: ${WHITE}${BOLD}v${latestVersion}`);
            ChatLib.chat(`${GREEN}Download the new version here: ${downloadLink}\n`);
        }
    }).catch(error => {
        console.error("Failed to fetch releases:", error);
    });
}

// Register an event handler to check for the latest release once the world is loaded
const once = register("worldLoad", () => {
    delay(getLatestReleaseVersion, 3000);
    once.unregister();
});
