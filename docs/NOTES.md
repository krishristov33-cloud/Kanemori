# KANEMORI 鐘守 — Keeper of the Shattered Bell · prototype v0.1 (Lumen)
*2026-11-16 · Apex Team · single file `index.html` (three.js 0.164.1 from unpkg, `?cdn=1` = jsDelivr). Serve the folder (`python3 -m http.server`) or open in Chrome/Edge with internet.*

Names follow Krea's design doc (`Apex/Projects/Kanemori.md`) and numbers follow `Balance and Content v0.1 - Krea.md`; motion follows Aether's spec. The hero is **Ren** (male). Shards = **kakera**. The mountain = **Nemuriyama**.

## Premise
The great bell of Kanemura kept Yamata no Orochi dreaming inside Nemuriyama. On a typhoon night it cracked, and its 8 kakera flew up the mountain. Ren, the new Kanemori, must win them back. Each kakera is sealed into his body as a glowing gold kintsugi crack.

## v0.1 slice: one valley
| Area | What's there |
|---|---|
| **Kanemura 鐘村** (south, start) | Broken bell frame, houses, torii, vending machine, pylon, **forge/anvil** (crafts weapons), sodium lamps |
| **Sugi no Mori 杉の森** (west/centre) | Dense instanced cedar forest, mist, kodama, tanuki, mushroom yokai, herbs, mushrooms, fiber |
| **Kawa River 川** (east) | River ribbon with banks, rust-rock iron ore, bamboo grove, deer, fishing |
| **Taki Pool 滝壺** (north-east) | The river falls off the upper-mountain cliff into a pool (animated waterfall + mist); fishing spot with a 3% golden koi |
| **Jorōgumo's Web 女郎蜘蛛の巣** (north-west) | Boss arena: 6 giant trunks, a radial web at 10 m, 3 glowing anchor threads, arena mist, gold shard beacon |
| Sealed regions | Kurayami Caves, Kawa Gorge, Taki no Kami, Hotaru Lagoon, Arashi Coast, Take Highlands, Yuki no Mine: shown hatched and locked on the scroll map, with their bosses. Data lives in `REGIONS[]` |

The sea is visible to the south (Arashi Coast direction). The upper mountain rises steeply to the north as a hard edge.

## Boss: Jorōgumo (900 HP, 2 phases, weak to fire ×1.5)
- **Phase 1, the canopy lady.** She hangs on a silk line and glides between web nodes in threes (weave, weave, attack). Her attacks: **silk lash** (fan-raise tell plus a red ground marker, 2 whips of 18, parryable), **web shot** (white marker, roots you for 1.5 s; Q struggles free), **drop strike** (shadow sharpens for 0.8 s, 22 AoE, then she stays low for about 1.5 s so melee can land), and **spiderling call** (3 adds with 15 HP). She retreats up after every 3 attacks. **Cutting an anchor thread** (melee its glowing stake) drops her, stunned for 3 s, taking ×1.5 damage. Threads regrow after 10 s. Fire ofuda hit her anywhere.
- **Phase 2 at 50%.** A bell ring and ripple, then the mist burns off and her spider half (8 legs and a striped abdomen) is revealed. She skitters in staccato bursts and stops. Her attacks: **charge** (25, marker tell, dodge it, not parryable), **3-hit leg combo** (12 each; a perfect parry on the 3rd hit staggers her for 2.4 s), and **ground web ring** (a slowing zone for 6 s).
- **Defeat.** She shrinks into rising silk, and the kakera falls slowly under a gold beacon. Catch it to get a bell ring, a gold crack on the right forearm and cheek, +20 max HP, +10 max spirit, 500 XP and silk, then the "To be continued" card.
- Walking more than 48 m away resets her. Dying also resets her.

