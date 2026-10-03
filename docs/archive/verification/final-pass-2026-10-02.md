# Final pass, 2026-10-02

The last part of todo #9: the final budget and accessibility pass over all 11 live editions, on a production build of `lane/final-pass` (base `a01294a`). Measured in headless Chromium with SwiftShader (no GPU), so frame rates and Lighthouse performance are far below a real device; the structural results (axe, CLS, aria, print) do not depend on the GPU.

## Summary

| Check                                                                                   | Result                                                                                                                      |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Budget (`bun run budget`)                                                               | 220 routes, all OK; four routes are within 1 KB of their ceiling (listed below)                                             |
| axe e2e (`e2e/a11y.spec.ts`, every edition project, desktop and mobile, light and dark) | 396 run, 387 passed, 9 failed before the fix (all Surface contrast), 0 after                                                |
| 3D aria-hidden scan (home and projects, 1440)                                           | every canvas and view/poster host is inside an `aria-hidden` ancestor in all 11 editions                                    |
| CLS with posters                                                                        | 0 on every edition and route except the residuals in the CLS table (all at or under 0.0057, 1440 only)                      |
| Print                                                                                   | canvases, posters, scene roots, slots and views do not render in print on any edition's home and resume (10 editions fixed) |
| Lighthouse 13.5.0 (mobile preset, headless Chromium)                                    | accessibility 98 to 100 everywhere, 100 after the fixes except noted; performance 45 to 71 (software GL, see below)         |

## Budget

Full table from `bun run budget` after the final build (sizes in KB gzipped; the framework share is 128.0 KB).

Routes within 1 KB of their ceiling:

| Route                                | Total KB | Ceiling KB |
| ------------------------------------ | -------- | ---------- |
| `/f/drawing-set/lab/signature-field` | 169.5    | 170        |
| `/f/drawing-set/resume`              | 179.0    | 180        |
| `/f/surface/lab/signature-field`     | 169.8    | 170        |
| `/f/timetable/owner`                 | 179.4    | 180        |

