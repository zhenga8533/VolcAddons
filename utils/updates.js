import axios from "../../axios";
import { delay } from "./thread";
const { BOLD, GOLD, GREEN, LOGO, WHITE } = require('./constants');


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

function getLatestReleaseVersion() {
    const releasesUrl = `https://api.github.com/repos/zhenga8533/VolcAddons/releases`;

    axios.get(releasesUrl).then(response => {
        const releases = response.data;

        if (!Array.isArray(releases) || releases.length === 0) {
            console.log("No releases found for the repository.");
            return;
        }

        const latestRelease = releases[0];
        if (!latestRelease.tag_name) {
            console.log("Unable to find the latest release tag.");
            return;
        }

        const latestVersion = latestRelease.tag_name.replace('v', '');
        const currentVersion = getCurrentVersion();

        if (currentVersion && currentVersion !== latestVersion) {
            const downloadLink = latestRelease.html_url;
            ChatLib.chat(`\n${LOGO} ${GOLD}${BOLD}NEW RELEASE: ${WHITE}${BOLD}v${latestVersion}`);
            ChatLib.chat(`${GREEN}Download the new version here: ${downloadLink}\n`);
        }
    }).catch(error => {
        console.error("Failed to fetch releases:", error);
    });
}

const once = register("worldLoad", () => {
    delay(getLatestReleaseVersion, 3000);
    once.unregister();
});