## Systems (implemented)
- **Controller:** third-person orbit camera (pointer lock, or drag), WASD, Shift sprint (9 m/s, 12 st/s), run 6, Space jump, Q dodge roll (0.35 s, i-frames 0.05–0.30, 20 st). Terrain-following, collisions with trees, rocks, houses and huts.
- **Combat:** LMB light combo (3 hits on bokken and yari, 4 on katana), RMB heavy, F block (chips 30%). Tapping F within 0.18 s (0.22 with the skill) of a hit is a **perfect parry**: bell tone, ground ripple, screen ripple, short slow-mo, enemy stagger, next hit ×2 (×3 with Bell Counter). A **perfect dodge** gives 0.3× slow-mo for 0.5 s. Tab locks on, and the camera frames the target and pulls back for the boss. Hit-stop (light 35 ms, heavy 70 ms), heavy camera shake, slash trail, sparks and floating damage numbers (crit gold, fire orange, player red, XP green).
- **Weapons (Krea numbers):** bokken 8/18, katana 14/32 (3 iron, 2 wood, 1 hide), yari 12/28 with 3 m reach and a narrow arc (2 iron, 3 bamboo, 1 fiber). Forged at the Kanemura anvil or next to any lit campfire. Each has its own swing animation (yari thrust vs katana arcs).
- **Minions:** kodama (20 HP, freeze-rattle tell then zigzag flight, sap), tanuki trickster (45 HP, belly puffs as the tell, then a belly-bounce charge for 10; **steals an item** on hit and flees, and you get it back by killing it), mushroom yokai (60 HP, cap swells and glows for 1 s, then a spore ring for 8 plus poison at 3/s for 4 s; hitting it during the tell pops it for double damage), spiderlings (boss adds). **Deer** freeze and then bound away (meat, hide). Loot orbs fly to you. Respawning keeps the population stable. **Night:** enemies have +30% HP and ×1.5 XP, and more spawn.
- **Gathering (E):** cedars (3 wood each, become stumps and regrow; resin/sap chance), stones (stone, flint), rust rocks (iron), fiber grass, yomogi herbs, mushrooms, bamboo. Every node respawns.
- **Crafting (I/C):** tabs for Weapons, Camp, Remedies and Cooking, with live cost colours and "needs fire/forge" hints. First-time crafts give 10 XP.
- **Building (B):** campfire (3 wood, 1 stone) and lean-to (4 wood, 2 fiber) are placed in front of you and grow in. Campfires burn fuel, rain or storm can put them out unless a lean-to covers them, and E relights for 1 wood (or hit one with a fire ofuda). The lean-to is your respawn point.
- **Survival (Krea rates):** hunger −1 per 6 s, doubled when sprinting or fighting. Warmth: night −0.5/s, rain −1/s, storm −2/s, ×1.5 when wet; fire +4/s, shelter +2/s. Wetness: rain +3/s, water +40/s, fire −6/s, shelter −2/s. At zero hunger you lose 1 HP/s and stamina regen halves; at zero warmth you lose 2 HP/s and move 25% slower. The body shows it: shivering, hunching and breath puffs when cold, and a cold screen frost.
- **Weather and time:** 12-minute day (8 day, 4 night), sky and fog grading through dawn and dusk. Weather cycles clear (4 min), cloudy (1), rain (2), then a 40% storm (2 min, with a **20 s warning**: orange sky, birds flee, low drum, banner). Fog appears too. Storms bring lightning that hits you for 18 when you're not sheltered. Quest step 5 forces the first storm.
- **Remedies and food:** healing salve (+40 over 3 s), fever tea (warmth stops draining for 90 s), stamina tonic (×2 regen for 60 s), grilled ayu, venison skewer (+10% damage for 2 min), mushroom stew (+30 warmth, regen). You can eat raw food (raw meat costs HP). Use from the hotbar (1–8) or by clicking in the inventory.
- **Fishing:** press E facing the water. You cast a bobber and wait 2–5 s for a bite, then press E while the marker sweeps through the green zone. The Taki Pool has a 3% golden koi.
- **XP and levels:** next level needs `100 × level^1.5`. Each level gives +10 HP, +5 stamina, +5 spirit, 1 skill point, a bell ring and a title card. XP also comes from new areas (25), goals (25), first crafts (10) and storms survived (40).
- **Skill tree (K):** Krea's 12 nodes in Blade / Hunter / Kami / Hearth, each node needing the one before it. Implemented: Keen Edge, Bell Parry, Bell Counter, Skinner, Silent Step, **Fire Ofuda**, Spirit Well, Thrift, Long Feast, Hut Craft. **Stubs** (shown, but not functional yet): Yumi Bow and Earth Wall.
- **Magic:** the Fire ofuda (X, learned in the Kami branch) costs 15 spirit and throws a spinning paper talisman for 25 damage plus burning (×1.5 on Jorōgumo). It lights unlit campfires. It homes in on the lock-on target, or flies where the camera aims.
- **HUD:** brush-style health, stamina and spirit bars, an XP bar and level, status chips (fire, sheltered, soaked, freezing, starving, poisoned, rooted, buffs). There's a compass strip with a quest marker and a rotating round minimap with the **survival ring** (hunger, warmth, wetness), structures, threats and the boss marker. Also: a bell-shaped 8-segment kakera tracker, a goal tracker with side hints, an 8-slot hotbar, an interaction prompt, the boss bar with a 50% phase tick, a loot toast feed, area title cards with Japanese names, and a time/weather readout.
- **Screens:** intro and prologue, pause (resume, save, load, mute, post FX, new game), controls (F1), inventory and crafting, skill tree, **scroll map (M)** with fog of war over the valley plus sealed regions, death ("Rise again" at your last lean-to, nothing lost), and the victory card.
- **Goal chain (8 steps):** gather, make camp, defeat 3 yokai, forge a weapon, survive the storm, find the web, defeat Jorōgumo, then free roam.
- **Tech (carried over from Mountain Drop):** on-screen error box, CDN fallback and boot watchdog, lazy optional bloom and grade post-FX (G toggles it, `?fx=0` disables), auto quality drop (FX off, then shadows off and lower resolution), localStorage save `kanemori.v1` (autosaves every 30 s and on milestones), `window.KM` debug hooks.