```text
Route                                   | Total KB | Page KB | Ceiling KB | Fonts | Status
----------------------------------------+----------+---------+------------+-------+-------
/f/calibre                              | 161.9    | 33.9    | 180        | 3     | OK
/f/calibre/about                        | 161.9    | 33.9    | 180        | 3     | OK
/f/calibre/ask                          | 176.4    | 48.4    | 240        | 3     | OK
/f/calibre/changelog                    | 128.0    | 0.0     | 180        | 0     | OK
/f/calibre/lab                          | 161.9    | 33.9    | 180        | 3     | OK
/f/calibre/lab/signature-field          | 163.2    | 35.2    | 170        | 3     | OK
/f/calibre/now                          | 161.9    | 33.9    | 180        | 3     | OK
/f/calibre/owner                        | 169.4    | 41.4    | 180        | 3     | OK
/f/calibre/projects                     | 161.9    | 33.9    | 180        | 3     | OK
/f/calibre/projects/calculator          | 167.1    | 39.1    | 180        | 3     | OK
/f/calibre/projects/infinitunes         | 167.1    | 39.1    | 180        | 3     | OK
/f/calibre/projects/jiosaavn-api        | 167.1    | 39.1    | 180        | 3     | OK
/f/calibre/projects/jiosaavn-api-rs     | 167.1    | 39.1    | 180        | 3     | OK
/f/calibre/projects/leetcode            | 167.1    | 39.1    | 180        | 3     | OK
/f/calibre/projects/lipi                | 167.1    | 39.1    | 180        | 3     | OK
/f/calibre/projects/rajputhemant-me     | 167.1    | 39.1    | 180        | 3     | OK
/f/calibre/projects/shellai             | 167.1    | 39.1    | 180        | 3     | OK
/f/calibre/projects/threejs-journey     | 167.1    | 39.1    | 180        | 3     | OK
/f/calibre/resume                       | 165.8    | 37.8    | 180        | 3     | OK
/f/calibre/work                         | 161.9    | 33.9    | 180        | 3     | OK
/f/darkroom                             | 157.9    | 29.9    | 180        | 2     | OK
/f/darkroom/about                       | 157.9    | 29.9    | 180        | 2     | OK
/f/darkroom/ask                         | 172.8    | 44.8    | 240        | 2     | OK
/f/darkroom/changelog                   | 128.0    | 0.0     | 180        | 0     | OK
/f/darkroom/lab                         | 157.9    | 29.9    | 180        | 2     | OK
/f/darkroom/lab/signature-field         | 159.5    | 31.5    | 170        | 2     | OK
/f/darkroom/now                         | 157.9    | 29.9    | 180        | 2     | OK
/f/darkroom/owner                       | 162.4    | 34.4    | 180        | 2     | OK
/f/darkroom/projects                    | 157.9    | 29.9    | 180        | 2     | OK
/f/darkroom/projects/calculator         | 163.3    | 35.3    | 180        | 2     | OK
/f/darkroom/projects/infinitunes        | 163.3    | 35.3    | 180        | 2     | OK
/f/darkroom/projects/jiosaavn-api       | 163.3    | 35.3    | 180        | 2     | OK
/f/darkroom/projects/jiosaavn-api-rs    | 163.3    | 35.3    | 180        | 2     | OK
/f/darkroom/projects/leetcode           | 163.3    | 35.3    | 180        | 2     | OK
/f/darkroom/projects/lipi               | 163.3    | 35.3    | 180        | 2     | OK
/f/darkroom/projects/rajputhemant-me    | 163.3    | 35.3    | 180        | 2     | OK
/f/darkroom/projects/shellai            | 163.3    | 35.3    | 180        | 2     | OK
/f/darkroom/projects/threejs-journey    | 163.3    | 35.3    | 180        | 2     | OK
/f/darkroom/resume                      | 158.7    | 30.7    | 180        | 2     | OK
/f/darkroom/work                        | 157.9    | 29.9    | 180        | 2     | OK
/f/drawing-set                          | 175.5    | 47.5    | 180        | 2     | OK
/f/drawing-set/about                    | 176.5    | 48.5    | 180        | 2     | OK
/f/drawing-set/ask                      | 184.1    | 56.1    | 240        | 2     | OK
/f/drawing-set/changelog                | 128.0    | 0.0     | 180        | 0     | OK
/f/drawing-set/lab                      | 167.7    | 39.7    | 180        | 2     | OK
/f/drawing-set/lab/signature-field      | 169.5    | 41.5    | 170        | 2     | OK
/f/drawing-set/now                      | 173.9    | 45.9    | 180        | 2     | OK
/f/drawing-set/owner                    | 177.7    | 49.7    | 180        | 2     | OK
/f/drawing-set/projects                 | 178.4    | 50.4    | 180        | 2     | OK
/f/drawing-set/projects/calculator      | 177.5    | 49.5    | 180        | 2     | OK
/f/drawing-set/projects/infinitunes     | 177.5    | 49.5    | 180        | 2     | OK
/f/drawing-set/projects/jiosaavn-api    | 177.5    | 49.5    | 180        | 2     | OK
/f/drawing-set/projects/jiosaavn-api-rs | 177.5    | 49.5    | 180        | 2     | OK
/f/drawing-set/projects/leetcode        | 177.5    | 49.5    | 180        | 2     | OK
/f/drawing-set/projects/lipi            | 177.5    | 49.5    | 180        | 2     | OK
/f/drawing-set/projects/rajputhemant-me | 177.5    | 49.5    | 180        | 2     | OK
/f/drawing-set/projects/shellai         | 177.5    | 49.5    | 180        | 2     | OK
/f/drawing-set/projects/threejs-journey | 177.5    | 49.5    | 180        | 2     | OK
/f/drawing-set/resume                   | 179.0    | 51.0    | 180        | 2     | OK
/f/drawing-set/work                     | 177.3    | 49.3    | 180        | 2     | OK
/f/jacquard                             | 165.1    | 37.1    | 180        | 3     | OK
/f/jacquard/about                       | 163.6    | 35.6    | 180        | 3     | OK
/f/jacquard/ask                         | 175.4    | 47.4    | 240        | 3     | OK
/f/jacquard/changelog                   | 128.0    | 0.0     | 180        | 0     | OK
/f/jacquard/lab                         | 163.6    | 35.6    | 180        | 3     | OK
/f/jacquard/lab/signature-field         | 164.8    | 36.8    | 170        | 3     | OK
/f/jacquard/now                         | 163.6    | 35.6    | 180        | 3     | OK
/f/jacquard/owner                       | 173.9    | 45.9    | 180        | 3     | OK
/f/jacquard/projects                    | 165.1    | 37.1    | 180        | 3     | OK
/f/jacquard/projects/calculator         | 165.1    | 37.1    | 180        | 3     | OK
/f/jacquard/projects/infinitunes        | 165.1    | 37.1    | 180        | 3     | OK
/f/jacquard/projects/jiosaavn-api       | 165.1    | 37.1    | 180        | 3     | OK
/f/jacquard/projects/jiosaavn-api-rs    | 165.1    | 37.1    | 180        | 3     | OK
/f/jacquard/projects/leetcode           | 165.1    | 37.1    | 180        | 3     | OK
/f/jacquard/projects/lipi               | 165.1    | 37.1    | 180        | 3     | OK
/f/jacquard/projects/rajputhemant-me    | 165.1    | 37.1    | 180        | 3     | OK
/f/jacquard/projects/shellai            | 165.1    | 37.1    | 180        | 3     | OK
/f/jacquard/projects/threejs-journey    | 165.1    | 37.1    | 180        | 3     | OK
/f/jacquard/resume                      | 170.3    | 42.3    | 180        | 3     | OK
/f/jacquard/work                        | 163.6    | 35.6    | 180        | 3     | OK
/f/maquette                             | 164.7    | 36.7    | 180        | 2     | OK
/f/maquette/about                       | 163.0    | 35.0    | 180        | 2     | OK
/f/maquette/ask                         | 176.9    | 48.9    | 240        | 2     | OK
/f/maquette/changelog                   | 128.0    | 0.0     | 180        | 0     | OK
/f/maquette/lab                         | 163.0    | 35.0    | 180        | 2     | OK
/f/maquette/lab/signature-field         | 164.4    | 36.4    | 170        | 2     | OK
/f/maquette/now                         | 163.0    | 35.0    | 180        | 2     | OK
/f/maquette/owner                       | 172.4    | 44.4    | 180        | 2     | OK
/f/maquette/projects                    | 163.2    | 35.2    | 180        | 2     | OK
/f/maquette/projects/calculator         | 168.5    | 40.5    | 180        | 2     | OK
/f/maquette/projects/infinitunes        | 168.5    | 40.5    | 180        | 2     | OK
/f/maquette/projects/jiosaavn-api       | 168.5    | 40.5    | 180        | 2     | OK
/f/maquette/projects/jiosaavn-api-rs    | 168.5    | 40.5    | 180        | 2     | OK
/f/maquette/projects/leetcode           | 168.5    | 40.5    | 180        | 2     | OK
/f/maquette/projects/lipi               | 168.5    | 40.5    | 180        | 2     | OK
/f/maquette/projects/rajputhemant-me    | 168.5    | 40.5    | 180        | 2     | OK
/f/maquette/projects/shellai            | 168.5    | 40.5    | 180        | 2     | OK
/f/maquette/projects/threejs-journey    | 168.5    | 40.5    | 180        | 2     | OK
/f/maquette/resume                      | 168.7    | 40.7    | 180        | 2     | OK
/f/maquette/work                        | 163.0    | 35.0    | 180        | 2     | OK
/f/minimal                              | 175.4    | 47.4    | 180        | 1     | OK
/f/minimal/about                        | 128.0    | 0.0     | 180        | 0     | OK
/f/minimal/ask                          | 180.2    | 52.2    | 240        | 1     | OK
/f/minimal/changelog                    | 163.9    | 35.9    | 180        | 1     | OK
/f/minimal/lab                          | 164.6    | 36.6    | 180        | 1     | OK
/f/minimal/lab/signature-field          | 165.8    | 37.8    | 170        | 1     | OK
/f/minimal/now                          | 164.4    | 36.4    | 180        | 1     | OK
/f/minimal/owner                        | 169.4    | 41.4    | 180        | 1     | OK
/f/minimal/projects                     | 171.3    | 43.3    | 180        | 1     | OK
/f/minimal/projects/calculator          | 128.0    | 0.0     | 180        | 0     | OK
/f/minimal/projects/infinitunes         | 128.0    | 0.0     | 180        | 0     | OK
/f/minimal/projects/jiosaavn-api        | 128.0    | 0.0     | 180        | 0     | OK
/f/minimal/projects/jiosaavn-api-rs     | 128.0    | 0.0     | 180        | 0     | OK
/f/minimal/projects/leetcode            | 128.0    | 0.0     | 180        | 0     | OK
/f/minimal/projects/lipi                | 128.0    | 0.0     | 180        | 0     | OK
/f/minimal/projects/rajputhemant-me     | 128.0    | 0.0     | 180        | 0     | OK
/f/minimal/projects/shellai             | 128.0    | 0.0     | 180        | 0     | OK
/f/minimal/projects/threejs-journey     | 128.0    | 0.0     | 180        | 0     | OK
/f/minimal/resume                       | 170.5    | 42.5    | 180        | 1     | OK
/f/minimal/work                         | 164.6    | 36.6    | 180        | 1     | OK
/f/mission                              | 168.4    | 40.4    | 180        | 2     | OK
/f/mission/about                        | 164.4    | 36.4    | 180        | 2     | OK
/f/mission/ask                          | 176.2    | 48.2    | 240        | 2     | OK
/f/mission/changelog                    | 128.0    | 0.0     | 180        | 0     | OK
/f/mission/lab                          | 164.4    | 36.4    | 180        | 2     | OK
/f/mission/lab/signature-field          | 165.6    | 37.6    | 170        | 2     | OK
/f/mission/now                          | 164.4    | 36.4    | 180        | 2     | OK
/f/mission/owner                        | 174.7    | 46.7    | 180        | 2     | OK
/f/mission/projects                     | 164.4    | 36.4    | 180        | 2     | OK
/f/mission/projects/calculator          | 164.4    | 36.4    | 180        | 2     | OK
/f/mission/projects/infinitunes         | 164.4    | 36.4    | 180        | 2     | OK
/f/mission/projects/jiosaavn-api        | 164.4    | 36.4    | 180        | 2     | OK
/f/mission/projects/jiosaavn-api-rs     | 164.4    | 36.4    | 180        | 2     | OK
/f/mission/projects/leetcode            | 164.4    | 36.4    | 180        | 2     | OK
/f/mission/projects/lipi                | 164.4    | 36.4    | 180        | 2     | OK
/f/mission/projects/rajputhemant-me     | 164.4    | 36.4    | 180        | 2     | OK
/f/mission/projects/shellai             | 164.4    | 36.4    | 180        | 2     | OK
/f/mission/projects/threejs-journey     | 164.4    | 36.4    | 180        | 2     | OK
/f/mission/resume                       | 171.1    | 43.1    | 180        | 2     | OK
/f/mission/work                         | 168.4    | 40.4    | 180        | 2     | OK
/f/press                                | 163.6    | 35.6    | 180        | 2     | OK
/f/press/about                          | 163.3    | 35.3    | 180        | 2     | OK
/f/press/ask                            | 178.6    | 50.6    | 240        | 2     | OK
/f/press/changelog                      | 128.0    | 0.0     | 180        | 0     | OK
/f/press/lab                            | 163.3    | 35.3    | 180        | 2     | OK
/f/press/lab/signature-field            | 164.8    | 36.8    | 170        | 2     | OK
/f/press/now                            | 163.3    | 35.3    | 180        | 2     | OK
/f/press/owner                          | 170.0    | 42.0    | 180        | 2     | OK
/f/press/projects                       | 163.3    | 35.3    | 180        | 2     | OK
/f/press/projects/calculator            | 168.5    | 40.5    | 180        | 2     | OK
/f/press/projects/infinitunes           | 168.5    | 40.5    | 180        | 2     | OK
/f/press/projects/jiosaavn-api          | 168.5    | 40.5    | 180        | 2     | OK
/f/press/projects/jiosaavn-api-rs       | 168.5    | 40.5    | 180        | 2     | OK
/f/press/projects/leetcode              | 168.5    | 40.5    | 180        | 2     | OK
/f/press/projects/lipi                  | 168.5    | 40.5    | 180        | 2     | OK
/f/press/projects/rajputhemant-me       | 168.5    | 40.5    | 180        | 2     | OK
/f/press/projects/shellai               | 168.5    | 40.5    | 180        | 2     | OK
/f/press/projects/threejs-journey       | 168.5    | 40.5    | 180        | 2     | OK
/f/press/resume                         | 166.8    | 38.8    | 180        | 2     | OK
/f/press/work                           | 163.3    | 35.3    | 180        | 2     | OK
/f/surface                              | 169.8    | 41.8    | 180        | 3     | OK
/f/surface/about                        | 170.2    | 42.2    | 180        | 3     | OK
/f/surface/ask                          | 183.2    | 55.2    | 240        | 3     | OK
/f/surface/changelog                    | 128.0    | 0.0     | 180        | 0     | OK
/f/surface/lab                          | 168.8    | 40.8    | 180        | 3     | OK
/f/surface/lab/signature-field          | 169.8    | 41.8    | 170        | 3     | OK
/f/surface/now                          | 168.5    | 40.5    | 180        | 3     | OK
/f/surface/owner                        | 172.0    | 44.0    | 180        | 3     | OK
/f/surface/projects                     | 168.8    | 40.8    | 180        | 3     | OK
/f/surface/projects/calculator          | 175.3    | 47.4    | 180        | 3     | OK
/f/surface/projects/infinitunes         | 175.3    | 47.4    | 180        | 3     | OK
/f/surface/projects/jiosaavn-api        | 175.3    | 47.4    | 180        | 3     | OK
/f/surface/projects/jiosaavn-api-rs     | 175.3    | 47.4    | 180        | 3     | OK
/f/surface/projects/leetcode            | 175.3    | 47.4    | 180        | 3     | OK
/f/surface/projects/lipi                | 175.3    | 47.4    | 180        | 3     | OK
/f/surface/projects/rajputhemant-me     | 175.3    | 47.4    | 180        | 3     | OK
/f/surface/projects/shellai             | 175.3    | 47.4    | 180        | 3     | OK
/f/surface/projects/threejs-journey     | 175.3    | 47.4    | 180        | 3     | OK
/f/surface/resume                       | 173.7    | 45.7    | 180        | 3     | OK
/f/surface/work                         | 169.9    | 41.9    | 180        | 3     | OK
/f/survey                               | 177.4    | 49.4    | 180        | 2     | OK
/f/survey/about                         | 167.7    | 39.7    | 180        | 2     | OK
/f/survey/ask                           | 183.8    | 55.9    | 240        | 2     | OK
/f/survey/changelog                     | 128.0    | 0.0     | 180        | 0     | OK
/f/survey/lab                           | 167.4    | 39.4    | 180        | 2     | OK
/f/survey/lab/signature-field           | 167.1    | 39.1    | 170        | 2     | OK
/f/survey/now                           | 173.5    | 45.5    | 180        | 2     | OK
/f/survey/owner                         | 176.2    | 48.2    | 180        | 2     | OK
/f/survey/projects                      | 169.3    | 41.3    | 180        | 2     | OK
/f/survey/projects/calculator           | 173.3    | 45.3    | 180        | 2     | OK
/f/survey/projects/infinitunes          | 173.3    | 45.3    | 180        | 2     | OK
/f/survey/projects/jiosaavn-api         | 173.3    | 45.3    | 180        | 2     | OK
/f/survey/projects/jiosaavn-api-rs      | 173.3    | 45.3    | 180        | 2     | OK
/f/survey/projects/leetcode             | 173.3    | 45.3    | 180        | 2     | OK
/f/survey/projects/lipi                 | 173.3    | 45.3    | 180        | 2     | OK
/f/survey/projects/rajputhemant-me      | 173.3    | 45.3    | 180        | 2     | OK
/f/survey/projects/shellai              | 173.3    | 45.3    | 180        | 2     | OK
/f/survey/projects/threejs-journey      | 173.3    | 45.3    | 180        | 2     | OK
/f/survey/resume                        | 172.5    | 44.5    | 180        | 2     | OK
/f/survey/work                          | 167.7    | 39.7    | 180        | 2     | OK
/f/timetable                            | 165.4    | 37.4    | 180        | 2     | OK
/f/timetable/about                      | 166.1    | 38.1    | 180        | 2     | OK
/f/timetable/ask                        | 182.3    | 54.3    | 240        | 2     | OK
/f/timetable/changelog                  | 128.0    | 0.0     | 180        | 0     | OK
/f/timetable/lab                        | 166.1    | 38.1    | 180        | 2     | OK
/f/timetable/lab/signature-field        | 167.2    | 39.2    | 170        | 2     | OK
/f/timetable/now                        | 171.7    | 43.7    | 180        | 2     | OK
/f/timetable/owner                      | 179.4    | 51.4    | 180        | 2     | OK
/f/timetable/projects                   | 168.2    | 40.2    | 180        | 2     | OK
/f/timetable/projects/calculator        | 171.2    | 43.2    | 180        | 2     | OK
/f/timetable/projects/infinitunes       | 171.2    | 43.2    | 180        | 2     | OK
/f/timetable/projects/jiosaavn-api      | 171.2    | 43.2    | 180        | 2     | OK
/f/timetable/projects/jiosaavn-api-rs   | 171.2    | 43.2    | 180        | 2     | OK
/f/timetable/projects/leetcode          | 171.2    | 43.2    | 180        | 2     | OK
/f/timetable/projects/lipi              | 171.2    | 43.2    | 180        | 2     | OK
/f/timetable/projects/rajputhemant-me   | 171.2    | 43.2    | 180        | 2     | OK
/f/timetable/projects/shellai           | 171.2    | 43.2    | 180        | 2     | OK
/f/timetable/projects/threejs-journey   | 171.2    | 43.2    | 180        | 2     | OK
/f/timetable/resume                     | 170.4    | 42.4    | 180        | 2     | OK
/f/timetable/work                       | 166.1    | 38.1    | 180        | 2     | OK
/flavors                                | 132.2    | 4.2     | 180        | 1     | OK

Framework share (shared by every page): 128.0KB gzipped
```

