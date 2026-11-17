# KANEMORI v0.5 — build notes (Lumen)

Built from v0.4 (backups: `backups/index_v04_pre_v05.html`, `backups/src_v04/`). `index.html` is concatenated from `src/` by `./build.sh`. New v0.5 sections: **p15** (Ghibli look I: quality tiers, grass, trees, clouds, moods, post), **p16** (water, village rebuild, lanterns, smoke, villager routines), **p17** (Ren secondary motion, footprints/dust, hit FX, v0.4 fixes, paper-and-gold HUD, painted map), **p18** (Jorōgumo redesign + move set). Green snapshots: `index_v05_partA_1..3`, `index_v05_partB_0..4`, `index_v05_partC_0..3` (final = `index.html`). Every step passed a headless check with 0 console errors.

## Part A — Ghibli look
- **Foliage + ground:** GPU-instanced grass field (wind gusts, bends away from Ren / horse / boss / nearest enemy), layered leaf-card cedars and broadleaf trees with soft spherical-normal shading and a warm canopy fill light, ferns, moss on rock tops, warmer painted ground with baked canopy AO.
- **Light + atmosphere:** tight follow shadow map (texel-snapped), GTAO on High, bloom, painterly Kuwahara + Ghibli grade pass, painted cumulus billboards, pollen + drifting leaves, stronger golden hour / moonlit night / storm moods. (Fog is classic distance fog; there is no true height fog yet.)
- **Quality Low / Medium / High** (Settings → Graphics, or `?q=`): scales grass count, shadow map, pixel ratio, bloom, paint pass, GTAO, ferns, water detail, god-ray count. **Auto** drops a tier after two slow 2 s windows (<28 fps) and steps up once (>55 fps). Software GPUs start on Low.

## Part B — water, village, Ren, UI
- **B0 fixes:** real-gold golden hour (amber sky/fog, warm hemi fill + gold grade, warm canopy), readable forest interiors. Low quality lightened: distance cull of small meshes (72 m Low / 130 m Medium, layer-mask based, rebuilt every 15 s) and windswept plant patches thinned to 38% on Low → Low went from 479 to **147 draw calls** and 875k → 672k triangles. `t_v05.py` vista pose fixed.
- **Water:** flowing normal-mapped ripples, sky/fresnel reflection, sun glint, bank + falls foam, spray, swim / horse splashes and ripple rings.
- **Kanemura:** minka with curved kawara roofs, engawa, shoji, noren; chōchin lanterns lit at night; glowing torii and shrine; chimney smoke; villager idle routines (sweep, carry, chat, sit).
- **Ren:** verlet scarf/obi chains, hair spring, hat wobble and ties (react to wind + movement), footprints and dust puffs, sharper hit flash star + spark streaks, enemy white flash, shake + hitstop scaled by weapon weight (bokken .75, katana 1, yari 1.2).
- **UI:** paper-and-gold HUD skin, painted scroll map (watercolour hill-shade, fog of war), graphics setting.

## Part C — boss + polish
- **C0 waterfall glare fixed:** the river shader's sun specular on the steep falls section + full-white foam blew out. Specular is now damped near the falls, foam is a softer off-white and the water colour is clamped. Spray and falls brightness toned down, sea lightened.
- **v0.4 issues verified in-game via KM hooks:** painted map opens (`#map` display flex); HUD skin style present; foot (ankle bone) height 0.07 m on flat, 0.01 / 0.08 m on a 2.8:1 slope (no floating); charge dash up a 2.8:1 slope travels 4.25 m vs 4.7 m on flat (no refusal); bokken socketed along the blade axis (rot π/2) so trails follow the blade; afterimages use the gradient shader (gold core, cool rim, hat fades first); god-ray tiers Low 0 / Medium 9 / High 14.
- **Jorōgumo (p18):** a woman's upper body in a layered black-gold kimono rising from a huge jorō spider (gold/indigo banded abdomen, 8 IK legs on a staccato tetrapod gait), glowing eyes, gold-silk lair with webs, hanging cocoons and egg sacs, toon + rim shading.
- **Move set:** reveal, idle, stalk, move/skitter, web shot, drop/rise on her thread, leg-strike combo (3rd strike parryable), web pull, leap slam, summon spiderlings, phase-2 transformation, stagger (recoverP2 / stunned), retreat, death (unravels to silk). Ground telegraphs before strikes.
- **C3 headless fight:** fire-damage run reached phase 2 at 9 s and death at 20 s; a slower run reached phase 2 at 34 s and death at 68 s, seeing reveal, move, shot, drop, rise, retreat, transform, stalk, leap, pull, combo, recoverP2, summon, dying. 0 console errors.
- Debug: `KM.camOv={p,t}` overrides the render camera (screenshots only); extra hooks on `KM` (scene, V5, WATER5, JG, meshH, setQuality…).

## Performance (headless SwiftShader, 1280×720, meadow, 10 s — software rendering, not representative of a GPU)
Low ≈ 0.6–0.8 fps (147 calls, 672k tris) · Medium ≈ 0.9–1.0 fps (452 calls, 1.6M tris) · High ≈ 0.4–0.5 fps (1534 calls, 3.9M tris).

## Known issues
- Phase-2 Jorōgumo reads floating: her legs are thin and dark against the forest floor, so the body looks hovering at a distance; legs need thicker silhouettes / lighter rim.
- The arena's dense canopy + web makes framing hard; the reveal shot reads as a silhouette through the web.
- Dense cedar interiors at golden hour are still more olive than gold.
- Low still ~670k triangles (grass + terrain + trees); next step is distance-thinned grass and tree impostors.
- The painted map shows mostly fog of war on a new game (by design).
- No real height fog; distance fog only.

## Screenshots (`shots_v05/`)
01 grass vista · 02 golden forest · 03 night · 04 river falls · 05 Ren close-up · 06 combat hit · 07 village day · 08 boss reveal · 09 boss phase 2.
