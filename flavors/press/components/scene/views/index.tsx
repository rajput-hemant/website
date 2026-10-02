import { PAD_VIEWS, padView, VIEW } from "@/flavors/press/lib/scene/views";

import type { SceneViews } from "@/lib/scene/session";

import { Books } from "./books";
import { ColourBar } from "./colour-bar";
import { Correction } from "./correction";
import { Flags } from "./flags";
import { Fold } from "./fold";
import { Fountain } from "./fountain";
import { Guillotine } from "./guillotine";
import { AccentRoller, Lever } from "./lever";
import { HomeLoupe, ThreadLoupe } from "./loupe";
import { Chase, Target } from "./owner";
import { pads } from "./pad";
import { Pile } from "./pile";
import { Pins } from "./pins";
import { Plates } from "./plates";
import { Rack } from "./rack";
import { Roller } from "./roller";
import { Signatures } from "./signatures";
import { Ball, Targets } from "./spoiled";
import { Stamp } from "./stamp";
import { Tins } from "./tins";
import { Tray } from "./tray";
import { Years } from "./years";

/** Every press view by placeholder id (docs/press.md, "3D"). */
export const pressViews: SceneViews = {
  [VIEW.loupe]: () => <HomeLoupe />,
  [VIEW.stamp]: () => <Stamp />,
  [VIEW.signatures]: () => <Signatures />,
  ...Object.fromEntries(
    Array.from({ length: PAD_VIEWS }, (_, i) => [padView(i), pads(i)])
  ),
  [VIEW.roller]: () => <Roller />,
  [VIEW.pile]: () => <Pile />,
  [VIEW.fountain]: () => <Fountain />,
  [VIEW.years]: () => <Years />,
  [VIEW.plates]: () => <Plates />,
  [VIEW.pins]: () => <Pins />,
  [VIEW.tins]: () => <Tins />,
  [VIEW.books]: () => <Books />,
  [VIEW.guillotine]: () => <Guillotine />,
  [VIEW.fold]: () => <Fold />,
  [VIEW.tray]: () => <Tray />,
  [VIEW.flags]: () => <Flags />,
  [VIEW.correction]: () => <Correction />,
  [VIEW.threadLoupe]: () => <ThreadLoupe />,
  [VIEW.rack]: () => <Rack />,
  [VIEW.colourBar]: () => <ColourBar />,
  [VIEW.lever]: () => <Lever />,
  [VIEW.accentRoller]: () => <AccentRoller />,
  [VIEW.chase]: () => <Chase />,
  [VIEW.target]: () => <Target />,
  [VIEW.ball]: () => <Ball />,
  [VIEW.targets]: () => <Targets />,
};
