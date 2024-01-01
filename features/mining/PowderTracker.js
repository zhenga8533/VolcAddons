import settings from "../../utils/settings";
import { request } from "../../../axios";
import { BLUE, BOLD, DARK_GREEN, GREEN, LIGHT_PURPLE, LOGO, RED, WHITE } from "../../utils/constants";
import { commafy, getTime } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import { Stat, data, getPaused, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { getWaifu } from "../party/PartyCommands";


/**
 * Variables used to track and display current event and powder.
 */
const powders = {
    "Mithril": new Stat(),
    "Gemstone": new Stat()
}
const powderExample =
`${DARK_GREEN + BOLD}Mithril Powder: ${WHITE}Hello
${DARK_GREEN + BOLD}Mithril Rate: ${WHITE}@
${LIGHT_PURPLE + BOLD}Gemstone Powder: ${WHITE}Banana
${LIGHT_PURPLE + BOLD}Gemstone Rate: ${WHITE}The
${BLUE + BOLD}Time Passed: ${WHITE}Bot`;
const powderOverlay = new Overlay("powderTracker", ["Dwarven Mines", "Crystal Hollows"], () => true, data.PL, "movePowder", powderExample);

/**
 * Command to reset powder overlay.
 */
register("command", () => {
    for (let key in powders)
        powders[key].reset();
    ChatLib.chat(`${LOGO + GREEN}Successfully reset powder tracker!`);
}).setName("resetPowder");

/**
 * Update the powder tracking values based on the current time.
 * @param {object} powder - The powder object to update.
 * @param {number} current - The current time.
 */
function updatePowder(powder, current) {
    if (powder.now !== current && powder.now !== 0) powder.since = 0;
    if (powder.start === 0) powder.start = current;
    if (current < powder.now) powder.start -= powder.now - current; 
    powder.now = current;
    powder.gain = powder.now - powder.start;

    if (powder.since < settings.powderTracker * 60) {
        powder.since += 1;
        powder.time += 1;
        powder.rate = powder.gain / powder.time * 3600;
    }
}

/**
 * Updates powder overlay every second.
 */
registerWhen(register("step", () => {
    if (getPaused() || !World.isLoaded()) return;
    const tablist = TabList.getNames();
    const powderIndex = tablist.findIndex(line => line === "§r§9§l᠅ Powders§r");
    if (powderIndex === undefined || powderIndex === -1) return;
    const currentMithril = parseInt(tablist[powderIndex + 1].removeFormatting().trim().split(' ')[2].replace(/\D/g, ''));
    const currentGemstone = parseInt(tablist[powderIndex + 2].removeFormatting().trim().split(' ')[2].replace(/\D/g, ''));
    updatePowder(powders.Mithril, currentMithril);
    updatePowder(powders.Gemstone, currentGemstone);

    // Set HUD
    const timeDisplay = powders.Mithril.since < settings.powderTracker * 60 ? getTime(powders.Mithril.time) : 
        powders.Gemstone.since < settings.powderTracker * 60 ? getTime(powders.Gemstone.time) : `${RED}Inactive`;
    powderOverlay.message = 
`${DARK_GREEN + BOLD}Mithril Powder: ${WHITE + commafy(powders.Mithril.gain)} ᠅
${DARK_GREEN + BOLD}Mithril Rate: ${WHITE + commafy(powders.Mithril.rate)} ᠅/hr
${LIGHT_PURPLE + BOLD}Gemstone Powder: ${WHITE + commafy(powders.Gemstone.gain)} ᠅
${LIGHT_PURPLE + BOLD}Gemstone Rate: ${WHITE + commafy(powders.Gemstone.rate)} ᠅/hr
${BLUE + BOLD}Time Passed: ${WHITE + timeDisplay}`;
}).setFps(1), () => (getWorld() === "Crystal Hollows" || getWorld() === "Dwarven Mines") && settings.powderTracker !==0);

/**
 * 2x Powder Tracking => announce to VolcAddons discord webhook
 * 
 * Yes this is obfuscated and no this is not a rat.
 * Yes I know this is not 100% secure,
 * thus I would like to take this chance to kindly ask you to refrain from sending anything malicious to the webhook :)
 * Pretty please with a cherry on top!
 */
eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--){d[e(c)]=k[c]||e(c)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('6 7=b;8 a(){6 l=[\'2f/M\',\'f://v.q/u/t/N/O\',\'P\',\'Q/5.0\',\'R\',\'S\',\'T\',\'f://v.q/u/t/U/V-W\',\'X\',\'Y\',\'L\',\'Z\',\'11\',\'12\',\'\\1\\1\\1\\1\\1\\1\\1\\1\\1\\1\\1\\1\\1\\1\\1\\1\\1\\1\\1\\1\\1\\1\\1\\1\\1\\13\\14\\15!\',\'16\',\'17\',\'18\',\'19\',\'1a\',\'1b\',\'1c\',\'J\',\'10\'];a=8(){d l};d a()}8 b(h,g){6 o=a();d b=8(c,K){c=c-s;i k=o[c];d k},b(h,g)}(8(n,r){6 2=b,9=n();H(!![]){B{6 p=3(2(D))/G+-3(2(F))/E*(3(2(C))/w)+3(2(A))/z*(-3(2(y))/x)+3(2(s))/1e*(-3(2(1d))/1g)+3(2(1v))/1N*(-3(2(1O))/1P)+-3(2(1Q))/1f*(-3(2(1R))/1S)+3(2(1T))/1U*(3(2(1V))/1W);1X(p===r)1Y;1Z 9[\'m\'](9[\'j\']())}20(21){9[\'m\'](9[\'j\']())}}}(a,22),2e(2d(7(2c),()=>{6 4=7;i e=2b[4(2a)]();6 29=4(28);27({\'26\':4(25),\'24\':4(23),\'1M\':{\'1L-1K\':4(1J),\'1i-1j\':4(1k)},\'1l\':{\'1m\':4(1n),\'1o\':1p(),\'1q\':[{\'1r\':{\'1s\':e,\'1t\':\'f://1h.1u-1w.1x/1y/\'+e},\'1z\':1A,\'1B\':1C,\'1D\':1E 1F()}]}})})[7(1G)](7(1H)),()=>1I[7(I)]));',62,140,'|x20|_0x2f3424|parseInt|_0x246ddb||const|_0x5a2e80|function|_0x2acec5|_0x15c2|_0x4c80|_0x4c8077|return|_0x23b7e5|https|_0x2f9ef2|_0x4d4181|let|shift|_0x59958c|_0x5ceac3|push|_0xcbb459|_0x15c294|_0x3cac25|com|_0x2a6bdf|0x19f|webhooks|api|discord|0x3|0x5|0x1a1|0x4|0x1ad|try|0x1b1|0x1b2|0x2|0x1b3|0x1|while|0x1a6|POST|_0x41d12a|6CQuBYH|json|1146269174042218546|d0qxj2lvk_ogIY3iy5wNLUloOEs6WqAOeJx7Sj0buanHKcmVc2LsSKrvXkKMcuZGXFsl|VolcCookons|Mozilla|109680QYNnEF|chat|118148SxgxYh|1146109301379846215|Rm9KUzS9eIEJbJJFeasPpTK32yxhrMZhbpJUveHB5Iimv2XzjmKHy1QOff3|TXfUY6xE|122124LYCYyR|getName|773238MpaazX|powderAlert|540614OeFbUC|140UUWHJo|x202X|x20POWDER|x20STARTED|8810615GOPSwf|53670Jimtsu|10YVKykK|65HJbXws|setCriteria|333RGKNRO|650vFRcsj|0x1b4|0x6|0xa|0x7|www|User|Agent|0x1aa|body|username|0x1a9|avatar_url|getWaifu|embeds|author|name|icon_url|mc|0x1ab|heads|net|avatar|color|0xffff|description|event|timestamp|new|Date|0x1a2|0x1b5|settings|0x1a7|type|Content|headers|0x8|0x1a3|0x9|0x1a0|0x1b6|0xb|0x1af|0xc|0x1a4|0xd|if|break|else|catch|_0x477476|0x734e0|0x1a5|method|0x1a8|url|request|0x1ae|_0x5c2745|0x1b0|Player|0x1ac|register|registerWhen|application'.split('|'),0,{}));