## axe

`bunx playwright test e2e/a11y.spec.ts` against a production build, with the serious and critical filter the spec uses (wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa). 528 cases (22 edition projects, desktop and mobile), 132 skipped by the spec itself (mobile dark), 387 passed, 9 failed.

| Edition     | Serious or critical before | After |
| ----------- | -------------------------- | ----- |
| minimal     | 0                          | 0     |
| drawing-set | 0                          | 0     |
| surface     | 9                          | 0     |
| timetable   | 0                          | 0     |
| survey      | 0                          | 0     |
| press       | 0                          | 0     |
| darkroom    | 0                          | 0     |
| jacquard    | 0                          | 0     |
| mission     | 0                          | 0     |
| maquette    | 0                          | 0     |
| calibre     | 0                          | 0     |

Surface failed `/now`, `/changelog` and `/owner` (desktop light and dark, mobile light): `color-contrast` on the inactive printhead and key switch legends (`text-ink-3` at 9px, 3.46:1 light and 4.19:1 dark against 4.5:1). Fixed by moving the inactive state to `text-ink-2` (commit `fix(surface): raise the inactive printhead...`). Re-run after the fix: Surface desktop and mobile pass.

## 3D glyphs and canvases are aria-hidden

DOM scan at 1440 of `canvas`, `[data-scene-view]`, `[data-scene-root]`, `[data-scene-board]` and `[data-scene-poster]` on each edition's home and projects: every canvas sits inside an `aria-hidden="true"` ancestor on all 22 pages. The only non-hidden matches are structural containers (`data-scene-root`, `data-scene-slot`/`board`) that hold nothing but the hidden canvas and poster, and Minimal's `ol[data-scene-view]`, which is the real project list (content, not a glyph). Nothing to fix.

