// Content keyword weights — shared between reddit-poller.js and api-server.js
// Each entry: [keyword, points]

export const KEYWORDS = [
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

  // Graded / slabbed
  ["cgc", 8],
  ["graded", 7],
  ["slabbed", 7],
  ["psa", 7],
  ["bgs", 6],
  ["sgc", 6],

  // Collectibles misc
  ["funko", 3],
  ["action figure", 3],
  ["statue", 3],
  ["variant", 3],
  ["first appearance", 5],
  ["first print", 5],
  ["key issue", 5],
  ["silver age", 6],
  ["bronze age", 5],
  ["golden age", 7],

  ["indy", 7],
  ["fantagraphics", 3],
  ["drawn & quarterly", 3],
  ["love and rockets", 3],
];