## Controls
WASD move · Shift sprint · Space jump · Q dodge · LMB light · RMB heavy · F block/parry · Tab lock-on · X fire ofuda · E gather/interact/fish · B build · I or C inventory/crafting · K skills · M map · 1–8 hotbar · Esc/P pause · F1 help · G post FX · arrow keys turn the camera

## Tests (headless Chromium + SwiftShader, Playwright, `test.py`)
- **0 console errors and 0 page errors** across the full scripted run. It covers a new game, gather and craft (campfire, lean-to, katana, grilled fish, salve), placing structures, storm at night, lock-on combat, levelling to 5, learning skills, opening the crafting screen, entering the boss arena, casting fire, phase 2, defeat, catching the kakera (shards 0→1, cracks added, victory card), the scroll map, real keyboard movement and dodge, and the pause menu.
- Screenshots: `shot_v01_explore`, `_combat`, `_camp_storm`, `_skilltree`, `_crafting`, `_boss`, `_boss_p2`, `_kakera`, `_map`, `_pause`.
- **Not verified:** frame rate on a real GPU, and a full 20–30 minute hands-on playthrough. The boss fight was forced with debug damage in the test, so the balance of the real fight is untested.

## Known gaps (honest)
- **Aether's motion module (`motion/kanemori-motion.js`) is not integrated yet.** It arrived mid-build, and its `bell.render()` replaces the renderer call, which would need care with the post-FX composer. v0.1 uses my own implementation of the same spec: hit-stop, slow-mo on perfect dodge and parry, the bell ripple (synth bell plus ground rings plus screen ripple), lean, landing squash, cold and tired posture, tier hooks, minion tells and Jorōgumo's two movement languages. Wiring the module in is the first v0.2 task.
- Ren is a primitive-built mid-poly figure with procedural animation, not a rigged mesh. There's no swimming; the river is shallow and slows you.
- Missing: the bow and Earth Wall (stubs), the hut and minka tiers, ink/soot for talismans (the ofuda uses spirit only), the antidote, kitsune scouts, tanuki disguises, onsen and shrines, and the Silk Step power (named on pickup, not usable).
- Night "silent" variants only scale stats; they have no unique visuals.
- Fog of war is only saved for the cells you've walked through. The scroll map isn't an animated unrolling scroll.
- Post FX is off in the screenshots (`?fx=0`, for SwiftShader speed). On a real GPU, bloom makes the gold cracks, lamps and shard glow.

## Next steps (v0.2)
1. Integrate Aether's motion module behind a feature flag with a fallback.
2. Playtest the win path at level 4–5 with the katana and tune Jorōgumo (target 3–4 min).
3. Add the bow, Earth Wall, the hut tier and ink crafting. Make Silk Step a usable grapple to web and branch points.
4. Open region 2 (Kurayami Caves, Ōmukade) using the `REGIONS` / `MINION_DEF` / `QUEST` tables.
5. Build a rigged hero mesh from `concepts/01_warrior.png`, with gold-crack decals per kakera.

## Files
`index.html` (current) · `index_v01_first.html` (first stable build) · `src/` (source parts that are concatenated into index.html) · `concepts/01_warrior.png 02_creatures.png 03_vista.png 04_hud.png` + `jobs.txt` · `test.py` · `shot_v01_*.png`