## CLS with posters

Each edition's home and projects, 1440 and 390, normal and reduced motion, with WebGL (SwiftShader) and with WebGL disabled (the poster path); 3.5 s observation window from `load`. Values are the layout-shift total (excluding input-driven shifts); the table shows the worst of the four 1440 runs and the worst of the four 390 runs, after the fixes.

| Edition     | Home 1440 | Home 390 | Projects 1440 | Projects 390 |
| ----------- | --------- | -------- | ------------- | ------------ |
| minimal     | 0.0008    | 0        | 0             | 0            |
| drawing-set | 0         | 0        | 0             | 0            |
| surface     | 0         | 0        | 0             | 0            |
| timetable   | 0         | 0        | 0.0003        | 0            |
| survey      | 0.0057    | 0        | 0.0002        | 0            |
| press       | 0         | 0        | 0             | 0            |
| darkroom    | 0         | 0        | 0.0001        | 0            |
| jacquard    | 0         | 0        | 0             | 0            |
| mission     | 0.0002    | 0        | 0.0001        | 0            |
| maquette    | 0.0001    | 0        | 0.0002        | 0            |
| calibre     | 0.0050    | 0        | 0.0007        | 0            |

Fixes applied (one commit per edition):

- Command hint swap (`⌘K` to `Ctrl K` on hydration resizing the header): Minimal, Jacquard, Mission, Maquette and Calibre now reserve the width, as Drawing Set, Timetable, Press, Surface and Survey already did. Darkroom did not shift.
- Calibre: the jewel tags re-laid out when the late small-caps font loaded (0.011 on home, 0.0111 on projects at 390). The tag layer now stays clear until `document.fonts.ready`.
- Maquette: the pin label flipped sides with `left`/`right` offsets at 390 on projects (0.0021). It now flips with a translate.

