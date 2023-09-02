import { request } from "../../../axios";
import settings from "../../settings";
import { BLUE, BOLD, DARK_GREEN, GREEN, LIGHT_PURPLE, LOGO, RED, WHITE } from "../../utils/constants";
import { commafy, getTime } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import { Stat, data, getPaused, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { getWaifu, setWaifu } from "../general/PartyCommands";


/**
 * Variables used to track and display current event and powder.
 */
const powders = {
    "Mithril": new Stat(),
    "Gemstone": new Stat()
}
const powderExample =
`${DARK_GREEN}${BOLD}Mithril Powder: ${WHITE}Hello
${DARK_GREEN}${BOLD}Mithril Rate: ${WHITE}@
${LIGHT_PURPLE}${BOLD}Gemstone Powder: ${WHITE}Banana
${LIGHT_PURPLE}${BOLD}Gemstone Rate: ${WHITE}The
${BLUE}${BOLD}Time Passed: ${WHITE}Bot`;
const powderOverlay = new Overlay("powderTracker", ["Dwarven Mines", "Crystal Hollows"], () => true, data.PL, "movePowder", powderExample);

/**
 * Command to reset powder overlay.
 */
register("command", () => {
    for (let key in powders)
        powders[key].reset();
    ChatLib.chat(`${LOGO} ${GREEN}Successfully reset powder tracker!`);
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
    if (getPaused()) return;
    const tablist = TabList?.getNames();
    const powderIndex = tablist?.findIndex(line => line === "§r§9§l᠅ Powders§r");
    if (powderIndex === undefined || powderIndex === -1) return;
    const currentMithril = parseInt(tablist[powderIndex + 1].removeFormatting().trim().split(' ')[2].replace(/\D/g, ''));
    const currentGemstone = parseInt(tablist[powderIndex + 2].removeFormatting().trim().split(' ')[2].replace(/\D/g, ''));
    updatePowder(powders.Mithril, currentMithril);
    updatePowder(powders.Gemstone, currentGemstone);

    // Set HUD
    const timeDisplay = powders.Mithril.since < settings.powderTracker * 60 ? getTime(powders.Mithril.time) : 
        powders.Gemstone.since < settings.powderTracker * 60 ? getTime(powders.Gemstone.time) : `${RED}Inactive`;
    powderOverlay.message = 
`${DARK_GREEN}${BOLD}Mithril Powder: ${WHITE}${commafy(powders.Mithril.gain)} ᠅
${DARK_GREEN}${BOLD}Mithril Rate: ${WHITE}${commafy(powders.Mithril.rate)} ᠅/hr
${LIGHT_PURPLE}${BOLD}Gemstone Powder: ${WHITE}${commafy(powders.Gemstone.gain)} ᠅
${LIGHT_PURPLE}${BOLD}Gemstone Rate: ${WHITE}${commafy(powders.Gemstone.rate)} ᠅/hr
${BLUE}${BOLD}Time Passed: ${WHITE}${timeDisplay}`;
}).setFps(1), () => (getWorld() === "Crystal Hollows" || getWorld() === "Dwarven Mines") && settings.powderTracker !==0);

/**
 * 2x Powder Tracking => announce to VolcAddons discord webhook
 * 
 * Yes this is obfuscated and no this is not a rat.
 * Yes I know this is not 100% secure,
 * thus I would like to take this chance to kindly ask you to refrain from sending anything malicious to the webhook :)
 * Pretty please with a cherry on top!
 */
eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--){d[e(c)]=k[c]||e(c)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('c 4=f;9 f(J,L){c H=d();b f=9(g,Z){g=g-(1W*-7+1V+-1U);p I=H[g];b I},f(J,L)}9 d(){c D=[\'1T\',\'1S\\1R\',\'1Q\',\'M/1P\',\'\\2⚑\\1O\\1N\\2\',\'u://1M\',\'1L\',\'O\',\'U\',\'1J\',\'T\',\'1w\',\'1I\',\'V\',\'j\',\'1H\',\'P\',\'1G\',\'1F\',\'1E\',\'1D\',\'z\',\'1C\',\'46/1B\',\'q\',\'1A\',\'1z\',\'1y!\',\'1x/5.\',\'1X\',\'\\2\\2\\2\\2\\2\\1K\\1Y\',\'\\2\\2\\2\\2\\2\\2\\2\\2\\2\\2\',\'2e\',\'2r\',\'2q\',\'2p\\2o\',\'.2n/2m\',\'2l\',\'2k\',\'2j\',\'2i\',\'2h\',\'2g\',\'2f\',\'2d\',\'u://20\',\'2c\',\'2b\',\'2a\',\'29/1u\',\'27\\26\',\'25\',\'n/24\',\'M/23\',\'22\\21\',\'C\',\'1Z\',\'w.1v-1o\',\'1t\',\'R\',\'X.Y/\'];d=9(){b D};b d()}(9(B,m){c 3=f,e=B();W(!![]){10{c k=-6(3(1f))/(1s+1r*-7+y*1q)*(6(3(1p))/(-y*E+1n+-1m))+-6(3(1l))/(1k*-1j+7*1i+-1h*7)+6(3(1g))/(1e*h+-11+1d*1c)*(6(3(1b))/(-1a+19+7*-18))+6(3(17))/(-h*-16+-15+14)*(-6(3(13))/(-12+-h*2s+-28*-7))+-6(3(2u))/(-2O*-3G+-3F+3E)*(6(3(3D))/(3C+-3B+3A*-7))+-6(3(3z))/(-3y+-3x+3v)*(-6(3(3k))/(7*3u+3t+-2t*7))+6(3(E))/(-3r+3q*7+-3p*7);3o(k===m)3n;3m e[\'v\'](e[\'x\']())}3l(3H){e[\'v\'](e[\'x\']())}}}(d,3w+-3I*-3W+-47),45(44(4(43),()=>{c 1=4,8={\'V\':9(A){b A()},\'z\':1(N)+1(G)+1(F)+1(42)+1(41)+1(40)+1(3Z)+1(3Y)+1(3X),\'T\':9(S,Q){b S(Q)},\'O\':1(N)+1(G)+1(F)+1(3V)+1(3K)+1(3U)+1(3S)+1(3R)+1(3Q)+1(3P)+1(3O)+1(3N)+\'l\',\'P\':1(3J),\'R\':1(3i)+1(2T),\'U\':1(3h)+\'0\',\'C\':1(2P)+\'s\',\'j\':9(o){b o()},\'q\':1(2N)+1(2M)+1(2L)+\'!\'};8[1(2K)](2J);p i=2I[1(2H)]();c 2F=8[1(2v)];8[1(2E)](2D,{\'2C\':8[1(2B)],\'2A\':8[1(2z)],\'2y\':{\'2x-2w\':8[1(2R)],\'2G-2S\':8[1(3g)]},\'3f\':{\'3e\':8[1(3d)],\'3c\':8[1(3a)](39),\'38\':[{\'37\':{\'35\':i,\'2U\':1(34)+1(33)+1(32)+\'r/\'+i},\'30\':2Z,\'2Y\':8[1(2X)],\'2W\':2V 48()}]}})})[4(3j)+\'a\'](4(K)+4(K)+4(31)+4(3b)+4(36)),()=>2Q()===4(3L)+4(3M)&&3T[4(3s)+\'t\']!==![]));',62,257,'|_0|x20|_1|_2||parseInt|0x1|_3|function||return|const|_4|_5|_6|_7|0x3|_8|UiMIz|_16||_14||_20|let|pgWVX||||https|push||shift|0x9|AkhPS|_17|_15|DJcgg|_13|0x17f|0x180|0x18b|_9|_10|_11|0x16e|_12|ks|0x17c|nVNub|ZAHta|_19|JhabR|_18|lVEve|uEVzu|cMOWw|while|scord|com|_23|try|0x3a3|0x234f|0x175|0x6ad|0xe69|0x296|0x19b|0x7e1|0x15c0|0xdda|0x178|0x4|0x3e|0xe5|0x16f|0x187|0x1b76|0x20b9|0x30|0x1c|0x182|0xfea|0x1d63|heads|0x1a2|0x1d|0x1fa3|0x1e9f|applicatio|webhoo|mc|VolcCookon|Mozilla|TED|atFaXaCHAX|1740422185|d0qxj2l|16532EvAMEF|Vc2LsSKrvX|6WqAOeJx7S|613217fTuNtv|ALD|18VDTdbb|OBUNGeBbUg|kKMcuZGXFs|x202X|powderAler|ww|x202x|x20The|ProAxas|POST|x20Ho|Crystal|31338RMEvjY|0x16aa|0x1a38|0x222|setCriteri|x20P|1673564jpUNAH|di|x20eve|Powder|1146269|json|866781yYuEQD|x20STAR|OWDER|0x3b5f|api|9860640OUFxvc|ChupIDPIoC|llows|getName|55JEpsHN|vk_ogIY3iy|oeBskitLaX|5VBaovP|j0buanHKcm|120ftVQFK|1599577JdLXnl|chat|avata|net|x20started|nt|5wNLUloOEs|136NJmKIO|0x803|0x374f|0x170|0x1a1|type|Content|headers|0x19c|method|0x193|url|request|0x196|_22|User|0x17b|Player|setWaifu|0x199|0x172|0x185|0x190|0x26f|0x197|getWorld|0x18a|Agent|0x183|icon_url|new|timestamp|0x1a4|description|0xffff|color|0x16d|0x173|0x188|0x191|name|0x1a7|author|embeds|getWaifu|0x19a|0x181|avatar_url|0x186|username|body|0x194|0x1a8|0x189|0x16c|0x19e|catch|else|break|if|0x3ce|0x26b9|0x22df|0x192|0x244d|0x130d|0x3b78|0xa48c6|0x1743|0x242b|0x176|0x21af|0x4f0|0x26a8|0x18c|0xe5a|0x1a7d|0x5|_21|0xa2a|0x18e|0x1a5|0x18d|0x17d|0x195|0x1a0|0x177|0x19f|0x171|0x17a|settings|0x1a3|0x184|0x138|0x19d|0x1a6|0x179|0x17e|0x198|0x18f|0x174|register|registerWhen||0x10403f|Date'.split('|'),0,{}))
