// Offensive / vulgar / slur words excluded from the bonus dictionary and grids.
const BLOCK = new Set(`
anal anus arse arses ass asses asshole bastard bastards bitch bitches bitchy blowjob bollock bollocks boner boob boobs booby
butt butts buttock buttocks clit cock cocks coon coons crap crappy cum cunt cunts damn damned dick dicks dildo dildos dyke dykes
fag fags faggot fagot fart farts fuck fucked fucker fucks gay gays gook gooks hell hells homo homos hooker horny jap japs jerkoff
jizz kike kikes kinky lesbo lust lusty milf negro negroes nigger nigga nazi nazis orgasm orgy orgies pecker penis penises piss
pissed pisses poo poop porn porno prick pricks pube pubes pubic pussy queer queers rape raped raper rapes rapist rectum retard
scrotum semen sex sexy shag shit shits shitty skank slag slut sluts slutty smut sodomy spic spics spunk tit tits titty turd turds
twat twats vagina vulva wank wanker whore whores wop wops dago dagos chink chinks gringo honky honkies tranny wetback crotch
coital pantie panties bimbo bimbos hussy floozy pimp pimps raunchy sperm testes testicle genital incest pedo nude nudes nudity erotic erection
`.trim().split(/\s+/));
module.exports = { BLOCK };