Left (all under 0.01, 1440 only, text reflow when a web font swaps in, nothing to do with posters):

- Survey home 0.0057: the hero block moves up 4 to 6 px at about 240 ms when the fonts swap. Not found to a single element; left.
- Calibre home 0.005: the hero headline paragraph on the font swap.
- Timetable projects 0.0003, Darkroom projects 0.0001, Mission 0.0001 to 0.0002, Maquette 0.0001 to 0.0002, Minimal home 0.0008 (reduced motion), Survey projects 0.0002, Calibre projects 0.0007: font swap reflow.
- Known shared and left: the dynamic `notFound()` shell shift.

## Print hides glyphs

`page.emulateMedia({ media: "print" })` on each edition's home and `/resume`, then every `canvas`, `[data-scene-root]`, `[data-scene-slot]`, `[data-scene-view]` and `[data-scene-poster]` must have no layout box. Before: 10 of the 11 editions still rendered something in print on home: a full-viewport canvas on Drawing Set and Timetable, the knob canvas on Surface, and the canvas, poster, scene root or slot on the others (Press only its poster and root); Drawing Set and Timetable also showed their canvas on `/resume`. After the per-edition `@media print` rule (`display: none !important`), none render on any edition's home or resume. Minimal passes with one intended exception: `ol[data-scene-view]` is the project list itself and prints.

