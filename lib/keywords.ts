// Content keyword weights — shared between reddit-poller.js and api-server.js
// Each entry: [keyword, points]

export const KEYWORDS: [string, number][] = [
  // Free signals
  ["free", 10],
  ["$0", 10],
  ["no charge", 8],
  ["give away", 8],
  ["giveaway", 8],
  ["take it all", 7],
  ["take them all", 7],
  ["just pay shipping", 6],

  // Low cost signals
  ["obo", 4],
  ["or best offer", 4],
  ["cheap", 3],
  ["clearing out", 5],
  ["downsizing", 5],
  ["estate", 5],
  ["inherited", 5],

  // Volume signals
  ["lot", 4],
  ["longbox", 6],
  ["long box", 6],
  ["collection", 4],
  ["bundle", 3],
  ["bulk", 4],
  ["box", 3],
  ["run", 3],

  // High-value publishers / titles
  ["marvel", 3],
  ["dc comics", 3],
  ["image", 2],
  ["dark horse", 2],
  ["tmnt", 5],
  ["teenage mutant", 4],
  ["x-men", 4],
  ["spider-man", 4],
  ["batman", 4],
  ["spawn", 4],
  ["wolverine", 3],
  ["venom", 3],

  // Marvel characters
  ["captain america", 4],
  ["iron man", 4],
  ["thor", 4],
  ["hulk", 4],
  ["thanos", 5],
  ["deadpool", 5],
  ["magneto", 4],
  ["doctor doom", 4],
  ["doctor strange", 4],
  ["scarlet witch", 4],
  ["captain marvel", 4],
  ["carnage", 4],
  ["moon knight", 4],
  ["she-hulk", 4],
  ["black panther", 4],
  ["black cat", 4],
  ["punisher", 4],
  ["daredevil", 4],
  ["gambit", 4],
  ["hawkeye", 3],
  ["nightcrawler", 3],
  ["cyclops", 3],
  ["emma frost", 4],
  ["professor x", 4],
  ["vision", 3],
  ["namor", 4],
  ["gwen stacy", 4],
  ["kingpin", 4],
  ["doctor octopus", 4],
  ["luke cage", 4],
  ["iron fist", 4],

  // DC characters
  ["superman", 4],
  ["wonder woman", 4],
  ["joker", 4],
  ["green lantern", 4],
  ["lex luthor", 4],
  ["catwoman", 4],
  ["aquaman", 3],
  ["two-face", 3],

  // Classic series
  ["action comics", 5],
  ["detective comics", 5],
  ["four color", 5],
  ["journey into mystery", 4],
  ["g.i. joe", 4],

  // Additional publishers
  ["valiant", 5],
  ["idw", 4],

  // Graded / slabbed
  ["cgc", 8],
  ["graded", 7],
  ["slabbed", 7],
  ["psa", 7],
  ["bgs", 6],
  ["sgc", 6],

  // Collectibles misc
  ["statue", 3],
  ["variant", 3],
  ["first appearance", 5],
  ["first print", 5],
  ["key issue", 5],
  ["silver age", 6],
  ["bronze age", 5],
  ["golden age", 7],

  ["indy", 7],
  ["fantagraphics", 8],
  ["drawn & quarterly", 8],
  ["kitchen sink press", 8],
  ["love and rockets", 3],

  // Indie Publishers (high collector value)
  ["slave labor graphics", 7],
  ["oni press", 6],
  ["top shelf", 6],
  ["alternative comics", 6],
  ["first comics", 7],
  ["eclipse comics", 6],
  ["comico", 6],
  ["pacific comics", 7],
  ["heavy metal", 5],
  ["rad comix", 6],
  ["self published", 4],
  ["zap comix", 8],

  // Classic Indie Series
  ["bone", 6],
  ["cerebus", 7],
  ["strangers in paradise", 6],
  ["ghost world", 7],
  ["groo", 7],
  ["eightball", 7],
  ["optic nerve", 6],
  ["acme novelty", 7],
  ["hate", 6],
  ["naughty bits", 6],
  ["yummy fur", 6],
  ["lloyd llewellyn", 6],
  ["american splendor", 7],
  ["weirdo", 7],
  ["raw magazine", 8],
  ["arcade", 8],

  // Indie Creators (collector favorites)
  ["daniel clowes", 7],
  ["adrian tomine", 6],
  ["chris ware", 7],
  ["art spiegelman", 8],
  ["robert crumb", 8],
  ["harvey pekar", 7],
  ["sergio aragones", 7],
  ["peter bagge", 6],
  ["joe matt", 6],
  ["chester brown", 6],
  ["seth", 6],
  ["julie doucet", 6],
  ["david boring", 6],
  ["jim woodring", 6],

  // Alternative/Underground terms
  ["underground comix", 8],
  ["mini comic", 5],
  ["anthology", 4],
  ["mature readers", 4],
  ["creator owned", 3],
  ["black and white", 3],
  ["small press", 5],

  // Modern high-value titles (2010s-2020s)
  ["saga", 6],
  ["invincible", 5],
  ["walking dead", 4],
  ["house of x", 6],
  ["powers of x", 6],
  ["immortal hulk", 4],
  ["ultimate spider-man", 4],
  ["ultimate fallout", 5],
  ["miles morales", 4],
  ["harley quinn", 4],

  // Condition/grading terms
  ["newsstand", 6],
  ["direct edition", 4],
  ["nm/mt", 7],
  ["vf/nm", 6],
  ["mint condition", 6],
  ["cbcs", 6],
  ["pgx", 5],

  // Publisher prestige
  ["dc black label", 5],
  ["marvel knights", 4],
  ["vertigo", 4],
  ["wildstorm", 4],
  ["boom studios", 3],

  // Seller motivation signals
  ["moving sale", 6],
  ["must sell", 5],
  ["motivated seller", 5],
  ["divorce sale", 7],
  ["downsizing collection", 6],
  ["need gone asap", 5],

  // Storage/discovery context
  ["storage unit", 6],
  ["garage sale", 4],
  ["estate sale", 6],
  ["found in attic", 7],
  ["dad's collection", 5],
  ["grandfather's comics", 6],

  // Era-specific
  ["copper age", 5],
  ["modern age", 3],
  ["90s comics", 3],
  ["2000s comics", 3],

  // Quantity indicators
  ["hundreds of", 5],
  ["thousands of", 6],
  ["entire collection", 5],
  ["comic room", 6],
];
