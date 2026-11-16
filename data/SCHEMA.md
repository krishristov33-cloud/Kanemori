# Kanemori data files (v0.3) — schema Lumen's build loads

The game fetches these from `data/` at boot (same folder as index.html). Every file is optional: if a file is missing or invalid JSON, the game uses its built-in placeholder data of the same shape and logs a warning (never crashes). Unknown fields are ignored, so you can add extra fields freely.

World coordinates: x from -195 (west) to 195 (east), z from -165 (north, mountain) to 182 (south, sea). Kanemura village centre ≈ (0, 150). Forest ≈ x<45, z -130..110. River runs north-south at x≈60-90. Taki Pool (waterfall) ≈ (66,-104). Jorōgumo's web ≈ (-85,-100). Cave mouth (sealed Kurayami) ≈ (-150,-120).

Building ids in Kanemura (use them for `home`/`work`): `temple`, `shop`, `smith`, `stable`, `inn`, `house1`..`house5`, `shrine`, `well`, `bellframe`. Areas: `kanemura`, `sugi`, `kawa`, `taki`, `web`, `cave`.

Faction ids: `village` (Kanemura folk), `forest` (forest folk: kodama keepers, charcoal burners), `river` (river people: fishers, ferrymen).

## npcs.json
```json
{
  "factions": [ { "id": "village", "name": "Kanemura Folk", "desc": "…", "area": "kanemura" } ],
  "npcs": [ {
    "id": "oharu",                       // unique, lowercase
    "name": "Oharu", "nameJp": "お春",     // nameJp shown only when 'Show Japanese names' is on
    "role": "Shopkeeper",                 // shown under the name
    "faction": "village",
    "home": "house2", "work": "shop",     // building ids (or {"x":..,"z":..})
    "schedule": [ {"from":6,"to":18,"at":"work"}, {"from":18,"to":21,"at":"wander"}, {"from":21,"to":6,"at":"home"} ],
    "persona": {
      "personality": "warm, gossipy, shrewd with money",
      "fears": ["the night yokai", "her son leaving"],
      "wants": ["rare mushrooms", "news from the river"],
      "speech": "short sentences, calls Ren 'young bell-keeper'",
      "secret": "optional hidden fact revealed at high trust"
    },
    "greeting": "Ah, the new bell-keeper!",
    "lines": { "bell": ["…"], "forest": ["…"], "fear": ["…"], "trade": ["…"], "bye": ["…"] },   // topic -> 1+ lines; any topic keys you like
    "likes": ["mushroom", "fish"], "dislikes": ["meat"],          // item ids for gifts
    "shop": { "sells": [ {"item":"salve","price":12} ], "buys": ["fish","hide","mushroom"] },  // optional
    "recruitable": false,                 // can join as a companion
    "combat": { "hp": 120, "dmg": 9 },    // used if recruitable
    "quests": ["q_mushrooms"],            // quest ids this NPC gives
    "start": { "affinity": 10, "trust": 5, "fear": 0 },   // optional starting relationship (-100..100, fear 0..100)
    "look": { "robe": "#7a3b2e", "hat": false, "hair": "#222", "scale": 1.0 }
  } ]
}
```
Item ids available: wood, stone, flint, iron, fiber, herb, mushroom, sap, hide, meat, fish, silk, bamboo, ofuda, salve, tea, tonic, gfish, gmeat, skewer, arrow, firearrow, kunai, coin, koi, and any id you add in lore/quests (unknown ids become generic "curio" items).

## quests.json
```json
{ "quests": [ {
  "id": "q_mushrooms", "title": "Mushrooms for Oharu", "type": "side",   // main | side | secret
  "giver": "oharu",                        // npc or mystery id; omit for auto-start
  "desc": "Oharu wants 5 mushrooms from Sugi no Mori.",
  "after": "q_prev",                       // optional: only offered after this quest is done
  "steps": [
    { "text": "Gather 5 mushrooms", "goal": { "type": "collect", "item": "mushroom", "n": 5 } },
    { "text": "Bring them to Oharu", "goal": { "type": "give", "item": "mushroom", "n": 5, "target": "oharu" } }
  ],
  "reward": { "xp": 60, "coins": 20, "items": {"salve": 2}, "affinity": {"oharu": 15}, "rep": {"village": 10}, "lore": ["l_bell"] }
} ] }
```
Goal types: `collect` (have n of item), `give` (hand n items to target via dialogue), `kill` (target = minion type: kodama/tanuki/mushroom/spiderling/deer or `jorogumo`, n), `talk` (target npc), `visit` (x,z,r), `craft` (item id), `recruit` (target npc), `shard` (n kakera).

## lore.json
```json
{ "lore":  [ { "id": "l_bell", "title": "The Bell of Kanemura", "text": "…", "found": "start" } ],
  "story": [ { "id": "s_prologue", "title": "Typhoon Night", "text": "…", "trigger": "start" } ] }
```
`found` / `trigger`: `start`, `npc:<id>` (after first talk), `quest:<id>` (on completion), `shard:<n>`, `place:<x>,<z>,<r>`, `mystery:<id>`.

## mystery.json
```json
{ "mystery": [ {
  "id": "hermit", "name": "The Masked Hermit", "area": "sugi", "x": -150, "z": -20,
  "look": "hermit",                        // hermit | fox | ringer | generic
  "persona": { "personality": "…", "fears": [], "wants": [], "speech": "riddles" },
  "greeting": "…", "lines": { "bell": ["…"], "orochi": ["…"] },
  "lore": ["l_orochi"],                    // lore unlocked on first talk
  "quest": "q_secret_mask",                // optional secret quest
  "time": "any"                            // any | night | day (when visible)
} ] }
```