## Lighthouse

`bunx lighthouse` 13.5.0 (installs from the registry) against the production build, mobile preset (default throttling), performance and accessibility only, Chromium 1194 headless, one run each, edition chosen with the `hr_flavor` cookie. Two runs hit `NO_NAVSTART` and were re-run.

Performance is not representative: there is no GPU, so WebGL runs on SwiftShader on a shared 4 CPU machine with 4x CPU throttling on top; total blocking time is in the seconds because of that. Use it to compare editions with each other, and take real numbers on a device. Accessibility is reliable.

| Edition     | Home perf | Home a11y | Home CLS | Projects perf | Projects a11y | Projects CLS |
| ----------- | --------- | --------- | -------- | ------------- | ------------- | ------------ |
| minimal     | 45        | 100       | 0        | 54            | 100           | 0            |
| drawing-set | 50        | 100       | 0        | 53            | 100           | 0            |
| surface     | 61        | 100       | 0        | 61            | 100           | 0            |
| timetable   | 69        | 100       | 0        | 68            | 100           | 0            |
| survey      | 59        | 100       | 0        | 60            | 100           | 0.001        |
| press       | 66        | 100       | 0        | 64            | 100           | 0            |
| darkroom    | 61        | 100       | 0        | 59            | 100           | 0            |
| jacquard    | 62        | 100       | 0        | 66            | 100           | 0            |
| mission     | 64        | 100       | 0        | 71            | 100           | 0            |
| maquette    | 61        | 100       | 0        | 61            | 100           | 0.005        |
| calibre     | 56        | 100       | 0.003    | 57            | 100           | 0.001        |

