/* ==========================================================================
   Cobblemon Dex — starter dataset.
   This is a small demo set (10 evolution lines). To add more Pokémon, push
   more objects into POKEMON_DATA following the same shape.

   SPRITES: assumed filenames in the "sprites" folder are "<id>.gif" for
   normal and "<id>-shiny.gif" for shiny (e.g. sprites/1.gif, sprites/1-shiny.gif).
   If your files are named differently, only spritePath() in
   Config/cobbledex.js needs to change — nothing here.

   MOVES: each move is { name, method, level }.
   method is "level" (learned by leveling up — give a level) or "tm" (taught
   via TM/TR, no level needed).

   Shape:
   {
     id: unique number,
     name: string,
     types: [1 or 2 strings],
     stats: { hp, atk, def, spAtk, spDef, speed },  // 1-255 each
     family: [{ id, name, note }],                  // full evolution line, in order
     moves: [{ name, method: "level"|"tm", level? }, ...]
   }
   ========================================================================== */

const POKEMON_DATA = [
  // --- Bulbasaur line ---
  {
    id: 1, name: "Bulbasaur", types: ["Grass", "Poison"],
    stats: { hp: 45, atk: 49, def: 49, spAtk: 65, spDef: 65, speed: 45 },
    family: [
      { id: 1, name: "Bulbasaur", note: "Base" },
      { id: 2, name: "Ivysaur", note: "Lv. 16" },
      { id: 3, name: "Venusaur", note: "Lv. 32" },
    ],
    moves: [
      { name: "Tackle", method: "level", level: 1 },
      { name: "Growl", method: "level", level: 3 },
      { name: "Vine Whip", method: "level", level: 7 },
      { name: "Leech Seed", method: "level", level: 10 },
      { name: "Poison Powder", method: "level", level: 13 },
      { name: "Sleep Powder", method: "level", level: 15 },
      { name: "Razor Leaf", method: "level", level: 20 },
      { name: "Sweet Scent", method: "level", level: 24 },
      { name: "Growth", method: "level", level: 27 },
      { name: "Solar Beam", method: "tm" },
      { name: "Sludge Bomb", method: "tm" },
      { name: "Synthesis", method: "tm" },
    ],
  },
  {
    id: 2, name: "Ivysaur", types: ["Grass", "Poison"],
    stats: { hp: 60, atk: 62, def: 63, spAtk: 80, spDef: 80, speed: 60 },
    family: [
      { id: 1, name: "Bulbasaur", note: "Base" },
      { id: 2, name: "Ivysaur", note: "Lv. 16" },
      { id: 3, name: "Venusaur", note: "Lv. 32" },
    ],
    moves: [
      { name: "Tackle", method: "level", level: 1 },
      { name: "Growl", method: "level", level: 3 },
      { name: "Vine Whip", method: "level", level: 7 },
      { name: "Leech Seed", method: "level", level: 10 },
      { name: "Poison Powder", method: "level", level: 13 },
      { name: "Sleep Powder", method: "level", level: 15 },
      { name: "Razor Leaf", method: "level", level: 20 },
      { name: "Sweet Scent", method: "level", level: 24 },
      { name: "Growth", method: "level", level: 27 },
      { name: "Solar Beam", method: "tm" },
      { name: "Sludge Bomb", method: "tm" },
      { name: "Synthesis", method: "tm" },
    ],
  },
  {
    id: 3, name: "Venusaur", types: ["Grass", "Poison"],
    stats: { hp: 80, atk: 82, def: 83, spAtk: 100, spDef: 100, speed: 80 },
    family: [
      { id: 1, name: "Bulbasaur", note: "Base" },
      { id: 2, name: "Ivysaur", note: "Lv. 16" },
      { id: 3, name: "Venusaur", note: "Lv. 32" },
    ],
    moves: [
      { name: "Vine Whip", method: "level", level: 7 },
      { name: "Razor Leaf", method: "level", level: 20 },
      { name: "Sweet Scent", method: "level", level: 24 },
      { name: "Growth", method: "level", level: 27 },
      { name: "Petal Dance", method: "level", level: 33 },
      { name: "Solar Beam", method: "tm" },
      { name: "Sludge Bomb", method: "tm" },
      { name: "Synthesis", method: "tm" },
      { name: "Leech Seed", method: "level", level: 10 },
      { name: "Earthquake", method: "tm" },
      { name: "Giga Drain", method: "tm" },
    ],
  },

  // --- Charmander line ---
  {
    id: 4, name: "Charmander", types: ["Fire"],
    stats: { hp: 39, atk: 52, def: 43, spAtk: 60, spDef: 50, speed: 65 },
    family: [
      { id: 4, name: "Charmander", note: "Base" },
      { id: 5, name: "Charmeleon", note: "Lv. 16" },
      { id: 6, name: "Charizard", note: "Lv. 36" },
    ],
    moves: [
      { name: "Scratch", method: "level", level: 1 },
      { name: "Growl", method: "level", level: 4 },
      { name: "Ember", method: "level", level: 7 },
      { name: "Smokescreen", method: "level", level: 10 },
      { name: "Dragon Rage", method: "level", level: 13 },
      { name: "Slash", method: "level", level: 20 },
      { name: "Flamethrower", method: "tm" },
      { name: "Fire Spin", method: "tm" },
      { name: "Wing Attack", method: "tm" },
      { name: "Fire Blast", method: "tm" },
    ],
  },
  {
    id: 5, name: "Charmeleon", types: ["Fire"],
    stats: { hp: 58, atk: 64, def: 58, spAtk: 80, spDef: 65, speed: 80 },
    family: [
      { id: 4, name: "Charmander", note: "Base" },
      { id: 5, name: "Charmeleon", note: "Lv. 16" },
      { id: 6, name: "Charizard", note: "Lv. 36" },
    ],
    moves: [
      { name: "Ember", method: "level", level: 7 },
      { name: "Smokescreen", method: "level", level: 10 },
      { name: "Dragon Rage", method: "level", level: 13 },
      { name: "Slash", method: "level", level: 20 },
      { name: "Flamethrower", method: "tm" },
      { name: "Fire Spin", method: "tm" },
      { name: "Wing Attack", method: "tm" },
      { name: "Fire Blast", method: "tm" },
    ],
  },
  {
    id: 6, name: "Charizard", types: ["Fire", "Flying"],
    stats: { hp: 78, atk: 84, def: 78, spAtk: 109, spDef: 85, speed: 100 },
    family: [
      { id: 4, name: "Charmander", note: "Base" },
      { id: 5, name: "Charmeleon", note: "Lv. 16" },
      { id: 6, name: "Charizard", note: "Lv. 36" },
    ],
    moves: [
      { name: "Slash", method: "level", level: 20 },
      { name: "Flamethrower", method: "tm" },
      { name: "Fire Spin", method: "tm" },
      { name: "Air Slash", method: "tm" },
      { name: "Dragon Claw", method: "tm" },
      { name: "Wing Attack", method: "tm" },
      { name: "Fire Blast", method: "tm" },
      { name: "Dragon Dance", method: "level", level: 40 },
      { name: "Earthquake", method: "tm" },
      { name: "Hyper Beam", method: "tm" },
    ],
  },

  // --- Squirtle line ---
  {
    id: 7, name: "Squirtle", types: ["Water"],
    stats: { hp: 44, atk: 48, def: 65, spAtk: 50, spDef: 64, speed: 43 },
    family: [
      { id: 7, name: "Squirtle", note: "Base" },
      { id: 8, name: "Wartortle", note: "Lv. 16" },
      { id: 9, name: "Blastoise", note: "Lv. 36" },
    ],
    moves: [
      { name: "Tackle", method: "level", level: 1 },
      { name: "Tail Whip", method: "level", level: 4 },
      { name: "Water Gun", method: "level", level: 7 },
      { name: "Withdraw", method: "level", level: 10 },
      { name: "Bite", method: "level", level: 13 },
      { name: "Rapid Spin", method: "level", level: 16 },
      { name: "Protect", method: "tm" },
      { name: "Surf", method: "tm" },
      { name: "Ice Beam", method: "tm" },
    ],
  },
  {
    id: 8, name: "Wartortle", types: ["Water"],
    stats: { hp: 59, atk: 63, def: 80, spAtk: 65, spDef: 80, speed: 58 },
    family: [
      { id: 7, name: "Squirtle", note: "Base" },
      { id: 8, name: "Wartortle", note: "Lv. 16" },
      { id: 9, name: "Blastoise", note: "Lv. 36" },
    ],
    moves: [
      { name: "Water Gun", method: "level", level: 7 },
      { name: "Withdraw", method: "level", level: 10 },
      { name: "Bite", method: "level", level: 13 },
      { name: "Rapid Spin", method: "level", level: 16 },
      { name: "Protect", method: "tm" },
      { name: "Surf", method: "tm" },
      { name: "Ice Beam", method: "tm" },
      { name: "Aqua Tail", method: "tm" },
    ],
  },
  {
    id: 9, name: "Blastoise", types: ["Water"],
    stats: { hp: 79, atk: 83, def: 100, spAtk: 85, spDef: 105, speed: 78 },
    family: [
      { id: 7, name: "Squirtle", note: "Base" },
      { id: 8, name: "Wartortle", note: "Lv. 16" },
      { id: 9, name: "Blastoise", note: "Lv. 36" },
    ],
    moves: [
      { name: "Skull Bash", method: "level", level: 36 },
      { name: "Surf", method: "tm" },
      { name: "Ice Beam", method: "tm" },
      { name: "Hydro Pump", method: "tm" },
      { name: "Aqua Tail", method: "tm" },
      { name: "Flash Cannon", method: "tm" },
      { name: "Rapid Spin", method: "level", level: 16 },
      { name: "Protect", method: "tm" },
    ],
  },

  // --- Pikachu line ---
  {
    id: 10, name: "Pikachu", types: ["Electric"],
    stats: { hp: 35, atk: 55, def: 40, spAtk: 50, spDef: 50, speed: 90 },
    family: [
      { id: 10, name: "Pikachu", note: "Base" },
      { id: 11, name: "Raichu", note: "Thunder Stone" },
    ],
    moves: [
      { name: "Thunder Shock", method: "level", level: 1 },
      { name: "Growl", method: "level", level: 3 },
      { name: "Tail Whip", method: "level", level: 6 },
      { name: "Quick Attack", method: "level", level: 10 },
      { name: "Thunder Wave", method: "level", level: 13 },
      { name: "Agility", method: "level", level: 20 },
      { name: "Electro Ball", method: "tm" },
      { name: "Iron Tail", method: "tm" },
      { name: "Thunderbolt", method: "tm" },
      { name: "Double Team", method: "tm" },
    ],
  },
  {
    id: 11, name: "Raichu", types: ["Electric"],
    stats: { hp: 60, atk: 90, def: 55, spAtk: 90, spDef: 80, speed: 110 },
    family: [
      { id: 10, name: "Pikachu", note: "Base" },
      { id: 11, name: "Raichu", note: "Thunder Stone" },
    ],
    moves: [
      { name: "Quick Attack", method: "level", level: 10 },
      { name: "Agility", method: "level", level: 20 },
      { name: "Volt Tackle", method: "level", level: 1 },
      { name: "Thunderbolt", method: "tm" },
      { name: "Thunder", method: "tm" },
      { name: "Iron Tail", method: "tm" },
      { name: "Focus Blast", method: "tm" },
      { name: "Brick Break", method: "tm" },
    ],
  },

  // --- Eevee / Vaporeon ---
  {
    id: 12, name: "Eevee", types: ["Normal"],
    stats: { hp: 55, atk: 55, def: 50, spAtk: 45, spDef: 65, speed: 55 },
    family: [
      { id: 12, name: "Eevee", note: "Base" },
      { id: 13, name: "Vaporeon", note: "Water Stone" },
    ],
    moves: [
      { name: "Tackle", method: "level", level: 1 },
      { name: "Tail Whip", method: "level", level: 3 },
      { name: "Sand Attack", method: "level", level: 6 },
      { name: "Quick Attack", method: "level", level: 10 },
      { name: "Bite", method: "level", level: 13 },
      { name: "Baton Pass", method: "level", level: 16 },
      { name: "Take Down", method: "level", level: 20 },
      { name: "Swift", method: "tm" },
      { name: "Helping Hand", method: "tm" },
    ],
  },
  {
    id: 13, name: "Vaporeon", types: ["Water"],
    stats: { hp: 130, atk: 65, def: 60, spAtk: 110, spDef: 95, speed: 65 },
    family: [
      { id: 12, name: "Eevee", note: "Base" },
      { id: 13, name: "Vaporeon", note: "Water Stone" },
    ],
    moves: [
      { name: "Water Gun", method: "level", level: 1 },
      { name: "Aurora Beam", method: "level", level: 20 },
      { name: "Aqua Ring", method: "level", level: 26 },
      { name: "Haze", method: "level", level: 33 },
      { name: "Acid Armor", method: "level", level: 40 },
      { name: "Muddy Water", method: "tm" },
      { name: "Ice Beam", method: "tm" },
      { name: "Hydro Pump", method: "tm" },
      { name: "Wish", method: "tm" },
    ],
  },

  // --- Geodude line ---
  {
    id: 14, name: "Geodude", types: ["Rock", "Ground"],
    stats: { hp: 40, atk: 80, def: 100, spAtk: 30, spDef: 30, speed: 20 },
    family: [
      { id: 14, name: "Geodude", note: "Base" },
      { id: 15, name: "Graveler", note: "Lv. 25" },
      { id: 16, name: "Golem", note: "Trade" },
    ],
    moves: [
      { name: "Tackle", method: "level", level: 1 },
      { name: "Defense Curl", method: "level", level: 4 },
      { name: "Rock Throw", method: "level", level: 7 },
      { name: "Magnitude", method: "level", level: 10 },
      { name: "Rollout", method: "level", level: 13 },
      { name: "Self-Destruct", method: "level", level: 20 },
      { name: "Earthquake", method: "tm" },
      { name: "Rock Slide", method: "tm" },
    ],
  },
  {
    id: 15, name: "Graveler", types: ["Rock", "Ground"],
    stats: { hp: 55, atk: 95, def: 115, spAtk: 45, spDef: 45, speed: 35 },
    family: [
      { id: 14, name: "Geodude", note: "Base" },
      { id: 15, name: "Graveler", note: "Lv. 25" },
      { id: 16, name: "Golem", note: "Trade" },
    ],
    moves: [
      { name: "Rollout", method: "level", level: 13 },
      { name: "Explosion", method: "level", level: 25 },
      { name: "Earthquake", method: "tm" },
      { name: "Rock Slide", method: "tm" },
      { name: "Stealth Rock", method: "tm" },
    ],
  },
  {
    id: 16, name: "Golem", types: ["Rock", "Ground"],
    stats: { hp: 80, atk: 120, def: 130, spAtk: 55, spDef: 65, speed: 45 },
    family: [
      { id: 14, name: "Geodude", note: "Base" },
      { id: 15, name: "Graveler", note: "Lv. 25" },
      { id: 16, name: "Golem", note: "Trade" },
    ],
    moves: [
      { name: "Double-Edge", method: "level", level: 36 },
      { name: "Earthquake", method: "tm" },
      { name: "Rock Slide", method: "tm" },
      { name: "Stealth Rock", method: "tm" },
      { name: "Stone Edge", method: "tm" },
      { name: "Fire Punch", method: "tm" },
    ],
  },

  // --- Machop line ---
  {
    id: 17, name: "Machop", types: ["Fighting"],
    stats: { hp: 70, atk: 80, def: 50, spAtk: 35, spDef: 35, speed: 35 },
    family: [
      { id: 17, name: "Machop", note: "Base" },
      { id: 18, name: "Machoke", note: "Lv. 28" },
      { id: 19, name: "Machamp", note: "Trade" },
    ],
    moves: [
      { name: "Karate Chop", method: "level", level: 1 },
      { name: "Low Kick", method: "level", level: 4 },
      { name: "Leer", method: "level", level: 7 },
      { name: "Focus Energy", method: "level", level: 10 },
      { name: "Seismic Toss", method: "level", level: 13 },
      { name: "Submission", method: "level", level: 20 },
      { name: "Bulk Up", method: "tm" },
    ],
  },
  {
    id: 18, name: "Machoke", types: ["Fighting"],
    stats: { hp: 80, atk: 100, def: 70, spAtk: 50, spDef: 60, speed: 45 },
    family: [
      { id: 17, name: "Machop", note: "Base" },
      { id: 18, name: "Machoke", note: "Lv. 28" },
      { id: 19, name: "Machamp", note: "Trade" },
    ],
    moves: [
      { name: "Seismic Toss", method: "level", level: 13 },
      { name: "Submission", method: "level", level: 20 },
      { name: "Dynamic Punch", method: "level", level: 28 },
      { name: "Bulk Up", method: "tm" },
      { name: "Cross Chop", method: "tm" },
      { name: "Rock Slide", method: "tm" },
    ],
  },
  {
    id: 19, name: "Machamp", types: ["Fighting"],
    stats: { hp: 90, atk: 130, def: 80, spAtk: 65, spDef: 85, speed: 55 },
    family: [
      { id: 17, name: "Machop", note: "Base" },
      { id: 18, name: "Machoke", note: "Lv. 28" },
      { id: 19, name: "Machamp", note: "Trade" },
    ],
    moves: [
      { name: "Dynamic Punch", method: "level", level: 28 },
      { name: "Cross Chop", method: "tm" },
      { name: "Bulk Up", method: "tm" },
      { name: "Stone Edge", method: "tm" },
      { name: "Earthquake", method: "tm" },
      { name: "Payback", method: "tm" },
      { name: "Knock Off", method: "tm" },
    ],
  },

  // --- Abra line ---
  {
    id: 20, name: "Abra", types: ["Psychic"],
    stats: { hp: 25, atk: 20, def: 15, spAtk: 105, spDef: 55, speed: 90 },
    family: [
      { id: 20, name: "Abra", note: "Base" },
      { id: 21, name: "Kadabra", note: "Lv. 16" },
      { id: 22, name: "Alakazam", note: "Trade" },
    ],
    moves: [
      { name: "Teleport", method: "level", level: 1 },
      { name: "Confusion", method: "tm" },
      { name: "Disable", method: "tm" },
      { name: "Psybeam", method: "tm" },
    ],
  },
  {
    id: 21, name: "Kadabra", types: ["Psychic"],
    stats: { hp: 40, atk: 35, def: 30, spAtk: 120, spDef: 70, speed: 105 },
    family: [
      { id: 20, name: "Abra", note: "Base" },
      { id: 21, name: "Kadabra", note: "Lv. 16" },
      { id: 22, name: "Alakazam", note: "Trade" },
    ],
    moves: [
      { name: "Confusion", method: "tm" },
      { name: "Disable", method: "tm" },
      { name: "Psybeam", method: "tm" },
      { name: "Psychic", method: "tm" },
      { name: "Recover", method: "tm" },
      { name: "Calm Mind", method: "tm" },
    ],
  },
  {
    id: 22, name: "Alakazam", types: ["Psychic"],
    stats: { hp: 55, atk: 50, def: 45, spAtk: 135, spDef: 95, speed: 120 },
    family: [
      { id: 20, name: "Abra", note: "Base" },
      { id: 21, name: "Kadabra", note: "Lv. 16" },
      { id: 22, name: "Alakazam", note: "Trade" },
    ],
    moves: [
      { name: "Psychic", method: "tm" },
      { name: "Recover", method: "tm" },
      { name: "Calm Mind", method: "tm" },
      { name: "Shadow Ball", method: "tm" },
      { name: "Focus Blast", method: "tm" },
      { name: "Energy Ball", method: "tm" },
      { name: "Dazzling Gleam", method: "tm" },
    ],
  },

  // --- Magikarp line ---
  {
    id: 23, name: "Magikarp", types: ["Water"],
    stats: { hp: 20, atk: 10, def: 55, spAtk: 15, spDef: 20, speed: 80 },
    family: [
      { id: 23, name: "Magikarp", note: "Base" },
      { id: 24, name: "Gyarados", note: "Lv. 20" },
    ],
    moves: [
      { name: "Splash", method: "level", level: 1 },
      { name: "Tackle", method: "level", level: 15 },
      { name: "Flail", method: "level", level: 30 },
    ],
  },
  {
    id: 24, name: "Gyarados", types: ["Water", "Flying"],
    stats: { hp: 95, atk: 125, def: 79, spAtk: 60, spDef: 100, speed: 81 },
    family: [
      { id: 23, name: "Magikarp", note: "Base" },
      { id: 24, name: "Gyarados", note: "Lv. 20" },
    ],
    moves: [
      { name: "Bite", method: "level", level: 1 },
      { name: "Dragon Rage", method: "level", level: 5 },
      { name: "Twister", method: "level", level: 10 },
      { name: "Waterfall", method: "level", level: 20 },
      { name: "Dragon Dance", method: "level", level: 40 },
      { name: "Ice Fang", method: "tm" },
      { name: "Hydro Pump", method: "tm" },
      { name: "Earthquake", method: "tm" },
      { name: "Hyper Beam", method: "tm" },
    ],
  },

  // --- Growlithe line ---
  {
    id: 25, name: "Growlithe", types: ["Fire"],
    stats: { hp: 55, atk: 70, def: 45, spAtk: 70, spDef: 50, speed: 60 },
    family: [
      { id: 25, name: "Growlithe", note: "Base" },
      { id: 26, name: "Arcanine", note: "Fire Stone" },
    ],
    moves: [
      { name: "Bite", method: "level", level: 1 },
      { name: "Roar", method: "level", level: 4 },
      { name: "Ember", method: "level", level: 7 },
      { name: "Flame Wheel", method: "level", level: 13 },
      { name: "Flamethrower", method: "tm" },
      { name: "Extreme Speed", method: "tm" },
    ],
  },
  {
    id: 26, name: "Arcanine", types: ["Fire"],
    stats: { hp: 90, atk: 110, def: 80, spAtk: 100, spDef: 80, speed: 95 },
    family: [
      { id: 25, name: "Growlithe", note: "Base" },
      { id: 26, name: "Arcanine", note: "Fire Stone" },
    ],
    moves: [
      { name: "Flame Wheel", method: "level", level: 13 },
      { name: "Flamethrower", method: "tm" },
      { name: "Extreme Speed", method: "tm" },
      { name: "Fire Blast", method: "tm" },
      { name: "Close Combat", method: "tm" },
      { name: "Crunch", method: "tm" },
      { name: "Wild Charge", method: "tm" },
    ],
  },
];