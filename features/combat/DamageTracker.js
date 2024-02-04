import { BOLD, DARK_GRAY, EntityArmorStand, GOLD, GRAY, LOGO, RED, WHITE, YELLOW } from "../../utils/constants";
import { formatNumber, getTime } from "../../utils/functions/format";
import settings from "../../utils/settings";
import { registerWhen } from "../../utils/variables";


/**
 * Variable used to track all damage ticks around the player.
 */
const unique = new Set();
const damages = [];
const crits = [];
const overloads = [];
const nonCrits = [];

let start = 0;
let last = 0;

function statisticalAnalysis(arr) {
    // Sort array
    const sortedArray = arr.map((value) => parseFloat(value / 20)).sort((a, b) => a - b);
  
    // Max, Min, and Range
    const max = sortedArray[sortedArray.length - 1];
    const min = sortedArray[0];
    const range = max - min;
  
    // Mean
    const sum = sortedArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const mean = sum / sortedArray.length;
  
    // Median
    const median = sortedArray.length % 2 === 0 ?
        (sortedArray[sortedArray.length / 2 - 1] + sortedArray[sortedArray.length / 2]) / 2 :
        sortedArray[Math.floor(sortedArray.length / 2)];
    
    // Inter Quartiles
    const lowerQ = calculatePercentile(sortedArray, 25);
    const upperQ = calculatePercentile(sortedArray, 75);
    const iqr = upperQ - lowerQ;
  
    // Variance and Standard Deviation
    const variance = sortedArray.reduce((accumulator, currentValue) => {
      const diff = currentValue - mean;
      return accumulator + diff * diff;
    }, 0);
    const stdDev = Math.sqrt(variance / sortedArray.length);
  
    const mode = calculateMode(sortedArray);
  
    return { sum, max, min, range, mean, median, mode, lowerQ, upperQ, iqr, variance, stdDev };
  }
  
function calculatePercentile(arr, percentile) {
    const index = (percentile / 100) * (arr.length - 1);
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    const lowerValue = arr[lowerIndex];
    const upperValue = arr[upperIndex];
    const interpolationFactor = index - lowerIndex;

    return lowerValue + (upperValue - lowerValue) * interpolationFactor;
}
  
function calculateMode(arr) {
    const countMap = new Map();

    // Iterate through the array to count the occurrences of each number
    for (const number of arr) {
        if (countMap.has(number)) {
            countMap.set(number, countMap.get(number) + 1);
        } else {
            countMap.set(number, 1);
        }
    }

    let mode = null;
    let maxCount = 0;

    // Find the number with the highest count
    countMap.forEach((count, number) => {
        if (count > maxCount) {
            mode = number;
            maxCount = count;
        }
    });

    return mode;
}

/**
 * Tracks any instance of damage around the player and displays it in chat.
 */
registerWhen(register("tick", () => {
    const player = Player.asPlayerMP().getEntity();
    const stands = World.getWorld()
        .func_72839_b(player, player.func_174813_aQ().func_72314_b(16, 16, 16))
        .filter(entity => entity instanceof EntityArmorStand);
    let ticked = false;

    // Get damage stands
    stands.forEach(stand => {
        const name = stand.func_95999_t();

        if (name.startsWith("§7") && !isNaN(name.removeFormatting().replace(/,/g, ''))) nonCrits.push(name);
        else if (name.startsWith("§f✧")) crits.push(name);
        else if (name.startsWith("§f✯")) overloads.push(name);
        else return;

        last = Date.now() / 1000;
        ticked = true;

        const num = name.removeFormatting().replace(/[^0-9.]/g, '');
        if (!unique.has(num)) {
            unique.add(num);
            ChatLib.chat(name);
        }
        damages.push(num);
    });

    // Check for initial damage tick
    if (damages.length === 0) return;
    else if (start === 0) start = Date.now() / 1000;

    // Do calcs when no new damage ticks
    if (!ticked && last - start > 1) {
        if (settings.damageTracker === 2) {
            const { sum, max, min, range, mean, median, mode, lowerQ, upperQ, iqr, variance, stdDev } = statisticalAnalysis(damages);
            
            const time = Date.now()/1000 - start;
            ChatLib.chat(`\n${LOGO + GOLD + BOLD}Damage Statistical Analysis ${GRAY}[${getTime(time, 2)}]\n`);
            
            ChatLib.chat(`${RED + BOLD}Extremas:`);
            ChatLib.chat(`  ${DARK_GRAY}- ${YELLOW}Max Damage: ${WHITE + formatNumber(max * 20)}`);
            ChatLib.chat(`  ${DARK_GRAY}- ${YELLOW}Min Damage: ${WHITE + formatNumber(min * 20)}`);
            ChatLib.chat(`  ${DARK_GRAY}- ${YELLOW}Range: ${WHITE + formatNumber(range * 20)}`);

            ChatLib.chat(`${RED + BOLD}Central Tendency:`);
            ChatLib.chat(`  ${DARK_GRAY}- ${YELLOW}Mean: ${WHITE + formatNumber(mean * 20)}`);
            ChatLib.chat(`  ${DARK_GRAY}- ${YELLOW}Median: ${WHITE + formatNumber(median * 20)}`);
            ChatLib.chat(`  ${DARK_GRAY}- ${YELLOW}Mode: ${WHITE + formatNumber(mode * 20)}`);

            ChatLib.chat(`${RED + BOLD}Interquartiles:`);
            ChatLib.chat(`  ${DARK_GRAY}- ${YELLOW}Upper Quartile ${GRAY}(75%): ${WHITE + formatNumber(upperQ * 20)}`);
            ChatLib.chat(`  ${DARK_GRAY}- ${YELLOW}Lower Quartile ${GRAY}(25%): ${WHITE + formatNumber(lowerQ * 20)}`);
            ChatLib.chat(`  ${DARK_GRAY}- ${YELLOW}Interquartile Range: ${WHITE + formatNumber(iqr * 20)}`);

            ChatLib.chat(`${RED + BOLD}Dispersion:`);
            ChatLib.chat(`  ${DARK_GRAY}- ${YELLOW}Variance: ${WHITE + formatNumber(variance)}`);
            ChatLib.chat(`  ${DARK_GRAY}- ${YELLOW}Standard Deviation: ${WHITE + formatNumber(stdDev)}`);

            ChatLib.chat(`\n${GOLD + BOLD}DPS: ${WHITE + formatNumber(sum / time)}\n`);
        }

        unique.clear();
        damages.length = 0;
        start = 0;
        last = 0;
    }
}), () => settings.damageTracker !== 0);
