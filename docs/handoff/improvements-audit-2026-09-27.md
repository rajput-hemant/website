# Portfolio improvements audit: design, animation, sound and 3D across all six editions

> **Dated 2026-09-27. Base commit `b71fb63`.** The audit names `adb15cf` on `fm/portfolio-edition-refactor` (not in this history); its `file:line` citations match `b71fb63` on `portfolio-3d` (spot-checked), not later commits. The content is left as written. Docs renamed since: `docs/redundancy-audit.md` is now `docs/redundancy-audit-2026-09-27.md`; `docs/redundancy-plan.md` and `docs/m1b-drawing-set.md` are archived (see `docs/archive/README.md`).

Task: `portfolio-improvements-audit` (scout, report only). Tree audited: `fm/portfolio-edition-refactor` at `adb15cf` (detached, `bun install` clean). No repo files were changed and nothing was committed.

## 0. How to read this

- **§1**: what I did and the evidence base.
- **§2**: the findings that cut across editions, and the shared architecture needed for per-edition sound and for 2+ 3D elements per page.
- **§3**: one ranked backlog across all editions (impact × effort).
- **§4**: shippable slices in build order.
- **§5**: the screenshot plan (IDs, and where each shot goes).
- **§6**: decisions (none left open).
- **Appendices A–F**: the full per-edition audits. Each has the same seven sections: design language, per-page inventory, design improvements, animation opportunities plus rejected candidates, sound design, 3D elements per page, and slices. Every claim carries a `file:line`.

Effort figures are worker-hours for one engineer who knows the codebase. Impact is H/M/L on a visitor's experience of that edition.

## 1. What I did

1. Checked out `fm/portfolio-edition-refactor` detached (`git checkout --detach fm/portfolio-edition-refactor`, HEAD `adb15cf`) and ran `bun install` (1277 packages, clean).
2. Read the shared layer myself: `lib/sound.ts`, `components/semantic/click-sound.tsx`, `lib/scene/{session.tsx,clock.ts,tier.ts,store.ts,dom.ts}`, `components/semantic/scene/use-scene-mount.ts`, `lib/prefs/standard.ts`, `docs/{architecture,flavors,m2-scene-spec,redundancy-audit}.md`, and the drei 10.7.9 `View` source (`node_modules/@react-three/drei/web/View.js`).
3. Loaded the frontend-design, emil-design-eng, apple-design and find-animation-opportunities skills. Their rules are applied throughout: the frequency gate, UI under 300ms, custom ease-out curves, `:active` press scale, no animation on keyboard-initiated actions, springs with velocity handoff, multimodal harmony (sound and picture on the same frame), reduced motion meaning gentler rather than zero, and a list of rejected candidates.
4. Ran six read-only sub-agents, one per edition, on disjoint file sets with one shared brief. I then spot-checked their load-bearing claims against the code (see §2.6) and integrated the results.
5. Screenshots: by the owner's change of plan, no heavy slot was used and no server or browser was started. A separate worker captures them from the brief in `screenshots-needed.md` (§5).

## 2. Cross-edition findings

### 2.1 Sound today: one voice everywhere, and one edition leaks the audio device

- **The only synthesizer** is `lib/sound.ts:11-13`: `TICK_HZ = { link: 2200, button: 1500 }`, a triangle wave, 30ms, gain 0.15, with a 2ms attack and an exponential decay down to 0.8× pitch.
- **The only trigger** is `components/semantic/click-sound.tsx:8,14-27`: a document click listener in the capture phase for `a, button, [role=button|switch|radio]`. It skips hidden tabs (`:18`) and touch `PointerEvent`s (`:19`), and calls `suspendSound()` on unmount (`:33`).
- **Mounted identically** by Minimal (`flavors/minimal/components/interaction/interaction-layer.tsx:25-29,78`, fine pointer only), Drawing Set, Press, Survey and Timetable (`flavors/<id>/components/site/deferred-layers.tsx:~23`). The result is the same two blips in every edition, which is the captain's complaint.
- **Control Surface never mounts `ClickSound`.** It calls `playTick` directly from the knob (`flavors/surface/components/knob/knob.tsx:125,305`) and the switches (`flavors/surface/components/site/switches.tsx:55-56`). So links and keys are silent there. Nothing in Surface ever calls `suspendSound()` (`git grep suspendSound` finds only `lib/sound.ts` and `click-sound.tsx`), so turning sound off leaves the AudioContext running. **This is a bug; ship it in slice S0.**
- **The Drawing Set ⌘K subtitle promises "Click and drawer sounds"** (`flavors/drawing-set/components/command/items.ts:99`), but no drawer sound exists.
- **Touch detection is unverified on iOS Safari.** The touch skip relies on `click` arriving as a `PointerEvent` with `pointerType === "touch"`. Whether it does there needs checking on a device; if it doesn't, taps tick. Include a device check in slice S1.

### 2.2 Sound: how to make it per edition without breaking the shared-code rule

The rule is at `docs/redundancy-audit.md:21` and `docs/flavors.md:87`: shared code may hold state, events and headless primitives, but it never imports `flavors/*`, never switches on edition identity, and never picks an edition's tokens. Every sub-agent converged on the same shape, and I recommend it:

**Shared (slice S1, about 3h)**

- **`lib/sound.ts` becomes a small data-driven engine.**
  - `type Voice = { layers: Layer[]; gain: number; pan?: number }`, where a `Layer` is `{ kind: "osc" | "noise", type?, freq: [from, to], filter?: { type, freq: [from, to], Q }, attack, decay, delay?, gain }`.
  - `playVoice(voice)` schedules at `audio.currentTime` inside the same handler that starts the visual. That is Apple's harmony rule.
  - The engine also holds one shared 1s white-noise `AudioBuffer`, a master `GainNode` into a `DynamicsCompressorNode` (so stacked voices never clip), and a limiter: at most 1 voice per 40ms, the same voice at most once per 80ms, at most 4 live nodes.
  - It suspends the context on `visibilitychange → hidden`.
  - `playTick` stays as two `Voice` constants, so nothing breaks mid-migration.
- **`ClickSound` grows optional props.** `voiceFor?: (el: Element, e: MouseEvent) => Voice | null` defaults to today's link/button choice. `onToggle?: (details: HTMLDetailsElement) => Voice | null` listens for the `toggle` event in the capture phase; it doesn't bubble, but a document capture listener sees it. It also skips keyboard-activated link clicks (`event.detail === 0`); switches and radios keep their sound because it confirms state.
- **Per-element opt-in uses `data-voice="<name>"`, not `data-sound`.** `data-sound` is already the preference flag on `<html>` (`lib/prefs/standard.ts:14`).
- **The shared code contains no edition names and no recipes.** The edition passes functions and data in, the same inversion `routeFlavor(isLiveFlavor, defaultFlavor)` already uses (`docs/redundancy-audit.md:44`).

**Per edition (each 3–5h, depends on S1)**

- **`flavors/<id>/lib/sound/voices.ts`** holds the recipes plus `voiceFor`, and is passed at the existing mount point.
- **Scene sounds** (a drawer runner, a flap flutter, the knob detents) are called from the edition's own scene code, which may import its own module. They are gated on `document.documentElement.dataset.sound === "on"`, the same check Surface already uses at `switches.tsx:55`.

**Synthesis or samples**

- **Synthesize all 36 voices** (six per edition): 0 KB of assets, no licensing, instant after the first gesture, and pitch can follow data. Examples of data-driven pitch: Survey's benchmark ping follows role height at 1 octave per 24 months, and Timetable's flap flutter locks to each 3D flap step.
- **Samples only as a fallback,** if a voice fails a listening test. The ones most at risk are Timetable's flap flutter and Press's platen. In that case use a CC0 recording (freesound.org with the CC0 filter), or a self-recording under the owner's copyright. Encode Opus mono at 32 kbps, 8 KB or less per sound and 40 KB or less per edition. Fetch and `decodeAudioData` only after the visitor opts in, never on page load.
- **Avoid "royalty-free" packs** such as Sonniss GDC bundles. They permit use but not redistribution of the raw files in a public repo.

**Behaviour contract (all editions)**

| Condition | Behaviour |
|---|---|
| Default | Off (`standardDefaults.sound = false`, `lib/prefs/standard.ts:40`). Turning it on previews one voice, and that same click is the gesture that unlocks audio. |
| Reduced motion | Sound is not motion, so event sounds stay. Sounds that describe motion that no longer happens are replaced: Drawing Set's drawer runner and plotter step, and Timetable's flap flutter, become one short thunk. No edition gets ambient or scroll-linked sound. |
| Mute | Preference off → `suspendSound()` (and Surface fixes its missing call). |
| Hidden tab | No playback, and the context is suspended. |
| Touch | UI clicks are silent. Rare confirmations (sent, copied, signed in) do play. |
| Keyboard | Silent on link activation and ⌘K navigation; sound on switches. |
| Hover | Never. Hover is tens-to-hundreds of events a day, so it fails the frequency gate. |

**Palettes, one sonic identity per edition.** The full recipes (oscillators, frequencies, envelopes, filters, gains) are in each appendix, §5.

| Edition | Concept | Band and character | Voices (and where each plays) |
|---|---|---|---|
| Minimal | Paper and nib | Soft bandpassed noise at 1–4 kHz; every voice at gain 0.07 or less | `tap` (links), `set` (buttons, with pitch encoding switch on/off and theme light/dark), `leaf` (disclosure open or close, pitch sweeps up or down), `stamp` (copy), `sent` (ask, owner), knock (error) |
| Drawing Set | The drafting room | Bright graphite transients plus a low steel runner | `lead` (links), `clutch` (buttons), `drawer` (route drawer opens), `sheet` (sheet opened), `stamp` (ANSWERED, sent, copied), `plot` (dimension re-plot, rate-limited) |
| Control Surface | Electromechanical | Hard square-bodied detents, relays, key up and down, beeps | detent plus end-stop (knob), relay (channel change), key down/up (links, keys), slide-and-latch (switches), confirm beep, error beep |
| Timetable | Station acoustics | Flap flutter bursts at about 55 ms spacing, enamel taps, one two-tone chime | flutter (synced to each flap step), enamel tap (nav), ticket-validator clunk (buttons), relay (switches), chime (sent, copied), ring (sign released after a drag) |
| Field Survey | The instrument case | Brass and glass: sine pings whose pitch comes from data, a glassy level bubble | click-stop (links), level bubble (switches), sheet turn, ink stamp, benchmark ping (role height sets the pitch), tally (count change) |
| Press Proof | The pressroom | Heavy low thumps and rubber | platen kiss (links), rubber stamp (buttons), register pins (headline, once per view), sheet feed (route), paper flex (peel drag), plate swap (theme) |

**One conflict the sub-agents missed.** Four editions each proposed a "stamp", and three proposed a "pencil tap". Taken together, that brings back the sameness the captain is complaining about. Resolve it by exclusivity:

- **Press Proof owns stamp.**
- **Drawing Set owns the pencil and graphite family.**
- **Minimal:** confirmations use `blot` instead of `stamp` (felt thud: noise lowpass at 600 Hz, 40 ms, with a sine 140→90 Hz). Links use `flick` instead of `tap` (noise highpass at 5 kHz, 8 ms, gain 0.03).
- **Field Survey:** confirmations use the benchmark ping instead of the ink stamp. Links use click-stop instead of the pencil tap.
- **Drawing Set's ANSWERED stamp:** keep it as a rubber stamp (it's literally the drawing's stamp), but retune it to be dry and higher (sine 220→140 Hz). Press's stamp stays low (120→58 Hz), so the two never read as the same sound.

### 2.3 3D today: what exists and why "one element per page" is structural

| Edition | Renderer | Where it lives | 3D today |
|---|---|---|---|
| Drawing Set | R3F `createRoot` of its own, on the shared `lib/scene/{clock,dom,store}` (`flavors/drawing-set/components/scene/scene-root.tsx:3-35`) | One `SceneSlot` per page | Plan chest and drafting table in instanced linework, with a pose per route (`world.tsx:70-590`) |
| Timetable | R3F `createRoot` of its own, same shared modules (`flavors/timetable/components/scene/scene-root.tsx:3-35`) | Header slot | Split-flap departure board |
| Press Proof | The shared `createSessionScene` (`flavors/press/components/scene/scene-root.tsx`, the only user of `lib/scene/session.tsx`) | One slot | A press with a peelable proof sheet |
| Field Survey | Plain three.js `WebGLRenderer` on the shared clock and DOM (`flavors/survey/components/scene/scene-root.ts:1-36`) | Inset | One displaced terrain plane, about 188k triangles in one call (`world.ts:60-97`) |
| Control Surface | Plain three.js with its own renderer and loop (`flavors/surface/components/knob/knob-scene.ts:21,98`) | Knob module | One 3D knob; 4 routes have none (`/ask/[slug]`, `/lab/[slug]`, `/owner`, 404) |
| Minimal | Lab only, in its own `<Canvas>` (`components/semantic/lab/canvas-stage.tsx:79`) | `/lab/[slug]` | A signature particle field; the other 13 routes have no 3D |

Why a page can hold only one element:

- **The canvas lives inside the slot.** `createSessionScene` (`lib/scene/session.tsx:95-150`) and its copies in Drawing Set and Timetable make one canvas and lend it to *one* host. It is sized to that host (`size: { width: 1, height: 1 }` and then the slot's rect).
- **The clock has one visibility flag.** It only wakes on `sceneStore.visible`, a single slot-level flag (`lib/scene/clock.ts:38-39`).
- **drei `View` can't work in that setup.** `View` scissors regions relative to the canvas rect and skips any region whose tracked element falls outside the canvas (`drei/web/View.js:10-32,91-122`). With the canvas sized to the slot, a `View` anywhere else on the page never draws. That's why every sub-agent independently arrived at the same shared prerequisite.
- **Two editions carry a copy of the session.** Drawing Set and Timetable each keep their own copy of what `createSessionScene` already does. Folding both into the shared function (part of slice S2) means the multi-view change is made once rather than three times. It also removes a real redundancy, in keeping with `docs/redundancy-plan.md`.
- **`/lab/[slug]` opens a second WebGL context** in every edition (for example `flavors/drawing-set/components/lab/experiment-stage.tsx:20-31`). The session should release or pause while a lab stage is mounted (slice S4).
- **Minimal has no `scene` preference,** yet `lib/scene/tier.ts:37` reads `data-scene`. It needs `scene: "auto" | "low" | "off"` (already in `lib/prefs/standard.ts:19,28`) before any 3D (appendix A §3 #1).

### 2.4 3D: the recommended architecture for 2+ elements per page

There are two shared mechanisms. Each edition uses the one that fits its renderer and each element.

**S2, tracked views (R3F editions: Drawing Set, Timetable, Press, Minimal). About 12h shared.**

- **Canvas.** The session canvas becomes `position: fixed; inset: 0; pointer-events: none; aria-hidden`, and stays behind content. Minimal puts it at `z-index: -1` so text always paints above it and stays selectable. The other editions put it below their chrome's z-layer.
- **Views.** The world renders `<View.Port />`, from drei 10.7.9, which is installed. The existing slot and every `[data-scene-view]` placeholder become `<View track={ref}>` regions, each with its own camera (drei `PerspectiveCamera` or `OrthographicCamera`).
- **Input.** It keeps using the DOM contract that already exists: `data-scene-item` hover and focus → `store.hovered` (`lib/scene/dom.ts`), drags via `bindDragInput` on the placeholder (`lib/scene/session.tsx:31`), plus `toggle` and `emit()` events (`lib/scene/store.ts:23`). The canvas never takes pointer events, so native selection, find-in-page and the keyboard stay intact.
- **Clock.** `visible` becomes "any view intersects", with one IntersectionObserver per view. The clock already wakes on scroll (`clock.ts:35-45`), and a fixed canvas has to redraw while scrolling so views stay glued to their DOM. That redraw is the cost of this mechanism, and it's why the budget below caps views per page. `frames` on `View` stays at `Infinity` only for views in the viewport.
- **Posters.** Each placeholder server-renders its own SVG or CSS poster. A root `data-scene-live` flag fades posters out over 400ms `--ease-enter`, which generalizes today's single `data-scene-poster` handoff (`use-scene-mount.ts:77-82`).
- **Drei allowance.** The spec currently limits drei to `PerformanceMonitor` (`docs/m2-scene-spec.md:43`). Amend it to allow `View`, `PerspectiveCamera`/`OrthographicCamera`, `Instances` (with `Merged`, exported from `core/Instances`), `Edges`, `Line`/`QuadraticBezierLine`, `RoundedBox` and `Hud`. Keep excluding `Text`, `Text3D` and `Html` (no canvas text: `docs/m2-scene-spec.md:10`), and `Float` (the spec forbids idle motion, `:75`).

**S3, blit glyphs (plain three.js editions: Surface, Survey; optional elsewhere). About 4h shared.**

- **Mechanism.** `lib/scene/blit.ts` registers `{ canvas2d, scene, camera }`. When a glyph is dirty (hover, toggle, data change), the one session renderer draws that small scene into a scratch region and `drawImage`s it into the glyph's own in-flow `<canvas>`, in the same task, so `preserveDrawingBuffer` isn't needed.
- **Why use it.** One WebGL context, no redraw on scroll (the 2D canvases scroll with the page like images), and zero idle frames. It also doesn't pull R3F into Surface or Survey, which don't ship it.
- **Choosing between S2 and S3.** Glyph-sized, event-driven objects use **S3**. Large, scroll-scrubbed objects, or ones that fly across two DOM regions (Drawing Set's RFI slip flying from composer to tray, Minimal's paper plane), use **S2**.

**Budgets per page, every edition**

- At most 4 live views or glyphs.
- 60 or fewer draw calls in total, the existing ceiling (`docs/m2-scene-spec.md:143`). The edition proposals peak at 24 (Drawing Set lab), 16 (Minimal), 15 (Timetable), 11 (Surface) and about 10 added (Survey).
- 12k or fewer added triangles.
- At T2, 2ms or less of CPU and 4ms or less of GPU per active frame.
- Zero frames when idle.
- Scene chunk at 300 KB gz or less (`docs/flavors.md:78`; Minimal estimates about 230 KB with the listed drei pieces).

**Fallbacks**

- **Reduced motion or the motion preference off:** static poses, no parallax or tilt. Direct-manipulation drags still work, as the spec already says (`m2-scene-spec.md:75`). Minimal shows posters only.
- **T0** (`scene: off`, saveData, `prefers-reduced-data`, no WebGL2, context loss, a PerformanceMonitor decline): no import at all; SVG posters (`lib/scene/tier.ts:12-16`).
- **T1** (coarse pointer, 4 GB of memory or less, `scene: low`): DPR 1, no antialias, toggle-only motion.
- **Low battery (proposed addition).** `navigator.getBattery()` reporting `charging === false && level < 0.2` should cap at T1. It's Chromium only; elsewhere, PerformanceMonitor already covers it.

**How many elements.** Every appendix §6 proposes at least two new elements per route, and the counts aren't padded: Minimal 24, Drawing Set 29, Surface 26, Timetable 26, Survey 27, Press 26, **158 in total**. Each row gives the element, its DOM anchor (`file:line`), interactivity (pointer, hover, scroll, drag or click), mechanism (P in-slot, V view, G glyph), draw calls and triangles, and its reduced-motion and T0 fallback. About 40% of them ride the *existing* slot as extra props (mechanism P) and need no shared change, so 3D work can start before S2 lands.

### 2.5 Baseline gaps found (captain's cross-edition baseline)

| Baseline item | Status on this tree |
|---|---|
| OS-following light/dark, explicit choice wins | Met everywhere, through `lib/prefs/standard.ts` `data-theme` resolution. **But theme changes are out of step with the 3D:** the Drawing Set DOM swaps instantly while scene uniforms tween 400ms (`flavors/drawing-set/components/scene/world.tsx:209-221`), and the Survey page fades 300ms (`flavors/survey/styles.css:133`) while its 3D colours snap (`world.ts:99-115`). |
| Edition-styled scrollbars | **Missing on Minimal, Drawing Set and Control Surface.** Commit `68090a8` ("fix(css): remove refactor scrollbar overrides on three editions") deleted them; those files now have only `scrollbar-gutter: stable` (`flavors/minimal/styles.css:1413`, `flavors/drawing-set/styles.css:124`, `flavors/surface/styles.css:91`). Press (`styles.css:161-182`), Survey (`:121-185`) and Timetable (`:432`) have them. The owner has decided to restore them (§6). |
| Reduced motion respected | Met in intent. Two correctness bugs: **Press** still turns the page on a drag of about 141px with motion off, where the peel isn't visible (`flavors/press/components/scene/world.tsx:288-293`). The **Survey** loupe and lean spring, and the **Surface** knob spring, are integrated per frame (`survey/components/scene/world.ts:44-48`), so they settle twice as fast at 120 Hz. |
| Fine-pointer cursor with labels | Met on Minimal (opt-in), Drawing Set, Timetable, Survey and Press. **Surface has no labelled cursor** (commit `9ec9daa` dropped the probe cursor); appendix C slice 5 restores one. |
| Opt-in sounds | Met (off by default), apart from the Surface suspend bug above. |

### 2.6 Spot-checks of sub-agent claims (lead verification)

| Claim | Check | Result |
|---|---|---|
| Surface never mounts `ClickSound` and never suspends | `git grep -n ClickSound -- flavors` lists minimal, drawing-set, press, survey and timetable only; `git grep suspendSound` finds only the shared files | Confirmed |
| Press drag navigates with motion off | `world.tsx:286-293`: `armed = peelTarget >= TURN` under `input.dragging`, then `navigate(pose.next)` with no `live` gate | Confirmed |
| Press button press transition is overridden | `ui/button.tsx:30` `transition-colors duration-(--duration-ui)` vs `styles.css:328-333` `.press { transition: scale … }`: the utility wins for `transition-property`, so the scale snaps | Confirmed |
| Survey spring depends on frame rate | `world.ts:44-48`: `s.v = (s.v + (target - s.x) * 0.08) * 0.82` per frame, no dt | Confirmed |
| Minimal has no `scene` pref | `grep scene flavors/minimal/lib/prefs.ts` is empty; `lib/scene/tier.ts:37` reads `data-scene` | Confirmed |
| Scrollbars removed on 3 editions | `git show --stat 68090a8`: −29/−30/−35 lines across drawing-set, minimal and surface `styles.css` | Confirmed |
| Only Press uses `createSessionScene` | `git grep -ln createSessionScene -- flavors` returns `flavors/press/components/scene/scene-root.tsx` only | Confirmed; Drawing Set and Timetable duplicate it |
| drei `View`, `Instances`/`Merged`, `Edges`, `Hud` exist in 10.7.9 | `node_modules/@react-three/drei/{web/View,core/Instances,core/Edges,core/Hud}.d.ts` | Confirmed (`Merged` is exported from `core/Instances`) |

## 3. Ranked backlog (impact × effort, all editions)

Ranked by impact first, then by lowest effort. The "Slice" column points into §4.

| Rank | Item | Editions | Impact | Effort | Slice |
|---|---|---|---|---|---|
| 1 | Surface: mount the voice layer on links and keys; call `suspendSound` when sound is turned off and when the tab is hidden | Surface | H (bug) | 1h | S0 |
| 2 | Press: gate the peel TURN on motion; fix the Button `transition` override | Press | H (bug) | 1.5h | S0 |
| 3 | Time-based springs (dt-integrated) | Survey, Surface | H (bug on 120 Hz) | 2h + 2h | S0 |
| 4 | Theme change lands together with the 3D (a View Transition timed to the uniform tween) | Drawing Set, Survey (Press's plate swap too) | M-H | 2h each | S0 / edition |
| 5 | Shared voice engine (§2.2) | all | H | 3h | S1 |
| 6 | Per-edition sound palettes (§2.2, appendix §5) | all six | H | 3–5h each (about 24h total) | E-snd |
| 7 | Every route gets its scene region: Drawing Set `/ask/[slug]` and `/ask/page/[n]`; Surface knob on 4 missing routes and on empty `/now` and `/ask`; Survey insets on 5 routes; Timetable mini boards | DS, Surface, Survey, Timetable | H | 0.5–3.5h each | E-fix |
| 8 | Scene reads page state it already emits: DS home role hover → drawer 02 (`experience-summary.tsx:32`) and stack/category filters; Timetable `ask:sent` (`chat-composer.tsx:86`) and map hover (`network-map.tsx:131-135`); Press per-item hover and `/now` progress | DS, Timetable, Press | H | 1–4h each | E-fix |
| 9 | Timetable: a sticky split-flap sign on `/work`, since today it flips off screen | Timetable | H | 3h | E-fix |
| 10 | In-slot 3D props (mechanism P): roughly 60 of the 158 elements | DS, Timetable, Survey, Press | H | 8–14h per edition | E-3d-P |
| 11 | Shared tracked-view engine S2, plus folding the Drawing Set and Timetable session copies into `createSessionScene` | DS, Timetable, Press, Minimal | H (unblocks) | 12–16h | S2 |
| 12 | Shared blit glyphs S3 | Surface, Survey | H (unblocks) | 4h | S3 |
| 13 | In-page view and glyph 3D batches | all six | H/M | 12–28h per edition | E-3d-V |
| 14 | Motion polish sets (appendix §4 tables, at most 7 per edition, each with exact curves, durations and reduced-motion fallback) | all six | M | 3–4h each | E-motion |
| 15 | Minimal `scene` preference and Customize "3D" row | Minimal | M (unblocks) | 2h | E-fix |
| 16 | Remove animation from keyboard-opened ⌘K (Timetable `ui/dialog.tsx`, Surface command dialog) | Timetable, Surface | M | 0.5h each | S0 |
| 17 | Popovers grow from their trigger (`transform-origin: var(--transform-origin)`, Base UI) | Timetable (and a check on others) | L-M | 0.5h | E-motion |
| 18 | Motion-token drift: Tailwind's default 150ms curve, off-token eases, Minimal's 700ms stage handoff vs the 400ms contract | Minimal, DS | L | 1h each | E-motion |
| 19 | Lab context hygiene: pause or release the session while `/lab/[slug]` holds a second WebGL context | all | L-M | 2h shared | S4 |
| 20 | Edition scrollbars on Minimal, Drawing Set and Surface (owner: custom, §6) | 3 | L-M | 0.5h each | S0 |

Totals from the appendices: about 330h of edition work across the six (Minimal 55–60, Drawing Set 61, Surface 54, Timetable 55–59, Survey 45, Press 44), plus about 22h of shared work (S1 3, S2 12–16, S3 4, S4 2). The edition totals include each edition's share of mechanism-P and mechanism-V 3D.

## 4. Shippable slices (build order)

Each slice fits one worker lane and leaves the tree shippable. Edition slices with no shared dependency can run in parallel lanes. Never put two lanes on one file: shared slices touch `lib/sound.ts`, `components/semantic/click-sound.tsx`, `lib/scene/*` and `components/semantic/scene/*`, so each goes to one lane at a time.

**Wave 0: bugs and hygiene (no shared dependency, parallel per edition, about 1 day in total)**

- **S0-surface** (2h). Sound suspend and hidden-tab handling (`flavors/surface/components/prefs/prefs-sync.tsx`), dt spring (`knob-scene.ts`), no ⌘K open animation. Appendix C slices 1 (suspend part) and 4 (dt part).
- **S0-press** (1.5h). Appendix F slice P-1.
- **S0-survey** (3h). Appendix E slice 4 (theme crossfade, dt loupe and spring, flight durations).
- **S0-drawing-set** (3h). Appendix B slice 1 (register tick, `data-scene-section`, `/ask` slots, `fine:` hover, easing token).
- **S0-timetable** (4h). Appendix D slice 1 (map hover, line-guide opacity, ⌘K instant, popover origin, `ask:sent`).
- **S0-minimal** (2h). Appendix A slice M-S1 (`scene` preference) plus token drift.

**Wave 1: sound (S1, then six parallel edition lanes, about 1.5 days)**

- **S1: shared voice engine** (3h). `lib/sound.ts` gets `Voice`, `playVoice`, the noise buffer, master gain and compressor, the limiter and hidden-tab suspend. `click-sound.tsx` gets `voiceFor`, `onToggle` and the keyboard skip. Add `lib/__tests__/sound.test.ts` against a mocked `AudioContext`, covering the limiter and the hidden-tab skip. Includes the iOS touch check.
- **E-snd-<id>** (3–5h each, six lanes). Each appendix §5, with the dedupe rules from §2.2 applied. Drawing Set also fixes the `items.ts:99` copy.

**Wave 2: 3D in the existing slot, plus scene-reads-page-state (parallel per edition, no shared dependency, about 2 days)**

- DS slice 4 (14h). Timetable slices 2, 3 and 7 (14h). Survey slices 6, 7 and 8 (15.5h). Press slice P-2 (4h). Surface slices 3 and 6 (9h, the knob on every page plus the bench refactor that makes S3 possible).

**Wave 3: shared multi-element engines (two lanes, about 2 days)**

- **S2: tracked views** (12–16h). Fixed canvas, `View.Port`, `[data-scene-view]` anchors, per-view IntersectionObservers, `visible` as "any view", per-view posters with `data-scene-live`, and the spec amendment to `docs/m2-scene-spec.md`. Drawing Set and Timetable move onto `createSessionScene`. Check: Press's single slot still passes its tests and posters, and idle pages render 0 frames (count them with a `renderNow` spy).
- **S3: blit glyphs** (4h). `lib/scene/blit.ts` plus a test that a dirty glyph renders once and a clean one renders none.
- **S4: lab context hygiene** (2h, can follow either).

**Wave 4: in-page 3D batches (parallel per edition after S2 or S3, about 1 week across lanes)**

- Minimal M-S4 to M-S8 (38h). Drawing Set slices 7, 8 and 9 (32h). Timetable slices 8 and 9 (26h). Press P-5 and P-6 (28h). Surface slices 7 to 10 (31h). Survey slices 9 to 11 (15.5h).

**Wave 5: motion polish and docs (parallel per edition)**

- Each appendix §4 opportunity set, plus the edition doc updates (`docs/<edition>.md` sections on Motion, 3D and Sound; Surface's "only 3D object" thesis at `docs/surface.md:67` changes).
- A final budget and accessibility pass: `bun run budget`; Lighthouse on each edition's home and projects plus every Minimal route (`docs/flavors.md:80-83`); axe check that every glyph is `aria-hidden`; CLS 0 with posters; print hides glyphs.

**Suggested first promotion.** Wave 0 plus S1 plus two sound lanes (Press and Timetable, the most characterful palettes) ship visible change to all six editions in about 2 days, with low risk.

## 5. Screenshots of today's pages

Per the owner's change of plan, screenshots are taken by a separate worker. The capture brief is `/Users/rajput-hemant/Desktop/firstmate/data/portfolio-improvements-audit/screenshots-needed.md`. Images land in `screens/<ID>.png` next to this report.

**ID scheme.** Prefixes: `MIN`, `DS`, `SUR`, `TT`, `SVY`, `PRS`. Suffixes:

| Suffix | What it is |
|---|---|
| `-<route>` | per-route baseline, 1440 light (brief §A) |
| `-<route>-390` | mobile, light (brief §B) |
| `-<route>-dark` | dark theme (brief §B) |
| `-sN` | interaction states (brief §C) |
| `-scroll` | scrollbar crop (brief §D) |
| `-rm` | reduced motion (brief §D) |

Where each set belongs in this report:

| Report location | Shots |
|---|---|
| §2.3 "3D today" table, one row per edition | `<P>-home`, `<P>-projects`, `<P>-s1` |
| §2.5 baseline table, theme row | `DS-home-dark`, `SVY-s4`, `PRS-s4` |
| §2.5 baseline table, scrollbar row (decision now answered) | `<P>-scroll` for all six |
| §2.5 baseline table, reduced-motion row | `<P>-rm` for all six |
| §2.1 and appendix C (Surface sound and knob gaps) | `SUR-s1`, `SUR-s4`, `SUR-thread`, `SUR-owner`, `SUR-404`, `SUR-study` |
| Appendix A §2 inventory | `MIN-*` §A rows; `MIN-s1..s5` |
| Appendix B §2 inventory; D1 reflow | `DS-*` §A rows; `DS-s2` (D1) |
| Appendix C §2 inventory | `SUR-*` §A rows |
| Appendix D §2 inventory; §3 main gap (sign off screen) | `TT-*` §A rows; `TT-s2` |
| Appendix E §2 inventory; §3 mobile crop | `SVY-*` §A rows; `SVY-s2`, `SVY-home-390` |
| Appendix F §2 inventory; §3 #3 per-item hover | `PRS-*` §A rows; `PRS-s2` |
| ⌘K rejected-animation evidence (each appendix §4) | `<P>-s5` (for Minimal, `MIN-s3` shows the Customize panel instead) |
| Mobile evidence for the 3D T1 tier | `<P>-home-390`, `<P>-projects-390` |

## 6. Decisions

1. **Edition scrollbars on Minimal, Drawing Set and Control Surface: answered by the owner (relayed by firstmate, inbox 001, 2026-09-27T08:54Z): "custom edition-styled scrollbars".** Restore them on all three, reversing the deletions in `68090a8`:
   - Minimal: `scrollbar-color: var(--color-faint) transparent` plus a thin WebKit thumb.
   - Drawing Set: a thin "scale bar" in `--color-line-strong` on `--color-ground`, with square corners.
   - Control Surface: the fader thumb it had before `68090a8`.
   
   This is part of slice S0 for each edition, 0.5h each, and backlog rank 20 becomes a plain S0 item.
2. **Engineering defaults this report assumes (no captain call needed):**
   - The drei allowance in `docs/m2-scene-spec.md` is widened as listed in §2.4.
   - All voices are synthesized, with samples only after a failed listening test.
   - Stamp and pencil sounds are exclusive as set out in §2.2.
   - Canvas text stays banned.

No captain decision is left open.

## 7. Completion

See the done line in the status file. Appendices A–F follow.


---

# Appendix A: Minimal

(Sub-agent audit, spot-checked by the lead in §2.6. The sound palette is subject to the dedupe rules in §2.2. Main-report §6 supersedes any "captain decision" or "pending confirmation" note below; the owner chose custom edition-styled scrollbars.)

# Edition: Minimal (`flavors/minimal`, `app/f/minimal`)

Default edition (docs/flavors.md:20, :43). Thesis (docs/architecture.md:5): "minimal and text-first; interaction is a thin layer of small, precise moments on top. Any effect that makes text slower to read or harder to select, or that works worse with a keyboard, a screen reader, reduced motion or a touch device, is cut." (docs/design.md is the Drawing Set spec, so architecture.md is Minimal's design law.) Everything below is held to that rule. The metaphor I use is **paper and ink**: warm paper, deep ink, a Fraunces display face, a handwritten signature, and ruled, graph or dot textures. That's the writer's desk, not a workshop.

## 1. Design language

- **Palette** (flavors/minimal/styles.css:15-41, all `light-dark()`): background `oklch(0.975 0.008 85)` / `oklch(0.168 0.013 262)`; foreground `oklch(0.21 0.012 65)` / `oklch(0.93 0.011 85)`; muted `0.445 0.014 65` / `0.735 0.012 80`; border `0.885 0.011 80` / `0.29 0.014 262`; hairline `oklch(0.3 0.02 70 / .12)` / `oklch(0.95 0.01 262 / .1)`; surface `0.954 0.01 82` / `0.205 0.014 262`. Accent is `oklch(var(--accent-lightness) var(--accent-c) var(--accent-hue))` with a hue swing for WCAG (:149-156). Default hue 38 "ember", with 6 presets (lib/prefs.ts:43-50). Dark mode sets L 0.75 and C 0.135 (:209-213). The page wash is a fixed radial layer (:190-201, :316-323), with a 3.5% accent glow in dark mode (:219-233).
- **Fonts** (lib/fonts.ts:4-40): Fraunces (display, preloaded LCP, axes opsz/SOFT/WONK), Bricolage Grotesque (body, opsz/wdth), Martian Mono (`meta` utility: 2xs uppercase, wdth 87.5, tracking .06em, styles.css:1061-1067), and a lazy Fraunces italic. The body is 17px on a minor-third scale (:69-91). Weights drop by 20 in dark mode (:214-218).
- **Layout device**: a single 42rem column (`--content-width`, :158) with a 60rem wide frame, margin `FrameRail`/`FrameNote` at 2xl (components/site/frame.tsx:20-40), and hairline-ruled lists (border-t/b hairline). Every list is rows that open in place (`Disclosure`, projects/project-row.tsx:82-86).
- **Motion vocabulary** (:96-99, :134-139): `--ease-enter cubic-bezier(0.23,1,0.32,1)`, `--ease-exit cubic-bezier(0.4,0,1,1)`, enter 220ms, exit 160ms, press 120ms, route out 180ms and in 240ms, `--press-scale .97` on every button, switch or radio `:active` (:379-389). First paint: `.stagger` 240ms, 8px, 50ms steps capped at 6 (:1124-1166), a headline word rise of 520ms with a 40ms cascade (home/headline.module.css:13-33), and a 380ms wordmark with a 15ms cascade (:106-114, :1109-1113). Route changes use a View Transition blur crossfade with an 8px depth shift (interaction/view-transitions.module.css:24-79). The theme toggle is a circular view-transition reveal (styles.css:1377-1396). Scroll-driven CSS runs the timeline rail fill (experience/experience.module.css:116-137) and reading progress (site/reading-progress.module.css:11-28). Reduced motion keeps colour and opacity only (:420-438). The one JS animation library use is Motion in the live texture (interaction/texture-effects.tsx:4). There's no GSAP.
- **Cursor**: an opt-in (default off, lib/prefs.ts:80) 24px accent ring follower with `mix-blend-mode` multiply/screen. It has states for link, external, copy, copied, text, drag and disabled, a magnet pull of 0.35 capped at 6px, and a press squash to 0.78 (interaction/cursor.tsx:9-19, cursor-state.ts:1-50, cursor.module.css:14,54-78). It uses its own ease, `cubic-bezier(0.22,1,0.36,1)`.
- **Scrollbar**: native, with only `scrollbar-gutter: stable` (styles.css:1412-1414). The custom thin scrollbar was **deliberately deleted** in 68090a8 ("remove refactor scrollbar overrides").
- **3D today**: none on 13 of 14 routes. `/lab` shows a CSS poster only (lab/page.tsx:40-43, lab/poster.tsx:14-16). `/lab/signature-field` is the one WebGL element: a particle word sampled from the serif face that ripples away from the pointer, with tap or horizontal drag on touch (lab/experiment-stage.tsx:20-31, components/semantic/lab/signature-field-scene.tsx:153-181). It runs in its **own** `<Canvas>` (components/semantic/lab/canvas-stage.tsx:79, on demand, DPR ≤1.5). It doesn't use the `lib/scene` session, and it gets no scene under reduced motion or with motion off (experiment-stage.tsx:55-57).

## 2. Per-page inventory

| Page | What renders today | Current 3D | Current motion | Gaps |
|---|---|---|---|---|
| `/` home (app/f/minimal/page.tsx:34-48) | Avatar and word-rise headline, bio with signature, contact row, local time, 4 Selected project rows, 3 roles, a "More" disclosure | none | stagger, word rise, signature stroke draw (signature/signature.tsx:82-101), row SOFT/WONK hover (project-row.module.css:28-38) | No depth anywhere; the local-time readout is static text; project rows have no open or close sound |
| `/work` (work/page.tsx:35-84) | Header meta (roles, since, resume links), experience timeline with rail, Skills and Education collapsed | none | stagger, rail scroll fill (experience.module.css:116-137), disclosure height (ui/disclosure.module.css:14-33) | Tenure is only text; rail dots are flat |
| `/projects` (projects/page.tsx:89-122) | Stack/status filter, Featured and More groups, rows that open in place with image, stack and links | none | stagger, filtered rows fade by opacity (project-list.module.css:11), row hover | Filtered rows pop out of the layout; no sense of how many are left |
| `/projects/[slug]` | `permanentRedirect("/projects")` (projects/[slug]/page.tsx:13-15) | n/a | n/a | Redirect, inherits /projects |
| `/now` (now/page.tsx:23-65) | "As of" date and UpdatedAgo, numbered list, About disclosure | none | stagger | Freshness only as text; the numerals are inert |
| `/changelog` (changelog/page.tsx:25-59) | Year index (row at md, sticky rail at lg with bars at xl), year disclosures | none | stagger, year bar hover tint (changelog/year-index.tsx:66) | No sense of where you are; bars are flat |
| `/about` | Redirects to `/work` (about/page.tsx:4-6) | n/a | n/a | Redirect |
| `/resume` (resume/page.tsx:10-14) | `ResumeDocument` with PrintButton (resume-document.tsx:60) and header | none | none (print-first) | Screen view has no object that says "sheet" |
| `/ask`, `/ask/page/[n]` (ask/page.tsx:30-94) | Header, composer, moderation strip, feed, pagination | none | stagger, composer toolbar `animate-in fade-in` (ask/chat-composer.tsx:154), spinners | Sending has no moment: the "sent" note just appears (chat-composer.tsx:259-265) |
| `/ask/[slug]` (ask/[slug]/page.tsx:47-76) | Back link, h1, meta, ChatThread with hairline elbows (ask/thread-line.ts:6-12) | none | none beyond route transition | Flat thread line |
| `/lab` (lab/page.tsx:20-68) | One row: CSS poster, title, description | none (poster only) | row bg hover | One experiment reads as empty; the poster never comes alive |
| `/lab/[slug]` (lab/[slug]/page.tsx:37-61) | Back, header, ExperimentStage | signature field (own Canvas), pointer ripple, touch tap/drag | fallback-to-scene crossfade 700ms `ease-out` (experiment-stage.tsx:78) | Off-token 700ms; the only interaction is pointer ripple |
| `/owner` (owner/page.tsx:17-24) | Header, passphrase form | none | spinner (ask/owner-sign-in.tsx:43, :96) | Success or failure is text only |
| 404 (not-found.tsx:33-66) | "Nothing here." and 3 suggestion rows with arrow nudge | none | stagger, arrow translate (:59) | No character |

## 3. Design improvements (ranked)

1. **Add a `scene` preference and Customize row.** Minimal's prefs have no scene key (lib/prefs.ts:57-83), but `lib/scene/tier.ts:37` reads `data-scene` and `lib/prefs/standard.ts:19,28,104` already define `auto|low|off`. Add `scene: "auto"` to `Prefs` and `defaultPrefs`, write `root.dataset.scene` in components/prefs/apply-prefs.ts (next to :41), extend `migrateStoredPrefs` enums (:108-115), and add a "3D" segmented row under Effects (customize/customize-controls.tsx:79-86). A missing key falls back to its default, so no version bump is needed. This is a prerequisite for every 3D item. Impact H, effort S (2h).
2. **Replace the one loud tick with a quiet paper-and-ink voice set** (section 5). Today it's a triangle at 2200/1500Hz and gain 0.15 (lib/sound.ts:11-13), which is bright and loud for an edition whose pitch is calm. Impact H, effort M (4h plus the shared engine).
3. **Adopt one text-safe 3D layer.** Put a fixed `z-index:-1` canvas host behind content, so text always paints above WebGL and selection or find-in-page is never obstructed. body already has no background so a layer can sit there (styles.css:333). Glyph-size objects render through drei `View` scissor regions tracked to inline placeholders (section 6). Impact H, effort L (10h).
4. **Make the lab index come alive.** The poster (lab/page.tsx:36-43) becomes a live, reduced-count View on hover or focus. The lab is the one place the edition promises spectacle. Impact M, effort M (4h).
5. **Give the Ask send a completion moment**: a paper-plane flight plus sound, and the note rises in. Today the note just appears (chat-composer.tsx:259). Impact M, effort S-M (3h).
6. **Collapse filtered rows instead of popping them.** project-list.module.css:11 fades opacity only, so the layout jumps. Impact M, effort S (1h).
7. **Fix motion-token drift.** Several `transition-colors` calls use Tailwind's default 150ms `cubic-bezier(.4,0,.2,1)` with no token: home/now-summary.tsx:22, ask/thread-reply.tsx:11, ask/ask-pagination.tsx:8, ask/chat-bubble.tsx:74, resume/resume-link.tsx:9, lab/page.tsx:34. The cursor ease (cursor.module.css:14) is `(0.22,1,0.36,1)` where the token is `(0.23,1,0.32,1)`. The stage handoff is 700ms (experiment-stage.tsx:78), where the poster contract is 400ms (docs/m2-scene-spec.md:57). Impact L, effort S (1h).
8. **Scrollbar: needs a captain decision.** The baseline asks for edition-styled scrollbars, but Minimal's thin scrollbar was removed on purpose in 68090a8. At most, add `html { scrollbar-color: var(--color-faint) transparent }`, one line and no `::-webkit` rules. Otherwise leave it native, which suits text-first. Impact L, effort S (0.25h).

## 4. Animation improvements (find-animation-opportunities)

| # | Location | Today | Purpose | Frequency | Exact motion (repo tokens) and reduced-motion fallback |
|---|---|---|---|---|---|
| 1 | Ask "sent" note, ask/chat-composer.tsx:259-265 | appears instantly | confirm causality after submit | rare (per send) | `opacity 0→1, translate 0 4px→0`, `var(--duration-enter)` 220ms `var(--ease-enter)`, 80ms delay after the plane (6·A1) leaves. RM: opacity only, 160ms linear (`data-motion-safe`) |
| 2 | Pending echo bubble arrival, ask/pending-echo.tsx | pops in | spatial continuity from composer to feed | rare | `@starting-style { opacity:0; scale:.98; translate:0 6px }`, 220ms `--ease-enter`, `transform-origin: bottom right`. RM: opacity 160ms |
| 3 | Busy buttons, chat-composer.tsx:213, owner-sign-in.tsx:43/96, moderation-strip.tsx:150 | spinner is swapped in, so width may jump | label↔spinner without layout jolt | per submit | stack both in one grid cell (theme-toggle.tsx:17-22 pattern): shown `opacity 1 blur 0 scale 1` over `--duration-enter`, hidden `opacity 0 blur(3px) scale .6` over `--duration-exit`, `--ease-enter`. RM: opacity only |
| 4 | Filtered project rows, projects/project-list.module.css:11 | opacity fade, then removal | keep place in a changing list | occasional | wrap each row in `display:grid; grid-template-rows:1fr→0fr` plus opacity, 160ms `--ease-exit` out and 220ms `--ease-enter` in, with `interpolate-size: allow-keywords` already used in ui/disclosure.module.css:14. RM: instant hide, colour only |
| 5 | Lab index poster frame, lab/page.tsx:36-43 | bg tint only | invite into the lab | occasional hover | `@media (hover:hover)` `.group:hover` poster `scale 1.015`, 220ms `--ease-enter`. Exit 160ms `--ease-exit`. `overflow-hidden` is already on the frame. RM: none (scale is dropped by styles.css:429-437) |
| 6 | Stage handoff, experiment-stage.tsx:78 | `duration-700 ease-out` | poster to live without a flash | once per visit | `opacity`, 400ms `var(--ease-enter)` (m2-scene-spec.md:57 poster contract). RM: n/a (no scene) |
| 7 | Changelog sticky year index, changelog/year-index.tsx:66 | bar tints on hover only | show which year you're reading | continuous scroll, compositor only | per-year `view-timeline-name: --y<year>` on each ChangelogYear, with `animation: year-on linear both; animation-timeline: --y<year>; animation-range: entry 40% exit 60%` on its index bar (`scaleX .6→1`, `background-color → var(--color-accent)`). Same `@supports (animation-timeline: view())` guard as experience.module.css:116. RM: static bars |

Rejected:
- **Status-dot pulse loop** (projects/project-status.tsx). Killed by the frequency gate and the thesis: an ambient loop in a reading column pulls the eye every second (architecture.md:5).
- **cmdk open or list animation beyond the 120ms backdrop fade** (command/command-dialog.tsx:199). It's keyboard-initiated and high frequency, so it must feel instant (emil).
- **Sliding pill under project filter chips** (project-filter.tsx:71). Killed by purpose: they're multi-select toggles, so a single moving indicator implies a wrong model.
- **Headline or intro scroll parallax.** It makes text slower to read (architecture.md:5), and the one-time word rise already carries the entrance.
- **Signature "replay on hover".** It's a one-time sign-off, and repeating it cheapens it (the frequency gate); it also moves beside the text being read.

## 5. Sound design: "paper and nib"

**Concept.** Everything sounds like it happens on a desk, a few centimetres from your ear, and never like a UI chirp. Pencil taps, a card being set down, a page turning, an ink stamp, a folded plane leaving the hand. The sounds are dry, short and low: master ceiling around −24 dBFS, and every voice at or under gain 0.07 (today's tick is 0.15). The body is bandpassed noise, since paper is noise, plus an occasional very short sine for "weight". There are no melodic intervals except the one gentle two-note "sent".

**Palette: 6 distinct voices, all synthesized, 0 KB of assets.**

| Interaction | Voice | Synthesis recipe | Dur | Peak gain |
|---|---|---|---|---|
| Internal link / nav click | `tap` (pencil tap on paper) | white-noise buffer → BiquadFilter bandpass 3200Hz Q 1.4; env attack 1ms, exp decay; plus sine 900Hz for 8ms at 0.2× | 14ms | 0.045 |
| External link | `tap-out` | the `tap` recipe with bandpass 2400Hz and a second 10ms tap 40ms later at 0.5× (a "double tap") | 60ms | 0.04 |
| Button, switch or radio press | `set` (card set down) | noise → highpass 1800Hz, 6ms; plus triangle 620→420Hz exp over 25ms. Switch on: body 700Hz; switch off: 520Hz | 25ms | 0.055 |
| Disclosure open / close (project rows, roles, years, More, About) | `leaf` (page turn) | noise → bandpass with freq ramp 1200→3800Hz (open) or 3800→1200Hz (close), Q 0.9; attack 18ms, linear release; stereo pan −0.15→+0.15 for open | 140ms | 0.03 |
| Copy email (copy-email.tsx:25, command-dialog.tsx:128) | `stamp` (ink stamp) | sine 180→115Hz exp over 60ms; plus noise lowpass 900Hz for 30ms at 0.4× | 60ms | 0.07 |
| Ask sent, owner sign-in success (A1, O1) | `sent` (plane leaves hand) | noise bandpass 600→2400Hz over 240ms (whoosh), attack 30ms; then sine 1320Hz and 1760Hz at +200ms, 90ms each, decay 80ms, at 0.3× | 320ms | 0.04 |
| Theme toggle (site/theme-toggle.tsx:36) | reuses `set` | light: body 760Hz; dark: body 380Hz (pitch encodes direction) | 25ms | 0.05 |
| Wrong passphrase, form error | reuses `set` | two `set` at 420Hz, 70ms apart, lowpass 1500Hz ("dull knock") | 100ms | 0.05 |

That's 6 recipes, with a few pitch parameters on top.

**Rules.**
- **Opt-in**, default off (lib/prefs.ts:81). Enabling it previews `set` (customize-controls.tsx:137 today plays `playTick("button")`).
- **Reduced motion**: sound is not motion, so all event sounds stay. There are no scroll-linked or ambient sounds in this edition, now or proposed; that's a design rule, not a gate.
- **Hidden tab**: skip (click-sound.tsx:18 already does), and `suspendSound()` on `visibilitychange` hidden.
- **Touch**: skip (click-sound.tsx:19). Coarse-pointer devices get nothing, matching the gate at interaction-layer.tsx:78.
- **Keyboard**: skip when `event.detail === 0` on links (keyboard navigation should feel silent and instant). Keep it on switches and radios, where it confirms state.
- **Rate limits**: at most one voice per 40ms, the same voice at most once per 80ms, and at most 4 live nodes.
- **Mute**: the pref, plus `AudioContext.suspend` when off (lib/sound.ts:27-29).

**Wiring (no shared code imports flavors).**
- **Shared engine slice E1**. `lib/sound.ts` gains a data-only `Voice` type (`layers: {kind:"noise"|"osc", type?, freq:[from,to], filter?:{type,freq:[from,to],Q}, attack, decay, delay?, gain, pan?}[]`) and `playVoice(voice)`, with the limiter and limits above. `playTick` stays as a `Voice` constant for the other editions. Separately, `components/semantic/click-sound.tsx` takes `resolve?: (el: Element, e: MouseEvent) => Voice | null`, defaulting to today's link/button choice, and adds an optional capture-phase `toggle` listener (`<details>` `toggle` doesn't bubble, but document capture sees it) calling `onToggle?: (details) => Voice | null`.
- **Edition side**. `flavors/minimal/lib/sound/voices.ts` holds the 6 recipes. `flavors/minimal/components/interaction/sound-layer.tsx` renders `<ClickSound resolve={…} onToggle={…} />` and subscribes to `COPIED_EVENT` (interaction/cursor-events.ts:6) for `stamp`. It replaces the mount at interaction-layer.tsx:25-29 and :78. `sent` is called directly from the success branch that sets `status.kind === "sent"` (chat-composer.tsx:259) and from owner-sign-in success, both dynamic-importing `voices.ts` only when `data-sound="on"`. The theme toggle's pitch comes from resolving `[data-theme-toggle]` inside `resolve` (site/theme-toggle.tsx:36). Switch on or off is read from `aria-checked` before the click flips it (ui/switch.tsx:13).
- Sound and visual start in the same frame: `playVoice` schedules at `audio.currentTime` inside the same click handler where the `:active` scale (styles.css:386) and the disclosure transition begin.

## 6. 3D: two or more new elements per page

**Rendering architecture (applies to all rows).** Minimal adopts the shared one-canvas session instead of new canvases:
- `flavors/minimal/components/scene/scene-layer.tsx` mounts once in the layout, beside `InteractionLayer` (app/f/minimal/layout.tsx:68). It's a `position:fixed; inset:0; z-index:-1; pointer-events:none; aria-hidden` host that calls `useSceneMount(route, () => import("./scene-root"))` (components/semantic/scene/use-scene-mount.ts:49).
- `scene-root.tsx` calls `createSessionScene({ world, camera:{fov:30,position:[0,0,10]}, drag:{x:[-40,40],y:[-40,40]} })` (lib/scene/session.tsx:95). `world` renders one drei `<View.Port />`. Each glyph is a `<View track={placeholderRef}>` with its own `OrthographicCamera` (drei), so many tiny regions share one canvas and one root. Views that are offscreen are skipped.
- **Placeholders are real DOM.** Each glyph is an inline `<span data-glyph="<kind>" aria-hidden data-decorative>` sized in em that contains its **SVG or CSS poster**, which is also the T0 and reduced-motion state. A root attribute `data-scene-live` (set when `live` from useSceneMount) fades posters to 0 over 400ms `--ease-enter`.
- **Input** never comes from the canvas (it's behind the content). Hover and focus come from the existing DOM contract: `data-scene-item` → `store.hovered` (lib/scene/dom.ts:17-32). Drags use `bindDragInput` on the placeholder (lib/scene/session.tsx:31). Toggles come from the `<details>` `toggle` event.
- **Look**: ink on paper. `meshBasicMaterial` fill = `--color-surface`, drei `<Edges>` (threshold 15°) in `--color-foreground` at 0.55 opacity, and the accent only on the hovered or active piece. No lights, shadows or canvas text (docs/m2-scene-spec.md:9-10). Drei `Text`, `Text3D` and `Html` are excluded: every numeral and label stays in the DOM beside the glyph. `Float` and `useCursor` are excluded: no idle loops, and the native cursor is untouched (architecture.md:61).
- **Motion**: damped springs (`THREE.MathUtils.damp`, λ 12 for hover, 8 for toggles), advanced by the shared clock (lib/scene/clock.ts), which sleeps when idle. `kick()` runs on hover, toggle and scroll, so idle pages render **0 fps**.
- **Budgets per page**: at most 4 visible Views, ≤16 draw calls (Edges adds 1 per mesh; repeated pieces use `Instances`, and for lines an instanced EdgesGeometry LineSegments as in m2-scene-spec.md:143), ≤5k triangles, ≤1.5ms CPU and ≤1ms GPU per active frame at T2. Chunk: three + fiber + drei `View/Edges/Instances/OrthographicCamera/QuadraticBezierLine/RoundedBox` ≈ 230 KB gz, loaded after load and idle (use-scene-mount.ts:26-41), under the 300 KB cap (docs/flavors.md:74-78).
- **Tiers**: T2 is DPR [1,1.5] with antialias. T1 (coarse pointer, ≤4GB, `scene: low`) is DPR 1 with no antialias, and hover tilt is replaced by toggle-only motion. T0 (`scene: off`, saveData, no WebGL2, context loss, or PerformanceMonitor decline) shows posters only (tier.ts:12-16).
- **Reduced motion or the motion switch off**: posters only, no scene import, matching architecture.md:55 and experiment-stage.tsx:55.
- **Print**: every placeholder is `[data-decorative]`, so it's hidden (styles.css:1296).

| Page | Element | Where | Interactivity | Pieces / budget |
|---|---|---|---|---|
| `/` | **H1 Index cards**: one small folded card per Selected row, 1em, before the year | home/selected-projects.tsx:21 → ProjectRow year cell (project-row.tsx:103) | Row hover (data-scene-item `project:<slug>`) lifts the card 12° with an accent edge. Row open (`toggle`) unfolds the card 0→165° over the damp. Keyboard focus mirrors hover | **One** View over the whole list column (not per row). Cards are `Instances` of a 2-panel box; 2 calls; ~100 tris |
| `/` | **H2 Desk clock disc**: 1.1em flat disc with hour and minute hands at owner-local time | beside `<LocalTime>` (home/intro.tsx:83) | Hands update once a minute (one `kick()`). Pointer over the meta row tilts the disc ±10° toward it | 1 View; disc + 2 boxes + Edges; 4 calls; 1 frame/min idle cost |
| `/` | (optional) **H3 Avatar card**: the 64px avatar as a paper-cut card with 1.5px thickness | Avatar (home/intro.tsx:47-52) | ±8° tilt toward the pointer within the header; texture is the same avatar URL | 1 View, RoundedBox + textured plane, 3 calls |
| `/work` | **W1 Tenure stack**: one sheet per role, thickness ∝ months, stacked like a ream | header meta, left of "N roles" (work/page.tsx:40-43) | Hovering a role article (data-scene-item `role:<id>`, weight = months) slides its sheet out 20%. Toggling a role's details ("Expand all", ui/disclosure) fans the stack | 1 View; `Instances` sheets + instanced edges, 2 calls; ≤12 instances |
| `/work` | **W2 Rail beads**: each TimelineRail dot becomes a 9px ink bead; the current role's bead is accent | experience/timeline-rail.tsx:45-53 (md+, like the rail) | Beads roll (rotate) with `progress` through `data-scene-section` on the timeline, in step with the CSS rail fill. Role hover lifts its bead 2px toward the camera | 1 View over the rail column; `Instances` spheres (8 segments); 2 calls; poster = today's CSS dot |
| `/work` | **W3 Folder glyphs**: a manila folder for Skills and Education | collapsed-section.tsx summary | `toggle` opens the flap 0→110° | 1 View per open-able pair (2 small Views); 2 calls each |
| `/projects` | **P1 Index cards** (same as H1) for Featured and More | ProjectGroup lists (projects/page.tsx:70) | as H1; archived cards render faint (edges at 0.3) | 1 View per group (2); 2 calls each |
| `/projects` | **P2 Card fan counter**: a fan of N cards = visible project count | right end of ProjectFilter (projects/page.tsx:98-106) | Filter change (hash, lib/projects/filter-hash.ts) riffles cards in or out, spring λ 10, 220ms-ish settle. Hover spreads the fan 6°. The count text stays in the DOM | 1 View; `Instances` ≤24 cards; 2 calls |
| `/now` | **N1 Tear-off block**: a desk-calendar pad whose thickness shrinks as `updatedAt` ages (fresh = thick pad, stale = few sheets), blank paper with a ruled header band and no digits | beside "As of <date>" (now/page.tsx:29-35) | Hovering the meta lifts the top sheet's corner 18°. Once per visit, if updated in the last 7 days, one sheet peels off (a single 600ms damp; skipped under T1) | 1 View; `Instances` sheets + 1 curl plane (vertex bend in `onBeforeCompile`); 3 calls |
| `/now` | **N2 Paper tabs** behind the "01…0n" numerals | numbers column (now/now-list.tsx:30-35) | Row hover lifts that tab 3px in z and gives it the accent edge; the numeral (DOM) sits on top since the canvas is at z −1 | 1 View over the list; `Instances`; 2 calls |
| `/changelog` | **C1 Ledger spines**: each year a book spine, thickness ∝ entry count | sticky YearIndex (changelog/year-index.tsx:66, lg+). The xl bar is the poster | Hover or focus on a year pulls its spine out 30%. The year you're reading (data-scene-item `year:<y>` plus `data-scene-section` per year) is tilted forward | 1 View; `Instances` RoundedBox-like boxes; 2 calls |
| `/changelog` | **C2 Scroll roll**: a small paper roll at the open year's heading | ChangelogYear summary (changelog/changelog-year.tsx:21-25) | `toggle` unrolls the paper strip (vertex roll, 0→1 over λ 8); close rolls it back | 1 View per open year (cap 2 live); 2 calls |
| `/ask`, `/ask/page/[n]` | **A1 Paper plane**: folds from a flat sheet on the send button and flies off along a curve | anchored to ChatComposer submit (chat-composer.tsx:213) | Fires on `emit({type:"ask:sent"})` (the SceneEvent already exists, lib/scene/store.ts:23): fold 180ms, flight 520ms along drei `QuadraticBezierLine`-shaped path (path only, not drawn), then note #1 appears. `sent` sound starts in the same frame | 1 View covering composer→top-right; 7-tri plane + Edges; 2 calls; only on send |
| `/ask` | **A2 Envelopes**: one small envelope per thread row next to the reply count | ChatFeed rows (ask/chat-feed.tsx) | Row hover opens the flap 0→140°. Threads with new replies show the flap ajar at rest | 1 View over the feed; `Instances` body + flap; 3 calls; ≤ page size |
| `/ask/[slug]` | **S1 Thread**: a real sagging thread (24-seg line) down the reply gutter, replacing the look of the hairline | thread-line.ts:12 gutter (`-left-5/-7`) | Scroll `progress` through the thread pulls it taut (sag 6px→0). Hovering a reply plucks it (damped wave, 300ms) | 1 View over the thread column; drei `Line`; 1 call; poster = today's hairline |
| `/ask/[slug]` | **S2 Opened letter** beside the h1 | ask/[slug]/page.tsx:50-55 | On arrival the flap is already open (static pose, no intro animation). Pointer over the header tilts it ±8° | 1 View; 3 calls |
| `/resume` | **R1 A4 sheet** preview beside Print | print-button.tsx:13 (resume-document.tsx:60) | Hover curls the bottom-right corner (bend 0→0.35). Press flattens at scale .97, in sync with `:active`. The click is still the DOM `window.print()` | 1 View; plane 12×16 segments + ruled lines as `Segments`; 2 calls |
| `/resume` | **R2 Paper clip** on the header's top edge | resume-header.tsx top-left | Hover wiggles it (±4°, 2 damped cycles); drag slides it along the edge within 40px | 1 View; TubeGeometry along a clip path; 1 call |
| `/lab` | **L1 Live poster**: the experiment's scene at 1/8 particle count inside the poster frame | lab/page.tsx:36-43 | Starts only on hover or focus (fine pointer) and pauses on leave; the poster stays under it. Pointer ripple as on the stage | 1 View; reuses the signature-field material; 1 call; T1: poster only |
| `/lab` | **L2 Glass slide with ink drop** under the page header | PageHeader (lab/page.tsx:21) | Pointer pushes the drop (metaball-ish vertex offset toward the pointer, clamped 8px); click spreads it and it recovers over λ 6. The drop is the accent | 1 View; plane + disc; 3 calls |
| `/lab/[slug]` | **X1 Ink bottle accent control**: the bottle's ink is the accent | beside the stage hint (experiment-stage.tsx:94-98) | Vertical drag scrubs `accentHue` through the presets (lib/prefs.ts:43-50) via `setPrefs`; the field recolours live (useAccent). The DOM twin is a real `role="slider"` with arrow keys, so it's not pointer-only | **Inside the existing CanvasStage Canvas** as a drei `View` (keep one canvas on this route; the session layer does not mount on `/lab/*`); 3 calls |
| `/lab/[slug]` | **X2 Side inset**: a 96px orthographic side view of the same particle field | stage corner, top right | Mirrors the main scene's pointer impulses edge-on; drag rotates the inset camera ±60° | second View in the same Canvas, same geometry and material; +1 call |
| `/owner` | **O1 Padlock** beside the form | owner/page.tsx:22 | Correct passphrase opens the shackle (λ 10) with the `sent` sound. A wrong one shakes it ±3px over 3 cycles in 240ms, with the knock sound | 1 View; body + torus shackle; 3 calls |
| `/owner` | **O2 Key tag**: paper tag on a string | right of the header | Pointer tilts it; it swings once when the input gains focus | 1 View; 2 calls |
| 404 | **F1 Crumpled page** beside "Nothing here." | not-found.tsx:35-37 | Drag unfolds it (morph target crumpled→flat, amount = drag distance); release re-crumples on a spring | 1 View; 20×20 plane with morphAttributes; 2 calls |
| 404 | **F2 Dog-ear**: the content column's top-right corner folds back | not-found.tsx:33 container corner | Hovering the suggestions list folds it 0→40°. Mostly static | 1 View; 2 calls |
| `/about`, `/projects/[slug]` | Redirects (about/page.tsx:5, projects/[slug]/page.tsx:14): they inherit /work and /projects elements | n/a | n/a | n/a |

All pages stay within ≤4 Views and ≤16 calls. The busiest is `/work` (W1+W2+W3 ≈ 8 calls).

Rejected 3D:
- **CSS covers it**: a WebGL tilt of the project image inside open rows. A `perspective` plus `rotate3d` on the real `<img>` keeps it selectable and saveable.
- **Canvas text**: 3D numerals on the Now tabs, or a 3D wordmark in the header. It breaks find and selection (the thesis) and m2-scene-spec.md:10.
- **Floating ambient objects** (drei `Float`), a thesis violation.

## 7. Shippable slices (ordered)

1. **M-S1 Scene pref.** Add `scene` to Prefs, defaults, migrate, applyPrefs and the Customize "3D" row. Files: flavors/minimal/lib/prefs.ts, components/prefs/apply-prefs.ts, components/customize/customize-controls.tsx, lib/__tests__/prefs.test.ts. 2h. Impact H (unblocks 3D). Shared dependency: none.
2. **E1 (shared) Voice engine.** `Voice` type, `playVoice`, limiter, `resolve`/`onToggle` props on ClickSound; `playTick` kept for other editions. Files: lib/sound.ts, components/semantic/click-sound.tsx plus a test. 3h. Every edition needs it.
3. **M-S2 Paper-and-nib voices.** Files: flavors/minimal/lib/sound/voices.ts, components/interaction/sound-layer.tsx, interaction-layer.tsx:25-29,78, customize-controls.tsx:137, chat-composer.tsx:259 (sent), owner-sign-in.tsx (sent/knock). 3h. Impact H. Depends on E1.
4. **M-S3 Motion polish** (section 4, #1-#7) and token drift (section 3 #7). Files: chat-composer.tsx, pending-echo.tsx, owner-sign-in.tsx, moderation-strip.tsx, project-list.module.css, lab/page.tsx, experiment-stage.tsx, year-index.tsx, changelog-year.tsx, the files listed in section 3 #7, cursor.module.css:14. 4h. Impact M. No dependency.
5. **E2 (shared) View-friendly session check.** Verify drei `View`/`View.Port` under `createSessionScene`'s imperative root (frameloop "never" plus `advance`), with a fixed host sized to the viewport. Add an optional `onLive` flag so the edition can set `data-scene-live` for per-glyph posters (use-scene-mount.ts:77-82 handles only one sibling poster). 2-3h. Minimal needs it first; other editions benefit.
6. **M-S4 Scene layer and glyph kit.** scene-layer.tsx (fixed z −1 host), scene-root.tsx (world = View.Port), `<Glyph kind poster>` placeholder with SVG posters, ink/paper materials from CSS tokens (reuse lib/scene/colors.ts), damped pose helper, and budget asserts in dev. Files: flavors/minimal/components/scene/*, flavors/minimal/lib/scene/poses.ts, app/f/minimal/layout.tsx:68, styles.css (poster fade under `data-scene-live`). 10h. Impact H. Depends on M-S1 and E2.
7. **M-S5 Home, Projects, Work glyphs** (H1, H2, P1, P2, W1, W2; W3 and H3 optional) with `data-scene-item` and `data-scene-section` wiring. 8h. Impact H. Depends on M-S4.
8. **M-S6 Now, Changelog, Ask, thread glyphs** (N1, N2, C1, C2, A1 with `emit("ask:sent")` from chat-composer, A2, S1, S2). 9h. Impact M-H. Depends on M-S4, and M-S2 for sound sync.
9. **M-S7 Resume, Owner, 404 glyphs** (R1, R2, O1, O2, F1, F2). 6h. Impact M. Depends on M-S4.
10. **M-S8 Lab** (L1 live poster in the session layer; X1 and X2 as Views inside the existing CanvasStage, with a `role="slider"` DOM twin). Files: lab/page.tsx, lab/poster.tsx, lab/experiment-stage.tsx, components/semantic/lab/canvas-stage.tsx (add `eventSource` for View; a shared, headless change). 5h. Impact M. Depends on M-S4.
11. **M-S9 Budget and a11y pass.** Lighthouse on every Minimal route (it's the default flavor: docs/flavors.md:80-81), scene chunk ≤300 KB gz (scripts/check-budget.ts), CLS 0 with posters, axe check that every glyph is `aria-hidden`, and print shows no glyphs. 3h. Depends on everything.

Total ≈ 55-60h. Order to ship: S1 → E1 → S2 → S3 (visible wins, low risk), then E2 → S4 → S5-S8, then S9.

---

# Appendix B: Drawing Set

(Sub-agent audit, spot-checked by the lead in §2.6. The sound palette is subject to the dedupe rules in §2.2. Main-report §6 supersedes any "captain decision" or "pending confirmation" note below; the owner chose custom edition-styled scrollbars.)

# Edition audit: Drawing Set (`flavors/drawing-set`, `app/f/drawing-set`)

Paths are relative to the repo root. `FDS` = `flavors/drawing-set`, `ADS` = `app/f/drawing-set`.

## 1. Design language

- **Palette** (`FDS/styles.css:17-36`, `light-dark(day, night)`): day is a diazo whiteprint and night is a cyanotype. ground `#eceee9/#0e2542`, sheet `#f4f5f1/#122d4f`, sheet-deep `#e2e5df/#0a1d36`, ink `#1e2c74/#dce8f0`, ink-soft `#4c5796/#9db7cb`, ink-faint `#55609b/#819eb5`, line `rgb(30 44 116/.2)` / `rgb(220 232 240/.22)`, line-strong at `.5`. The accent is the "redline": `oklch(.46|.72 .17 var(--accent-hue))`, hue 32 by default (`:98`), with presets 32/70/165/255/300/350 (`FDS/lib/prefs.ts:27-34`). A static turbulence wash sits at 5-7% opacity (`styles.css:128-142`).
- **Fonts** (`styles.css:38-44`): Archivo display in condensed caps (`[font-stretch:62-72%]`, weight 540), Newsreader text at 18px with line-height 1.6, and Azeret Mono for labels (11-13px, tracking 0.08em, tabular numerals). Radii are 2-4px; drawings have square corners (`:71-74`).
- **Layout device**: a fixed drawing frame inset 12px (8px on mobile) with A-H / 1-8 grid ticks (`FDS/components/site/drawing-frame.tsx:5-6,23-79`). Every page is a numbered sheet (`FDS/content.ts:6-15`). Other devices are the title block, the schedules, `Dimension` (true measurements only) and `Stamp`s.
- **Motion vocabulary** (`styles.css:76-105`): `--ease-glide cubic-bezier(.16,1,.3,1)`, `--ease-enter (.23,1,.32,1)`, `--ease-exit (.4,0,1,1)`, and `--ease-flick` as an overshoot `linear()`. Durations: press 120ms, UI 260ms, route out 180ms / in 260ms (+60ms delay, blur 2px), camera 1100ms. `.press:active` scales to 0.97 (`:359-369`). The one orchestrated moment is plotting: `plot-x/plot-y` draw in over 480ms glide, first session load only (`:386-406`, `ADS/layout.tsx:23`). Dimensions re-plot over 400ms on navigation or when they scroll into view (`FDS/components/ui/dimension.tsx:26-28`). Tilt is limited to large sheets (`styles.css:318-357`). Split headings use gsap SplitText.
- **Cursor**: a redline crosshair (24px, rotates 45deg and scales 1.3 on hot targets over 200ms glide) with a mono grid-reference readout (`C4`), or the `data-cursor` label (`FDS/components/interaction/cursor.tsx:26-35,93-100`, `cursor.css:26-41`). Fine pointer with motion on only.
- **Scrollbar**: not styled. `html` only sets `scrollbar-gutter: stable` (`styles.css:122-125`); the refactor overrides were removed in `68090a8`. **This misses the cross-edition baseline** (see D2).
- **3D today**: one persistent canvas (plan chest + drafting table in instanced linework, 2 draw calls per `Linework`, `FDS/components/scene/linework.ts`). Each page gets a single `SceneSlot` with its own route pose and prop group (`FDS/components/scene/world.tsx:70-590`, `FDS/lib/scene/poses.ts:116-232`). Interactivity on every route: drag orbit (4px threshold, `FDS/components/scene/scene-root.tsx:54-116`), drawer hover that slides the drawer 0.2 and click-to-navigate (`world.tsx:335-355`), and pointer parallax of 0.08 rad (`:535`). There is no idle motion.

## 2. Per-page inventory

| Page | What renders today | Current 3D (slot / pose) | Current motion | Gaps |
|---|---|---|---|---|
| Home `/` (`ADS/page.tsx`) | Hero (eyebrow, CTAs over the drawing, headline, `Dimension`, `TitleBlock`), ExperienceSummary, SelectedSheets, CurrentRevision | `home` / `fill` in the hero (`FDS/components/home/hero.tsx:58`). Chest with callouts A-G, SVG leaders (`world.tsx:267-300`); hovered drawer opens 0.55 | First-load plot, split heads, leader stroke colour swap, tilt on selected sheets | ExperienceSummary rows carry `data-scene-item="role:"` (`FDS/components/home/experience-summary.tsx:32`), but the home route ignores items, so hovering a role does nothing (drawer 02 should open) |
| Projects `/projects` | PageHeader, selected ProjectSheets (tilt), register with stack chips and a hover leader preview | `projects` / `window` (`ADS/projects/page.tsx:37`). Up to 12 sheets fan out of drawer 01; the hovered sheet lifts in redline (`world.tsx:357-379`) | Leader draws in 200ms (`FDS/components/projects/project-register.tsx:127-130`, hard-coded ease). The row tick is inserted as `content:'→ '` | Stack filter doesn't reach the scene. The row "tick" is text insertion, so the mark reflows (`FDS/components/ui/schedule.tsx:86`) |
| Project `/projects/[slug]` | Header, View A/B DrawingFrames (B is a placeholder "diagram to follow"), notes, title block, stack schedule | `project` / `band` (`ADS/projects/[slug]/page.tsx:71`). One sheet on the board; the camera tilts with `progress` (`world.tsx:381-389,540-543`) | Split heads only | No `data-scene-section`, so progress is page scroll, not the case study (spec `docs/m2-scene-spec.md:124`). The View B placeholder is empty |
| Work `/work` | PageHeader, YearRail (lg), chain timeline | `work` / `band` (`ADS/work/page.tsx:52`). Chain segments ∝ tenure; active = hovered or scroll-scrubbed (`world.tsx:391-420`) | Dimension plot, continuity chevron rotate 260ms | Solid. `data-scene-active` is under-used in the DOM styling |
| About `/about` | GeneralNotes, skills schedules, education, contact title block | `about` / `band` (`ADS/about/page.tsx:38`). 14 cards riffle with progress (`world.tsx:422-450`) | Split heads | Copying the email gives only a "Copied" text swap (`FDS/components/site/copy-email.tsx:13-28`) |
| Now `/now` | Current revision, log by year, category filter | `now` / `band` (`ADS/now/page.tsx:40`). A 24-card lean wave, revision cloud and triangle (`world.tsx:452-475`) | Colour transitions | The category filter doesn't reach the scene |
| Ask `/ask` (+ `/ask/page/[n]`) | RFI composer, How-this-works, moderation strip, feed, pagination | `ask` / `band` (`ADS/ask/page.tsx:55`). Slip tray; `ask:sent` drops a redline slip (`world.tsx:254-262,477-501`, `FDS/components/ask/chat-composer.tsx:86`) | Composer expand 260ms, ANSWERED stamp pops from scale 1.5 (`FDS/components/ask/answered-stamp.tsx:20-25`) | `/ask/page/[n]` has **no slot** (`ADS/ask/page/[page]/page.tsx`) |
| RFI `/ask/[slug]` | Back link, header, thread, footer CTA | **none** | none | No scene at all, though the spec's slip vocabulary fits |
| Lab `/lab` | PageHeader, study cards (tilt + glare) | `lab` / `band` (`ADS/lab/page.tsx:34`). Turntable plus up to 6 solids; drag spins it; hover faces the study to the camera (`world.tsx:503-527`) | Tilt; `hover:border-accent/40` is **not** behind `fine:` (`FDS/components/lab/study-card.tsx:25`) | Only one study exists, so the turntable is nearly empty |
| Study `/lab/[slug]` | Header, tags, ExperimentStage | Its **own** WebGL context (`FDS/components/lab/experiment-stage.tsx:20-31`), separate from the session canvas | Experiment's own | Two GL contexts in a session. No view controls |
| Resume `/resume` | Folio tag, band slot, ResumeDocument, print | `resume` / `band` (`ADS/resume/page.tsx:22`). An A4 with ruled lines, static (`world.tsx:529-530`) | none | Static. The A4 doesn't mirror the document |
| Owner `/owner` | Sign-in | Reuses `ask` / `window` (`ADS/owner/page.tsx:28`) | none | Sign-in success has no feedback in the scene |
| 404 | Frame, "Sheet not found in set", nav | `notfound` / `window` (`ADS/not-found.tsx:63`). Drawer 08 open 1.7, empty | none | Nothing to do in the scene |
| `/changelog` | `permanentRedirect("/now#log")` (`ADS/changelog/page.tsx:5`) | n/a | n/a | n/a (covered by Now) |

## 3. Design improvements (ranked)

| # | What | Where | Why | Impact | Effort |
|---|---|---|---|---|---|
| D1 | Make the register margin tick a drawn 8px redline rule (`absolute`, `plot-x` scale 0→1), not `content:'→ '` | `FDS/components/ui/schedule.tsx:86` | The text insertion shifts the DWG number on every hover, and design.md:128 asks for a tick | H | S (1h) |
| D2 | Edition scrollbar: `scrollbar-color: var(--color-line-strong) var(--color-ground); scrollbar-width: thin`, plus a WebKit thumb with a 1px `line` border and square corners (it reads as a scale bar) | `FDS/styles.css:122` | Cross-edition baseline; the Drawing Set has none since `68090a8` | M | S (0.5h) |
| D3 | Theme change harmony: the DOM swaps instantly while the scene uniforms tween 400ms `power1.out` (`world.tsx:209-221`). Run the DOM swap inside `startViewTransition` with a 400ms crossfade, "exposure", so both land on the same frame (minimal has `flavors/minimal/lib/interaction/theme-reveal.ts:54-68` as a pattern to copy, not import) | `FDS/lib/prefs-store.ts` (theme setter) | Apple multimodal harmony: sheet and ink should expose together | M | S (2h) |
| D4 | Home: hovering or focusing an ExperienceSummary row opens drawer 02 (map `role:*` → `drawer:02` on home) | `world.tsx:335-348`, `experience-summary.tsx:32` | The attribute is already emitted but dead; it links the chest to content | M | S (1h) |
| D5 | Add `data-scene-section` on the project case-study body, and make the slot sticky in it | `ADS/projects/[slug]/page.tsx:92` | Spec `m2-scene-spec.md:124`; today the tilt scrubs over the whole page | M | S (1h) |
| D6 | Give `/ask/page/[n]` and `/ask/[slug]` a `SceneSlot route="ask"` ("band" and "window") | `ADS/ask/page/[page]/page.tsx`, `ADS/ask/[slug]/page.tsx:57` | Every sheet has a scene region (design.md:98) | M | S (0.5h) |
| D7 | Gate the study-card border hover behind `fine:` | `study-card.tsx:25` | Sticky hover on touch; rule in `docs/m1b-drawing-set.md` | L | S (0.1h) |
| D8 | Use the `--ease-glide` token for the leader, not an inline `cubic-bezier(.22,1,.36,1)` | `project-register.tsx:129` | One vocabulary | L | S (0.1h) |
| D9 | The command palette subtitle says "Click and drawer sounds", but only one tick exists | `FDS/components/command/items.ts:99` | False promise; fixed by §5 | L | S |
| D10 | Stack chip and category filter state → scene: non-matching sheets and cards sink back into their drawer (`faint`) | `project-register.tsx:98`, `FDS/components/now/category-filter.tsx` → store `filter` | The scene should respond to the page's real state, not just hover | M | M (3h) |

## 4. Animation improvements

### Opportunities

| # | Location | Today | Purpose | Frequency | Motion (reduced-motion fallback) |
|---|---|---|---|---|---|
| A1 | Register row tick (`schedule.tsx:86`) | Text arrow pops in | Wayfinding, marks the row under the pointer | High (hover), but the tick is 8px and not layout-bearing | `transform: scaleX(0→1)`, origin left, 120ms `--ease-glide`; out 80ms `--ease-exit`. RM: instant, colour only |
| A2 | ANSWERED stamp (`answered-stamp.tsx:20-25`) | scale 1.5→1, 200ms flick | Feedback that an RFI was answered, physical press | Once per stamp per session | From `scale(1.12) rotate(-6deg)` to `scale(1) rotate(-2.5deg)`, 180ms `--ease-flick`, same frame as the `stamp` sound (§5). 1.5 is too far and reads as a zoom. RM: already a no-op |
| A3 | Copy email (`copy-email.tsx:18-28`) | Text swap to "Copied" | Confirmation | Rare | A "COPIED" mini `Stamp` presses in with A2's values, holds 1600ms, fades 160ms `--ease-exit`. RM: opacity only |
| A4 | Nav current-sheet tick (`FDS/components/site/nav-links.tsx:28` `after:`) | Each link has its own tick, swapped instantly | Continuity: the tick moves to the new sheet | Per navigation | Replace the pseudo with one `<span style="view-transition-name:sheet-tick">` inside the current link. The VT group animates the position over 260ms `--ease-glide`, in the same transition as `page-in`. RM: `[data-motion=off]` fade, as `styles.css:273-279` already does |
| A5 | Text CTAs `Button` primary/ghost (`FDS/components/ui/button.tsx:63`) | No `:active` state; only icon buttons get `.press` (`:123`) | Press feedback | Medium | `active:translate-y-px` plus underline `border-color: accent`, 120ms `--ease-flick` (no scale on text; it blurs condensed caps). RM: colour only |
| A6 | Theme toggle (D3) | DOM instant, scene 400ms | Harmony | Rare | VT root crossfade 400ms `cubic-bezier(.23,1,.32,1)` (`--ease-enter`), timed so the scene's colour tween starts on the same rAF. RM: 160ms linear fade |
| A7 | Composer send → slip (`chat-composer.tsx:86`) | Scene drops a slip, the form resets | Causality: your message becomes the slip | Rare | Composer box `translateY(-4px)` + `opacity .6` for 140ms `--ease-exit`, then resets in 260ms `--ease-enter`; the slip drop starts on the same frame. RM: no translate |

### Rejected

- **Split-text reveal on every SheetHeading on scroll**: frequency gate. There are dozens per session and the headings are the content, and text must never wait (`docs/design.md:126`). Keep it for page headers only.
- **Idle "breathing" or `Float` on the chest**: the spec forbids idle motion (`docs/m2-scene-spec.md:75`). It burns frames against the sleeping clock (`lib/scene/clock.ts`).
- **Animating the ⌘K dialog open**: keyboard-initiated and high-frequency (emil). It stays instant.
- **Hero `Dimension` label count-up (0→N years)**: text must be present from first paint (design.md:126) and the number is a fact; purpose gate.
- **Tilt on register rows**: design.md:128 keeps tilt off dense lists. It would also fight the leader preview.

## 5. Sound design

**Concept: the drafting room.** Every sound is something a drawing set physically does: graphite on vellum, a mechanical pencil clutch, a steel plan-chest drawer on its runners, a sheet sliding out, a rubber stamp and the plotter's stepper. The sounds are dry and close, with no reverb. Everything sits below 0.2 gain and is shorter than the matching motion, so sound and picture land on the same frame.

**Palette: 6 distinct sounds**, all synthesized (0 KB of assets, no licensing). A noise source is a 1s white-noise `AudioBuffer` created once and reused.

| Interaction | Sound | Recipe | Trigger (file:line) |
|---|---|---|---|
| Link click | `lead`: pencil tap on vellum | noise → bandpass 3200Hz Q1.4, 1ms attack, exp decay 14ms, gain 0.07; plus triangle 1900→1300Hz, 12ms, gain 0.04 | shared `ClickSound` capture (`components/semantic/click-sound.tsx:24-26`) via the edition's voice map |
| Button, switch, segmented control | `clutch`: mechanical pencil click | two transients 24ms apart: noise → highpass 2500Hz, 3ms each, gains 0.09 / 0.05; square 950Hz 5ms under the first. Switch off plays them reversed (quiet first) | same; switch state is read from `aria-checked` |
| Drawer opens on navigation (scene drawer click, SceneNav, or any route change that opens the route's drawer) | `drawer`: plan-chest runner | noise → lowpass 500Hz, bandpass sweep 240→620Hz over 170ms, gain 0→0.10 (25ms)→0; then sine 72Hz "stop" thump, 40ms, gain 0.12, at 170ms | `FDS/components/scene/world.tsx:226` (route change in the store subscription), gated on `motionOn()` |
| Sheet lifted, clicked to open (projects fan), study raised by click | `sheet`: paper slide | noise → bandpass 1500→4200Hz sweep, Q0.8, 130ms, attack 20ms, gain 0.05 | `world.tsx:607-612` (`onClick` with href), before `navigate` |
| ANSWERED stamp, RFI sent, email copied, owner signed in | `stamp`: rubber stamp | sine 120→58Hz over 80ms, gain 0.16; noise → lowpass 900Hz, 25ms, gain 0.08; 1ms attack | `answered-stamp.tsx:21`, `chat-composer.tsx:86`, `FDS/components/about/contact-block.tsx:45`, `FDS/components/ask/owner-sign-in.tsx` (success) |
| Dimension re-plot after navigation (not on scroll-in) | `plot`: pen-plotter step | square 480Hz with an AM gate at 55Hz (a gain node driven by a 55Hz square LFO), 300ms, gain 0.025, lowpass 2kHz. Rate-limited to 1 per 800ms | `FDS/components/ui/dimension.tsx:53` when `byNavigation` |

- **Count**: 6 sounds (4 click-class, 2 event-class). None play on hover (frequency gate).
- **Opt-in**: already off by default (`FDS/lib/prefs.ts:61`). Enabling plays `clutch` as the unlock gesture (`FDS/components/customize/customize-controls.tsx:88`).
- **Reduced motion**: sound is not motion. Keep `lead`, `clutch`, `stamp` and `sheet`. Suppress `plot` (no plotting happens) and `drawer` when `data-motion=off`: the drawer snaps, so a 170ms slide sound would describe motion that didn't occur. Use a single `clutch` instead.
- **Mute / hidden tab**: `ClickSound` already skips `document.hidden` (`click-sound.tsx:18`). Add a `visibilitychange` → `suspendSound()`. Scene sounds can't fire while hidden because rAF and the clock stop.
- **Touch**: UI ticks stay silent on touch (`click-sound.tsx:19`). Confirmations (`stamp` on send or copy) do play: they're rare and deliberate. Verify that iOS Safari's `click` is a `PointerEvent`; if it isn't, the touch skip silently fails there.
- **Keyboard**: play on Enter/Space activation (deliberate). Never play on SceneNav arrow roving (`FDS/components/scene/scene-nav.tsx:35`).
- **Wiring (no shared → flavor import)**:
  1. Shared `lib/sound.ts` grows a generic `play(recipe: Voice)`. A `Voice` is plain data (`{ osc?: [...], noise?: {...}, filter?: {...}, env: {...}, gain }`), and the existing `playTick` becomes one recipe.
  2. `ClickSound` takes `voiceFor?: (el: Element, e: MouseEvent) => Voice | null`, defaulting to today's ticks.
  3. The edition owns `FDS/lib/sound/voices.ts` (the 6 recipes plus `voiceFor`) and passes it in `FDS/components/site/deferred-layers.tsx:23`.
  4. Elements can opt into a voice with `data-voice="stamp"`, **not** `data-sound`, which is already the pref flag on `<html>` (`prefs.ts:14,139`), the same collision the cursor dodges at `cursor.tsx:74`.
  5. The scene calls a `playVoice` exported from the edition module (world.tsx is edition code), gated on `data-sound=on`.

## 6. 3D: new elements (two or more per page)

**Riding the session**:

- **Mode P** (a prop in the existing slot): edition-only. A new `Linework` adds 2 draw calls, a proxy adds 0. It needs a `presence()` group plus `commit()` like today (`world.tsx:87-100`).
- **Mode V** (a tracked viewport outside the slot): needs shared slice **S-V**. The session canvas becomes `position:fixed; inset:0; pointer-events:none` behind content (`z-index` below `DrawingFrame` z-30). The slot, and any `[data-scene-view]` element, becomes a drei `View` `track` (drei 10.7.9 `web/View.js`: `View`, `View.Port`). Mount `<View.Port/>` in the imperative root with `events` bound to `document.body` as the event source. Each View gets an IO (awake only if intersecting) and a scissor render, per `lib/scene/dom.ts:141-185` generalized.
- **Mode G**: a Mode V view at glyph size (≤ 64px).

The contract holds: no canvas text, linework only (`Linework` over drei `Edges`, because `Edges` costs 1 call per mesh and isn't instanced). The spec limits drei to `PerformanceMonitor` (`m2-scene-spec.md:43`), so each new drei import needs a spec amendment. `Instances`/`Merged` aren't needed, since `Linework` is already instanced; `useCursor` is fine for pointer state. Hard budget: < 60 calls per frame, a scene chunk ≤ 300KB gz, and ≤ 4ms GPU at T1/DPR1.

**Fallbacks**:

- **T0 / low power**: an SVG poster built with `scene-posters.tsx`'s `view()` + `Linework` projection (`FDS/components/site/scene-posters.tsx:22,91`), server-rendered under every V/G element.
- **Reduced motion**: a static pose, no parallax or tilt; drag still works (spec `:75`).

| Page | # | Element | Where | Interactivity | Mode / pieces | Calls / tris | RM / T0 |
|---|---|---|---|---|---|---|---|
| Home | H1 | Drafting-machine arm (2-link parallel arm + scale head) clamped to the table | slot, on the board | Head swings to aim at the hovered or focused drawer (damped IK); click the head → `/projects` | P, `Linework` + proxy | +2 / ~600 segs | Static aimed at A / poster |
| Home | H2 | Triangular architect's scale lying along the hero `Dimension` | View tracked to `hero.tsx:83` | Drag rotates about the long axis with a 120deg snap (spring, interruptible); ticks re-space to show the year span | V, `View` + `Linework` | +2 / 300 segs | Face 1 static / SVG |
| Home | H3 | Sheet-corner glyph on each SelectedSheet: its title block lifts on hover | G on `FDS/components/home/selected-sheets.tsx` card corner | Hover lifts 0.1 with 4deg tilt; replaces the CSS tilt on that sheet | G | +2 each, ≤ 3 visible | Flat / SVG |
| Projects | P1 | Drawing tubes for SUPERSEDED projects, rolled on the table | slot | Hover rolls a tube 30deg and redlines it; click → project | P, `Linework` ×N instanced | +2 / 24-seg cylinders | Static / poster |
| Projects | P2 | Mini sheet inside the register's hover preview, tilting against pointer velocity (max 6deg) | G in `useLeader` preview (`project-register.tsx:111-133`) | Pointer velocity → tilt, damped k=9 | G | +2 | No tilt / preview image only |
| Projects | P3 | Stamp legend glyphs: a rubber stamp per status that presses on legend hover | G per `StampLegend` row | Hover presses 60ms; plays `stamp` only on click | G, one instanced `Linework` | +2 | Static / CSS stamp |
| Project | J1 | Exploded axonometric of the stack in View B (one slab per stack item) | V on View B `DrawingFrame` (`FDS/components/projects/drawing-frame.tsx`) (`ADS/projects/[slug]/page.tsx:86`) | Scroll explodes the slabs (gap 0→0.3 over the section); hovering a Stack schedule row redlines its slab (`data-scene-item="stack:<i>"`) | V, `Linework` N instances | +2 / ≤ 12 boxes | Exploded static / SVG |
| Project | J2 | T-square + 45deg set square sliding along the board edge with `progress` | slot | Scroll; drag the T-square along its edge (clamped) | P | +4 / 200 segs | Parked / poster |
| Work | W1 | Sticky triangular scale as the YearRail, ticks per year | V on `FDS/components/work/year-rail.tsx` | Scroll rotates 0→120deg; clicking a year keeps the existing jump | V | +2 | Static / existing rail |
| Work | W2 | Continuation-joint glyph (pin joint) per role, rotating to lock as its role becomes active | G per role in `FDS/components/work/experience-timeline.tsx:81` | Scroll-scrub active; hover spins the pin 90deg | G, one instanced view per visible role (≤ 4) | +2 each | Locked pose / SVG pin |
| About | B1 | Drafting dividers that "step off" down the General notes, one step per note, as you scroll | V on `FDS/components/about/bio.tsx` gutter | Scroll-linked steps (damped); hovering a note swings the dividers to it | V | +2 / 150 segs | Parked at note 1 / SVG |
| About | B2 | Rubber stamp + ink pad beside Copy email | G on `contact-block.tsx:45` | Click (copy) presses the stamp with the `stamp` sound on the same frame; hover lifts 0.05 | G | +4 | No press / CSS stamp (A3) |
| Now | N1 | Plotter gantry over the revision cloud; the pen carriage rides `drawRange` while the group plots in | slot | Plots once per visit (tied to presence 0→1); re-plots on category change | P | +2 / 120 segs | Parked / poster |
| Now | N2 | Revision piles per year (sheet stack height ∝ entries) | V on `FDS/components/now/year-index.tsx:4` | Hover lifts a pile; the category filter redlines matching sheets; click jumps (existing link) | V, instanced | +2 | Static piles / SVG |
| Ask | K1 | RFI slip leaving the composer and flying into the tray (cross-view flight) | V on the composer header → slot | Send: slip folds (160ms) and flies along a bezier to the tray (600ms glide), replacing the in-slot drop | V (needs the fixed canvas: one object crossing two tracked rects) | +2 | Slip appears in the tray / none |
| Ask | K2 | 3D ANSWERED stamp per answered thread, pressing when scrolled in | G per `FDS/components/ask/chat-feed.tsx:25` | IO once; hover wiggles 2deg | G, one instanced `Linework` across visible threads | +2 total | CSS stamp (A2) |
| Ask pages `/ask/page/[n]` | K3 | Same tray slot as `/ask` (D6), with slip count = threads on this page | slot | As `/ask` | P (existing) | 0 new | poster |
| Ask pages | K4 | K2 stamps, shared | G | As K2 | G | as K2 | as K2 |
| RFI `/ask/[slug]` | R1 | New slot: this thread's slip pinned to the board, reply slips stacked under it (count = `replies.length`) | slot `window` above `ChatThread` (`ADS/ask/[slug]/page.tsx:94`) | Hovering a reply in the DOM lifts its slip; drag orbit | P, reuses `slip()` | +2 | Static / new poster |
| RFI | R2 | Paper clip binding question to response, at the thread's top-left | G | Hover rotates the clip open 15deg; purely an affordance | G | +2 | Static / SVG clip |
| Lab | L1 | Dividers that open to the hovered study's footprint width | slot, chest top | Hover the study DOM or mesh → dividers span it; drag spins the turntable (existing) | P | +2 | Closed / poster |
| Lab | L2 | Study solid rotating inside its card head on hover (the card's own study) | G in `study-card.tsx:37` | Hover spins at 0.6 rad/s, but only while hovered (not idle); drag turns it | G | +2 per visible card | Poster image |
| Study `/lab/[slug]` | S1 | CAD view cube (linework cube, faces redline on hover) in the stage corner, controlling the experiment camera | inside the experiment's own canvas via drei `Hud` | Click a face snaps the view (1.1s glide); drag orbits | experiment canvas, `Hud` | +2 | Hidden / none |
| Study | S2 | Drawer-03 glyph in the eyebrow: slides open to show the study count as sheets; click → `/lab` | G at the PageHeader eyebrow | Hover opens 0.3; click navigates (`drawer` sound) | G (session canvas) | +4 | Closed / SVG |
| Resume | U1 | A4 minimap: its ruled lines map to ResumeDocument sections; the current section redlines as you scroll | slot (needs `data-scene-section` + `data-scene-item="section:*"` in `FDS/components/resume/resume-document.tsx`) | Scroll; clicking a ruled block scrolls to its section | P (update `M.a4()` to one instance per section block) | +2 | Static / poster |
| Resume | U2 | Plotter glyph on the Print button; carriage steps once on click, on the same frame as `window.print()`, never delaying it | G on `FDS/components/resume/print-button.tsx:13` | Hover moves the carriage 2px; click runs a 300ms step | G | +2 | Static / SVG |
| Owner | O1 | Padlock on drawer 06; the shackle lifts on successful sign-in (new `emit({type:"owner:in"})`) | slot | Event-driven, plus the `stamp` sound | P (+ a `SceneEvent` union member in shared `lib/scene/store.ts:23`, which is generic, not flavor-specific) | +2 | Unlocked state / poster |
| Owner | O2 | Combination dial beside the submit button: turns a notch per attempt, shakes back 4px on failure | G | Submit only, never on typing (keyboard frequency gate) | G | +2 | Static |
| 404 | F1 | Misfiled sheets fallen in front of the chest, one per nav sheet (01-04) | slot | Hover redlines and lifts; click → that sheet (a DOM-equivalent nav already exists) | P, `sheet()` ×4 + proxy | +2 | Static / poster |
| 404 | F2 | Loupe (lens ring + handle) that follows the pointer over the empty drawer interior | slot | Pointer-follow, damped k=6; hidden on touch | P | +2 | Parked at centre |

**Budgets**: the worst route becomes lab at 20 + 4 (L1, L2 ×1) = 24, and project at 6 + 2 + 4 + J1 2 = 14. A crossfade still peaks near 40, under 60. Every View is gated by its own IO, so off-screen glyphs cost 0 calls.

**Frame**: every new animation is damped (`approach` in `world.tsx:181-185`) or goes through `tween()`, so the sleeping clock still applies. Glyphs never keep the clock awake after they settle.

## 7. Shippable slices

1. **Hygiene pass**: D1, D2, D5, D6, D7, D8 and A1. Files: `schedule.tsx`, `styles.css`, `ADS/projects/[slug]/page.tsx`, `ADS/ask/page/[page]/page.tsx`, `ADS/ask/[slug]/page.tsx`, `study-card.tsx`, `project-register.tsx`. **3h**, impact H. No shared dependency.
2. **Press and stamp feedback**: A2, A3, A5, A7. Files: `answered-stamp.tsx`, `copy-email.tsx`, `button.tsx`, `chat-composer.tsx`. **3h**, M. None.
3. **Drafting-room sound**: the §5 palette and D9. Files: new `FDS/lib/sound/voices.ts`, `deferred-layers.tsx`, `world.tsx`, `dimension.tsx`, `answered-stamp.tsx`, `contact-block.tsx`, `owner-sign-in.tsx`, `items.ts`. **5h** edition-side, H. Depends on shared **S-SND** (`play(voice)` in `lib/sound.ts`, `voiceFor` and `data-voice` in `ClickSound`, visibility suspend; about 3h).
4. **Scene responds to page state**: D4, D10, plus the in-slot props H1, P1, J2, N1, R1 (with D6), L1, U1, O1, F1, F2. Files: `world.tsx`, `models.ts`, `poses.ts` (R1 pose), `resume-document.tsx`, `scene-posters.tsx` (new posters), `lib/scene/store.ts` event union. **14h**, H. No shared engine beyond one event type.
5. **Theme exposure**: D3 / A6. Files: `FDS/lib/prefs-store.ts`, `styles.css`. **2h**, M. None.
6. **Nav tick continuity**: A4. File: `nav-links.tsx`, plus VT CSS in `styles.css`. **1.5h**, L-M. None.
7. **Tracked views**: H2, J1, W1, B1, N2, K1. Files: `scene-root.tsx`, `world.tsx` (split per-view scenes), `scene-slot.tsx`, the page components listed in §6, plus SVG fallbacks. **16h**, H. Depends on shared **S-V** (fixed session canvas + drei `View` tracks, per-view IO in `lib/scene/dom.ts`, `use-scene-mount` releasing the slot-as-track, and a spec amendment for the `View` import; about 10h shared, benefits every edition).
8. **Glyph views**: H3, P2, P3, W2, B2, K2/K4, R2, L2, S2, U2, O2. Files: a new `FDS/components/scene/glyph.tsx` (`<SceneGlyph kind>` rendering a `[data-scene-view]` + SVG fallback), plus call sites. **12h**, M. Depends on slice 7 / S-V.
9. **Study view cube**: S1. File: `FDS/components/lab/experiments/signature-field/signature-field.tsx` (drei `Hud`). **4h**, L. None (it lives in its own canvas). A follow-up is folding lab experiments into the session canvas to drop the second GL context.

---

# Appendix C: Control Surface

(Sub-agent audit, spot-checked by the lead in §2.6. The sound palette is subject to the dedupe rules in §2.2. Main-report §6 supersedes any "captain decision" or "pending confirmation" note below; the owner chose custom edition-styled scrollbars.)

# Edition audit: surface ("Control Surface", HR-26)

Scope: `flavors/surface/**`, `app/f/surface/**`, `docs/surface.md`, `docs/mocks/surface.{md,html}`. Read-only audit at `adb15cf` (fm/portfolio-edition-refactor).

**Correction to the lead's context.** Surface does **not** use `lib/scene/session.tsx`, R3F, drei or gsap for 3D. `flavors/surface/components/knob/knob-scene.ts` is plain three.js with its own `WebGLRenderer` and its own rAF spring loop (`knob-scene.ts:1-25,263-272`). It borrows only `Tier` (`knob-scene.ts:25`) and `detectTier` (`knob.tsx:22`) from `lib/scene`. The doc says this is deliberate: "one object does not need a reconciler" (`docs/surface.md:67`). `lib/scene/poses.ts` does not exist in this tree. Surface also does **not** mount the shared `ClickSound`: the only callers are drawing-set, press, survey, timetable (`deferred-layers.tsx`) and minimal (`interaction-layer.tsx`). Surface ticks only from the knob (`knob.tsx:125,305`) and the slide switches (`switches.tsx:55-57`), so links and keys make no sound here at all.

## 1. Design language

- **Palette** (`flavors/surface/styles.css:17-35`, light/dark via `light-dark()`): plate `#d5d2ca`/`#151514`, plate-2 `#dfdcd5`/`#1c1c1a`, plate-lo `#c3bfb6`/`#0c0c0b`, ink `#1a1a18`/`#ece9e2`, ink-2 `#4b4944`/`#a3a097`, ink-3 `#6f6c65`/`#7c7970`, signal `#f2b705`/`#f7c02a` (live things only, never text, `docs/surface.md:19`), led-off `#aaa69d`/`#383733`, lcd `#aab397`/`#141b12`, lcd-ink `#1c2217`/`#c9d7a2`, alarm `#a3281c`/`#ff7a66`. The body carries static powder-coat grain (`styles.css:95-111`).
- **Fonts** (`styles.css:37-41`, `lib/fonts.ts`): Barlow Semi Condensed 600 for legends and display (the LCP font), Barlow 400/500 for text, Doto 800 for the dot-matrix line only. Numerals are hand-built seven-segment SVG (`components/ui/seg.tsx`).
- **Layout device**: a 12-column faceplate of `.mod` and `.rack-mod` modules split by milled seams `.seam-t`/`.seam-b` (`styles.css:165-183,372-401`), with `.glass` LCDs (`:285`), a `.rating-plate` (`:309`) and `.screw` heads (`:346`). Inner pages use `Panel` (`components/site/panel.tsx:52-113`): title in 8 columns, a sticky knob module in the right 4 (`panel.tsx:79`).
- **Motion vocabulary**: `--ease-detent cubic-bezier(.34,1.45,.5,1)`, `--ease-out cubic-bezier(.23,1,.32,1)`, `--ease-spring cubic-bezier(.3,1.5,.6,1)` (`styles.css:66-68`). Key press is 80ms translateY(1px) (`:214-226`). LED fades are 150ms linear (`:257-259`). The in-progress pulse is 1.8s (`:269-271`). The slide thumb is 200ms ease-spring (`:436`). The SVG knob uses 550ms ease-detent (`knob.tsx:515`). Route changes run out 140ms `cubic-bezier(.4,0,1,1)` and in 220ms ease-out after a 40ms delay (`styles.css:531-550`). The 3D spring is k 0.13 with damping 0.7 per frame (`knob-scene.ts:233`). With motion off everything snaps (`styles.css:485-497`, `knob-scene.ts:54`).
- **Cursor**: the system cursor everywhere. `cursor-grab`/`active:cursor-grabbing` appears only on the knob hit area (`knob.tsx:577`). There is no labelled cursor, which misses the cross-edition baseline. A fine-pointer lean feeds only the 3D knob tilt (`knob.tsx:342-351`).
- **Scrollbar**: the default scrollbar. The "fader" scrollbar and smooth scroll that `93e8c5d` added were removed in `68090a8` ("remove refactor scrollbar overrides"). Only `scrollbar-gutter: stable` is left (`styles.css:91`). This misses the baseline.
- **3D today**: one lathe-turned knob per page. It has 150 instanced knurl ribs, a signal index and two blob shadows, lit by RoomEnvironment plus one directional light (`knob-scene.ts:97-204`). That is about 5 draw calls and about 5k triangles, and nothing renders while it is idle (`:263-272`). **Interactivity**: drag through notched detents with rubber end stops (`knob.tsx:291-308`, `lib/knob/geometry.ts:42-55`), press to sink (`knob-scene.ts:247`), lean toward the mouse (`:244-246`), hover-preview from `data-knob-item`/`data-channel` (`knob.tsx:146-185`), turns as the page scrolls (`:200-219`), and turns to the new detent on navigation (`knob-scene.ts:50-51`). Tier 0 shows the SVG poster (`knob.tsx:488-554`).

## 2. Per-page inventory

| Page | What renders today | Current 3D (slot) | Current motion | Gaps |
|---|---|---|---|---|
| `/` home (`app/f/surface/page.tsx`) | Hero faceplate: legends, h1, channel selector, LCD readout, status module with copy email, rating plate (`hero.tsx:47-157`). Multitrack (`page.tsx:78`), preset bank A with 4 presets (`:104-113`), Now and Ask (`:119`) | Channel knob, 5 detents, with lamps (`channel-selector.tsx:32-40`) | Knob spring, hover-lean from header keys and legends, preset lift 3px at 250ms ease-spring (`preset-module.tsx:36`), LED pulse | Status lamp and rating plate are flat. No sound on keys or links. Copy gives no feedback beyond the text swap (`copy-email.tsx:35`) |
| `/projects` | Readout plus lamp key plus banks of 4 `PresetModule` (`projects/page.tsx:63-88`) | Preset knob, N detents (`:54-61`) | Knob-to-scroll link, `data-knob-active` ring (no transition, `preset-module.tsx:36`), hover lift | Bank headers are only text (`:67-73`). The active ring snaps |
| `/projects/[slug]` | Status LED and keys, image in glass, notes, spec rating plate, prev/next (`projects/[slug]/page.tsx:57-161`) | Preset knob, browse mode, `initial=index` (`:70-78`) | Knob turns to this preset on arrival | Prev/next are plain keys. The spec sheet is static |
| `/work` | Readout, detent multitrack, role strips (`work/page.tsx:35-65`) | Track knob (`:43-50`) | Mirror highlight 150ms (`multitrack.tsx:79`), strip ring 200ms (`role-strip.tsx:41`) | The tape metaphor (reels, transport) is missing and the playhead is a 1px line (`multitrack.tsx:64-67`) |
| `/now` | Now module plus dot-matrix log per year (`now/page.tsx:53-145`) | Log knob, **only if years > 0** (`:37-51`) | Knob-to-scroll link | No printer mechanism. The rail empties when there is no log |
| `/changelog` | `permanentRedirect("/now#log")` (`changelog/page.tsx`) | none (N/A) | none | N/A |
| `/about` | Manual sections: General, Specs, Education, Contact with CopyEmail (`about/page.tsx:94-214`) | Section knob (`:84-92`) | Knob-to-scroll link | Contact is plain keys. The rating plate is not "expanded" as `docs/mocks/surface.md:27` promises |
| `/resume` | `ResumeDocument` plus print button (`resume/page.tsx:35`, `print-button.tsx:9`) | Section knob (`:26-33`) | none of its own | Print is a bare `window.print()` |
| `/ask` (+ `/ask/page/[n]`) | Composer, moderation strip, feed, pagination (`ask/page.tsx:69-100`) | Thread knob, **only if items > 0** (`:56-67`) | Composer LED on send (`chat-composer.tsx:197`) | Send gives no tactile moment. The queue count is flat |
| `/ask/[slug]` | Back key plus `ChatThread` standalone (`ask/[slug]/page.tsx:84-88`) | **none**: Panel without a knob | Replies caret rotates 150ms (`chat-thread.tsx:105`) | Breaks "one rotary encoder, on every page" (`docs/surface.md:46`) |
| `/lab` | `StudyModule` grid with posters (`lab/page.tsx:30-45`) | Study knob (`:30`) | Hover lift, which lacks the ease token (`study-module.tsx:23`) | Nothing in 3D beyond the knob |
| `/lab/[slug]` | `ExperimentStage` (`lab/[slug]/page.tsx:61`), with a **separate R3F Canvas** via `components/semantic/lab/canvas-stage.tsx:5` | none from the edition. The experiment is its own second WebGL context | 700ms fallback crossfade (`experiment-stage.tsx:76`) | No knob. Two GL contexts once the knob canvas is alive elsewhere in the session |
| `/owner` | `OwnerSignIn` (`owner/page.tsx:22`) | none | none | No knob. Sign-in success and failure are only an LED and text (`owner-sign-in.tsx:27,52`) |
| 404 / `[...missing]` | "No signal" legend, h1, seven-segment code, channel keys (`not-found.tsx:19-60`) | none | none | The signature interaction is absent exactly where it would be most charming |

## 3. Design improvements (ranked)

1. **Knob on every Panel page.** Add browse knobs to `ask/[slug]` (threads), `lab/[slug]` (studies, like `projects/[slug]/page.tsx:70-78`), `owner` (a 1-detent "Locked"), and 404 (the channel selector, which re-tunes to a real channel). Where: `app/f/surface/{ask/[slug],lab/[slug],owner}/page.tsx`, `not-found.tsx`. Why: the doc's own rule (`docs/surface.md:46`), and the persistent canvas keeps its angle across these routes. Impact H, effort S (2h).
2. **Never drop the rail when the list is empty.** Render a 1-detent disabled knob with a "No log"/"Queue empty" readout instead of `undefined` (`now/page.tsx:37-51`, `ask/page.tsx:56-67`). Why: the layout jumps from 8 to 12 columns (`panel.tsx:102-108`) and the knob canvas detaches. Impact M, effort S (1h).
3. **Scrollbar as a fader, deliberately.** Re-add the thin fader removed in `68090a8`: `scrollbar-color: var(--color-ink-3) var(--color-plate)` with a 3px-inset rounded thumb that goes to ink-2 on hover. That commit reverted a refactor-era override, so the captain should confirm it; the cross-edition baseline asks for it. Where: `styles.css` after `:91`. Impact M, effort S (0.5h).
4. **Labelled fine-pointer cursor on the knob only.** Show an engraved legend chip ("Turn" while hovering the ring, "Push" at dead centre, "Grab" while dragging) that follows the pointer, is 11px `.legend`, is offset 14px, and appears only with `fine:`. Where: a new flavor-owned `components/knob/knob-cursor.tsx`, mounted in `knob.tsx:357`. Why: baseline "cursor interactivity with labels"; the knob is the one unusual control. Impact M, effort S (2h).
5. **Consistent module states.** `StudyModule` lacks `ease-[var(--ease-spring)]` and the drop shadow on `data-knob-active` that `PresetModule` has (`study-module.tsx:23` vs `preset-module.tsx:36`). Neither transitions its box-shadow, while `RoleStrip` does over 200ms (`role-strip.tsx:41`). Unify on one `.rack-mod[data-knob-active]` rule in `styles.css`. Impact M, effort S (1h).
6. **Copy and Send feedback on the instrument.** Flash an LED beside "Copy" (`copy-email.tsx:32-36`) and flash the queue Seg on `justFiled` (`chat-composer.tsx:66,197`). Lamps carry state here, so use a lamp, not a toast. Impact M, effort S (1h).
7. **One GL context on `/lab/[slug]`.** The experiment mounts its own R3F `Canvas` (`canvas-stage.tsx:5`) while the knob world stays alive in the session (`knob-scene.ts:44`). Once the knob lands there (item 1), dispose of neither but cap it: pause the knob renderer while the stage is visible, and note this in `docs/surface.md` 3D. Impact L, effort S (1h).
8. **Dead reduced-motion block.** `styles.css:499-506` only fires when `html` has no `data-motion`, but the pre-paint script always sets it (`lib/prefs.ts:87`). Keep it as the no-JS path and comment it so. Impact L, effort S (0.2h).

## 4. Animation improvements

| # | Location | Today | Purpose | Frequency | Exact motion (repo tokens), reduced-motion fallback |
|---|---|---|---|---|---|
| 1 | 3D spring, `knob-scene.ts:233,248-255` | Per-frame constants (k 0.13, damping 0.7, ease 0.18/0.35), so at 120Hz the knob settles twice as fast as at 60Hz | Same physical feel on every display | Every turn | Make it dt-based: `v += (goal-x)*ω²·dt; v *= exp(-2ζω·dt)` with ω=26 rad/s and ζ=0.55 (matches today's 60Hz overshoot). Clamp dt ≤ 1/30. Reduced motion: `still()` snap, unchanged |
| 2 | SVG knob preview vs select, `knob.tsx:515` | 550ms `--ease-detent` for everything, including hover previews from header keys, which fire constantly | Keep previews snappy, commits weighty | Very high (hover) | `preview !== null` gives `transform 260ms var(--ease-out)`. A select or keyboard move keeps 550ms `--ease-detent`. Motion off: `transition:none` (`styles.css:495`) |
| 3 | Knob press sink (SVG), `knob.tsx:546-553` | Centre dot `scale(0.98)` with no transition. The body does not sink | Causality for "push to open" on T0 | Per press | `[data-knob-poster]` scales `0.985` over `80ms var(--ease-out)` on `pressed` and releases over `160ms var(--ease-spring)`, origin centre. Motion off: none (the colour stays) |
| 4 | Active preset/study/role ring, `preset-module.tsx:36`, `study-module.tsx:23` | Box-shadow snaps on `data-knob-active` | Show which item the knob moved to | High (every detent) | `transition: box-shadow 150ms var(--ease-out)`, the same as LED timing. Motion off: keep, since it is a shadow colour change rather than a displacement |
| 5 | Knob readout LCD digits, `knob-readout.tsx:34,41` | The number and the matrix label swap instantly | LCD segment latency sells the display | High | Old value opacity 1 to 0 over 70ms linear, new value 0 to 1 over 50ms linear with a 30ms delay (a two-layer crossfade in `Seg`). No transform. Motion off: instant swap |
| 6 | Command dialog, `command-dialog.tsx:198,201` | 100ms opacity fade on open and close, even when opened from the ⌘K keyboard shortcut | Emil: never animate keyboard-initiated high-frequency UI | High for power users | Open: none when opened via keyboard (keep 100ms only for pointer on `CommandTrigger`). Close: 80ms `var(--ease-out)` opacity. Motion off: none |
| 7 | Slide thumb grab, `styles.css:418-441` | Only the slide transition | :active tactile feedback, like `.key` | Low | `.slide:active > span { scale: 0.94 1 }` over 80ms `var(--ease-out)`, composed with the existing translate. Motion off: none (`styles.css:494`) |

Rejected:
- **Playhead sweep-in on the multitrack** (`multitrack.tsx:64-67`): killed by the frequency gate. Home is seen on every visit, and the sweep is decorative and delays reading.
- **Idle knob wobble or breathing index**: killed by the edition contract of zero idle frames (`docs/surface.md:69`) and by utility.
- **Keyboard end-stop bounce** (ArrowRight at the last detent): killed by the keyboard-initiated rule, because repeated arrow presses would stutter. Use the end-stop sound instead (section 5).
- **Scroll parallax of modules and screws**: killed by the metaphor, since "a real faceplate is printed and flat" (`docs/surface.md:67`).
- **Filament afterglow on channel-key lamps**: killed by restraint and physics. These are LEDs, and a 150ms fade already reads as instant-on.

## 5. Sound design

**Concept: the HR-26 is hardware, so every sound is a mechanism rather than a tone.** Ball-bearing detents, key-switch leaves, a slide switch scraping onto a latch, a relay pulling in on a channel change, and a piezo beeper for confirmations. Everything is synthesized with WebAudio, so it adds 0KB of assets. Level stays below 0.15 peak so it sits under speech.

Palette: **6 voices, plus 1 variant** (end stop).

| Interaction | Sound | Synthesis recipe |
|---|---|---|
| Knob detent (drag crosses a detent, arrow, select) `knob.tsx:125,305` | **Detent** | White noise 10ms into bandpass 3.2kHz Q 8, gain 0.12, attack 1ms, exp decay to 1e-4 at 10ms. Add a sine 180Hz thump at gain 0.06 over 12ms. Detune the bandpass ±3% by detent index so a sweep reads as a ratchet. Voice-steal: at most one per 25ms |
| Knob end stop (drag past `END_PLAY`, arrow at an end) `knob.tsx:301,333-335` | **Detent/clunk** variant | Noise into lowpass 900Hz for 30ms at gain 0.1, plus a triangle 110Hz dropping to 80Hz over 40ms at gain 0.08. Fires once per contact, re-armed after leaving the stop |
| Knob push to open, and route change via channel keys or 0-4 (`knob.tsx:140-143`, `channel-shortcuts.tsx:29`) | **Relay** | Two noise clicks 18ms apart: the first bandpasses 1.6kHz Q 6 over 6ms at gain 0.1, the second 2.4kHz Q 6 over 5ms at gain 0.07. Scheduled on the same frame as the `page-out` view-transition start |
| `.key` down and up (all KeyLink and `.key` buttons, `styles.css:186-226`) | **Key leaf** | Pointerdown: noise 6ms into bandpass 2.2kHz Q 4 at gain 0.07, plus a triangle 900Hz over 12ms at gain 0.04. Pointerup (inside only): the same at 2.8kHz and 5ms, gain 0.04. The down sound lands with the `:active` translateY on the same frame |
| Slide switch (Edition, Motion, 3D, Clicks) `switches.tsx:54-58` | **Slide + latch** | Scrape: 60ms noise into bandpass swept 1.2 to 4kHz, gain 0 to 0.035 to 0. Latch at +110ms, the overshoot peak of the 200ms `--ease-spring` thumb (`styles.css:436`): a click at 1.9kHz Q 8 over 8ms, gain 0.09. The Motion switch uses the latch only |
| Copy email / Ask filed / owner signed in (`copy-email.tsx:32`, `chat-composer.tsx:66`, `owner-sign-in.tsx:27`) | **Beeper OK** | Square 1318Hz for 45ms, then 1760Hz for 60ms, into lowpass 2.5kHz Q 0.7, gain 0.05, 3ms attack and release |
| Error (ask error `chat-composer.tsx:237-246`, owner error `owner-sign-in.tsx:52`, 404 mount after a click) | **Beeper alarm** | Square 440Hz, 2 × 70ms with a 50ms gap, into lowpass 1.2kHz, gain 0.045 |

Policy:
- **Opt-in, default off.** Keep `sound: false` (`lib/prefs.ts:38`) and the "Clicks" switch (`switches.tsx:122-134`). Rename its legend to "Sound", because it now covers more than detents.
- **Mute.** Call `suspendSound()` when the pref goes off; surface never calls it today (grep finds 0 hits in `flavors/surface`). Hook it in `PrefsSync` (`prefs-sync.tsx:10`).
- **Hidden tab.** On `visibilitychange` to hidden, suspend and drop queued voices. On visible, do not auto-resume; resume on the next gesture.
- **Reduced motion.** Sound is not motion, so keep every voice. Scroll-driven knob turns (`knob.tsx:209-211`) stay **silent** in all modes, as today: they are not caused by the hand, and they would machine-gun during a fling.
- **Touch.** Keep Detent and Relay on touch, because the knob is direct manipulation and the sound confirms it. Skip Key leaf on touch, where it doubles the OS haptic and mis-fires on scroll-starts. Latch plays on touch.
- **Wiring without shared code importing flavors.** The shared engine slice extends `lib/sound.ts` with `getAudioContext()` and `playVoice(voice: (ctx, t0, out) => void)`, keeping `playTick` as it is. Surface owns `flavors/surface/lib/sound.ts`, which exports the 6 voice functions and a `play(name)` gate that checks `data-sound="on"` and the rate limits. Surface also owns `components/site/key-sounds.tsx`, a pointerdown/pointerup capture on `.key`, mounted in `app/f/surface/layout.tsx:59`. Then replace `playTick("button")` at `knob.tsx:125,305` and `switches.tsx:56` with `play("detent")`/`play("slide")`. If the shared `ClickSound` gains a `voice` prop instead, surface can pass `play("keyDown")`, but the down/up pair needs pointer events, so the edition-owned listener is simpler.

## 6. 3D: two or more new elements per page

**How they ride the canvas.** Keep plain three.js and generalize `knob-scene.ts` into a flavor-owned **bench** (`components/scene/bench.ts`):
- The existing `WebGLRenderer` stays the only GL context.
- Each instrument registers a DOM slot `[data-bench="lamp"]` with its own tiny `Scene` and `OrthographicCamera`, plus a slot-local 2D `<canvas>`.
- When an instrument is dirty or settling, the bench sizes the GL canvas to the slot (DPR ≤ 2), renders, then does `ctx2d.drawImage(glCanvas)` into the slot in the same task.
- Each instrument keeps its own spring and dirty flag. Nothing renders while idle, and nothing re-renders on scroll, because the pixels live in the slot's 2D canvas.

This is the drei `View`/`View.Port` technique minus scissoring a fixed canvas. `View` would wake the clock on every scroll frame (`lib/scene/clock.ts:34-46`) and would need R3F plus drei in a chunk this edition kept out (`docs/surface.md:67`).

Parts map to three primitives, with drei equivalents noted for a later migration to `lib/scene/session.tsx`:

| Three primitive | drei equivalent |
|---|---|
| `InstancedMesh` | `Instances`/`Merged` |
| `three/addons/geometries/RoundedBoxGeometry.js` (present in node_modules) | `RoundedBox` |
| `EdgesGeometry` | `Edges` |
| the existing `softShadow()` blob | `ContactShadows` |
| a `userData.hover` raycaster on the slot | `useCursor` |
| the bench's own tier logic | `PerformanceMonitor` |

The design needs no text in canvas: labels, numbers and titles stay in the DOM around each slot. `Html` and `Text` are forbidden.

**Shared rules for every element below:**
- **T0**: the existing DOM/SVG stays (every slot wraps its printed poster, like `[data-knob-poster]` at `knob.tsx:488`).
- **Reduced motion**: render the final pose once, with no lean or spring.
- **T1**: DPR 1 and no antialiasing, except that slots under 96px render at DPR 2, which costs few pixels.
- **Context loss**: poster, as the knob does today.
- **Budgets**: at most 4 draw calls and 3k triangles per element, and at most 20 draw calls per page including the knob's 5.
- **Frames**: at most 0.6ms CPU and 1ms GPU per element-frame while settling, and 0 idle.

| Page | New element | Where | Interactivity | Draws / tris |
|---|---|---|---|---|
| `/` | **A. Jewel pilot lamp**: lathe bezel, faceted lens with emissive signal core | Replaces `<Led>` in the Status module (`hero.tsx:116`), 28px | Fine-pointer hover rolls the lens highlight with the pointer. Lit steady ("available"). Click copies the email (same handler as `copy-email.tsx:32`) and plays Beeper OK | 2 / 1.2k |
| `/` | **B. Rating-plate screws**: 4 instanced slotted pan heads | Corners of `.rating-plate` (`hero.tsx:131-133`) and the hero `Screws` (`:48`) | Hover turns a screw 12° with a detent tick. Drag rotates it with notches every 30°. It keeps its angle for the session | 1 / 4×300 |
| `/` | **C. Tape reels**: two lathe reels with instanced spokes | `SectionHead` aside of Experience (`page.tsx:68-77`) | Hovering a multitrack row spins the reels to that role's position on the tape (take-up reel radius = elapsed fraction, from `layTape`). Settles with the spring | 3 / 2.5k |
| `/projects` | **A. Bank rotary switch**: small 4-position chicken-head knob | Beside each bank `h2` (`projects/page.tsx:67`), 40px | Click or drag steps through banks A to D, which calls the knob's `select(bank.first)`. Plays Detent | 2 / 1.5k |
| `/projects` | **B. Travelling jewel lamp**: one lens that re-parents into the `data-knob-active` preset's status slot | `PresetModule` status (`preset-module.tsx:48-51`) | Follows the knob. Colour and pulse come from `lamp[status]` (`status.ts`). Hover leans the lens. One object on the page, not N | 2 / 1.2k |
| `/projects/[slug]` | **A. Bat-handle toggle**: centre-off, three positions | In the prev/next nav (`projects/[slug]/page.tsx:140-161`), centre | Flick left or right (drag or click a side) to load the prev or next preset. The lever springs back to centre after navigation. Plays Slide + latch and then Relay | 3 / 1.8k |
| `/projects/[slug]` | **B. LED bar-graph**: N instanced segment boxes showing preset index of total | Top of the spec rating plate (`:108-113`) | Hovering the knob's detents previews the lit segment. Emissive signal on the active one. Real data | 1 / N×12 |
| `/work` | **A. Tape reels and capstan** (reusing part C) | Panel `meta` beside `Readout` (`work/page.tsx:35-41`) | The knob's track index drives the reels. Dragging a reel scrubs the knob, a second input path using the same store (`lib/knob/store.ts`) | 3 / 2.5k |
| `/work` | **B. Analog needle meter**: bezel, geometric tick ring (no numerals), needle | Knob module readout area (`panel.tsx:88-93`, `/work` only) | The needle shows the active role's tenure as a fraction of the longest. It springs with overshoot on track change. Hover bumps it with a small jitter, like a pinned needle | 3 / 900 |
| `/now` | **A. Dot-matrix print head** on a rail | Above the log `h2` (`now/page.tsx:86-93`) | Its carriage x follows the knob's detent (Now or a log year). It shuttles with the spring and does a 2-pixel "strike" dip on arrival | 2 / 800 |
| `/now` | **B. Paper spindle**: lathe roll with a sheet lip | Top of the Now module (`:53-60`) | Advances one notch per log detent, not per scroll pixel. Drag to wind, which scrubs the knob | 2 / 1.4k |
| `/about` | **A. Patch bay**: 3 jack sockets plus one drag-able plug on a TubeGeometry cable | Contact section (`about/page.tsx:190-214`) | Drag the plug into the Email, GitHub or LinkedIn socket (DOM legends under each) to copy or open. The cable sags as a CatmullRom curve. The plug snaps into the socket with a latch. Keyboard path: the existing links | 4 / 3k |
| `/about` | **B. Brushed rating plate**: a rounded plane with an anisotropic-looking roughness stripe map and rivets | Specifications section header (`:130-133`) | Pointer lean tilts it ±6° so the highlight slides. Static at rest | 2 / 400 |
| `/resume` | **A. Thermal paper roll** | Beside `PrintButton` (`print-button.tsx:9`) | Click Print: the roll feeds a 20mm curl over 300ms, then `window.print()`. Hover advances it 1mm | 2 / 1.6k |
| `/resume` | **B. Key-lock "Available" lamp** (reusing lamp A) | Resume header status (`resume-header.tsx`) | Hover leans the lens. The lamp is lit if available | 2 / 1.2k |
| `/ask` | **A. Momentary arcade push button** (Send) | Composer submit (`chat-composer.tsx:197`), 44px, wrapping the real `<button>` | 3mm press travel with a spring return. The lamp ring lights while `isSending` and flashes on `justFiled`. Plays Key leaf and then Beeper OK | 3 / 1.8k |
| `/ask` | **B. Queue bar-graph** (reusing part B from `/projects/[slug]`) | Queue readout (`ask/page.tsx:48`) | Segments equal the pending count (real). A new filing lights the next segment | 1 / ≤300 |
| `/ask/[slug]` | **A. Jewel lamp: answered or pending** | Thread header (`ask/[slug]/page.tsx:58`) | Hover lean. The pulse runs only while pending | 2 / 1.2k |
| `/ask/[slug]` | **B. Push button: Reply** (reusing the `/ask` button) | Reply composer (`thread-reply.tsx`) | Same as Send | 3 / 1.8k |
| `/lab` | **A. Toggle bank**: one instanced bat lever per study | Panel `meta` (`lab/page.tsx:24-30`) | Lever up means active and down means archived (real status). Clicking a lever selects that study on the knob | 2 / N×400 |
| `/lab` | **B. Trim pot row**: instanced screwdriver pots | Beside each study's LCD number (`study-module.tsx:26-32`) | Hover turns the pot a notch. It is decorative, so it ships last or gets cut | 1 / N×200 |
| `/lab/[slug]` | **A. Power toggle** | Stage bezel (`lab/[slug]/page.tsx:60-67`) | Flips run or pause for the experiment. This needs `ExperimentSceneProps` to take `paused` (`lib/lab/types`), which is a small shared prop add with no flavor import | 3 / 1.8k |
| `/lab/[slug]` | **B. Bezel screws** (reusing screws B) | 4 corners of the stage `mod` | Hover turns a screw | 1 / 1.2k |
| `/owner` | **A. Key switch**: a lock cylinder with a key | Beside the sign-in form (`owner-sign-in.tsx:95`) | Rotates 90° when sign-in succeeds (Relay). Shakes ±4° over 3 cycles in 240ms on error (Alarm). Idle otherwise | 3 / 2k |
| `/owner` | **B. Jewel lamp** in signal or alarm colour | Status line (`owner-sign-in.tsx:27`) | Reflects the busy, ok or error state | 2 / 1.2k |
| 404 | **A. Unplugged patch cable** (reusing the `/about` patch bay) | Beside the "No signal" h1 (`not-found.tsx:28`) | Drag the plug into the socket to route home. On release outside the socket it swings back with the spring | 4 / 3k |
| 404 | **B. Needle meter pinned at zero** (reusing the `/work` meter) | Next to the seven-segment code (`not-found.tsx:38`) | The needle trembles ±1.5° only while hovered. It stays at zero, because there is no signal | 3 / 900 |

The combined page budget peaks on `/about` at 5 + 4 + 2 = 11 draws and about 9k triangles. The bench chunk grows by about 6KB of part code on top of three core, which is already loaded, far under the 300KB gz cap in `docs/m2-scene-spec.md:184`.

## 7. Shippable slices (in order)

1. **Sound voices and wiring of existing triggers**: `flavors/surface/lib/sound.ts` (6 voices plus the gate), replacing the calls at `knob.tsx:125,305` and `switches.tsx:56`, the end-stop clunk, and `suspendSound` plus hidden-tab handling in `prefs-sync.tsx`. 4h. Impact H. **Depends on** the shared-engine slice (`lib/sound.ts` exposing `getAudioContext`/`playVoice`).
2. **Key, relay and beeper sounds**: `components/site/key-sounds.tsx` mounted in `layout.tsx`, Relay on `channel-shortcuts.tsx:29` and knob `open`, Beeper on copy, file and sign-in, Alarm on errors. Rename the "Clicks" legend to "Sound". 3h. Impact H. Depends on slice 1.
3. **Knob everywhere and a stable rail**: design items 1 and 2 (the `ask/[slug]`, `lab/[slug]`, `owner`, 404 pages, plus the empty-state knob). 3h. Impact H. No dependencies.
4. **Motion polish**: animation items 1 to 7 (dt spring in `knob-scene.ts`, preview/select durations, press sink, active-ring transitions, LCD latency in `seg.tsx`, command dialog keyboard open, slide grab). 4h. Impact M. No dependencies.
5. **Chrome baseline**: fader scrollbar (pending captain confirmation because of `68090a8`), labelled knob cursor, module state unification. 3h. Impact M. No dependencies.
6. **Bench refactor**: split `knob-scene.ts` into `components/scene/bench.ts` (renderer, tiering, context loss, blit slots, per-instrument springs) plus `instruments/knob.ts`. This slice changes nothing visible, and its check is that the knob still settles with 0 idle frames. 6h. Impact M, as the enabler. No shared dependency.
7. **Parts library**: `components/scene/instruments/{lamp,screws,reels,rotary,toggle,bargraph,meter,printhead,spindle,patch,plate,roll,pushbutton,keyswitch}.ts`, each with its SVG/CSS poster. 12h. Impact H. Depends on slice 6.
8. **Placement batch 1**: `/`, `/projects`, `/projects/[slug]`, `/work` (8 elements). 6h. Impact H. Depends on slice 7.
9. **Placement batch 2**: `/now`, `/about`, `/resume`, `/ask`, `/ask/[slug]` (10 elements). 7h. Impact H. Depends on slice 7. The sound hooks come from slice 2.
10. **Placement batch 3**: `/lab`, `/lab/[slug]` (plus the shared `paused` prop in `lib/lab/types`), `/owner`, 404 (8 elements), and `docs/surface.md` 3D and Motion sections rewritten (the "only 3D object" thesis at `docs/surface.md:67` changes to "instruments on the bench, flat plate"). 6h. Impact M. Depends on slice 7 and on a shared lab prop slice.

---

# Appendix D: Timetable

(Sub-agent audit, spot-checked by the lead in §2.6. The sound palette is subject to the dedupe rules in §2.2. Main-report §6 supersedes any "captain decision" or "pending confirmation" note below; the owner chose custom edition-styled scrollbars.)

## Edition: Timetable (`flavors/timetable`, `app/f/timetable`)

All paths below are relative to the repo root, `/Users/rajput-hemant/.treehouse/website-98ed84/12/website`. This audit was read-only: nothing was run.

### 1. Design language

- **Palette** (`flavors/timetable/styles.css:18-50`, night values at `:112-137`). Day ground is enamel `#f3f5f6`, surface `#ffffff`, ink `#14191e`, ink-soft `#4a545d`. The sign and board stay dark in both themes: sign `#14191e`, board `#171b1f`, cell `#262c32`/`#20252a`, flap `#f4f6f7`. Signal yellow `#ffc20e` means "you are here" only, focus is `#0a5eb0` by day and yellow at night (`:124`), and there are six line colours, `#d52b1e #7c3aa0 #0a5eb0 #00874e #b85a00 #8c5a2b`, with night versions at `:126-131`. There is no accent picker (`lib/prefs.ts:15-16`). The night block is copied a second time at `styles.css:139-166`.
- **Type.** Overpass for display and text (800 weight, -0.02em tracking, `styles.css:207-213`) and Overpass Mono for flaps, times and table heads (`:53-55`). Numbers are tabular across the whole body (`:202`).
- **Layout device.** It is a transit station. The sticky black sign band is the header, with numbered platform plates as nav (`components/site/site-header.tsx:16-22`, `nav-links.tsx:31-34`). Every page header is a platform sign with the indicator hanging on the right (`components/ui/page-header.tsx:44-74`). The departures board is a real `<table>` (`projects/departure-board.tsx:58`), and the SVG network map uses a true month axis (`network/network-map.tsx:43-119`).
- **Motion vocabulary** (`styles.css:86-98, 171-175`):
  - Easings: glide `cubic-bezier(.16,1,.3,1)`, enter `cubic-bezier(.23,1,.32,1)`, exit `cubic-bezier(.4,0,1,1)`, and flick, a `linear()` overshoot spring.
  - Durations: press 120ms, ui 240ms, route-out 160ms, route-in 260ms. Press scale is 0.97 (`:366-372`).
  - Movement: page slide of -8px out and 12px in (`:292-312`), line draw 1100ms glide with a 90ms stagger (`:415-422`, `network-map.tsx:147-150`), and the here-pulse (2.4s, infinite, `:404-412`).
  - Flaps: the DOM riffle steps every 46ms through random glyphs (`motion/flap-riffle.tsx:6,19`). The 3D flaps step every 55ms in real drum order (`scene/world.tsx:44-45`).
  - Headings split-reveal (`motion/split-heading.tsx:21`).
- **Cursor.** A signal-yellow "you are here" dot sits beside the native cursor, lerps at 0.32 and opens into a sign plate that says "Go", "Visit", "Board", "Copy" or "Swing" (`interaction/cursor.tsx:11-23,43,91-95`).
- **Scrollbar.** Thin; an ink-faint thumb on enamel and flap-soft on dark surfaces (`styles.css:429-462`).
- **3D today.** Every page has one split-flap departure indicator hanging on two rods (`scene/world.tsx:90-327`). It has 28 modules in 3 instanced draw calls plus 4 for the housing, face, stripe and rods (`docs/timetable.md:74`).
  - Pointer: the mouse leans it (`world.tsx:284-292`) and a drag swings it on springs (`scene-root.tsx:63-100`, `world.tsx:294`). On touch, "Tilt to swing" uses the device's tilt sensor (`scene-loader.tsx:32-39`).
  - Hover: hovering any `[data-scene-item]` flips the board to its label and tints the stripe with that role's line colour (`world.tsx:234-249`). On /work, scroll scrubs the roles (`:224-233`).
  - Idle cost is zero frames (`clock.ts` settle).

### 2. Per-page inventory

| Page | What renders today | Current 3D (slot / route pose) | Current motion | Gaps |
|---|---|---|---|---|
| Home `/` (`app/f/timetable/page.tsx`) | Hero (`home/hero.tsx`), network map and key, 4 selected departures, legend, service updates and latest notice | Hero slot, `home`, yaw -0.32 (`poses.ts:41-47`), board = current role (`hero.tsx:19-21`) | Flap riffle on board cells, lines draw in (only if below the fold), here-pulse, magnetic CTA (`hero.tsx:54`) | Map lines give no hover feedback on the map itself (`network-map.tsx:130-135`, `transition-opacity` with no opacity rule). Selected-departure rows flip an indicator that has already scrolled out of view. |
| Projects `/projects` | Platform filter, full board (oldest first), legend (`projects/page.tsx:54-70`) | Header slot, `projects`, board "N departures\|Point at a row" (`:52`) | Riffle on first view only. Filtering hides rows and swaps the count instantly (`ui/row-filter.tsx:58-62`). | You point at row 10 while the indicator sits about 1.5 screens up. "Point at a row" means nothing on touch. |
| Project `/projects/[slug]` | Service details, image, description, calling pattern, previous/next (`projects/[slug]/page.tsx:51-168`) | Header slot, `project`, board = name\|year\|status (`:76`) | Split heading only | The calling pattern is a static rail (`calling-pattern.tsx:15-54`). CTAs have no boarding moment. |
| Experience `/work` | Network map and key, one line guide per role (`work/page.tsx:50-83`) | Header slot, `work`; scroll through `[data-scene-section]` scrubs roles (`world.tsx:224-233`) | Lines draw, pulse. The active guide's stripe goes from 0.9 to 1 opacity (`line-guide.tsx:49`). | The scrub drives an indicator that is off screen for the whole guides section (`page-header.tsx:70-73` is not sticky). The active state is invisible. |
| About `/about` | Bio, facilities `dl` (hover flips the board), education, desk (`about/page.tsx`) | Header slot, `about` | None beyond the heading | The facility hover (`:67-71`) targets an indicator that is off screen. History is plain rows. |
| Now `/now` (+ `/changelog` redirect `changelog/page.tsx:4`) | Current-position notices, updates by year with a category filter | Header slot, `now`; notices are scene items (`now/page.tsx:56-57`); `data-scene-section` is on the updates (`:112`) but the `now` route ignores progress | Filter snaps | The progress is computed and never used for `now`. The year nav is plain links. |
| Ask `/ask` | Composer, "how the desk works", moderation strip, pending notices, feed, pagination | Header slot, `ask`; notices are items (`ask/chat-feed.tsx:27-28`) | Composer UI | `emit({type:"ask:sent"})` fires (`chat-composer.tsx:86`), but the Timetable World never calls `onSceneEvent`, so the send has no 3D consequence. |
| Ask notice `/ask/[slug]`, `/ask/page/[n]` | Thread, or an older feed page | None (`scene={null}`, `ask/[slug]/page.tsx:73`, `ask/page/[page]/page.tsx:63`) | None | No 3D on these pages at all. |
| Lab `/lab` | Experiment cards with SVG posters and CSS tilt (`lab/page.tsx:36-68`) | Header slot, `lab`; cards are `study:` items | CSS tilt (`styles.css:352-364`) | The poster-only rule is deliberate (`lab/page.tsx:20-23`). |
| Lab exp `/lab/[slug]` | Its own `CanvasStage` (`components/semantic/lab/canvas-stage.tsx:61-65`) | None in the session. The stage is a second WebGL context. | Experiment-specific | Two live contexts once the session canvas has been created. |
| Resume `/resume` | Printed-guide document | Header slot, `resume` (`resume/page.tsx:21-27`) | None | Nothing to do with "printed guide" on screen. |
| Owner `/owner` | Passphrase sign-in | Header slot, `ask`, board "Staff only\|Information desk" (`owner/page.tsx:23-24`) | None | Sign-in success has no feedback in the scene. |
| 404 (`not-found.tsx`) | "This service does not run" and a platform list | Hero slot, `notfound`, yaw -0.5 (`poses.ts:104-110`) | None | The page reads as a dead end and offers nothing to play with. |

### 3. Design improvements (ranked)

1. **Keep the indicator in view where the page drives it.** On /work the slot should turn sticky inside the guides section (`work/page.tsx:53-57`), or a mini indicator should track the section (see §6, View). Today the scrub at `world.tsx:224-233` and the hovers on /projects, /about and /now animate an off-screen object. It is the edition's signature interaction and it goes unseen on most pages. Impact H, effort M (3-5h sticky; View version in §7).
2. **Wire `ask:sent` into the World.** Subscribe with `onSceneEvent` in `createWorld` (`world.tsx:252-256`) and flip the board to `NOTICE RECEIVED|AWAITING REVIEW|HELD` for about 6s before returning to rest. The event is already emitted (`chat-composer.tsx:86`) and ignored. Impact H, effort S (1h).
3. **Light the hovered line on the map itself.** Add `[data-network]:has([data-scene-active]) [data-line]:not([data-scene-active]){opacity:.3}`. Every `<g data-line>` already carries `data-scene-item`, so it gets `data-scene-active` mirrored (`lib/scene/dom.ts` mirror) and already declares a transition (`network-map.tsx:131-135`). Impact H, effort S (0.5h).
4. **Make the active line guide visible.** An opacity step from 0.9 to 1 (`line-guide.tsx:49`) is imperceptible. Grow the stripe from 7px to 11px and set a yellow "you are here" dot at its end while `data-scene-active` is set. Impact M, effort S (1h).
5. **Stop animating ⌘K.** `CommandDialog` uses the shared `Dialog`, which scales and fades for 240ms (`ui/dialog.tsx:61-67`, `command/command-dialog.tsx:182`). The dialog opens from the keyboard and is used often, so add an `instant` prop that drops the `motion:transition-all` classes. Impact M, effort S (0.5h).
6. **Grow popovers from their trigger.** `ui/popover.tsx:45-47` scales from the popup's centre; add `origin-(--transform-origin)` (Base UI sets the variable). Exit should use 160ms `--ease-exit` rather than the 240ms enter. Impact M, effort S (0.25h).
7. **Give the DOM riffle the same physics as the 3D flaps.** `flap-riffle.tsx:15-21` shows random glyphs every 46ms and dims cells to 0.7. It should walk the real drum order toward the target, like `flaps.ts:32-35` `stepToward`, at 55ms, with the same column stagger as `world.tsx:205` (22ms per column). Today the board and the sign flip differently side by side. Impact M, effort S (1.5h).
8. **Fix copy that doesn't fit touch.** "Point at a row" (`projects/page.tsx:52`) should become `N departures|Choose a row`, or the hint should be omitted on coarse pointers. Impact L, effort S.
9. **Clear doc and CSS drift.**
   - `button.tsx:32` says "redline arrow", which is Drawing Set copy.
   - `site/page.tsx:5-6` says the keyframes live in `app/globals.css`; they are in `styles.css:292-312`.
   - `docs/timetable.md:18` says `light-dark()`, but the tokens use `[data-theme]` blocks, and the night block is copied twice (`styles.css:112-137`, `:139-166`). One shared custom property set would do.
   - Impact L, effort S (0.5h).
10. **Fill in `magnetic-inner` on the `asChild` path.** `button.tsx:73-83` never adds `data-magnetic-inner`, so the hero CTA (`hero.tsx:54`) moves as one block while non-`asChild` buttons move their label at half speed (`:93`). Impact L, effort S.
11. **Avoid two WebGL contexts on /lab/[slug].** Either release the session context while a `CanvasStage` is mounted, or render the experiment through the session root. A second context appears once any page has created the session canvas (`scene-root.tsx:31`). Impact L, effort M.

### 4. Animation improvements

Opportunities (the tokens are the ones in `styles.css:86-98, 171-175`):

| # | Location | Today | Purpose | Frequency | Exact motion (reduced-motion fallback) |
|---|---|---|---|---|---|
| 1 | Board count `<b data-board-count>` (`departure-board.tsx:52`, set at `row-filter.tsx:61-62`) | Text swaps instantly | The count is the board's answer to your filter; real boards flip it | Occasional, once per filter click | 2-3 flap cells step in drum order, 55ms per step, 22ms per column, `--ease-flick` on a translateY of 1px per step. Fallback: instant text, colour-only 120ms. |
| 2 | Rows revealed by a filter (`row-filter.tsx:58`) | `hidden` toggles instantly | Makes it clear which departures changed | Occasional | Re-riffle only the newly shown rows' `[data-flap]` cells, with the same drum walk as #1 and at most 6 rows animated (the rest snap). Fallback: none. |
| 3 | Map line focus (`network-map.tsx:131-135`, key `network-section.tsx:167`) | No change on the map | Causality: the key entry and the map line are the same thing | Hover-driven, but only on a deliberate map scan | The other lines go to opacity 0.3 over 200ms `--ease-enter`, and the hovered stroke goes from 7 to 9px. Fallback: the same opacity change (opacity transitions stay allowed, `styles.css:241`) with no stroke change. |
| 4 | Active line guide stripe (`line-guide.tsx:47-50`) | Opacity 0.9 → 1 | Shows where the scroll has taken you | Once per role while scrolling | `scaleY` 1 → 1.57 (7 to 11px) plus a yellow dot `translateX(0 → 100%)` over 240ms `--ease-glide`. Fallback: an instant dot and a thicker stripe. |
| 5 | Popover open/close (`ui/popover.tsx:45-47`) | Scales from the centre, 240ms both ways | Spatial origin | Customize and preview, occasional | Enter: `scale .96 → 1` from `--transform-origin`, 200ms `--ease-enter`. Exit: 140ms `--ease-exit`. Fallback: opacity only. |
| 6 | Copy email confirmation (`site/copy-email.tsx:23-28`) | "Copied" appears | Confirms the action (emil: feedback for invisible actions) | Rare | `COPIED` set as `FlapText size="sm"` with a 6-cell riffle, total ≤ 300ms, holding the 1600ms from `useCopyEmail`. Fallback: plain text. |
| 7 | Platform plate press (`nav-links.tsx:31-34`) | Colour change only | Tactile enamel press | Every nav click (high, so it must be tiny) | `:active` scale 0.94 over 120ms `--ease-flick` (reuse the `.press` pattern, `styles.css:366-372`). Fallback: none needed, since `:active` scale is not motion-heavy but still gated by `motion:`. |

Rejected candidates:

- **Opening animation on ⌘K.** The dialog is keyboard-initiated and used many times a session, which fails the frequency gate. The recommendation is to remove it (§3 #5).
- **A continuous "stop-to-go" second sweep on a station clock.** It would break the zero-idle-frames contract (`docs/timetable.md:78`), and ambient motion that runs forever fails the purpose gate. Minute jumps only (§6).
- **Tilt or parallax on departure-board rows.** Scanning a table is high-frequency and the board is information design, so the purpose gate kills it; the flaps already carry the delight.
- **Scroll-linked movement on the sign band.** The chrome must stay put (`docs/timetable.md:65`), and moving it would break spatial consistency.
- **A bigger page slide than 12px.** Navigation is the most frequent action, and the current 160/260ms is already the right size.

### 5. Sound design

**Concept: "station acoustics."** The sound comes from the hardware people hear in a station: the Solari flutter of flaps settling, enamel plates tapped, a ticket validator's clunk, and the two-tone station chime before an announcement. Everything is synthesized, so there are no assets and 0 KB to download. There are 6 distinct sounds. Sound stays opt-in with the default off (`lib/prefs.ts:45`).

| Interaction | Sound | Synthesis recipe |
|---|---|---|
| 3D flap step (`world.tsx:268-276`, each `m.cur = m.next`) | **Flap flutter** | A cached 20ms white-noise buffer; each grain is 5ms, bandpass 3200Hz ±8% random with Q 3.5, and a 1ms attack with a 4ms exponential decay. Per-grain gain is 0.035. Grains are pooled to at most 1 per 16ms and 40 per second, with at most 3 grains per frame and a random gain of ±20%. When a board settles, the last grain adds a 5ms lowpass 900Hz "seat" thunk at 0.05. |
| DOM riffle / board count flip (`flap-riffle.tsx:16-21`, §4 #1) | Flap flutter (the same voice) | Grains at half gain (0.018). Only while the board is in view and only for the first riffle. |
| Nav and platform link click (`nav-links.tsx:24`) | **Enamel tap** | A 1850Hz sine plus a 4420Hz sine (inharmonic, gain 0.4×). Envelope: 2ms attack, 45ms exponential decay. Gain 0.09. |
| Button / CTA press (`ui/button.tsx:86`, `asChild` links) | **Validator clunk** | A sine that drops from 150 to 85Hz over 60ms, plus a noise burst (lowpass 1200Hz, 8ms). Total 70ms, gain 0.12. |
| Switch and segmented control (`ui/switch.tsx:30`, `customize-controls.tsx:82,114`) | **Relay** | Two 6ms square clicks filtered with lowpass 2000Hz and spaced 14ms apart. On goes 1400 then 1700Hz; off goes 1700 then 1400Hz. Gain 0.06. |
| Ask sent / owner reply posted (`chat-composer.tsx:86`), copy email (`copy-email.tsx:18`) | **Station chime** | Two tones, E5 659Hz then C5 523Hz, 200ms apart. Each is a sine plus a second harmonic at 0.18, with a 5ms attack and a 450ms exponential decay. Total about 650ms, gain 0.08. Only on success, never on errors. |
| Drag release of the sign (`scene-root.tsx:93-100`, when \|dragX\| > 60) | **Rod ring** | A 2400Hz sine plus a 3310Hz sine, 140ms decay, gain 0.03, with the pitch scaled by the release velocity (±10%). |

The ⌘K open gets no sound, because it is keyboard-initiated and high-frequency.

**Behaviour:**

- **Mute and off.** Sound stays under the existing `sound` pref and switches off in `ClickSound` (`components/semantic/click-sound.tsx:14-35`, `suspendSound`). The 3D flutter reads the same pref through `data-sound` on `<html>` (`lib/prefs.ts:12`).
- **Reduced motion.** Reduced motion is a motion preference, not a sound preference, so keep sounds that are caused directly by a click (tap, clunk, relay, chime). The flaps don't turn with motion off (`world.tsx:201-203`), so there is no flutter: play one "seat" thunk per board change instead. Drop riffle sounds, because riffles don't run.
- **Hidden tab.** Keep the existing `document.hidden` guard (`click-sound.tsx:18`) for clicks and add it to the flutter. Suspend the context on `visibilitychange`.
- **Touch.** Keep skipping click sounds on touch (`click-sound.tsx:19`), because taps plus haptics are enough. Keep the chime on touch for sent and copied, since it confirms an invisible result. Set `navigator.audioSession.type = "ambient"` where it exists, so the iOS silent switch mutes it.
- **Master gain.** All sounds go through one 0.8 master gain with a `DynamicsCompressorNode` (threshold -18dB), so flutter never stacks into clipping.

**Wiring (the shared rule holds, with no flavors imports):**

- **Shared** `lib/sound.ts` gains generic primitives: `getContext()`, a cached `noiseBuffer()`, `tone({type,freq,to,attack,decay,gain,at})`, `noise({filter,freq,q,decay,gain,at})`, `grainPool(maxPerSec)`, and `suspendSound`. `playTick` stays as the default voice for the other editions.
- **Shared** `ClickSound` gains `voice?: (control: Element) => (() => void) | null`. With no voice it falls back to `playTick`.
- **Edition** `flavors/timetable/lib/sound.ts` holds the six recipes built from those primitives, plus `timetableVoice(el)`:
  - `[role=switch],[role=radio]` → relay
  - `a[data-scene-item^="platform:"]` → enamel tap
  - `button, .press` → clunk
  - other `a` → enamel tap at 0.6 gain
- **Mounting.** `deferred-layers.tsx:24` passes `voice={timetableVoice}`.
- **Direct calls.** The scene chunk imports the edition module directly (`world.tsx` flip loop, `scene-root.tsx` `up`). The composer's `onSent` calls `chime()`.

### 6. 3D: new elements per page

**How they ride the session.** There are three options:

- **(a) Extra props in the existing slot.** This is S effort and only fits objects that hang next to the indicator in the header.
- **(b) drei `View`** (it exists at `node_modules/@react-three/drei/web/View.d.ts`, with a `track` prop) scissored to DOM elements. The session canvas becomes one fixed full-viewport overlay, the indicator becomes the first `View` tracked to `[data-scene-slot]`, and `<View.Port/>` goes in `World`. The tunnel is a store, so DOM `<View>`s work with the imperative `createRoot` (`scene-root.tsx:35-48`). This is a shared-engine change to `components/semantic/scene/use-scene-mount.ts` and `lib/scene/dom.ts`.
  - Scroll becomes a frame source: kick the clock on scroll only while a tracked View intersects, and render after Lenis on the same gsap tick.
  - It also fixes §3 #1.
- **(c) A second slot.** This doesn't work: `attachScene` lends one canvas to one host.

Use (a) for header neighbours and (b) for everything in the page body. Rule of the ladder: where an element is a flat card that only flips, **CSS 3D** (`preserve-3d`, as in `styles.css:352-356`) is enough and is noted below.

**Constraints for every element:**

- No drei `Text`, `Text3D` or `Html`. Glyphs come from the existing flap atlas (`flaps.ts:37-70`), which is the edition's documented exception to the "no canvas text" rule (`docs/m2-scene-spec.md:10`, which is written for Drawing Set). The words stay in the DOM.
- Budget: indicator 7 draw calls, plus at most 8 per page for the new elements, stays under 60. Triangles stay under 25k per page. Frames are 0 when idle, and frame time is under 4ms at T1.
- Reduced motion: a static pose and no parallax. T0: an SVG or CSS poster in the same DOM box.

| Page | New element | Where | Interactivity | Session route | drei/three pieces | Budget | Reduced / T0 |
|---|---|---|---|---|---|---|---|
| Home | **A. "You are here" totem**: a yellow disc on an ink post | Over the map's here marker (`network-map.tsx:227-253`) | Hover a line and the totem leans toward that line's row (spring k 0.05, damp 0.88, like `world.tsx:48-53`); click scrolls to /work#role | (b) View tracked to the `svg[data-network]` box, orthographic camera mapped to viewBox 1344 | `View`, `OrthographicCamera`, `useCursor` | 2 calls, 600 tris | Static upright / the existing SVG here-marker |
| Home | **B. Hilfiker-style station clock**: ink hands and a yellow seconds disc | Service-updates head (`home/service-updates.tsx:28`) | Minute hand jumps once a minute (one kicked frame). Hover plays a single 1.5s second-hand sweep. | (b) View | `Instances` (12 hour bars + 48 minute ticks = 1 call), 3 hand meshes | 5 calls, 1.2k tris | Shows the time with no sweep / SVG clock |
| Projects | **A. Flap counter**: 3 modules showing "shown" | Board top strip (`departure-board.tsx:51-56`) | Flips in drum order on each filter change (§4 #1) | (b) View; reuse `createModules` from `flaps.ts` with n=3 | Existing shader | 3 calls, 12 tris | Places the digits / DOM `FlapText` |
| Projects | **B. Signal head**: three aspects (on time, delayed, cancelled) | Beside `DepartureLegend` (`departure-board.tsx:156`) | Hovering a row lights the aspect for its status (`departures[status].tone`); hover only, no click action | (b) View | `Instances` for lenses, `Edges` on the hood | 3 calls, 900 tris | Lit statically to "on" / CSS dots (already in the legend) |
| Project | **A. Edmondson card ticket** | Beside "Board the live service" (`projects/[slug]/page.tsx:78-95`) | Hover lifts it 4° with a spring. Clicking the CTA punches a hole (a 120ms disc drop) at the same time as the clunk sound, with no navigation delay (the link is `target=_blank`). | (b) View, or CSS 3D (a flat card flip suffices) | `RoundedBox` (drei core) and a hole disc | 2 calls, 400 tris | Static / CSS card |
| Project | **B. Bogie on the calling pattern** | Rail of `CallingPattern` (`calling-pattern.tsx:23-36`) | Scroll progress through the section moves the car stop to stop, easing into each stop (`--ease-flick`-like spring) | (b) View; needs `data-scene-section` on the calling section | `Instances` (2 wheelsets), a box body | 3 calls, 800 tris | Parked at the first stop / none |
| Work | **A. Extruded line roundels** | Replace `LineBadge` visuals in each guide (`line-guide.tsx:42-46`) | The active guide's roundel turns 180° to show its line colour face. Hover spins it 360° once. | (b) Views: one `View` per visible guide, at most 2 intersecting | `Instances` (one per role, colour per instance) | 2 calls, 2k tris | Flat roundel / the existing `LineBadge` |
| Work | **B. Train on the network map** | Horizontal map (`network-map.tsx:77`) | Scroll progress runs a 3-car train along the active role's path; hovering a key entry sends it there (a 600ms glide tween) | (b) View tracked to the map, with an orthographic camera in viewBox units | `Instances` (3 cars), `Edges` | 3 calls, 1.5k tris | Parked at "you are here" / none (the SVG carries the facts) |
| About | **A. Wayfinding totem**: a 4-faced pylon | Beside "About this station" (`about/page.tsx:47-56`) | Scroll progress turns it to the face of the section in view (guide, facilities, history, desk). Drag spins it on a spring. | (b) View; faces show platform plates `4a`–`4d` from the flap atlas | Box, atlas material, `useCursor` | 3 calls, 300 tris | Faces the guide / SVG pylon |
| About | **B. Milestone posts**: one per education entry | History list (`about/page.tsx:89-113`) | Hovering a row raises its post 0.1 units and rings the yellow band | (b) View | `Instances` (posts + bands) | 2 calls, 1k tris | Posts at rest / CSS rule marks |
| Now | **A. Station clock** | In the header slot beside the indicator, "Last updated" (`now/page.tsx:45`) | Same behaviour as Home B, but the hour hand points at `now.updatedAt` and hovering it shows the live time | (a) Extra props in the slot (a small pose offset on route `now`) | The same clock module | 5 calls | Static / poster SVG |
| Now | **B. Year drum**: a cylinder carrying the years | Beside the year nav (`now/page.tsx:91-101`) | Progress through `#updates` (already `data-scene-section`, `:112`) rotates it to the year in view. Clicking a face follows the anchor. | (b) View, with years from atlas glyphs | Cylinder, atlas material | 2 calls, 500 tris | Current year face / DOM nav |
| Ask | **A. Hanging "i" sign** (information desk cube) | Above "How the desk works" (`ask/page.tsx:72-87`) | The pointer leans it (the same lean as `world.tsx:284-292`). On `ask:sent` it does one 360° spin with the chime. | (b) View | `RoundedBox`, 2 rods reused as `InstancedMesh` | 3 calls, 700 tris | Still / SVG sign |
| Ask | **B. Ticket validator and notice slip** | By the composer's submit (`chat-composer.tsx:226`) | On `ask:sent` a slip drops into the tray (a 400ms spring). Hovering the tray lifts the last slip. | (b) View; listens with `onSceneEvent` | Boxes, `Instances` for slips (max 5) | 3 calls, 600 tris | No animation / none |
| Ask notice, feed page | **A. Mini flap board**: 1×12 modules, "NOTICE 014" or "PAGE 2 OF 5" | Header right (today `scene={null}`, `ask/[slug]/page.tsx:73`) | Flips when hovering replies ("REPLY 3") | (a) Add a slot with a new `notice` pose, a reduced module row | `createModules` | 3 calls | Places the text / `FlapText` |
| Ask notice, feed page | **B. The "i" sign, small** | Next to the reply composer | Spins on reply posted | (b) View (shares the Ask A module) | As Ask A | 3 calls | Still |
| Lab | **A. Railway turntable** | Under the card grid heading (`lab/page.tsx:35`) | Hovering a card rotates the deck to point at it (a 500ms glide); dragging spins it | (b) View | Cylinder deck, `Instances` rails | 3 calls, 1k tris | Static / SVG |
| Lab | **B. Amber test beacon** | Header, next to the indicator | Rotates only while the pointer is over a card (no idle frames) | (a) Slot extra | Cone lens, emissive | 1 call | Unlit / CSS dot |
| Lab exp | **A. Mini flap board** "EXPERIMENT 01\|RUNNING" | Header (today `scene={null}`) | Static; flips on status change | (a) Slot. Mount only while `CanvasStage` is not active, to avoid a third context. | `createModules` | 3 calls | `FlapText` |
| Lab exp | **B. Signal head for the experiment status** | Beside the tags (`lab/[slug]/page.tsx:53-57`) | Aspect = `labStatusLabels` | CSS 3D recommended (inside a page that already runs its own canvas) | None (CSS) | 0 GL | Flat CSS |
| Resume | **A. Pocket timetable leaflet**: 6-panel accordion fold | Header slot, beside the indicator | Scroll through the document unfolds it (0 → 1 progress, panel yaw ±π); hover a panel lifts it. `data-print=hide`. | (a) Slot extra, with progress from `data-scene-section` on `ResumeDocument` | `Instances` (6 panels) | 2 calls, 72 tris | Folded / SVG |
| Resume | **B. Ticket printer** on `PrintButton` | `resume/print-button.tsx:7` | Hover feeds 8mm of ticket; click feeds a full ticket, then `window.print()` fires on the next frame (no delay) | (b) View, or CSS 3D | Box, `RoundedBox` ticket | 2 calls | Static / none |
| Owner | **A. Signal-box lever frame**: 3 levers | Beside the sign-in form (`owner/page.tsx:26-28`) | Drag pulls a lever. A successful sign-in pulls the "clear" lever and the indicator reads "STAFF\|SIGNED IN". | (b) View | `Instances` (levers), frame box | 3 calls, 900 tris | Levers normal / none |
| Owner | **B. Padlock on the desk door** | Header slot | The shackle opens on success (a 300ms spring) | (a) Slot extra | Torus shackle and body | 2 calls | Closed |
| 404 | **A. Buffer stop at the end of track** | Under the hero slot (`not-found.tsx:46-48`) | Drag a single carriage into it; the spring bounce plays the clunk | (b) View, or in the same hero slot (a), since the slot is big | Boxes, `Instances` for the sleepers | 4 calls, 1k tris | Carriage at rest / SVG |
| 404 | **B. Tail lamp**, red (`--color-danger`) | On the carriage | Hover glows it (emissive 0 → 1 over 200ms); no blinking loop | Shared with A | Emissive sphere | 1 call | Unlit |

### 7. Shippable slices

1. **Quick fixes (no 3D).** Includes §3 #2, #3, #4, #5, #6, #8, #9 and §4 #3, #5, #7. Files: `world.tsx`, `styles.css`, `line-guide.tsx`, `ui/dialog.tsx`, `command/command-dialog.tsx`, `ui/popover.tsx`, `projects/page.tsx`, `ui/button.tsx`, `site/page.tsx`, `docs/timetable.md`. Effort 4h, impact H. No dependencies.
2. **Drum-true riffle and flipping counts.** Includes §3 #7 and §4 #1, #2, #6: `stepToward` moves to `lib/board.ts` so the DOM and scene share one step. Files: `flap-riffle.tsx`, `lib/board.ts`, `scene/flaps.ts`, `row-filter.tsx`, `copy-email.tsx`, plus a test in `lib/__tests__/board.test.ts`. Effort 3h, impact M. No dependencies.
3. **Sticky indicator on /work.** A per-page `sticky` flag on `PageHeader`/`SceneSlot`, used on /work (and optionally /projects). Files: `page-header.tsx`, `scene-slot.tsx`, `work/page.tsx`. Effort 3h, impact H. No dependencies. It is superseded by slice 6 if that ships.
4. **Shared sound engine primitives.** `tone`/`noise`/`grainPool`/compressor in `lib/sound.ts`, plus a `voice` prop on `ClickSound`. Files: `lib/sound.ts`, `components/semantic/click-sound.tsx`. Effort 3h, impact H (unblocks every edition). It is shared.
5. **Timetable station acoustics.** The six recipes in `flavors/timetable/lib/sound.ts`; wiring in `deferred-layers.tsx:24`, `world.tsx` (flip loop), `scene-root.tsx` (release) and `chat-composer.tsx` (chime); a `visibilitychange` suspend. Effort 4h, impact H. Depends on 4.
6. **Shared View overlay engine.** A fixed full-viewport session canvas, `View.Port` in the World, the indicator as the first `View`, scroll kicking the clock only while a View intersects, and T0/poster handoff per View. Files: `components/semantic/scene/use-scene-mount.ts`, `lib/scene/dom.ts`, `lib/scene/clock.ts`, `flavors/timetable/components/scene/{scene-root,world}.tsx`, `docs/m2-scene-spec.md`. Effort 12-16h, impact H. It is shared.
7. **Slot-extra objects (a).** The Now clock, Lab beacon, Resume leaflet, Owner padlock, the mini flap boards for ask/[slug], feed pages and lab/[slug], and new poses in `poses.ts` plus the matching posters in `scene-poster.tsx`. Effort 8h, impact M. No dependency on 6.
8. **In-page View objects, part 1.** Home totem and clock, Projects flap counter and signal head, Work roundels and train. Effort 12h, impact H. Depends on 6.
9. **In-page View objects, part 2.** Project ticket and bogie, About totem and posts, Now year drum, Ask i-sign and validator, Lab turntable, Resume ticket printer, Owner levers, 404 buffer stop and lamp. Effort 14h, impact M. Depends on 6 and 8 (shared clock module and atlas reuse).
10. **Lab context hygiene.** Release the session WebGL context while a `CanvasStage` is mounted (§3 #11). Effort 2h, impact L. It is shared (`use-scene-mount.ts`, `canvas-stage.tsx`).

---

# Appendix E: Field Survey

(Sub-agent audit, spot-checked by the lead in §2.6. The sound palette is subject to the dedupe rules in §2.2. Main-report §6 supersedes any "captain decision" or "pending confirmation" note below; the owner chose custom edition-styled scrollbars.)

# Edition: Field Survey (`survey`)

Scope read: `docs/survey.md`, `docs/mocks/survey.md`, `flavors/survey/styles.css`, `flavors/survey/lib/{loupe,relief,prefs}.ts`, `flavors/survey/lib/scene/poses.ts`, `flavors/survey/components/{scene,relief,home,work,projects,interaction,customize,motion,site,lab}/*`, every `app/f/survey/**/page.tsx`, shared `lib/sound.ts`, `components/semantic/click-sound.tsx`, `lib/scene/{clock,dom}.ts`, `docs/m2-scene-spec.md`.

**Structural fact that shapes every 3D recommendation below:** unlike the brief's R3F default, Survey's session scene is plain three.js with no R3F (`docs/survey.md:61`, `flavors/survey/components/scene/scene-root.ts:1-36` builds a raw `WebGLRenderer`, `world.ts:56-97` one `ShaderMaterial` plane). drei `View`, `Instances`, `Edges` and the rest can't be used in the session scene unless it's ported to R3F. The three-core equivalents are `InstancedMesh`, `EdgesGeometry` + `LineSegments`, `BatchedMesh`, and a hand-rolled scissor viewport. The one R3F surface is `/lab/[slug]` (`components/semantic/lab/canvas-stage.tsx:4-5`, drei `PerformanceMonitor` + fiber `Canvas`), and drei is fine there.

## 1. Design language

- **Palette** (`styles.css:23-53`, all `light-dark()` pairs): ground `#dfe6dd / #0a1417`, sheet `#ebefe7 / #0e1b1e`, ink `#1c2a2b / #d6e1d9`, contour `#9a5b2a / #c8975c`, water `#255f8a / #72b0d6` (grid, focus, selection, reticle), sea `#d2e1e5 / #0f2630`, wood `#36683a / #86c08f` (available/maintained), revision `#7a4aa5 / #bda3ec` (current), and 8 stepped tints running `#e3e7d5` to `#c29a70` (day). Each colour carries one meaning (`styles.css:19-21`).
- **Type** (`styles.css:55-60`, `docs/survey.md:34-39`): Spectral display in spaced caps (`.spaced` 0.3em, `styles.css:202-207`), Spectral italic for ledes, Public Sans for text and tabular grid numbers (`.caps` 0.6875rem/600/0.14em, `styles.css:192-199`), and UnifrakturMaguntia once for archived projects. Radii are 2/3/5px (`styles.css:85-87`).
- **Layout device:** the page is a survey sheet (`hero.tsx:33-116`): title band, relief map with neat line, marginalia aside (`hero.tsx:77-103`), and a foot strip. Every inner page uses a title band plus a 4:3 inset of its own grid square (`page-header.tsx:39-76`, `scene-slot.tsx:42`). Eastings are years, north of the boundary is employment, east of the coast is the sea.
- **Motion vocabulary:** easings `--ease-glide (0.16,1,0.3,1)`, `--ease-enter (0.23,1,0.32,1)`, `--ease-exit (0.4,0,1,1)` (`styles.css:89-91`). Durations are press 120ms at scale 0.97, ui 220ms, route-out 160ms, route-in 280ms with a 40ms delay (`styles.css:100-104, 314-334`). Transect draw is 1400ms glide (`styles.css:285`) and split headings are 0.8s at stagger 0.04 (`use-split-reveal.ts:46-48`). The loupe lerps 0.2 per frame (`loupe.ts:19`), camera flights run 1.4s `expo.inOut` (`world.ts:134`), and the inset lean uses a per-frame spring of k 0.08 with damping 0.82 (`world.ts:44-48`). Theme changes fade the body over 300ms with the generic `ease` (`styles.css:133-135`).
- **Cursor:** a water-blue reticle (a ring with a cross) sits beside the native cursor. It shrinks to 0.72 over targets (200ms ease-enter) and opens a caps tag (`cursor.tsx:54-77`), and it steps aside over the map, where the loupe acts as the cursor (`data-cursor="none"`, `sheet-map.tsx:196`, `scene-loader.tsx:53`).
- **Scrollbar:** a contour-brown thumb with a 3px transparent border on a ground track, darkening to contour-ink on hover (`styles.css:121, 165-187`).
- **Current 3D, one per page:** a single displaced plane (380x248 segments, about 188k triangles, 1 draw call, `world.ts:60-97`). It draws gaussian hills per role, contours, tints, NW hillshade, sea hachure and a shader loupe ring (`shaders.ts:9-118`). Home shows the full sheet under the DOM SVG overlay. Other pages show a 4:3 header inset flown to the page's pose (`poses.ts:80-153`). Interactivity: the pointer aims the loupe, which magnifies the terrain (`shaders.ts:31-42`); hovering any `data-scene-item` sends the loupe there (`world.ts:147-155`); insets lean ±0.12 rad yaw and ±0.06 pitch with the pointer (`world.ts:169-175`). There's no click or drag, and nothing is scroll-linked.

## 2. Per-page inventory

| Page | What renders today | Current 3D (slot / pose) | Current motion | Gaps |
|---|---|---|---|---|
| Home `/` (`app/f/survey/page.tsx:47-74`) | Sheet hero: title band, relief map with summits and sites as links, marginalia, key, strip (`hero.tsx`). Then Summits, selected Gazetteer, Revisions | Full-sheet mesh under the SVG (`sheet-map.tsx:172-191`, `poseFor("home")` → `FULL_SHEET`, `poses.ts:148-151`) | Loupe lerp and readout (`sheet-map.tsx:125-148`), aims on summit or site hover (`:312`, `:374`), site label fade 150ms (`:383`) | The mesh is only magnified, never lit up per hover. SVG summit and site links have no press state. On phones the map is cropped to 158% width with a -37% shift (`hero.tsx:66`), which hides the west edge (the first years) |
| Work `/work` (`work/page.tsx:33-69`) | Header, then one `RoleTransect` per role with an SVG profile (`role-transect.tsx`, `transect.tsx:54-73`) | Inset `route:"work"` framing all summits (`poses.ts:103-107`) | Transect draw-in 1400ms (`styles.css:279-286`). Hovering an article (`data-scene-item role:*`, `role-transect.tsx:36`) moves the inset loupe | The inset doesn't show which ridge a transect cuts, and nothing links scroll position to the inset |
| Projects `/projects` (`projects/page.tsx:35-70`) | Gazetteer header, `RowFilter` by condition, full `Gazetteer` | Inset `route:"projects"` on the lowland (`poses.ts:96-97`) | Row colour 200ms (`gazetteer.tsx:61`), row hover moves the loupe (`gazetteer.tsx:60`). The filter swaps instantly | Sites are only a shader loupe target, with no marker in 3D. Filtering leaves the inset unchanged |
| Project `/projects/[slug]` (`projects/[slug]/page.tsx:60-190`) | Site report: grid ref, notes, image, "Surveyed with", `SiteSymbol` (`:134`), W/E neighbour nav (`:148-190`) | Inset `route:"project"` centred on the site (`poses.ts:98-102`) | Page view transition only | The neighbour links (W and E) aren't `data-scene-item`s, so the inset can't point at them. The condition symbol is 2D only |
| Now `/now` (`now/page.tsx:44-130`) | Revision notes R01…, "What changed" by year, category `RowFilter` | Inset `route:"now"` at the coast (`poses.ts:113-120`) | None beyond the route transition and the filter | Revision items don't talk to the inset, and year anchors do nothing in 3D |
| Changelog `/changelog` | `permanentRedirect("/now#log")` (`changelog/page.tsx`) | Inherits /now | n/a | n/a (all additions land on /now) |
| About `/about` (`about/page.tsx:36-141`) | Surveyor, Instruments (skills tags), Training, Correspondence | Inset `route:"about"` on the first year (`poses.ts:108-112`) | None | The "Instruments" section is plain tags, so the metaphor stops at the header |
| Resume `/resume` (`resume/page.tsx:20-27`) | `PageHeader scene={null}`, `ResumeDocument`, print button | **None** (`scene={null}`, `:24`) | None | No grid square, which breaks "every page has its own square" (`docs/survey.md:15`) |
| Ask `/ask` (`ask/page.tsx:37-104`) | Notebook composer, moderation strip, entries feed, pagination | Inset `route:"ask"` on the current summit (`poses.ts:121-125`) | Pending echo and chat UI, route transition | The entry count and submission leave no mark on the sheet |
| Ask entry `/ask/[slug]` (`ask/[slug]/page.tsx:50-71`), also `/ask/page/[page]` (`:59`) | Single `ChatThread` | **None** (`scene={null}`, `:68`, `ask/page/[page]:59`) | None | No inset |
| Lab `/lab` (`lab/page.tsx:27-60`) | Tilted trial cards with static SVG poster (`poster.tsx`, `data-tilt`) | Inset `route:"lab"` on the most recent year's sites (`poses.ts:126-130`) | Card tilt (`styles.css:233-245`), border colour 220ms | The lab pose frames project sites, not the trials, so the metaphor is weak |
| Lab trial `/lab/[slug]` (`lab/[slug]/page.tsx:48-61`) | `ExperimentStage` with a separate R3F `CanvasStage` (`signature-field.tsx:13-19`), fallback fade 700ms ease-out (`experiment-stage.tsx:83`) | No session inset (`scene={null}`, `:52`). The experiment has its own R3F canvas | 700ms fallback crossfade | This is a second WebGL context, and the trial isn't placed on the sheet |
| Owner `/owner` (`owner/page.tsx:19-26`) | "Surveyor only" header, `OwnerSignIn` | **None** (`scene={null}`, `:23`) | None | Utility page, so it gets low priority |
| 404 (`not-found.tsx:18-50`) | "Unsurveyed", list of surveyed pages | Inset `route:"notfound"` on the sea (`poses.ts:131-138`) | None | The sea is inert. The nav list doesn't point back to land in the scene |

## 3. Design improvements (ranked)

1. **Theme flip desync between DOM and mesh.** The body fades colours over 300ms with `ease` (`styles.css:133-135`), but `world.ts:99-115` snaps the uniforms at once and `kick()`s one frame, so the inset jumps while the page around it fades. Fix: in `colours()`, keep the previous colours and `tween` a `mix` value 0→1 over 220ms (`--duration-ui`) with `power2.out`. Change the body transition to `var(--duration-ui) var(--ease-enter)` so both flip in the same frames. Motion off: both instant. Impact H, effort S (1.5h).
2. **Frame-rate-dependent easing.** The loupe lerps `k=0.2` per rAF (`loupe.ts:19`) and the lean spring is per frame (`world.ts:44-48`). At 120Hz the loupe converges twice as fast and the spring is stiffer, so ProMotion and 60Hz displays feel different. Fix: `k = 1 - Math.exp(-13.4 * dt)` (13.4/s equals 0.2 at 60fps), and step the spring with a clamped `dt`. The clock already passes scene time (`clock.ts:70-73`), but `scene-root.ts:34` discards it. Impact M, effort S (1h).
3. **Scene-less pages break the sheet's own rule.** "Every page has its own square" (`docs/survey.md:15`), yet resume (`resume/page.tsx:24`), owner (`owner/page.tsx:23`), ask entry (`ask/[slug]/page.tsx:68`), ask pages (`ask/page/[page]/page.tsx:59`) and lab trial (`lab/[slug]/page.tsx:52`) pass `scene={null}`. Fix: add `SceneRoute` cases `entry` (the current summit, with the entry index as focus jitter), `trial` (a trial stake, see 6.x) and `owner` (the coast), and let resume keep a print-hidden inset (`data-print="hide"`). Impact M, effort M (3h).
4. **Map links have no press feedback.** `.press` exists (`styles.css:209-215`) but only buttons use it. Summit and site `<a>`s in `sheet-map.tsx:310-400` and gazetteer rows don't. Fix: SVG `transform-box: fill-box; transform-origin:center`, `:active` scale 0.94, 120ms `--ease-enter`. Impact M, effort S (0.5h).
5. **Mobile hero crop hides the first years.** `hero.tsx:66` forces the map to 158% width at -37% translate, so on phones the 2022 lowland and west neat line fall off-screen, and a loupe landing there shows nothing. Fix: make the wrapper `overflow-x:auto` with `scroll-snap-type:x proximity` and an initial `scrollLeft` at the massif (`peak`). Or add a 1-line locator strip below it showing the visible window. Impact M, effort M (2h).
6. **The lab pose points at unrelated project sites** (`poses.ts:126-130` uses the most recent year's projects). Fix: give trials sheet coordinates (year → easting, fixed "trial lane" northing just south of the boundary) and frame them. Impact L, effort S (1h).
7. **Camera flight overshadows the page-in.** The page settles in 280ms+40ms (`styles.css:319`), but the inset flies for 1.4s `expo.inOut` (`world.ts:134`), so the header keeps moving for about 1.1s after the content has landed. Fix: 0.9s `expo.out` when the flight distance is under half a sheet, and keep 1.2s `expo.inOut` for long flights (home ↔ 404). It's already interruptible via `overwrite:"auto"` (`clock.ts:99`). Impact M, effort S (0.5h).
8. **Inset mesh resolution.** 188k triangles (`world.ts:60-65`) is sized for the full home sheet. A ~420px inset needs a quarter of that. Fix: on T1 or `route !== "home"`, swap to a 190x124 geometry (about 47k triangles), one extra cached geometry. Impact L-M (T1 GPUs), effort S (1h).
9. **Transect draw is long.** 1400ms (`styles.css:285`) repeats for every role on /work. Fix: 900ms `--ease-glide` plus `--delay` 60ms between the profile and its "alongside" shading. Impact L, effort S (0.3h).

## 4. Animation improvements

Tokens: `E` = `--ease-enter cubic-bezier(0.23,1,0.32,1)`, `G` = `--ease-glide cubic-bezier(0.16,1,0.3,1)`, `X` = `--ease-exit cubic-bezier(0.4,0,1,1)`.

| # | Location | Today | Purpose | Frequency | Exact motion | Reduced-motion fallback |
|---|---|---|---|---|---|---|
| 1 | Summit and site links, gazetteer rows (`sheet-map.tsx:310-400`, `gazetteer.tsx:60-61`) | No `:active` | Feedback: the press registers | Occasional (click) | `:active{transform:scale(.94)}`, `transition: transform 120ms E`, `transform-box:fill-box` | Colour darkens to `contour-ink`, no scale |
| 2 | Theme flip, mesh uniforms (`world.ts:99-115`) plus body (`styles.css:133`) | DOM 300ms `ease`, mesh snaps | Multimodal harmony: one surface flips as one | Rare | Uniform `uMix` 0→1 over 220ms `power2.out` (the closest gsap to E); body `220ms E` | Both instant |
| 3 | Inset marker rise on row hover (new 3D markers, 6.projects) | The loupe moves only | Causality: the row and its map mark answer together | Frequent (hover scan) | Marker `y += 6` via critically damped spring (stiffness 380, damping 32; about 180ms settle); water tint mix 0→1 over 120ms | Tint only, no rise |
| 4 | `RowFilter` results (`row-filter.tsx:46-57`, `/projects`, `/now`) | Instant show and hide | State change: the visitor sees what the filter kept | Occasional | Kept rows `opacity .0→1, translateY 4px→0`, 160ms E, stagger 20ms capped at 6 rows. Removed rows hide instantly (exits shouldn't make the visitor wait) | Opacity only, 120ms linear |
| 5 | Camera flight (`world.ts:134`) | 1.4s `expo.inOut` always | Spatial continuity between grid squares | Per navigation | Distance `d` = window centre delta ÷ sheet width: `d<.5` → 0.9s `expo.out`, else 1.2s `expo.inOut`. Stays interruptible | Instant (already `duration:0`, `clock.ts:101`) |
| 6 | Copy email "Copied" (`copy-email.tsx:23-24`) | Text appears | Confirmation, like a stamp landing | Rare | `scale 1.12→1, opacity 0→1`, 180ms E, out 120ms X after 1600ms | Opacity only |
| 7 | Transect draw (`styles.css:283-286`) | 1400ms G | Reveals the section as it's reached | Once per transect | 900ms G, `--delay` 0/60ms for profile vs alongside fill | Drawn from first paint (already) |

**Rejected candidates**
- Rolling or odometer animation on the loupe readout text (`sheet-map.tsx:136-145`): it fires on every pointer frame, so the frequency gate kills it. Text must track instantly.
- Ambient sea swell or buoy bob on the 404 while idle: it has no purpose and breaks the "idle = zero frames" contract (`docs/survey.md:67`). Rejected by the purpose and battery gates. Motion only while the pointer is inside the inset (6.404).
- Drawing contours in on home first paint: "correct from first paint" (`docs/survey.md:57`), and home is the most-seen page. Rejected by the frequency gate plus the first-paint rule.
- Animating the ⌘K dialog rows or the scene inset when the command palette navigates: the action is keyboard-initiated, so rejected by the never-animate-keyboard gate. The flight still runs because the route changed, but the palette itself stays instant.
- A magnified-lens "glass" refraction pass on the loupe: it costs a full-screen pass for a purely decorative effect that the vertex magnification already delivers (`shaders.ts:36-40`), so the utility gate kills it.

## 5. Sound design

**Concept: "The instrument case."** The sheet is surveyed with brass and glass instruments, so sounds are short, dry, and mechanical, with no music and no reverb tails. Links click like a theodolite's detent. Buttons are a pencil tap on the plane table, switches are the bubble in a spirit level settling, and a theme flip is a sheet of paper turning. Hovering a summit rings a brass benchmark pinged at a pitch set by the role's height in months, so the heights become audible. That makes the ping data-true, like every other device on the sheet (`docs/survey.md:3`). Copy, print and submit get an ink stamp.

**Palette: 6 distinct voices** (plus one quiet variant). All run on one shared `AudioContext`, go through a master gain at 0.8, and never exceed peak 0.12.

| Interaction | Sound | Synthesis recipe |
|---|---|---|
| Link click (any `<a>`) | **Click-stop** (theodolite detent) | White noise 6ms → bandpass 3200Hz Q 6, gain 0.08. Plus sine 2400Hz, attack 1ms, exp decay 14ms, gain 0.05. Total 20ms |
| Button or filter-chip click | **Pencil tap** | Noise 12ms → highpass 2500Hz → bandpass 5000Hz Q 1.5, attack 1ms, exp decay 12ms, gain 0.07. Plus triangle 1100Hz 10ms, gain 0.03 |
| Switch on/off (`role=switch`, customize) | **Level bubble** | Sine glide 660→990Hz (on) or 990→660Hz (off) over 70ms, lowpass 3000Hz, attack 4ms, exp decay to 90ms, gain 0.06 |
| Theme toggle | **Sheet turn** | Two noise bursts through bandpass sweeping 1200→3500Hz: #1 at 90ms, #2 at +35ms for 60ms at 0.6×. Attack 8ms, gain 0.05. Starts in the same frame as the 220ms colour flip (§4 #2) |
| Pointer-enter on a summit or site (`data-scene-item`, fine pointer only) | **Benchmark ping** | Sine f and sine 1.5f at 0.3×, attack 3ms, exp decay 180ms, gain 0.035. Summits use f = 523.25·2^(h/24) Hz (24 months is one octave, so a taller role rings higher). The current role gets a third partial at 2f, 0.15× (its purple). Sites use a fixed 1046Hz at gain 0.025 |
| Variant: the loupe's "N roles running" count changes on home | **Tally** (quiet ping) | Triangle 880·2^(n·3/12)Hz, 18ms, gain 0.02. Rate limit 1 per 90ms. Fires only on a change of `n` (`relief.ts:345-348`), never per frame |
| Copy email, print, ask submit | **Ink stamp** | Sine 150→70Hz over 70ms, gain 0.10. Plus noise 8ms → lowpass 800Hz, gain 0.05. 80ms total |

- **Samples:** none. Everything is synthesized, so it adds 0 KB. If a real detent is ever preferred, a self-recorded theodolite or pencil (CC0, own recording) as 48kHz mono Opus is about 3-4 KB each. Freesound CC0 is acceptable only with the CC0 filter checked and the link kept in `docs/survey.md`.
- **Opt-in:** unchanged. `sound: false` default (`lib/prefs/standard.ts:39`). Turning it on plays the Level bubble as the unlocking gesture (replaces `playTick("button")` at `customize-controls.tsx:54`).
- **Reduced motion or motion off:** sound isn't motion, so click-stop, pencil, bubble, sheet turn and stamp stay. Suppress the tally, because with motion off the loupe snaps (`loupe.ts:19`) and counts would jump in bursts. Keep the benchmark ping, which is a discrete hover and not motion-linked. No flight sound exists (rejected: a 1-second whoosh on every navigation fails the frequency gate).
- **Mute, hidden tab, touch:** mute means the master gain goes to 0 and `suspendSound()` (existing, `lib/sound.ts:27`). The engine drops every call while `document.hidden` (today only `click-sound.tsx:18` checks this, so move it into the engine). Touch keeps no click sounds (existing `click-sound.tsx:19`), and hover voices never fire on touch because they're gated on `pointerType==="mouse"` or `pen`. Focus-driven aims (`sheet-map.tsx:313`, `:375`) stay silent, so keyboard travel isn't noisy.

**Triggers and wiring (shared code never imports flavors):**
- Shared engine `lib/sound.ts`: add `export type Voice = (ctx: AudioContext, t: number, out: AudioNode) => void` and `export function play(voice: Voice)`. It holds the lazy context, master gain, hidden-tab guard, a cached 1s noise `AudioBuffer` via `noiseBuffer(ctx)`, and a voice limiter (max 4 concurrent). `playTick` stays as the default voice for editions that don't opt in.
- Shared `ClickSound` (`click-sound.tsx:13-26`): accept `voices?: { link?: Voice; button?: Voice; switch?: Voice }`. The existing `closest(CLICKABLE)` picks link, `[role=switch]`, or button, and falls back to `playTick`.
- Edition module `flavors/survey/lib/sound.ts` (new) exports the 6 recipes plus a `benchmark(h, current)` factory, and imports only `lib/sound`.
- Call sites:
  - Link, button and switch: `deferred-layers.tsx:24` passes `<ClickSound enabled={sound} voices={surveyVoices} />`.
  - Sheet turn: `theme-toggle.tsx:14`.
  - Ink stamp: `copy-email.tsx:17` (in the `copy` success path), `print-button.tsx:13`, and `chat-composer.tsx:95` after a successful submit (not on validation fail).
  - Benchmark ping: `sheet-map.tsx:312` / `:374` (home) and the shared `world.ts:147-155` hover path for insets. Guard with the `sound` pref, read via a `data-sound="on"` check on `<html>`, which `standard.ts:105` already sets, so `world.ts` needs no React.
  - Tally: `sheet-map.tsx:127` draw listener, which diffs `n`.

## 6. 3D: two new elements per page

**How they ride the one session canvas.** There are three mechanisms, cheapest first:
- **(A) Props in the existing slot's scene.** Add meshes to `world.ts`'s `scene` and let the board carry their data (extend `Board`, `poses.ts:156-166`). These add zero extra viewports and share the camera, lean and flight.
- **(B) Blit glyphs.** For small inline objects elsewhere on the page, the same `WebGLRenderer` renders a tiny scene into a 128-192px viewport (`setViewport` + `setScissor`), then `drawImage`s it into a DOM `<canvas>` 2D element placed in the markup. This keeps one WebGL context, and glyphs render only on demand (hover, drag, theme). It's the plain-three version of drei `View`/`View.Port` without needing a fixed full-screen canvas. It needs a small shared helper, `lib/scene/blit.ts`: register rect, scene and camera, then render them when dirty. That helper is edition-agnostic.
- **(C) A second slot** is not recommended. `attachScene` lends the canvas to one host (`dom.ts:136-140`).

**Constraints on every element:**
- No canvas text (`docs/m2-scene-spec.md:10`); labels stay in the DOM.
- Colours come from the tokens via `tokenColor` (`world.ts:101`).
- Unlit flat `ShaderMaterial`/`MeshBasicMaterial` with ink outlines via `EdgesGeometry`/`LineSegments` (the drei `Edges` equivalent).
- Page budget: current 1 call and 188k triangles, plus at most 10 calls and 12k triangles. Well under the <60 draw-call limit (`m2-scene-spec.md:145,186`). The frame target is ≤2ms extra GPU on T1, and idle stays 0 frames.
- T0 or `scene:"off"`: the (A) props are drawn in the SVG poster (`SheetGround`), and each (B) glyph falls back to its SVG twin (for example `SiteSymbol`).
- Reduced motion: static final pose, no lean, bob or sweep, and drag without inertia.

| Page | New element | Where | Interactivity | Mechanism and pieces | Budget | Fallbacks |
|---|---|---|---|---|---|---|
| Home | **H1 Hovered-summit contour lift.** The hovered summit's contour rings rise 6 units as water-blue loops, index rings thicker | On the sheet, in the same scene | Pointer-enter on a summit or summit row (the existing `hovered`, `world.ts:147`). Tint in over 120ms, rise via spring | A: `LineSegments` built once per summit from `contour()` (`relief.ts:389`) at `levels()`, shown by index | 1 call (active ring set only), about 2k segments | RM: tint, no rise. T0: the SVG summit mark already highlights |
| Home | **H2 Theodolite at the coast.** A low-poly tripod and instrument standing at "today", its telescope yawing to sight the loupe | Coast line, mid-northing (`relief.coast`) | Follows the loupe (reads `loupe.x/p`, 0 new listeners). Click is DOM (a hidden hotspot link to `/now`, since the instrument is "surveyed today") | A: merged `BufferGeometry` (about 600 triangles) plus `EdgesGeometry`, 2 materials; telescope is a child `Object3D` | 2 calls, 600 triangles | RM: fixed bearing at the peak. T0: add an SVG tripod glyph to `SheetGround` |
| Work | **W1 Section plane.** A vertical cutting sheet with ink hachure standing on the ridge of the role currently in view, showing where the transect below cuts | Header inset | Scroll: nearest `RoleTransect` in view (put `data-scene-section` on each, `dom.ts:41-54` progress) moves the plane to that ridge. Hover snaps; hovering the inset does a ±8% scrub | A: 1 `PlaneGeometry` quad plus shader stripe, and a `uCut` uniform highlighting ±1.5 units in `shaders.ts` (0 extra calls for the band) | 1 call, 2 triangles | RM: plane jumps, no ease. T0: dashed SVG line on the poster |
| Work | **W2 Ridge block diagram.** A geology-style cut block of that role's ridge (heightfield strip with side skirts), beside each transect's margin | `role-transect.tsx:40` margin column, 160px | Drag to rotate yaw ±30° (spring back on release), hover tilts 6° | B: `PlaneGeometry(64,16)` sampled with `heightAt` (`relief.ts:305`) plus a skirt, shared material. Only on-screen blocks render | 2 calls per visible block (at most 2 visible), about 2.3k triangles each | RM: static 20° view, drag without inertia. T0: none (the SVG transect already carries it) |
| Projects | **P1 Site markers.** Trig pillars, antiquity crosses and works-boxes standing on the lowland in 3D | Header inset | Gazetteer row hover raises its marker (§4 #3). The `#condition` filter sinks non-matching markers (y −6, 180ms) | A: 3 `InstancedMesh` (one per condition, per-instance `hot` attribute) plus shared edges | 3-6 calls, about 1k triangles | RM: tint only. T0: the SVG `SiteSymbol` in `SheetGround` |
| Projects | **P2 Row glyphs.** A 24px 3D condition symbol at the head of each gazetteer row | `gazetteer.tsx` row, the `1.75rem` column | Row hover turns it 90° (spring). Otherwise static | B: shared geometry from P1, one renderer pass per hovered row only | 2 calls on hover, 0 idle | RM: no turn. T0: existing `SiteSymbol` |
| Project | **J1 Sight lines.** Dashed rays from this site to its W and E neighbours, with neighbour markers | Header inset | Hover the neighbour nav links. Add `data-scene-item="site:<slug>"` at `projects/[slug]/page.tsx:152-186` so the ray lights and the loupe travels | A: `LineSegments` with a dash shader (2 segments) plus P1 instances | 2 calls, trivial | RM: rays static-lit. T0: dashed SVG rays on the poster |
| Project | **J2 Condition monument.** A 96px trig pillar, antiquity or works-box that you can turn | Beside "Marked on the sheet as" (`projects/[slug]/page.tsx:134`) | Drag spins it with inertia (friction 0.92 per 16ms), hover leans 8°. Keyboard: none, it's decorative (`aria-hidden`) | B: P1 geometry at larger scale, edges plus fill | 2 calls on interaction | RM: drag without inertia. T0: `SiteSymbol` |
| Now | **N1 Revision overprint.** Purple hatch over the current summit, with a revision-purple strip along the newest surveyed months at the coast | Header inset | Hover an R01… item (`now/page.tsx:66-80`) to strengthen the hatch (make the items `data-scene-item="role:<current>"`) | A: fragment-shader uniform `uRevision` (hatch where the current hill dominates and x is within 1 year of the coast). 0 extra calls | 0 calls | RM: same, no fade. T0: purple SVG hatch in the poster |
| Now | **N2 Revision layers.** A stack of thin translucent sheet tiles, one per changelog year | Beside the year nav (`now/page.tsx:98-108`), 140px | Hovering a year link lifts that tile 8 units; clicking scrolls (DOM) | B: N `BoxGeometry` thin slabs (N = years, at most 5) in one `InstancedMesh` plus edges | 2 calls, 60 triangles | RM: tint the tile instead of lifting. T0: hidden |
| About | **A1 Plane table at the first site.** A tripod and plane table standing on the first-year site ("where the survey began") | Header inset | Lean (existing). Hovering "The surveyor" section heading aims the loupe there | A: merged geometry, about 400 triangles plus edges | 2 calls | RM: static. T0: SVG tripod glyph |
| About | **A2 The instrument.** A theodolite (same model as H2) that you can turn, next to "What the survey used" | `about/page.tsx:56-80` section head aside, 180px | Drag the alidade (yaw). Hovering a skill group swings the telescope to a preset bearing per group (spring) | B: H2 geometry. Rendered on hover or drag only | 2 calls, 600 triangles | RM: preset bearings snap. T0: hidden |
| Resume | **R1 Folded map sheet.** The resume as a map folded in 3 panels, with one panel unfolding | New print-hidden inset in the header (see §3.3) | Hover unfolds panel 2 through 0→150° (hinge rotation, spring). Click the print button to fold flat | A in a new `route:"resume"` pose over the full sheet: 3 `PlaneGeometry` panels, flat sheet tint plus ruled lines in the shader (no texture) | 3 calls, 6 triangles | RM: open, static. T0: SVG. Print: `data-print="hide"` |
| Resume | **R2 Stamp glyph.** A 40px rubber stamp beside Print that presses on `:active` | `print-button.tsx:13` | Press depresses it 3 units in the same frame as the ink stamp sound (§5) | B, 120 triangles | 2 calls on press | RM: no travel. T0: none |
| Ask | **K1 Cairn on the current summit.** One stone per entry (capped at 24) | Header inset | Composer focus lifts a spare stone above the cairn. Submit drops it (spring with a small overshoot, 240ms) together with the ink stamp | A: `InstancedMesh(IcosahedronGeometry(1,0))`, deterministic per-index scale and rotation | 1 call, 480 triangles | RM: stone appears in place. T0: cairn glyph in the SVG |
| Ask | **K2 Benchmark discs.** A 20px brass benchmark disc beside each "Entry 014" label, tilting toward the pointer | `entry-number.ts` label in `chat-bubble.tsx` | Hover tilt ±15° only, no drag | B: a `CylinderGeometry(1,1,.15,24)` shared across entries; renders only the hovered disc | 2 calls on hover | RM: flat. T0: SVG circle |
| Ask entry | **E1 Inset with this entry's stone** highlighted in the cairn (new `entry` route, §3.3) | New header inset (`ask/[slug]/page.tsx:68`) | Lean, plus hover on the entry label to pulse the stone tint | A: K1 with a `hot` index | 1 call | As K1 |
| Ask entry | **E2 Benchmark disc** (K2) as the page's hero mark, 72px | Beside the title | Drag to spin with inertia | B | 2 calls | As K2 |
| Lab | **L1 Trial stakes.** A wooden stake with flagging tape per trial, on the new trial lane (§3.6) | Header inset | Card hover (`lab/page.tsx:37-40`, add `data-scene-item="trial:<slug>"`) raises its flag. The tape ripples via a vertex sine only while hovered | A: instanced stake plus a 4x1-segment tape plane | 2 calls, about 200 triangles | RM: flag raised, no ripple. T0: SVG stake |
| Lab | **L2 Trial pit on hover.** Hovering a card swaps its static poster for a live cut block of the terrain at that trial | Card poster box `lab/page.tsx:43-45` | Hover shows it, and the card tilt (existing `--rx/--ry`) drives the block's yaw and pitch | B: W2 block geometry. Renders only while hovered | 2 calls | RM: static poster stays. T0: poster |
| Lab trial | **T1 Inset with its stake** (`route:"trial"`) | New header inset (`lab/[slug]/page.tsx:52`) | Lean. While the R3F stage is live, the session canvas sleeps (0 frames) so two contexts never render at once | A: L1 | 2 calls | As L1 |
| Lab trial | **T2 Survey grid ground in the experiment.** A drei `Grid` under the signature field (cell 1, section 4, matching the index contour every 4th), with drei `Edges` on the field's bounds | Inside `CanvasStage` (`signature-field.tsx:13-19`) | Existing experiment interaction. The grid fades with its `fadeDistance` | R3F: drei `Grid`, `Edges` (both exist in drei 10.x) | 2 calls | RM: static. T0: experiment fallback |
| Owner | **O1 Map case.** A small locked instrument case whose lid opens on successful sign-in | Next to `OwnerSignIn` (`owner/page.tsx:26`), 120px | Lid hinge 0→70° via spring on auth success. Hover lifts the latch | B, about 300 triangles | 2 calls | RM: open or closed state swap. T0: hidden |
| Owner | **O2 Inset at base camp** (`route:"owner"`, a tent glyph at the coast) | Header inset | Lean only | A: 60 triangles | 2 calls | T0: SVG |
| 404 | **F1 Sounding buoy** in the unsurveyed sea | Inset | It bobs ±2 units only while the pointer is inside the inset. Drag nudges it (spring back). No idle frames | A: a `LatheGeometry` buoy of about 150 triangles plus edges | 2 calls | RM: still. T0: SVG buoy |
| 404 | **F2 Lighthouse beam** from the coast sweeping toward the pointer, pointing "back to land" | Inset, at the coast | Beam yaw follows the pointer. Hovering a nav link in `not-found.tsx:33-39` swings the beam west to that page's pose centre | A: tower (about 100 triangles) plus an additive cone (`ConeGeometry`, `depthWrite:false`) | 3 calls | RM: fixed beam west. T0: SVG beam |
| Changelog | Redirects to `/now#log`, so it inherits N1 and N2 | n/a | n/a | n/a | n/a | n/a |

## 7. Shippable slices

1. **Shared voice engine** (shared, prerequisite for 2-3). `lib/sound.ts`: `Voice`, `play`, master gain, noise buffer, hidden guard, limiter. `components/semantic/click-sound.tsx`: `voices` prop with `playTick` fallback. No edition identity. 3h. Impact H (unblocks per-edition sound for all six).
2. **Survey instrument case, clicks.** `flavors/survey/lib/sound.ts` (click-stop, pencil, bubble, sheet turn, stamp). Wire `deferred-layers.tsx:24`, `customize-controls.tsx:54`, `theme-toggle.tsx:14`, `copy-email.tsx:17`, `print-button.tsx:13`, `chat-composer.tsx:95`. 2.5h, impact H. Depends on 1.
3. **Survey benchmark ping and tally.** Wire `sheet-map.tsx:127/312/374` and `world.ts:147` with the h→pitch mapping, fine-pointer and motion gates. 2h, impact M. Depends on 2.
4. **Motion correctness.** Theme uniform crossfade plus body token (§3.1), dt-based loupe and spring (§3.2), flight durations (§3.7), transect 900ms (§3.9). Files: `world.ts`, `loupe.ts`, `scene-root.ts:34`, `styles.css:133,285`. 3h, impact H. No dependency.
5. **Press and filter polish.** §4 #1, #4, #6. Files: `sheet-map.tsx`, `gazetteer.tsx`, `row-filter.tsx`, `copy-email.tsx`, `styles.css`. 2h, impact M. No dependency.
6. **Every page gets a square.** New `SceneRoute`s `entry`, `trial`, `owner` and a print-hidden resume inset. Trial coordinates (§3.6). Files: `poses.ts`, `poses.test.ts`, `resume|owner|ask/[slug]|ask/page/[page]|lab/[slug]/page.tsx`. 3.5h, impact M. No dependency.
7. **Board props layer (mechanism A).** Extend `Board` with a `props` list, a prop registry in `world.ts`, instanced markers, edges material, `hot` attribute, and the SVG twins in `SheetGround`. Ships P1, J1, K1/E1, L1/T1, O2, F1, F2. 8h, impact H. Depends on 6 for the new routes.
8. **Shader additions.** H1 contour lift, W1 cut plane plus `uCut`, N1 `uRevision`, and the T1 inset geometry LOD (§3.8). Files: `shaders.ts`, `world.ts`, `role-transect.tsx` (`data-scene-section`), `now/page.tsx` items. 4h, impact H. Depends on 7 (shared props plumbing).
9. **Blit glyph helper** (shared). `lib/scene/blit.ts`: register a DOM `<canvas>`, scene and camera, render on dirty through the session renderer, poster fallback on T0. 4h, impact H (reusable by every edition). Depends on the session renderer only.
10. **Survey glyph set (mechanism B).** P2, J2, W2, N2, K2/E2, R2, O1, L2, plus H2/A2 theodolite model (one geometry, two uses). Files: new `flavors/survey/components/scene/glyphs/*`, call sites listed in §6. 10h, impact M-H. Depends on 7 and 9.
11. **Lab trial ground.** T2 drei `Grid` + `Edges` inside `SignatureFieldScene` via an edition prop (the scene is shared, so the edition passes a `ground` render prop and the shared code doesn't switch on edition). 1.5h, impact L. No dependency.
12. **Mobile hero pan** (§3.5). `hero.tsx:65-75` scroll-snap plus initial scroll to the peak. 2h, impact M. No dependency.

---

# Appendix F: Press Proof

(Sub-agent audit, spot-checked by the lead in §2.6. The sound palette is subject to the dedupe rules in §2.2. Main-report §6 supersedes any "captain decision" or "pending confirmation" note below; the owner chose custom edition-styled scrollbars.)

# Edition: Press Proof (`press`)

Paths are relative to the repo root. All evidence was read at `adb15cf` (detached `fm/portfolio-edition-refactor`).

## 1. Design language

- **Metaphor:** the proof a printer checks before the run. Two plates in register: P1 pink is interface, P2 blue is systems. P3 yellow marks only what is current (docs/press.md:3-15, docs/mocks/press.md:3).
- **Palette** (one `light-dark()` pair per token, flavors/press/styles.css:19-35): paper `#e7e8e4`/`#15181d`, sheet `#f2f3f0`/`#1c2027`, shade `#d6d9d3`/`#262b33`, pink `#ff48b0`/`#1fc47e`, blue `#3255a4`/`#e0b25a`, yellow `#ffe800`/`#2b40da`, ink `#2a4690`/`#ead6a6`, ink-soft `#4a5f93`/`#b7a57c`, danger `#b0183d`/`#ff8a9a`. `--blend` is `multiply` on paper and `screen` on the plate view (styles.css:80,91-99). The stock carries a feTurbulence fibre grain (styles.css:83-84).
- **Type:** Libre Franklin at 900/500/400, and Martian Mono at 75% width for the `slug` utility (styles.css:38-41,188-197; docs/press.md:27-29). The display scale runs up to `--text-name` clamp(4.25rem..14.75rem) (styles.css:61).
- **Layout device:** a fixed trimmed-sheet margin with crop marks, four RegMarks, a control strip (one patch per project), the gripper edge and the slug line. It is `lg+` only and `aria-hidden` (flavors/press/components/site/sheet-frame.tsx:46-117). Page headers are a 7/5 grid with the press on the right (components/ui/page-header.tsx:39-84). Titles use `.ovp` overprint: two grid-stacked plates, offset by `--mis` × `--k` (styles.css:214-240).
- **Motion vocabulary** (styles.css:68-71,85-86):
  - Easings: `--ease-snap` cubic-bezier(0.25,1.7,0.45,1) for the overshoot, `--ease-enter` (0.23,1,0.32,1), `--ease-exit` (0.4,0,1,1), `--ease-feed` (0.32,0.72,0,1).
  - Durations: `--duration-press` 120ms, `--duration-ui` 220ms.
  - Registration moves `translate` over 600ms on `--ease-snap` (styles.css:222,245).
  - Titles snap in on scroll through a `view()` timeline on `--k` (keyframes 9 → 0.4 → 1, styles.css:367-386), with a 900ms timer fallback (styles.css:389-393; site/snap-in-fallback.tsx).
  - Route changes use View Transitions: sheet-out 180ms `--ease-exit`, then sheet-in 420ms `--ease-feed` after a 60ms delay (styles.css:448-472; site/page.tsx:17).
  - Card tilt runs 220ms (styles.css:314-326), and `:active` scales to 0.97 (styles.css:328-334).
- **Cursor:** a three-plate registration target. The plates trail at rates 0.34, 0.2 and 0.13, lock at 0.4 over links, scale to 0.7 and show a slug label (components/interaction/cursor.tsx:14,38,87,107). It only appears on fine pointers (cursor.tsx:93).
- **Scrollbar:** thin, `ink-soft` on paper, and blue on hover (styles.css:159-185).
- **The one 3D element:** "the press", in one session canvas (components/scene/scene-root.tsx:6-11).
  - Parts: two drums (pink over blue), a feed board, and a 32×32-segment sheet with a CanvasTexture print of the glyph and slug (scene/world.tsx:70-131,149-203).
  - Interactivity:
    - Pointer lean: yaw ±0.14, pitch 0.05 (world.tsx:296-301).
    - Dragging peels the corner. Past `TURN` 0.92, letting go navigates to `pose.next` (world.tsx:288-295).
    - Hovering any `[data-scene-item]` registers the print (world.tsx:287,302).
    - A route change feeds a new sheet (world.tsx:269-276).
  - Poses per route live in lib/scene/poses.ts:32-104. The poster is an SVG (site/scene-poster.tsx).

## 2. Per-page inventory

| Page | What renders today | Current 3D (slot / pose) | Current motion | Gaps |
|---|---|---|---|---|
| `/` home | Hero (register readout, h1 overprint, bio, separations, ProofStamp), press log, 4 ProofCards, LatestProof (app/f/press/page.tsx:46-124; home/hero.tsx:51-170) | Press slot in hero, `home` (HR, peel 0.28) (hero.tsx:64-67; poses.ts:33-39) | h1 registers on hover; SectionHead snap-in; card tilt and register; press-log pink bar 500ms snap (work/press-log.tsx:91) | The ProofStamp is static (proof-stamp.tsx:29). Separations swatches are flat `<i>` (hero.tsx:144-147). The proof date is frozen at module load (hero.tsx:15-21). |
| `/projects` | Header, then ProofCards grouped by StatusStamp (app/f/press/projects/page.tsx:31-70) | Header slot, `projects` ("02") (projects/page.tsx:47) | Card tilt and register, snap-in | Hovering a card only registers the whole print. The scene ignores *which* item is hovered (world.tsx:287). |
| `/projects/[slug]` | Progressive-proof header, image, description, Separations P1/P2 lists, prev/next (projects/[slug]/page.tsx:73-175) | Header slot, `project` ("SIG") (page.tsx:87) | Header register only | The plates are text lists (page.tsx:136-137). There is no scroll-linked proofing. |
| `/work` | Header, PressLog, job tickets (`registers`, `data-scene-item=run:*`) (work/page.tsx:30-185) | Header slot, `work` ("03") (page.tsx:48) | Ticket register on hover; bar snap | Run items tag the scene but the press shows no per-run response. |
| `/now` | Yellow "On press now" items, then a log by year inside `data-scene-section` (now/page.tsx:41-133) | Header slot, `now` ("06") (page.tsx:38) | Snap-in | The page drives `progress` through `data-scene-section` (now/page.tsx:93; lib/scene/dom.ts:41-52), but world.tsx never reads `progress`. That signal is dead. |
| `/changelog` | Redirect to `/now#log` (changelog/page.tsx) | n/a | n/a | Inherits `/now` |
| `/about` | Colophon bio, skills (`data-scene-item=skills:*`), education, reach (about/page.tsx:34-210) | Header slot, `about` ("05") (page.tsx:44) | Snap-in | The ink swatches are 8px squares (about/page.tsx:103-108). |
| `/resume` | Header (hidden in print), ResumeDocument (resume/page.tsx:18-29) | Header slot, `resume` ("08") (page.tsx:25) | none | Nothing marks the final print or the print action. |
| `/ask` | Corrections sheet, composer, moderation, feed, pagination (ask/page.tsx:29-105) | Header slot, `ask` ("07") (page.tsx:50) | Composer `justFiled` nudges 4px (ask/composer.tsx:119) | Submitting has no causal visual. |
| `/ask/[slug]` | One query thread (ask/[slug]/page.tsx:47-86) | **none** (`scene={null}`, page.tsx:68) | none | Zero 3D |
| `/lab` | Test-sheet cards with SVG posters (lab/page.tsx:21-66) | Header slot, `lab` ("04") (page.tsx:28) | Tilt and register | none |
| `/lab/[slug]` | ExperimentStage: its own CanvasStage (a second WebGL context) and a 700ms poster fade (lab/[slug]/page.tsx:40-64; lab/experiment-stage.tsx:69; lab/signature-field.tsx:13) | **none** from the session (`scene={null}`, page.tsx:46) | Poster fade | Two contexts are possible if the session is warm. |
| `/owner` | Sign-in (owner/page.tsx:17-29) | **none** (`scene={null}`, page.tsx:24) | Spinner | Zero 3D |
| 404 | Spoiled sheet (`--mis:5`), list of sheets (not-found.tsx:18-51) | Slot, `notfound` (spoiled, peel 0.46) (not-found.tsx:47-50; poses.ts:96-103) | none | The list does not interact with the spoiled print. |

## 3. Design improvements (ranked)

1. **Dragging under motion off navigates with no visible cause.**
   - Where: world.tsx:288-295 arms `TURN` from `peelTarget` whether motion is on or off, while `targets.peel` holds the resting pose (world.tsx:299).
   - Why: with reduced motion, about 141px of drag ((0.92-0.28)×220) turns the page without any feedback. That is a causality and accessibility bug.
   - Fix: gate `armed` on `live`, or keep the peel visible in discrete steps when motion is off.
   - Impact: **H**. Effort: **S** (0.5h).
2. **`:active` scale snaps instead of easing on every Button.**
   - Where: `buttonClass` adds `transition-colors` (ui/button.tsx:30,79). That utility overrides the `.press` `transition: scale 120ms` (styles.css:329), so the 0.97 press jumps.
   - Fix: add `transition-[color,background-color,scale]` in button.tsx, or fold `scale` into `.press`. Also add `[data-motion=off] .press:active{scale:1}`.
   - Impact: **M**. Effort: **S** (0.5h).
3. **Make the press respond to *which* item is hovered, not just to any hover.**
   - Where: world.tsx:287,302.
   - Change: map `hovered` prefixes (`project:`, `run:`, `skills:`, `now:`) to a print variant. For example, the print shows the hovered project's first letter as the glyph, and a run shows its run number as bars (no new text).
   - Why: `data-scene-item` is already wired on 5 pages but reads as one boolean.
   - Impact: **H**. Effort: **M** (3h).
4. **Consume `progress` on /now, and elsewhere.**
   - Where: world.tsx never reads `sceneStore.progress`, although now/page.tsx:93 declares `data-scene-section`.
   - Change: drive the sheet's feed or peel from scroll through the log, so the sheet "comes off the press" as the log is read.
   - Impact: **M**. Effort: **S** (1.5h).
5. **Registration on high-frequency hovers is too slow.**
   - Where: `.registers` cards and tickets run the 600ms overshoot (styles.css:222,238-240).
   - Why: that is fine for the h1 signature but over the <300ms UI budget for cards scanned in a grid.
   - Fix: `.registers .ovp > *{transition-duration:320ms}`. Keep 600ms for `[data-register]`.
   - Impact: **M**. Effort: **S** (0.3h).
6. **Proof dates are frozen at build or module load.**
   - Where: hero.tsx:15-21 and sheet-frame.tsx:26-32 call `new Date()` at module scope in server components, so the "proof date" shows the build date.
   - Fix: derive it from the latest content date (for example `now.updatedAt`), which is a real fact per docs/press.md:3.
   - Impact: **L**. Effort: **S** (0.5h).
7. **Theme flip has no plate-change moment.**
   - Where: theme-toggle.tsx:18 swaps every token instantly.
   - Change: a "plate swap" wipe from the gripper edge (see §4 #1).
   - Impact: **M**. Effort: **S** (1h).
8. **Canvas text in the print texture.**
   - Where: world.tsx:94-126 draws the glyph and slug in a 2D canvas. The shared spec says "Canvas text: none" (docs/m2-scene-spec.md:10). That line is written for drawing-set, but the rule is cross-edition intent.
   - Recommendation: keep the existing print, since it is decorative and duplicated in the DOM, but **no new 3D element may carry text**. Everything in §6 is geometry only.
   - Impact: **L**. Effort: **—**.
9. **Pages without 3D have no press presence.**
   - Where: `/ask/[slug]`, `/owner` and `/lab/[slug]` pass `scene={null}` (ask/[slug]/page.tsx:68; owner/page.tsx:24; lab/[slug]/page.tsx:46).
   - Covered in §6. On `/lab/[slug]`, keep the session paused while the experiment's own CanvasStage is live.
   - Impact: **M**. Effort: see §6.

## 4. Animation improvements

| # | Location | Today | Purpose | Frequency | Motion (values) | Reduced-motion fallback |
|---|---|---|---|---|---|---|
| 1 | Theme toggle (site/theme-toggle.tsx:18) | Instant token swap | Makes the plate change legible: the negative is "pulled" over the proof | Rare (per session) | `document.startViewTransition`, with the new root at `clip-path: inset(0 0 100% 0)` → `inset(0)`, top first from the gripper edge, 320ms `var(--ease-feed)`. The old root is held. | Crossfade 160ms linear (the existing `fade` keyframes, styles.css:482-486) |
| 2 | Hero ProofStamp (home/hero.tsx:156; ui/proof-stamp.tsx:29) | Static at -3deg | Makes the "OK to print" state a stamped act | Once per session (sessionStorage flag in try/catch) | From `scale:1.12; rotate:-6deg; opacity:0` to `scale:1; rotate:-3deg; opacity:1`, 180ms `var(--ease-enter)`, starting 250ms after the hero paints. Sound #2 plays on the same frame. | Opacity 0→1, 120ms |
| 3 | Card and ticket registration (styles.css:222 via `.registers`) | 600ms overshoot | Keeps the signature but fits the hover budget | High (grid scanning) | `translate` 320ms `var(--ease-snap)`. Leaving back out of register runs 200ms `var(--ease-exit)`, so an asymmetric exit is faster. | Already snaps (styles.css:402) |
| 4 | Peel release (world.tsx:305-312) | Exponential approach, rate 0.14 per 60th of a second, with no velocity carry-over | Springy, interruptible paper. The corner springs back with the momentum of the release. | Medium (drag) | A critically-underdamped spring on `peel`: stiffness 320, damping 26, mass 1. Seed it with the drag velocity at pointerup. Settle at |v|<1e-3, then `settle(false)`. Keep `feed` on the approach. | Static pose (unchanged: `live` false) |
| 5 | Copy email "Copied" (site/copy-email.tsx:23) | Text appears or disappears | Confirms the copy at the point of action | Rare | The slug enters with `scale 0.9→1`, `opacity 0→1`, 140ms `var(--ease-enter)`, and exits after 1600ms with opacity 120ms `var(--ease-exit)`. `transform-origin: left center`. | Opacity only |
| 6 | New pending query (ask/pending.tsx:23-31; composer.tsx:119) | Appears in place; the composer nudges `translate-y-1` | Causality: the filed query feeds onto the sheet | Rare | The new `<li>` enters from `clip-path: inset(0 0 100% 0); translate: 0 -8px` to rest, 280ms `var(--ease-feed)`. Use `@starting-style`, which needs no JS. | Opacity 0→1, 160ms |
| 7 | Resume print button (resume/print-button.tsx) | Plain button | Foreshadows the "final print" | Rare | On hover, the header press slot's sheet peel eases to 0. That is a scene-side target change, eased with the same spring as #4. The button keeps `.press:active` scale 0.97, 120ms `var(--ease-enter)`. | No peel change |

**Rejected:**
- **⌘K dialog open or close choreography** (command/command-dialog.tsx). Killed by the *keyboard-initiated, high-frequency* gate: it must open instantly.
- **Press-log bars growing from zero on scroll-in** (work/press-log.tsx:83-95). Killed by the *purpose* gate: it delays reading dates on every visit and adds no information.
- **Parallax on the stock grain or the sheet frame** (styles.css:83-84; sheet-frame.tsx). Killed by the *vestibular / no purpose* gate: the frame's stillness is the point ("the frame and the press stay put", docs/press.md:56).
- **Per-letter misregistration jitter on nav links on hover.** Killed by *frequency plus restraint*: the nav is hit constantly and the cursor already locks over links (cursor.tsx:74).
- **Animated 404 scatter on load.** Killed by *utility*: a 404 visitor needs the sheet list first. The spoiled state is conveyed statically (`--mis:5`, not-found.tsx:24).

## 5. Sound design

**Concept: "the pressroom at arm's length."** Every sound is a physical event of offset printing: paper against a steel platen, a rubber stamp on a pad, register pins seating, a sheet riffling through the drums, a plate swapped on its cylinder. Sounds are dry, short and low in gain, the sounds of one sheet rather than the whole press. They are not the shared 2200/1500Hz triangle tick (lib/sound.ts:11-13).

**Distinct sounds: 6.**

| # | Interaction | Sound | Synthesis recipe (WebAudio, no assets) | Trigger (file:line) |
|---|---|---|---|---|
| 1 | Link click | **Platen kiss** (paper tapped on steel) | White-noise buffer (reused, 0.1s), bandpass 3200Hz Q 1.1, gain env 0→0.10 in 1.5ms then exp to 1e-4 over 22ms. Layer: sine 190Hz, 0→0.06 over 2ms, exp decay 28ms. Total ≈30ms. | ClickSound capture (components/semantic/click-sound.tsx:24-26) resolves an `<a>` → `"link"` |
| 2 | Button, switch, radio; ProofStamp stamp-in; Copy email | **Rubber stamp** (thunk plus pad) | Sine 118Hz with pitch exp → 72Hz over 60ms, gain 0.16 attack 2ms, exp decay 70ms. Noise through lowpass 900Hz, gain 0.05, decay 30ms. | ClickSound → `"button"`; hero.tsx:156 (stamp-in); copy-email.tsx:17 |
| 3 | Headline pulled into register (`[data-register]` hover, first time per page view) | **Register pins** (two plates seating) | Two triangle clicks, 2600Hz then 2350Hz, 5ms each and 9ms apart (P1 then P2), gain 0.05, highpass 1500Hz. Throttled to one per 1.5s. | New `pointerenter` listener on `[data-register]` (page-header.tsx:56; hero.tsx:76) in the press sound module |
| 4 | Route change / sheet feed (link nav or peel TURN) | **Sheet feed** (paper through the nip) | Noise through bandpass swept 700→2400Hz over 180ms (Q 0.8), gain 0→0.07 in 20ms, hold, exp out by 200ms. Plus a drum roll: sine 62Hz, gain 0.04, 160ms. Starts at the VT `page-in` delay (60ms) so it lands with the sheet-in (styles.css:453). | world.tsx:273 (route subscription) and world.tsx:294 (peel turn) call the voice through the store, or `sceneStore` fires it |
| 5 | Peel drag (continuous) | **Paper flex** | Looping noise source, lowpass 2800Hz, gain mapped from `|drag velocity|` (0→0.05, smoothed with `setTargetAtTime` τ 30ms), with a slight pitch wobble through playbackRate 0.9-1.1. It stops with a 60ms release on pointerup. | bindDragInput (lib/scene/session.tsx:31) exposes drag; the press world reads `input.dragX/Y` (world.tsx:288) |
| 6 | Theme toggle | **Plate swap** (thin aluminium plate) | Two sines at inharmonic 1320Hz and 1987Hz (ratio 1.505), gain 0.05 each, attack 1ms, exp decay 140ms. The second partial decays in 90ms. Plus a 6ms noise tick, highpass 4kHz. | theme-toggle.tsx:18 |

Rejected sound candidates:
- **Cursor movement or cursor lock.** Killed by frequency and by being ambient.
- **Scroll snap-in of titles.** Scroll-linked and ambient, so it is killed.
- **Per-card hover registration.** Too frequent. Only the headline gets sound #3, and only once per page view.

**Behaviour:**
- **Opt-in:** default off. `standardDefaults.sound` is reused through flavors/press/lib/prefs.ts:15. Enabling it plays #2 as the unlock gesture (customize/customize-controls.tsx:88-91).
- **Reduced motion:** sound is not motion, so keep #1, #2, #3 and #6.
  - Suppress #5: under reduced motion the peel is not drawn (world.tsx:299), so no paper-flex sound plays without a visual.
  - Play #4 only on navigation, which is still a real event.
- **Mute / sound off:** `ClickSound` unmounts its listener and suspends the context (click-sound.tsx:31-34). The press module does the same.
- **Hidden tab:** keep the `document.hidden` guard (click-sound.tsx:18). Also suspend on `visibilitychange`, and stop #5.
- **Touch:** keep skipping tap clicks (click-sound.tsx:19), which is platform-appropriate. Allow #4 on navigation, and allow #5 during a touch peel only when tilt is enabled.
- **Multimodal sync:** each voice is scheduled at `audio.currentTime` from the same handler that flips the visual state, with no rAF delay. For #4, the sound starts at a +60ms offset to match `sheet-in` (styles.css:453).
- **Shared-code wiring** (no flavors import in shared code):
  - Shared engine (slice S-A): extend lib/sound.ts with `playVoice(recipe: Voice)`. `Voice` is a data description: `{osc?:[{type,f0,f1,dur,gain}], noise?:{filter,type,f0,f1,q,dur,gain}, attack}`. It uses the shared noise buffer and a lazy context.
  - Change `ClickSound` to accept `resolve?: (el: Element) => Voice | null`, which defaults to today's tick.
  - The edition owns flavors/press/lib/sounds.ts, which exports the 6 recipes and `pressResolve`. The edition passes `<ClickSound enabled={sound} resolve={pressResolve} />` (site/deferred-layers.tsx:24).
  - The scene-driven sounds (#4, #5) are wired in flavors/press/components/scene/world.tsx. It imports `@/lib/sound` (shared engine) and flavors sounds, and checks `document.documentElement.dataset.sound` or the prefs store.
- **Budget:** 0 KB of assets and about 2 KB of recipes. No samples are needed. If samples are ever wanted, use a self-recorded stamp and paper riffle (CC0, Opus 48kHz mono, about 6-10 KB each).

## 6. 3D: two new elements per page

**How they ride the one canvas.**
- Today the session canvas is attached *into* the slot host and sized to it (lib/scene/session.tsx:141-158). drei `View` scissors relative to the canvas rect (node_modules/@react-three/drei/web/View.js:88-109), so a View outside the slot would be offscreen and never render.
- **Recommendation (shared slice S-B): a "viewport mode" for `createSessionScene`.**
  - The canvas becomes `position:fixed; inset:0; pointer-events:none` behind the sheet, and each DOM anchor becomes a `<View track={ref}>`.
  - The existing press becomes View 0.
  - Events: `View` reconnects events to `track` (View.js:120-126).
  - Scroll already kicks the clock through the store subscription (lib/scene/dom.ts:118; world.tsx:269-277). Views need their rects re-read on scroll while any View intersects.
  - The engine stays edition-agnostic: it takes `views: Record<id, () => ReactNode>`, and pages mark anchors with `data-scene-view="id"`.
- **Fallback where S-B is not taken:** add extra props to the existing slot. This only works for elements that sit inside the press slot rectangle.
- **Budget:** the whole page stays under 60 draw calls (docs/m2-scene-spec.md). The press uses about 13 today (2 drums × 3 material groups, 2 seams, 2 axles, board, sheet front and back; world.tsx:149-203) and about 5k triangles.
  - Each new element: ≤4 draws, ≤2k triangles, 0.5ms GPU at T2.
  - T1: half the segments, no MSAA (session.tsx:125).
  - T0: CSS or SVG poster. Every element has a static DOM twin.
  - Reduced motion: a static pose, and no pointer lean or parallax (`motionOn()` gate, lib/scene/clock).
  - Idle: zero frames.
- **Rules for every element:** no text in any geometry or texture. Colours come from `tokenColor` (lib/scene/colors). Plates blend multiply or screen through `blending` matching `--blend`.

drei 10.7.9 exports used, all verified in node_modules/@react-three/drei (core/web index.d.ts): `View`, `Instances`/`Instance`, `Merged`, `Edges`, `Outlines`, `Float`, `useCursor`, `RoundedBox`, `Decal`, `PresentationControls`, `Bvh`, `PerspectiveCamera`.

**Home**
- **Linen tester (loupe) over the Separations list** (hero.tsx:115-153):
  - A folding brass loupe, a thin RoundedBox frame plus a lens disc. The lens uses a halftone shader: pink and blue dot screens at 15° and 75°, offset by `mis`.
  - Hovering a separations row slides the loupe to it with a spring and shows that plate's screen alone. The "P1+P2" row shows the rosette.
  - Drei: `View`, `RoundedBox`, `useCursor`. Budget: 3 draws, 600 triangles.
  - Reduced motion: it sits over the "in register" row. T0: CSS radial-gradient halftone disc.
- **Rubber proof stamp** beside the ProofStamp (hero.tsx:156):
  - A wooden handle with a rubber foot (Cylinder plus RoundedBox).
  - On first view it presses down, synced to §4 #2 and sound #2. Clicking re-stamps it, with a 90ms squash on the foot scaleY.
  - Drei: `View`, `Outlines` (ink edge). Budget: 3 draws, 800 triangles.
  - Reduced motion: at rest, lifted. T0: hidden, and the DOM stamp remains.

**/projects**
- **Signature stack in the header meta row:**
  - One folded signature per project, a thin bent box drawn with `Instances`. Featured signatures use overprint colour and the rest use tint, mirroring the control strip (lib/proof.ts `controlStrip`).
  - Hovering a ProofCard (`project:*`) lifts the matching signature 0.15 units.
  - Budget: 1 draw (Instances), 14×24 triangles. Reduced motion: no lift, but the lifted signature is outlined. T0: the CSS control strip.
- **Status stamp pad** in each group's SectionHead kicker (projects/page.tsx:55):
  - A glyph-size (48px) ink pad plus stamp. It rocks once when its group scrolls into view (scroll-linked via `progress` across the section, clamped to one pass) and tilts toward the pointer.
  - Drei: `View`, `Float` (floatIntensity 0 unless hovered). Budget: 2 draws per pad. Up to 4 pads share the geometry through `Merged`.
  - Reduced motion: static. T0: none, because the DOM StatusStamp stays.

**/projects/[slug]**
- **Exploded progressive proof** beside Separations (projects/[slug]/page.tsx:130-138):
  - Three thin plates (P1, P2, composite) spaced on z. Scrolling through the section collapses them into register using `progress`.
  - Hovering a P1 or P2 list pulls its plate forward.
  - Drei: `View`, `Edges`. Budget: 3 draws (one mesh each, with shared geometry), 12 triangles plus an Edges pass (+3). Reduced motion: collapsed. T0: the existing ProgressiveProof glyph (projects/progressive-proof.tsx).
- **Register pins on the job image** (page.tsx:115-124):
  - Two steel pins at the image's top corners, with the image "hung" on them. Pointer lean tilts the pins ±4°, and clicking the image seats them (a 60ms drop, sound #3).
  - Drei: `View` (tracked to the image wrapper), `Instances` (2 pins). Budget: 1 draw, 200 triangles. Reduced motion: seated. T0: CSS dots.

**/work**
- **Ink roller on the press-log rail** (work/press-log.tsx:72-95):
  - A small brayer that rides the month axis.
  - Hovering a run (`run:*`) rolls it to `run.start`, with rotation = distance / r, and it leaves an ink stripe over `run.length`.
  - Drei: `View` tracked to the log wrapper, `useCursor`. Budget: 3 draws (roller, handle, stripe), 500 triangles.
  - Reduced motion: it jumps to the run with no roll. T0: none (the bars already carry it).
- **Delivery pile** beside the job tickets header (work/page.tsx:60):
  - A stack of sheets, one per run, with thickness ∝ tenure, built with `Instances`. Scrolling through tickets (`progress`) raises a pointer arrow along the pile. Hovering a ticket fans its sheet out 0.1.
  - Budget: 1 draw, ≤200 triangles. Reduced motion: no fan. T0: CSS stacked borders.

**/now** (also serves /changelog)
- **P3 ink fountain** by "On press now" (now/page.tsx:46-66):
  - A yellow ink duct whose ink level = `now.items.length`, with an ink knife resting on it. Hovering a now item (`now:*`) dips the knife. The ink uses the yellow token.
  - Drei: `View`, `RoundedBox`. Budget: 3 draws, 700 triangles. Reduced motion: static. T0: a CSS yellow bar.
- **Year sheets fanning** beside the log (now/page.tsx:93):
  - One sheet per year (`Instances`) fans open as `progress` crosses each year. This consumes the currently dead `data-scene-section` signal.
  - Budget: 1 draw, ≤100 triangles. Reduced motion: fully fanned. T0: none.

**/about**
- **Ink tins** by "Inks on hand" (about/page.tsx:70-85):
  - One tin per skill group (`Instances`). The lid stripe is P1 or P2 by majority `plateFor`. Hovering a group (`skills:*`) lifts its lid 0.08 and tilts it.
  - Budget: 2 draws (bodies, lids), ≤1.5k triangles. Reduced motion: no lift, and the lid is outlined via `Outlines`. T0: the existing swatches.
- **Bound imprint volumes** by Education (about/page.tsx:125-150):
  - One spine-only RoundedBox book per education entry on a shelf. Hovering pulls a book out 0.1. With `PresentationControls` (snap back, polar ±0.2) the shelf turns slightly on drag.
  - Budget: 1 draw (Instances), ≤400 triangles. Reduced motion: no controls. T0: none.

**/resume**
- **Guillotine and trimmed stack** by the print button (resume/print-button.tsx):
  - A blade over a small paper stack. Hovering the print button lowers the blade 30%. Clicking drops it (80ms) before `window.print()` fires, then sound #2.
  - Drei: `View`, `Edges`. Budget: 3 draws, 300 triangles.
  - Hidden in print (`data-print="hide"`). Reduced motion: static. T0: none.
- **Folded final sheet** in the header (resume/page.tsx:20-26):
  - A tri-fold sheet that unfolds flat as the resume scrolls into view (`progress`, one-way), becoming the "final print".
  - Budget: 1 draw, 3×8 segments. Reduced motion: flat. T0: none.

**/ask**
- **Query tray** under the composer (ask/page.tsx:53-81):
  - A wire in-tray. On `justFiled` (composer.tsx:119) a sheet slides into it with sound #4-lite (sheet feed, 120ms). The tray's fill = pending count.
  - Drei: `View`, `Instances` (sheets). Budget: 2 draws, 300 triangles. Reduced motion: the sheet appears in place. T0: none.
- **Correction flags** in the feed margin (ask/page.tsx:97-104):
  - A pin board with one flag per query on the page (`Instances`). Hovering a message raises its flag. Answered queries have a blue flag and pending ones a pink flag.
  - Budget: 1 draw, ≤400 triangles. Reduced motion: no raise, only a colour change. T0: none.

**/ask/[slug]**
- **Corrected sheet** in the header (ask/[slug]/page.tsx:49-68, currently no scene):
  - A single small sheet with a blue margin correction mark (geometry: a caret and a line). It flips to its answered side if the thread has an owner reply. Pointer lean applies.
  - Drei: `View`, `Edges`. Budget: 2 draws, 50 triangles. Reduced motion: static. T0: an SVG mark.
- **Loupe** reused from home, parked at the question body. Dragging moves it over the thread, with `useCursor("grab")`. Budget: 3 draws. Reduced motion: parked. T0: none.

**/lab**
- **Drying rack** over the test cards (lab/page.tsx:30-64):
  - A wire line with one clipped sheet per experiment (`Instances`, sheets plus pegs through `Merged`). Hovering a card swings its sheet with a damped pendulum, and the others sway slightly.
  - Budget: 2 draws, ≤500 triangles. Reduced motion: still. T0: none.
- **Colour bar** under the header meta:
  - The 4 process patches as thin raised blocks whose heights follow pointer x like a densitometer sweep.
  - Budget: 1 draw (Instances). Reduced motion: flat. T0: the CSS strip.

**/lab/[slug]**
- **Constraint:** ExperimentStage mounts its own CanvasStage (lab/signature-field.tsx:13). The session Views on this page must pause, with `frames` 0 and no `kick`, while the stage reports `ready`, and resume when it is paused or on the poster.
- **Press lever** by the Run control (lab/experiment-stage.tsx): a start lever that throws when the experiment starts. Budget: 2 draws. Reduced motion: final position. T0: none.
- **Accent ink roller**: a glyph-size roller in the experiment's accent (`useAccent`, lab/use-accent.ts) that rolls once per accent change. Budget: 2 draws. Reduced motion: static.

**/owner**
- **Chase and quoins** by the sign-in (owner/page.tsx:26-28):
  - A metal chase frame with two wedges. They tighten (slide 0.05) on sign-in success and loosen on error, with a 3-cycle shake of 4px (motion on only).
  - Drei: `View`, `Instances`. Budget: 2 draws. Reduced motion: final state. T0: none.
- **3D registration target**: three rings (yellow, pink, blue, `Instances`) that spread with typing velocity in the field and register on submit.
  - Budget: 1 draw, 3×64 triangles. Reduced motion: registered. T0: the RegMark SVG.

**404**
- **Crumpled spoiled sheet** beside the press (not-found.tsx:47-50):
  - An icosahedron-noise "paper ball" that can be dragged and flicked into a bin. The bin catches it and the ball respawns, and the spoiled press prints the next sheet.
  - Drei: `View`, `useCursor`, `Bvh`. Budget: 2 draws, ≤1.2k triangles. Reduced motion: the ball rests in the bin, with no drag. T0: none.
- **Scattered registration targets** around the sheet list (not-found.tsx:33-45):
  - 5 targets (`Instances`) far out of register. Hovering a sheet link registers the nearest one and points it at the link.
  - Budget: 1 draw. Reduced motion: registered. T0: static SVG RegMarks.

## 7. Shippable slices (ordered)

1. **P-1: Motion correctness fixes.**
   - Contents: §3 #1 (gate peel TURN on `live`), #2 (Button `:active` transition), #5 (320ms card registration).
   - Files: flavors/press/components/scene/world.tsx, flavors/press/components/ui/button.tsx, flavors/press/styles.css.
   - Effort 1.5h. Impact H. No shared dependency.
2. **P-2: Scene reads what the page already says.**
   - Contents: §3 #3 (hover-specific print variants) and #4 (`progress` on /now).
   - Files: world.tsx, lib/scene/poses.ts (flavors/press).
   - Effort 4h. Impact H. No shared dependency.
3. **P-3: Small DOM motion set.**
   - Contents: §4 #1 (theme plate swap), #2 (stamp-in), #5 (copy), #6 (pending feed-in), #4 (peel spring with velocity).
   - Files: theme-toggle.tsx, proof-stamp.tsx, hero.tsx, copy-email.tsx, ask/pending.tsx, styles.css, world.tsx.
   - Effort 4h. Impact M. No shared dependency.
4. **S-A (shared): Voice engine.**
   - Contents: `playVoice(recipe)`, a shared noise buffer, and a `resolve` prop on ClickSound, with the current tick as the default.
   - Files: lib/sound.ts, components/semantic/click-sound.tsx.
   - Effort 3h. Impact H (enables every edition).
5. **P-4: Press sound palette.**
   - Contents: the 6 recipes, `pressResolve`, register-pin listener, feed and peel hooks in the scene, and visibility suspend.
   - Files: new flavors/press/lib/sounds.ts, site/deferred-layers.tsx:24, scene/world.tsx:273,294, theme-toggle.tsx.
   - Effort 4h. Impact M. Depends on S-A.
6. **S-B (shared): Session viewport mode with drei `View`.**
   - Contents: a fixed overlay canvas, `data-scene-view` anchors, the existing slot as View 0, per-View frames gating, rect refresh on scroll, and a pause API for foreign canvases (/lab/[slug]).
   - Files: lib/scene/session.tsx, lib/scene/dom.ts, components/semantic/scene/use-scene-mount.ts, docs/m2-scene-spec.md.
   - Effort 10-14h. Impact H (unblocks §6 for all editions).
7. **P-5: 3D set A (data-rich pages).**
   - Contents: home loupe and stamp, projects signature stack, work roller and pile, now fountain and year fan.
   - Files: new flavors/press/components/scene/views/*.tsx, the page anchors, poses.ts.
   - Effort 12h. Impact H. Depends on S-B (and P-2 for `hovered` and `progress` mapping).
8. **P-6: 3D set B (remaining pages).**
   - Contents: project plates and pins, about tins and books, resume guillotine and fold, ask tray and flags, ask/[slug] sheet and loupe, lab rack and bar, lab/[slug] lever and roller (with the pause rule), owner chase and target, 404 ball and targets.
   - Effort 16h. Impact M. Depends on S-B.
9. **P-7: Docs and budgets.**
   - Contents: update docs/press.md §"Motion", §"3D" and §"Sound" (docs/press.md:52-69). Add a draw-call assertion (<60) in a scene test.
   - Effort 2h. Impact L. Depends on P-4, P-5 and P-6.