Accessibility audits that did not pass (scores from the first run; the survey heading was fixed and re-run to 100):

- Jacquard and Mission, home and projects: `label-content-name-mismatch` on the header search chip (accessible name "Search", visible text `⌘K` or `Ctrl K`). Left: score is still 100, and the e2e suite finds the button by the exact name "Search", so a longer name would break `e2e/editions.spec.ts`. Hiding the visible text with `aria-hidden` did not clear the audit (tried and dropped). Fix later by moving the hint out of the button's text, as the other editions do (icon plus `aria-hidden` kbd).
- Survey home: `label-content-name-mismatch` on the sheet map links (`aria-label` is the full role sentence, the visible map text is the company or site name). Left: a map-label redesign, score 100.
- Survey projects: `heading-order` (h1 then h3 rows). Fixed with a visually hidden h2 ("Surveyed sites"); re-run 100.

## Findings left

- Survey's home runs at about 3 fps in this environment's software GL (Timetable: 37 fps), and three `e2e/editions.spec.ts` cases on `desktop-survey` ("Search button opens it too", "typing filters and Enter navigates", "Customize") time out waiting for the header button to be stable because requestAnimationFrame is starved. The same specs pass on every other edition, axe passes on Survey, and none of this lane's Survey changes touch the home page. Looks environmental (no GPU); worth one run on a real GPU or in CI.
- The sub-0.01 font-swap CLS residuals listed above.
- Jacquard and Mission search chip name mismatch; Survey map link labels.
