# Press proof

**Thesis.** Hemant sells "pixel-perfect", so the site is the proof you check before the run. Fullstack is two plates in register: P1 pink is interface (React, Next.js, React Native), P2 blue is systems (Node, TypeScript).

**Palette.**
- Arctic grey-white stock `#E7E8E4`
- Fluorescent pink `#FF48B0` (P1)
- Federal blue `#3255A4` (P2, text `#2A4690`)
- Yellow `#FFE800` (P3, only what is current)
- Overprint violet `#321871`
- Plate view `#15181D`. Dark theme is the negative: inks flip to their complements and multiply becomes screen.

**Type.** Libre Franklin 900/500/400 for display and text, an American press gothic. Martian Mono at 75% width for slugs, stamps and readouts.

**Layout.** The page sits on a trimmed sheet, with crop marks, registration targets, a gripper edge and a slug line in a fixed margin. The control strip has 14 patches, one per project; the 4 solids are the featured ones. The proof stamp ticks "OK to print: available for work".

**Signature.** The name and headings print on two plates, 6 px out of register. Hover the name and every mark snaps into register at once, with a readout of the offset. Section titles snap in on scroll.

**3D.** Light, but literal. One three.js canvas in the hero shows a pink drum and a blue drum. The sheet feeds out of the nip on load. Its texture uses the same overprint, so hovering the name registers it too. Drag to peel the corner. It renders only on change, caps DPR at 1.5 and holds still under reduced motion. The SVG drawing is the fallback. Nothing else is 3D, because the flat marks already do that job.

**Motion.** Registration snaps in with a slight overshoot. Page changes feed the next sheet through the drums.

**Pages.** Projects are signatures stamped In print, Proofing or Out of print, with progressive proofs. Experience is a press log, one run per role. Now and changelog are the latest proof, marked in yellow. Ask is the corrections sheet. About is the colophon.
